import { getPaginationDefaults } from '@/utils/paginationUtils';
import apiService from '@/services/apiService';



const subscriptionService = {

    getSubscriptions: async (pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/subscriptions?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getSubscription: async (subscriptionId) => {
        try {
            const response = await apiService.get(`/subscriptions/${subscriptionId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getSubscriptionEmployees: async (subscriptionId, pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);

        try {
            const response = await apiService.get(`/subscriptions/${subscriptionId}/employees?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getSubscriptionPayments: async (subscriptionId, pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);

        try {
            const response = await apiService.get(`/subscriptions/${subscriptionId}/payments?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getSubscriptionClaims: async (subscriptionId, pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);

        try {
            const response = await apiService.get(`/subscriptions/${subscriptionId}/claims?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getSubscriptionsByCompanyId: async (pageIndex, pageSize, searchTerm, isActive, companyId) => {

        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);

        try {
            const response = await apiService.get(`/subscriptions/company/${companyId}?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getSubscriptionsByPlanId: async (planId, pageIndex, pageSize, searchTerm, isActive) => {

        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);

        try {
            const response = await apiService.get(`/subscriptions/plans/${planId}?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , updateSubscription: async (subscriptionId, subscriptionData) => {
        try {
            const response = await apiService.patch(`/subscriptions/${subscriptionId}`, subscriptionData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateSubscriptionPaymentStatus: async (paymentId, status) => {
        try {
            const response = await apiService.patch(`/subscriptions/payment/${paymentId}`, status);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    , createSubscription: async (subscriptionData) => {
        try {
            const response = await apiService.post('/subscriptions/', subscriptionData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    deleteSubscription: async (subscriptionId) => {
        try {
            const response = await apiService.delete(`/subscriptions/${subscriptionId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    createEmployeeSubscription: async (subscriptionId, employeeSubscriptionData) => {

        try {
            const response = await apiService.post(`/subscriptions/${subscriptionId}/employees`, employeeSubscriptionData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    deleteEmployeeSubscription: async (subscriptionId, employeeId) => {

        try {
            const response = await apiService.delete(`/subscriptions/${subscriptionId}/employees/${employeeId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    createEmployeeSubscriptionPayment: async (employeeSubscriptionPaymentData) => {
        try {
            const response = await apiService.post('/employee-subscription-payments/', employeeSubscriptionPaymentData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateEmployeeSubscriptionPaymentStatus: async (employeeSubscriptionPaymentId, status) => {
        try {
            const response = await apiService.patch(`/employee-subscription-payments/${employeeSubscriptionPaymentId}`, status);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getEmployeeSubscription: async (subscriptionId, employeeId) => {

        try {
            const response = await apiService.get(`/subscriptions/${subscriptionId}/employees/${employeeId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getEmployeeSubscriptionCurrentMonthPayment: async (employeeSubscriptionId) => {

        try {
            const response = await apiService.get(`/employee-subscription-payments/${employeeSubscriptionId}/currentMonthPayment`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getEmployeeSubscriptionPendingPayment: async (employeeSubscriptionId) => {

        try {
            const response = await apiService.get(`/employee-subscription-payments/${employeeSubscriptionId}/pendingPayment`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getEmployeeSubscriptionPayments: async (employeeSubscriptionId, pageIndex, pageSize, searchTerm) => {

        try {
            const response = await apiService.get(`/employee-subscription-payments/${employeeSubscriptionId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getEmployeeSubscriptionPaymentsByEmployeeId: async (employeeId) => {

        try {
            const response = await apiService.get(`/employee-subscription-payments/employee/${employeeId}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    getSubscriptionsByEmployeeId: async (employeeId, pageIndex, pageSize, searchTerm, isActive) => {
        const { pageIndex: finalPageIndex, pageSize: finalPageSize } = getPaginationDefaults(pageIndex, pageSize);
        try {
            const response = await apiService.get(`/subscriptions/employee/${employeeId}?pageIndex=${finalPageIndex}&pageSize=${finalPageSize}&searchTerm=${searchTerm || ''}&isActive=${isActive || 'active'}`);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }

    }

};
export default subscriptionService;