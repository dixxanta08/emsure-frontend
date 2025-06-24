import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./features/authentication/pages/Login";
import ErrorPage from "./pages/ErrorPage";
import TestLayout from "./layout/TestLayout";
import Test from "./pages/Test";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoutes from "./auth/ProtectedRoutes";
import MainLayout from "./layout/MainLayout";

import ErrorBoundaryWithRetry from "./utils/error/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import ResetPassword from "./features/authentication/pages/ResetPassword";
import Agents from "./features/people & organizations/pages/Agents";
import AgentsForm from "./features/people & organizations/pages/AgentsForm";
import AgentsDetail from "./features/people & organizations/pages/AgentsDetail";
import AuthLayout from "./features/authentication/layout/AuthLayout";
import ForgotPassword from "./features/authentication/pages/ForgotPassword";
import EmailSent from "./features/authentication/pages/EmailSent";
import InvalidResetToken from "./features/authentication/pages/InvalidResetToken";
import Companies from "./features/people & organizations/pages/Companies";
import CompaniesDetail from "./features/people & organizations/pages/CompaniesDetail";
import CompaniesForm from "./features/people & organizations/pages/CompaniesForm";
import Employees from "./features/people & organizations/pages/Employees";
import EmployeesForm from "./features/people & organizations/pages/EmployeesForm";
import EmployeesDetail from "./features/people & organizations/pages/EmployeesDetail";
import BenefitTypes from "./features/insurance management/pages/BenefitTypes";
import Benefits from "./features/insurance management/pages/Benefits";
import MedicalFacilities from "./features/insurance management/pages/MedicalFacilities";
import MedicalFacilitiesDetail from "./features/insurance management/pages/MedicalFacilitiesDetail";
import MedicalFacilitiesForm from "./features/insurance management/pages/MedicalFacilitiesForm";
import PoliciesForm from "./features/insurance management/pages/PoliciesForm";
import PoliciesDetail from "./features/insurance management/pages/PoliciesDetail";
import Plans from "./features/insurance management/pages/Plans";
import PlansDetail from "./features/insurance management/pages/PlansDetails";
import PlansForm from "./features/insurance management/pages/PlansForm";
import { ConfigProvider, theme } from "antd";
import Policies from "./features/insurance management/pages/Policies";
import ProtectedRoute from "./auth/ProtectedRoute";
import ExplorePlans from "./features/client portal/pages/ExplorePlans";
import CompanyDetail from "./features/client portal/pages/CompanyDetail";
import CompanyEmployees from "./features/client portal/pages/Employees";
import ExplorePlanDetails from "./features/client portal/pages/ExplorePlanDetails";
import BuyPlan from "./features/client portal/pages/BuyPlan";
import PaymentSuccess from "./features/client portal/pages/PaymentSuccess";
import CompanyForm from "./features/client portal/pages/CompanyForm";
import SubscribedPlans from "./features/client portal/pages/SubscribedPlans";
import SubscribedPlanDetail from "./features/client portal/pages/SubscribedPlanDetail";
import EmployeeSubscribedPlan from "./features/client portal/pages/EmployeeSubscribedPlan";
import MonthlyPaymentSuccess from "./features/client portal/pages/MonthlyPaymentSuccess";
import ClaimForm from "./features/client portal/pages/ClaimForm";
import ClaimDetail from "./features/client portal/pages/ClaimDetail";
import CompanyEmployeeDetails from "./features/client portal/pages/CompanyEmployeeDetails";
import CompanyClaims from "./features/client portal/pages/Claims";
import PaymentFailed from "./features/client portal/pages/PaymentFailed";
import ProfilePage from "./features/authentication/pages/ProfilePage";

