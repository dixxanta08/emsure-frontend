import React from "react";
import { useQuery } from "@tanstack/react-query";
import dashboardService from "../services/dashboardService";
import { Card, Row, Col, Statistic, Table, Progress, Empty } from "antd";
import { UserOutlined, FileTextOutlined, DollarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { useAuth } from "@/auth/AuthContext";

const CompanyDashboard = () => {
  const { loggedInUser } = useAuth();
  const companyId = loggedInUser?.companyId;

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard", companyId],
    queryFn: () => dashboardService.getCompanyDashboard(companyId),
    enabled: !!companyId,
  });

  const recentPaymentsColumns = [
    {
      title: "Payment ID",
      dataIndex: "paymentId",
      key: "paymentId",
    },
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `Rs. ${amount?.toLocaleString() || 0}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : status === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? format(new Date(date), "PPP") : "N/A"),
    },
  ];

  const recentClaimsColumns = [
    {
      title: "Claim ID",
      dataIndex: "claimId",
      key: "claimId",
    },
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `Rs. ${amount?.toLocaleString() || 0}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? format(new Date(date), "PPP") : "N/A"),
    },
  ];

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="p-8">No data available</div>;
  }

  const { company, overview, recentPayments, recentClaims, statistics } = dashboardData;

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Company Info */}
      <Card className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">{company?.name || "Company Name"}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{company?.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{company?.phoneNumber || "N/A"}</p>
          </div>
        </div>
      </Card>

      {/* Overview Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={overview?.totalEmployees || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Subscriptions"
              value={overview?.activeSubscriptions || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Claims"
              value={overview?.totalClaims || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Claim Amount"
              value={overview?.totalClaimAmount || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => `Rs. ${value?.toLocaleString() || 0}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Monthly Payments */}
      <Card 
        title="Monthly Payments" 
        className="mt-6"
        bodyStyle={{ padding: "24px" }}
      >
        {(statistics?.monthlyPayments || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(statistics?.monthlyPayments || []).map((month) => (
              <Card 
                key={month?.month} 
                size="small"
                className="hover:shadow-md transition-shadow duration-200"
                bodyStyle={{ padding: "16px" }}
              >
                <Statistic
                  title={
                    <span className="text-gray-600">
                      {month?.month ? format(new Date(month.month + "-01"), "MMMM yyyy") : "Unknown Month"}
                    </span>
                  }
                  value={month?.totalAmount || 0}
                  prefix={<DollarOutlined className="text-green-500" />}
                  formatter={(value) => `Rs. ${value?.toLocaleString() || 0}`}
                />
                <p className="text-sm text-gray-500 mt-2">{month?.count || 0} payments</p>
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            description="No monthly payment data available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-8"
          />
        )}
      </Card>

      {/* Recent Activity */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Payments" 
            className="h-full"
            bodyStyle={{ padding: "24px" }}
          >
            {(recentPayments || []).length > 0 ? (
              <Table
                dataSource={recentPayments || []}
                columns={recentPaymentsColumns}
                pagination={false}
                scroll={{ y: 300 }}
              />
            ) : (
              <Empty
                description="No recent payments"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="py-8"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Claims" 
            className="h-full"
            bodyStyle={{ padding: "24px" }}
          >
            {(recentClaims || []).length > 0 ? (
              <Table
                dataSource={recentClaims || []}
                columns={recentClaimsColumns}
                pagination={false}
                scroll={{ y: 300 }}
              />
            ) : (
              <Empty
                description="No recent claims"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="py-8"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card 
            title="Claims Statistics"
            bodyStyle={{ padding: "24px" }}
          >
            <div className="space-y-6">
              {Object.entries(statistics?.claims || {}).map(([status, data]) => (
                <div key={status}>
                  <div className="flex justify-between mb-2">
                    <span className="capitalize font-medium text-gray-700">{status}</span>
                    <span className="text-gray-600">{data?.count || 0} claims</span>
                  </div>
                  <Progress
                    percent={Math.round(((data?.totalAmount || 0) / (overview?.totalClaimAmount || 1)) * 100)}
                    status={status === "approved" ? "success" : status === "pending" ? "active" : "exception"}
                    strokeWidth={10}
                    showInfo={false}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Subscription Status"
            bodyStyle={{ padding: "24px" }}
          >
            <div className="space-y-6">
              {Object.entries(statistics?.subscriptions || {}).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between mb-2">
                    <span className="capitalize font-medium text-gray-700">{status}</span>
                    <span className="text-gray-600">{count || 0} subscriptions</span>
                  </div>
                  <Progress
                    percent={Math.round(((count || 0) / (overview?.activeSubscriptions || 1)) * 100)}
                    status={status === "active" ? "success" : status === "pending" ? "active" : "exception"}
                    strokeWidth={10}
                    showInfo={false}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CompanyDashboard; 