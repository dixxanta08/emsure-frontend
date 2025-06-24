import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '@/services/apiService';



const claimService = {

    // getBenefits: async (pageIndex, pageSize, searchTerm, isActive) => {
    //     const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
    //     try {
    //         const response = await apiService.get(`/benefits?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
    //         return response.data;
    //     } catch (error) {
    //         console.log(error);
    //         throw error;
    //     }
    // },

    getClaim: async (claimId) => {
        try {
            const response = await apiService.get(`/claims/${claimId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getClaimsByEmployeeId: async (employeeId) => {
        try {
            const response = await apiService.get(`/claims/employee/${employeeId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getClaimsByCompanyId: async (companyId) => {
        try {
            const response = await apiService.get(`/claims/company/${companyId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getClaimsByEmployeeSubscriptionId: async (employeeSubscriptionId) => {
        try {
            const response = await apiService.get(`/claims/employeeSubscription/${employeeSubscriptionId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    // updateBenefit: async (benefitId, benefitData) => {
    //     try {
    //         const response = await apiService.patch(`/benefits/${benefitId}`, benefitData);
    //         return response.data;
    //     } catch (error) {
    //         console.log(error);
    //         throw error;
    //     }
    // }
    // ,
    createClaim: async (claimData) => {
        try {
            const response = await apiService.post('/claims/', claimData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateClaimStatus: async (claimId, claimUpdateStatusData) => {
        try {
            const response = await apiService.patch(`/claims/update-status/${claimId}`, claimUpdateStatusData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    ,



};
export default claimService;