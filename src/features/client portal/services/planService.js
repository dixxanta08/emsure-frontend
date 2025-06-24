import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '@/services/apiService';



const planService = {

    getPlans: async (pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/plans?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getPlan: async (planId) => {
        try {
            const response = await apiService.get(`/plans/${planId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }, updatePlan: async (planId, planData) => {
        try {
            const response = await apiService.patch(`/plans/${planId}`, planData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , createPlan: async (planData) => {
        try {
            const response = await apiService.post('/plans/', planData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



};
export default planService;