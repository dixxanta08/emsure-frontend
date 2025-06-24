import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '../../../services/apiService';



const employeeService = {

    getEmployeesByCompany: async (companyId, pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/companies/${companyId}/employees?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getEmployees: async (pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);

        try {
            const response = await apiService.get(`/employees?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getEmployee: async (employeeId) => {
        try {
            const response = await apiService.get(`/employees/${employeeId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    createEmployee: async (companyId, employeeData) => {
        try {
            const response = await apiService.post(`/companies/${companyId}/employees/`, employeeData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateEmployee: async (companyId, employeeId, employeeData) => {
        try {
            const response = await apiService.patch(`/companies/${companyId}/employees/${employeeId}`, employeeData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



};
export default employeeService;