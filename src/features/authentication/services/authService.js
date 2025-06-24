import { deleteCookie, getCookie } from '@/utils/cookieUtils';
import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '../../../services/apiService';

const authService = {

    signup: async (credentials) => {
        try {
            const response = await apiService.post('/auth/signup', credentials);
            return response.data
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    login: async (credentials) => {
        try {
            const response = await apiService.post('/auth/login', credentials, {
                withCredentials: true
            });
            return response.data
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    test: async () => {
        try {
            const response = await apiService.get('/auth/test');
            return response.data
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    refreshToken: async () => {
        try {
            const response = await apiService.post('auth/refresh-token', null, {
                withCredentials: true
            })
            console.log("Refresh token response: ", response.data);
            return response.data
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    fetchMe: async () => {
        try {
            const accessToken = getCookie('accessToken');
            const headers = {};

            if (accessToken) {
                headers["Authorization"] = `Bearer ${accessToken}`;
            }

            const response = await apiService.get('auth/me', { headers });
            return response.data;
        } catch (error) {
            console.log("Error fetching me: ", error);
            console.error(error);
            throw error;
        }
    }
    , sendPasswordResetEmail: async (userId, email) => {
        try {
            const response = await apiService.post('auth/request-password-reset', { userId, email })
            return response.data
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , verifyPasswordResetToken: async (resetPasswordToken) => {
        try {
            const response = await apiService.get(`auth/verify-password-reset-token/${resetPasswordToken}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , resetPassword: async (resetPasswordToken, newPassword) => {
        try {
            const response = await apiService.post(`auth/reset-password/${resetPasswordToken}`, { newPassword });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    logout: async () => {
        try {
            const response = await apiService.post('auth/logout', null, {
                withCredentials: true
            });
            deleteCookie('accessToken');
            deleteCookie('refreshToken');
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

};
export default authService;