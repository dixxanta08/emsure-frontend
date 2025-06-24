import { getCookie } from '@/utils/cookieUtils';
import axios from 'axios';
import authService from '../features/authentication/services/authService';

const API_BASE_URL = 'http://localhost:8080';

const apiService = axios.create({
    baseURL: API_BASE_URL,
});

const refreshAccessToken = async () => {
    try {
        const data = await authService.refreshToken();
        if (!data?.user) {
            throw new Error("Refresh token is invalid or expired.");
        }
        return getCookie('accessToken');
    } catch (error) {
        throw new Error("Failed to refresh access token");
    }
};

// Request Interceptor
apiService.interceptors.request.use(
    (config) => {
        const token = getCookie('accessToken'); // Fetch dynamically
        if (!config._retry && token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
apiService.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const accessToken = await refreshAccessToken();

                originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                return apiService(originalRequest);
            } catch (refreshError) {
                console.error("Token refresh failed. Logging out...");
                // logout(); // Implement proper logout
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiService;
