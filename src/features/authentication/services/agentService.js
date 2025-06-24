import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '../../../services/apiService';



const agentService = {

    getAgents: async (pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/agents?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getAgent: async (agentId) => {
        try {
            const response = await apiService.get(`/agents/${agentId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }, updateAgent: async (agentId, agentData) => {
        try {
            const response = await apiService.patch(`/agents/${agentId}`, agentData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , createAgent: async (agentData) => {
        try {
            const response = await apiService.post('/agents/', agentData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



};
export default agentService;