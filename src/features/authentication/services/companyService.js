import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '../../../services/apiService';



const companyService = {

    getCompanies: async (pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/companies?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getCompanyReports: async (companyId) => {
        try {
            const response = await apiService.get(`/companies/${companyId}/report`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getCompaniesByAgentId: async (agentId, pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/companies/agent/${agentId}?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    verifyCompany: async (companyId) => {
        try {
            const response = await apiService.post(`/companies/${companyId}/verify`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getCompany: async (companyId) => {
        try {
            const response = await apiService.get(`/companies/${companyId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    isCompanyProfileComplete: async (companyId) => {
        try {
            const response = await apiService.get(`/companies/${companyId}/is-profile-complete`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateCompany: async (companyId, companyData) => {
        try {
            const response = await apiService.patch(`/companies/${companyId}`, companyData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , createCompany: async (companyData) => {
        try {
            const response = await apiService.post('/companies/', companyData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , getCompanyEmployees: async (companyId) => {
        try {
            const response = await apiService.get(`/companies/${companyId}/employees`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



};
export default companyService;