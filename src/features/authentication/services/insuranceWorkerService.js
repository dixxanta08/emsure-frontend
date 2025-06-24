import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '../../../services/apiService';



const insuranceWorkerService = {

    getInsuranceWorkers: async (pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/insurance-workers?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getInsuranceWorker: async (insuranceWorkerId) => {
        try {
            const response = await apiService.get(`/insurance-workers/${insuranceWorkerId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }, updateInsuranceWorker: async (insuranceWorkerId, insuranceWorkerData) => {
        try {
            const response = await apiService.patch(`/insurance-workers/${insuranceWorkerId}`, insuranceWorkerData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , createInsuranceWorker: async (insuranceWorkerData) => {
        try {
            const response = await apiService.post('/insurance-workers/', insuranceWorkerData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



};
export default insuranceWorkerService;