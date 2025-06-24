import companyService from "@/features/authentication/services/companyService";
import Button from "@/features/client portal/components/customantd/button";
import Select from "@/features/client portal/components/customantd/select";
import { useQuery } from "@tanstack/react-query";
import { Empty, Progress } from "antd";
import {
  ArrowLeft,
  DollarSign,
  FileIcon,
  FileTextIcon,
  PieChartIcon,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ClaimsDistributionChart from "../components/ClaimsDistributionChart";
import ProcessingTimeChart from "../components/ProcessingTimeChart";
import { useAuth } from "@/auth/AuthContext";

const InsuranceCompaniesReport = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { loggedInUser } = useAuth();
  const roleName = useMemo(() => loggedInUser.roleName, []);

  const { data: companies, isLoading } = useQuery({
    queryKey: ["insurance-companies"],
    queryFn: async () => {
      if (roleName === "AGENT") {
        const response = await companyService.getCompaniesByAgentId(
          loggedInUser.userId
        );
        return response.companies;
      } else {
        const response = await companyService.getCompanies();
        return response.companies;
      }
    },
  });
  const { data: companyReports } = useQuery({
    queryKey: ["insurance-company-reports", selectedCompany],
    queryFn: async () => {
      if (selectedCompany) {
        const response = await companyService.getCompanyReports(
          selectedCompany.companyId
        );
        return response.data.companyReports;
      }
      return null;
    },
    enabled: !!selectedCompany,
  });

  const handleSelectCompanyChange = (value) => {
    const selected = companies.find((company) => company.companyId === value);
    setSelectedCompany(selected || null);
  };

  return (
    <div className="p-8 bg-gray-100 h-full">
      <div className="flex items-center justify-start gap-4 mb-6">
        <Button
          icon={<ArrowLeft />}
          onClick={() => navigate(-1)}
          variant="empty"
        ></Button>
        <h1 className="font-semibold text-lg">Company Report </h1>
      </div>
      <div>
        <p className="text-sm mb-2">Select Company</p>
        <Select
          className="w-full"
          placeholder="Select Insurance Company"
          loading={isLoading}
          onChange={handleSelectCompanyChange}
        >
          {companies?.map((company) => (
            <Select.Option key={company.companyId} value={company.companyId}>
              {company.companyName}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div className="bg-white p-4 py-6 mt-4 rounded-md ">
        {selectedCompany ? (
          <div className="">
            <h3 className="text-base font-semibold ">Company Information</h3>
            <div className="grid grid-cols-3 gap-4 mt-6 px-4">
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <Link
                  to={`/people-organizations/companies/${selectedCompany?.companyId}/details`}
                >
                  <p className="text-sm font-semibold text-purple-600 underline hover:text-purple-900">
                    {selectedCompany.companyName}
                  </p>
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600">Company Address</p>
                <p className="text-sm font-semibold text-gray-600">
                  {selectedCompany.companyAddress}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="text-sm font-semibold text-gray-600">
                  {selectedCompany.email}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center h-full">
            <Empty description={"Please select a company to view reports"} />
          </div>
        )}
      </div>
      {selectedCompany && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {/* Insurance Claims */}
            <div className="bg-white p-4 py-6 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Claims</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {companyReports?.claimsSummary?.totalClaims || 0}
                  </p>
                </div>
                <FileTextIcon
                  className="text-gray-800 p-2 rounded-full bg-gray-300"
                  size={36}
                />
              </div>
              <div className="flex justify-between items-center mb-2 text-sm">
                <p className="text-gray-600">Insurance Approved</p>
                <p className="text-gray-800">
                  {companyReports?.claimsSummary?.insuranceApproved || 0}
                </p>
              </div>
              <div className="flex justify-between items-center mb-2 text-sm">
                <p className="text-gray-600">Insurance Rejected</p>
                <p className="text-gray-800">
                  {companyReports?.claimsSummary?.insuranceRejected || 0}
                </p>
              </div>
            </div>
            {/* payments */}
            <div className="bg-white p-4 py-6 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-sm font-semibold text-gray-800">
                    NPR. {companyReports?.payments?.totalPayments || 0}
                  </p>
                </div>
                <DollarSign
                  className="text-green-700 p-2 rounded-full bg-gray-100"
                  size={36}
                />
              </div>
              <div className="flex justify-between items-center mb-2 text-sm">
                <p className="text-gray-600">Pending Payments</p>
                <p className="text-gray-800">
                  NPR. {companyReports?.payments?.pendingPayments || 0}
                </p>
              </div>
              <div className="flex justify-between items-center mb-2 text-sm">
                <p className="text-gray-600">Claims Reimbursed</p>
                <p className="text-gray-800">
                  NPR. {companyReports?.payments?.claimReimbursed || 0}
                </p>
              </div>
            </div>
            {/* claim limit utilization */}
            <div className="bg-white p-4 py-6 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Claim Limit Utilization
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    NPR.{" "}
                    {companyReports?.claimLimitUtilization?.totalLimit || 0}
                  </p>
                </div>
                <PieChartIcon
                  className="text-blue-700 p-2 rounded-full bg-gray-100"
                  size={36}
                />
              </div>
              <div className="flex justify-between items-center mb-2 text-sm">
                <Progress
                  percent={
                    companyReports?.claimLimitUtilization
                      ?.claimLimitUtilizationPercent
                  }
                />
              </div>
              <div className="flex justify-between items-center mb-2 text-sm">
                <p className="text-gray-800">
                  Used: NPR.
                  {companyReports?.claimLimitUtilization?.usedAmount || 0}
                </p>
                <p className="text-gray-800">
                  Available: NPR.
                  {companyReports?.claimLimitUtilization?.availableAmount || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md: grid-cols-2 gap-6 mt-6">
            <div className="h-72 bg-white p-6 rounded-md flex flex-col items-center justify-center">
              <h3 className="text-base font-semibold text-gray-800 w-full text-left">
                {" "}
                Claims Distribution
              </h3>
              <ClaimsDistributionChart
                chartData={companyReports?.claimsDistribution?.data}
                chartLabel={companyReports?.claimsDistribution?.labels?.map(
                  (label) =>
                    label.split("_").join(" ").charAt(0).toUpperCase() +
                    label.split("_").join(" ").slice(1).toLowerCase()
                )}
              />
            </div>
            <div className="h-72 bg-white p-6 rounded-md flex flex-col items-center justify-center">
              <h3 className="text-base font-semibold text-gray-800 w-full text-left">
                {" "}
                Processing Time Trends
              </h3>
              <ProcessingTimeChart
                chartLabel={companyReports?.processingTimeTrends?.labels}
                chartData={companyReports?.processingTimeTrends?.data}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InsuranceCompaniesReport;
