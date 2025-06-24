import apiService from "@/services/apiService";

const dashboardService = {
  getCompanyDashboard: async (companyId) => {
    try {
      const response = await apiService.get(`/dashboard/company/${companyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEmployeeDashboard: async (employeeId) => {
    try {
      const response = await apiService.get(`/dashboard/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardService; 