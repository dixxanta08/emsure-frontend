import { getCookie } from '@/utils/cookieUtils';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';


const authService = axios.create({
    baseURL: API_BASE_URL,
})

const accessToken = getCookie('accessToken');


authService.interceptors.request.use(
    (config) => {
        if (!config._retry && accessToken) {
            console.log("accestToken" + accessToken);
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


let refreshAttempted = false;
const refreshAccessToken = async () => {
    try {
        const data = await authService.refreshToken();
        if (!data.accessToken || data.refreshTokenError) {
            throw new Error("Refresh token is invalid or expired.");
        }
        return data.accessToken;
    } catch (error) {
        throw new Error("Failed to refresh access token");
    }
};
authService.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401: Unauthorized
        if (error.response && error.response.status === 401) {
            // Prevent infinite refresh attempts
            if (refreshAttempted) {
                // Log out the user or notify them that their session has expired
                // logout();
                return Promise.reject(error);
            }

            refreshAttempted = true; // Set the flag to true to indicate we're attempting to refresh the token

            try {
                const accessToken = await refreshAccessToken();
                originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                return authService(originalRequest); // Retry original request with new access token
            } catch (refreshError) {
                // logout(); // Log the user out if refresh fails
                return Promise.reject(refreshError); // Reject with the refresh error
            } finally {
                refreshAttempted = false; // Reset flag after refresh attempt
            }
        }

        return Promise.reject(error); // Reject error for other scenarios
    }
);





authService.login = async (credentials) => {
    try {
        const response = await authService.post('/auth/login', credentials, {
            withCredentials: true
        });
        return response.data
    } catch (error) {
        console.log(error);
        throw error;
    }
}

authService.test = async () => {
    try {
        const response = await authService.get('/auth/test');
        return response.data
    } catch (error) {
        console.log(error);
        throw error;
    }
}
authService.getUsers = async () => {
    try {
        const response = await authService.get('/users');
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

authService.refreshToken = async () => {
    try {
        const response = await authService.post('auth/refresh-token', null, {
            withCredentials: true
        })
        return response.data
    } catch (error) {
        console.log(error);
        throw error;
    }
}
authService.fetchMe = async () => {
    let headers = {};

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
        const response = await authService.get('auth/me', { headers });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default authService;