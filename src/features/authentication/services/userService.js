import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '../../../services/apiService';



const userSerivce = {

    getUsers: async (pageIndex, pageSize, searchTerm) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/users?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getUser: async (userId) => {
        try {
            const response = await apiService.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateUser: async (user) => {
        try {
            const response = await apiService.patch(`/users/${user.userId}`, user);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },


};
export default userSerivce;