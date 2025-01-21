import { getCookie } from '@/utils/cookieUtils';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';


const authService = axios.create({
    baseURL: API_BASE_URL,
})



// import axios from 'axios';
// import { getRefreshToken, setAccessToken } from './auth'; // Utility functions for token management

// // Create an Axios instance
// const api = axios.create({
//     baseURL: 'your-api-endpoint',
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // Request interceptor to add the Authorization header with the access token
// api.interceptors.request.use(
//     (config) => {
//         const accessToken = localStorage.getItem('accessToken');
//         if (accessToken) {
//             config.headers['Authorization'] = `Bearer ${accessToken}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // Response interceptor to handle 401 and refresh token logic
// api.interceptors.response.use(
//     (response) => response, // Return the response if it's successful
//     async (error) => {
//         const originalRequest = error.config;

//         // Check if the error is a 401 Unauthorized and the request has not been retried yet
//         if (error.response && error.response.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;

//             // Get the refresh token (typically from cookies or localStorage)
//             const refreshToken = getRefreshToken();

//             if (refreshToken) {
//                 try {
//                     // Request to refresh the access token using the refresh token
//                     const response = await axios.post('/api/refresh-token', { refreshToken });

//                     // Save the new access token in localStorage
//                     setAccessToken(response.data.accessToken);

//                     // Update the original request's Authorization header with the new access token
//                     originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;

//                     // Retry the original request with the new access token
//                     return api(originalRequest);
//                 } catch (err) {
//                     // Handle the case where refreshing the token fails (e.g., log the user out)
//                     console.error('Error refreshing token:', err);
//                     // Optional: Redirect to login page or show a message to the user
//                 }
//             } else {
//                 // If no refresh token is available, redirect to login or show a message
//                 console.error('No refresh token available');
//             }
//         }

//         // If the error is not related to 401 or token refresh fails, reject the promise
//         return Promise.reject(error);
//     }
// );


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

authService.refreshToken = async () => {
    try {
        const response = await authService.post('auth/refresh-token', null, {
            withCredentials: true
            // this is the only time we need to send the refresh token so withCredentials is set to true
        })
        return response.data
    } catch (error) {
        console.log(error);
        throw error;
    }
}
authService.fetchMe = async () => {
    const accessToken = getCookie('accessToken');
    if (!accessToken) {
        throw new Error('Invalid access token');
    }
    try {
        const response = await authService.get('auth/me', {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export default authService;