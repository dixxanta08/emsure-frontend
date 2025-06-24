import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '@/services/apiService';



const benefitService = {

    getBenefits: async (pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/benefits?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getBenefit: async (benefitId) => {
        try {
            const response = await apiService.get(`/benefits/${benefitId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }, updateBenefit: async (benefitId, benefitData) => {
        try {
            const response = await apiService.patch(`/benefits/${benefitId}`, benefitData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , createBenefit: async (benefitData) => {
        try {
            const response = await apiService.post('/benefits/', benefitData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



};
export default benefitService;