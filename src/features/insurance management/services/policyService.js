import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '@/services/apiService';



const policyService = {

    getPolicies: async (pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/policies?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getPolicy: async (policyId) => {
        try {
            const response = await apiService.get(`/policies/${policyId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }, updatePolicy: async (policyId, policyData) => {
        try {
            const response = await apiService.patch(`/policies/${policyId}`, policyData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , createPolicy: async (policyData) => {
        try {
            const response = await apiService.post('/policies/', policyData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



};
export default policyService;