import apiService from "@/services/apiService";

const dashboardService = {
    getAdminDashboard: async () => {
        try {
            const response = await apiService.get(`/dashboard/admin`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getAgentDashboard: async (agentId) => {
        try {
            const response = await apiService.get(`/dashboard/agent/${agentId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }


};

export default dashboardService; 