import Claims from "./features/subscription management/pages/Claims";
import ClaimDetailInsurance from "./features/subscription management/pages/ClaimDetail";
import SubscribedPlansInsurance from "./features/subscription management/pages/SubscribedPlans";
import SubscribedPlanDetailInsurance from "./features/subscription management/pages/SubscribedPlanDetail";
import EmployeeSubscribedPlanInsurance from "./features/subscription management/pages/EmployeeSubscribedPlan";
import ClientPoliciesDetail from "./features/client portal/pages/PoliciesDetail";
import Register from "./features/authentication/pages/Register";
import ClaimPaymentSuccess from "./features/subscription management/pages/ClaimPaymentSuccess";
import ClaimPaymentFailed from "./features/subscription management/pages/ClaimPaymentFailed";
import Payments from "./features/client portal/pages/Payments";
import InsurancePayments from "./features/subscription management/pages/Payments";
import CompanyDashboard from "./features/client portal/pages/CompanyDashboard";
import EmployeeDashboard from "./features/client portal/pages/EmployeeDashboard";
import AdminDashboard from "./features/people & organizations/pages/AdminDashboard";
import InsuranceWorkers from "./features/people & organizations/pages/InsuranceWorkers";
import InsuranceWorkersForm from "./features/people & organizations/pages/InsuranceWorkersForm";
import AgentDashboard from "./features/people & organizations/pages/AgentDashboard";
import LandingPlans from "./pages/LandingPlans";
import InsuranceCompaniesReport from "./features/reporting/pages/InsuranceCompaniesReport";
import Features from "./pages/Features";
const App = () => {
  const queryClient = new QueryClient();
  return (
    <>
      {/* <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav> */}
      <ConfigProvider
        theme={{
          algorithm: theme.compactAlgorithm,
          components: {
            Select: {
              colorBorder: "#6b7280",
            },
            Button: {},
          },
        }}
      >
        <AuthProvider>
          <ErrorBoundaryWithRetry>
            <QueryClientProvider client={queryClient}>
              <Routes>
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        "AGENT",
                        "SUPER_ADMIN",
                        "INSURANCE_WORKER",
                      ]}
                    />
                  }
                >
                  <Route element={<MainLayout />}>
                    <Route
                      path="/agent-dashboard"
                      element={<AgentDashboard />}
                    />
                  </Route>
                </Route>

                {/* Agent allowed routes */}

                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={["SUPER_ADMIN", "INSURANCE_WORKER"]}
                    />
                  }
                >
                  <Route element={<MainLayout />}>
                    <Route
                      path="/main-dashboard"
                      element={<AdminDashboard />}
                    />
                    <Route path="/people-organizations">
                      <Route path="agents" element={<Agents />} />
                      <Route
                        path="agents/:agentId/details"
                        element={<AgentsDetail />}
                      />
                      <Route
                        path="insurance-workers"
                        element={<InsuranceWorkers />}
                      />
                      <Route
                        path="insurance-workers/:userId/details"
                        element={<InsuranceWorkersForm />}
                      />
                    </Route>
                    <Route path="/insurance-management">
                      <Route path="plans/:planId" element={<PlansForm />} />
                      <Route
                        path="policies/:policyId"
                        element={<PoliciesForm />}
                      />
                      <Route
                        path="medical-facilities/:medicalFacilityId/details"
                        element={<MedicalFacilitiesDetail />}
                      />
                    </Route>
                  </Route>
                </Route>

                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        "AGENT",
                        "SUPER_ADMIN",
                        "INSURANCE_WORKER",
                      ]}
                    />
                  }
                >
                  <Route element={<MainLayout />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/people-organizations">
                      <Route path="companies" element={<Companies />} />
                      {/* <Route
                        path="companies/:companyId"
                        element={<CompaniesForm />}
                      /> */}
                      <Route
                        path="companies/:companyId/details"
                        element={<CompaniesDetail />}
                      />
                      <Route path="employees" element={<Employees />} />
                      <Route
                        path="companies/:companyId/employees"
                        element={<Employees />}
                      />
                      <Route
                        path="companies/:companyId/employees/:employeeId"
                        element={<EmployeesForm />}
                      />
                      <Route
                        path="companies/:companyId/employees/:employeeId/details"
                        element={<EmployeesDetail />}
                      />
                      <Route index element={<Test />} />
                    </Route>

                    <Route path="/insurance-management">
                      <Route path="benefits" element={<Benefits />} />
                      <Route path="benefit-types" element={<BenefitTypes />} />
                      <Route
                        path="medical-facilities"
                        element={<MedicalFacilities />}
                      />
                      {/* <Route
                        path="medical-facilities/:medicalFacilityId"
                        element={<MedicalFacilitiesForm />}
                      /> */}
                      {/* <Route
                        path="medical-facilities/:medicalFacilityId/details"
                        element={<MedicalFacilitiesDetail />}
                      /> */}
                      <Route path="policies" element={<Policies />} />

                      <Route
                        path="policies/:policyId/details"
                        element={<PoliciesDetail />}
                      />
                      <Route path="plans" element={<Plans />} />
                      {/* <Route path="plans/:planId" element={<PlansForm />} /> */}
                      <Route
                        path="plans/:planId/details"
                        element={<PlansDetail />}
                      />
                    </Route>

                    <Route path="/subscription-management">
                      <Route path="payments" element={<InsurancePayments />} />
                      <Route
                        path="plan-subscriptions"
                        element={<SubscribedPlansInsurance />}
                      />
                      <Route
                        path="company/:companyId/plan-subscriptions"
                        element={<SubscribedPlansInsurance />}
                      />
                      <Route
                        path="plan-subscriptions/:subscriptionId/details"
                        element={<SubscribedPlanDetailInsurance />}
                      />
                      <Route
                        path="plan-subscriptions/:subscriptionId/employees/:employeeId"
                        element={<EmployeeSubscribedPlanInsurance />}
                      />
                      <Route path="claims" element={<Claims />} />
                      <Route
                        path="claims/:claimId/details"
                        element={<ClaimDetailInsurance />}
                      />
                      <Route
                        path="claim-payment-success/:employeeSubscriptionClaimPaymentId"
                        element={<ClaimPaymentSuccess />}
                      />
                      <Route
                        path="claim-payment-failed"
                        element={<ClaimPaymentFailed />}
                      />
                    </Route>
                    <Route path="/report">
                      <Route
                        path="company"
                        element={<InsuranceCompaniesReport />}
                      />
                    </Route>
                  </Route>
                </Route>

                <Route
                  element={
                    <ProtectedRoute allowedRoles={["EMPLOYEE", "EMPLOYER"]} />
                  }
                >
                  <Route element={<MainLayout />}>
                    <Route path="/explore-plans" element={<ExplorePlans />} />

                    <Route path="/user-profile" element={<ProfilePage />} />
                    <Route path="/payments" element={<Payments />} />

                    <Route
                      path="/policies/:policyId"
                      element={<ClientPoliciesDetail />}
                    />

                    <Route
                      path="/explore-plans/:planId"
                      element={<ExplorePlanDetails />}
                    />

                    <Route path="/company" element={<CompanyDetail />} />

                    <Route path="/company-edit" element={<CompanyForm />} />

                    <Route
                      element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}
                    >
                      <Route
                        path="/employee-dashboard"
                        element={<EmployeeDashboard />}
                      />
                    </Route>
                    <Route
                      element={<ProtectedRoute allowedRoles={["EMPLOYER"]} />}
                    >
                      <Route
                        path="/company-dashboard"
                        element={<CompanyDashboard />}
                      />
                      <Route path="/employees" element={<CompanyEmployees />} />
                      <Route path="/buy-plan/:planId" element={<BuyPlan />} />

                      <Route
                        path="/payment-success/:paymentId"
                        element={<PaymentSuccess />}
                      />
                      <Route
                        path="/payment-failed/:paymentId"
                        element={<PaymentFailed />}
                      />

                      <Route
                        path="/monthly-payment-success/:employeeSubscriptionPaymentId"
                        element={<MonthlyPaymentSuccess />}
                      />
                    </Route>

                    <Route
                      path="/employees/:employeeId/details"
                      element={<CompanyEmployeeDetails />}
                    />

                    <Route
                      path="/subscribed-plans"
                      element={<SubscribedPlans />}
                    />
                    <Route
                      path="subscribed-plans/:subscriptionId/details"
                      element={<SubscribedPlanDetail />}
                    />
                    <Route
                      path="subscribed-plans/:subscriptionId/employees/:employeeId"
                      element={<EmployeeSubscribedPlan />}
                    />
                    <Route path="claims/" element={<CompanyClaims />} />
                    <Route
                      path="subscribed-plans/:subscriptionId/employees/:employeeId/claims/new"
                      element={<ClaimForm />}
                    />

                    <Route
                      path="claims/:claimId/details"
                      element={<ClaimDetail />}
                    />

                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />

                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  <Route
                    path="/reset-password/:resetPasswordToken"
                    element={<ResetPassword />}
                  />
                </Route>
                <Route path="/email-sent" element={<EmailSent />} />
                <Route
                  path="/invalid-reset-token"
                  element={<InvalidResetToken />}
                />

                {/* <Route element={<>}> */}
                <Route index path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/features" element={<Features />} />
                <Route path="/plans" element={<LandingPlans />} />
                {/* <Route path="/login" element={<Login />} />

                <Route
                  path="/reset-password/:resetPasswordToken"
                  element={<ResetPassword />}
                /> */}
                <Route
                  path="/not-authorized"
                  element={<ErrorPage type="401" />}
                />
                <Route path="*" element={<ErrorPage type="404" />} />
                {/* </Route> */}
              </Routes>
            </QueryClientProvider>
          </ErrorBoundaryWithRetry>
        </AuthProvider>
        <Toaster />
      </ConfigProvider>
    </>
  );
};

export default App;
