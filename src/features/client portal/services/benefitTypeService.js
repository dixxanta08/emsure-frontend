import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '@/services/apiService';



const benefitTypeService = {

    getBenefitTypes: async (pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/benefit-types?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getBenefitType: async (benefitTypeId) => {
        try {
            const response = await apiService.get(`/benefit-types/${benefitTypeId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }, updateBenefitType: async (benefitTypeId, benefitTypeData) => {
        try {
            const response = await apiService.patch(`/benefit-types/${benefitTypeId}`, benefitTypeData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , createBenefitType: async (benefitTypeData) => {
        try {
            const response = await apiService.post('/benefit-types/', benefitTypeData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



};
export default benefitTypeService;