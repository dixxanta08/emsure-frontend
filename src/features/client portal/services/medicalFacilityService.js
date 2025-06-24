import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '@/services/apiService';



const medicalFacilityService = {

    getMedicalFacilities: async (pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/medical-facilities?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getMedicalFacility: async (medicalFacilityId) => {
        try {
            const response = await apiService.get(`/medical-facilities/${medicalFacilityId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }, updateMedicalFacility: async (medicalFacilityId, medicalFacilityData) => {
        try {
            const response = await apiService.patch(`/medical-facilities/${medicalFacilityId}`, medicalFacilityData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , createMedicalFacility: async (medicalFacilityData) => {
        try {
            const response = await apiService.post('/medical-facilities/', medicalFacilityData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



};
export default medicalFacilityService;