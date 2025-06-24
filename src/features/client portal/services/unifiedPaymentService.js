// import { getPaginationDefaults } from '@/utils/paginationUtils';
// import apiService from '@/services/apiService';

// const unifiedPaymentService = {
//   // Get all payments with filters
//   getAllPayments: async (pageIndex = 0, pageSize = 10, searchTerm = "") => {
//     try {
//       const response = await apiService.get(`/payments`, {
//         params: {
//           pageIndex,
//           pageSize,
//           searchTerm,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   },

//   // Get payments by employee ID
//   getEmployeePayments: async (employeeId, pageIndex = 0, pageSize = 10, searchTerm = "") => {
//     try {
//       const response = await apiService.get(`/payments/employee/${employeeId}`, {
//         params: {
//           pageIndex,
//           pageSize,
//           searchTerm,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   },
//   getAgentPayments: async (agentId, pageIndex = 0, pageSize = 10, searchTerm = "") => {
//     try {
//       const response = await apiService.get(`/payments/agent/${agentId}`, {
//         params: {
//           pageIndex,
//           pageSize,
//           searchTerm,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   }
//   ,

//   // Get payments by company ID
//   getCompanyPayments: async (companyId, pageIndex = 0, pageSize = 10, searchTerm = "") => {
//     try {
//       const response = await apiService.get(`/payments/company/${companyId}`, {
//         params: {
//           pageIndex,
//           pageSize,
//           searchTerm,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   },
// };

// export default unifiedPaymentService; 
import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '@/services/apiService';

const unifiedPaymentService = {
  // Get all payments with filters
  getAllPayments: async (
    pageIndex = 0,
    pageSize = 10,
    searchTerm = "",
    paymentType = "all",
    status = "all",
    startDate = null,
    endDate = null
  ) => {
    try {
      const response = await apiService.get(`/payments`, {
        params: {
          pageIndex,
          pageSize,
          searchTerm,
          paymentType: paymentType !== "all" ? paymentType : undefined,
          status: status !== "all" ? status : undefined,
          startDate: startDate ? startDate.toISOString() : undefined,
          endDate: endDate ? endDate.toISOString() : undefined,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payments by employee ID with filters
  getEmployeePayments: async (
    employeeId,
    pageIndex = 0,
    pageSize = 10,
    searchTerm = "",
    paymentType = "all",
    status = "all",
    startDate = null,
    endDate = null
  ) => {
    try {
      const response = await apiService.get(`/payments/employee/${employeeId}`, {
        params: {
          pageIndex,
          pageSize,
          searchTerm,
          paymentType: paymentType !== "all" ? paymentType : undefined,
          status: status !== "all" ? status : undefined,
          startDate: startDate ? startDate.toISOString() : undefined,
          endDate: endDate ? endDate.toISOString() : undefined,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payments by agent ID with filters
  getAgentPayments: async (
    agentId,
    pageIndex = 0,
    pageSize = 10,
    searchTerm = "",
    paymentType = "all",
    status = "all",
    startDate = null,
    endDate = null
  ) => {
    try {
      const response = await apiService.get(`/payments/agent/${agentId}`, {
        params: {
          pageIndex,
          pageSize,
          searchTerm,
          paymentType: paymentType !== "all" ? paymentType : undefined,
          status: status !== "all" ? status : undefined,
          startDate: startDate ? startDate.toISOString() : undefined,
          endDate: endDate ? endDate.toISOString() : undefined,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payments by company ID with filters
  getCompanyPayments: async (
    companyId,
    pageIndex = 0,
    pageSize = 10,
    searchTerm = "",
    paymentType = "all",
    status = "all",
    startDate = null,
    endDate = null
  ) => {
    try {
      const response = await apiService.get(`/payments/company/${companyId}`, {
        params: {
          pageIndex,
          pageSize,
          searchTerm,
          paymentType: paymentType !== "all" ? paymentType : undefined,
          status: status !== "all" ? status : undefined,
          startDate: startDate ? startDate.toISOString() : undefined,
          endDate: endDate ? endDate.toISOString() : undefined,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default unifiedPaymentService;