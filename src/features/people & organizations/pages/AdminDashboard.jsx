import React from "react";
import { useQuery } from "@tanstack/react-query";
import dashboardService from "../services/dashboardService";
import { Card, Row, Col, Statistic, Table, Progress, Empty } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => dashboardService.getAdminDashboard(),
  });

  // Columns for Recent Payments Table
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
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
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

  // Columns for Recent Claims Table
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
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
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

  // Columns for Companies Table
  const companiesColumns = [
    {
      title: "Company ID",
      dataIndex: "companyId",
      key: "companyId",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Employees",
      dataIndex: "employeeCount",
      key: "employeeCount",
    },
    {
      title: "Subscriptions",
      dataIndex: "subscriptionCount",
      key: "subscriptionCount",
    },
  ];

  if (isLoading) {
    return <Loader2 className="m-auto h-10 w-10 animate-spin text-blue-400" />;
  }

  if (!dashboardData) {
    return (
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">
          Admin Dashboard
        </h1>
        <Empty
          description="Not enough data available to display. Come back later."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="py-8 w-full h-64 bg-white rounded-lg shadow-md"
        />
      </div>
    );
  }

  const { overview, companies, recentPayments, recentClaims, statistics } =
    dashboardData;

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Overview Stats */}
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Admin Dashboard
      </h1>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Companies"
              value={overview?.totalCompanies || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={overview?.totalUsers || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
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
              value={overview?.totalActiveSubscriptions || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Inactive Subscriptions"
              value={overview?.totalInactiveSubscriptions || 0}
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
      </Row>

      {/* Companies List */}
      <Card
        title="All Companies"
        className="mb-6"
        bodyStyle={{ padding: "24px" }}
      >
        {(companies || []).length > 0 ? (
          <Table
            dataSource={companies || []}
            columns={companiesColumns}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 300 }}
          />
        ) : (
          <Empty
            description="No companies available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-8"
          />
        )}
      </Card>

      {/* Recent Activity */}
      <Row gutter={[16, 16]} className="mb-6">
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
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Subscription Status" bodyStyle={{ padding: "24px" }}>
            <div className="space-y-6">
              {Object.entries(statistics?.subscriptions || {}).map(
                ([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize font-medium text-gray-700">
                        {status}
                      </span>
                      <span className="text-gray-600">
                        {count || 0} subscriptions
                      </span>
                    </div>
                    <Progress
                      percent={Math.round(
                        ((count || 0) / (overview?.totalSubscriptions || 1)) *
                          100
                      )}
                      status={
                        status === "active"
                          ? "success"
                          : status === "pending"
                          ? "active"
                          : "exception"
                      }
                      strokeWidth={10}
                      showInfo={false}
                    />
                  </div>
                )
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Claims Statistics" bodyStyle={{ padding: "24px" }}>
            <div className="space-y-6">
              {Object.entries(statistics?.claims || {}).map(
                ([status, data]) => (
                  <div key={status}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize font-medium text-gray-700">
                        {status}
                      </span>
                      <span className="text-gray-600">
                        {data?.count || 0} claims
                      </span>
                    </div>
                    <Progress
                      percent={Math.round(
                        ((data?.count || 0) / (overview?.totalClaims || 1)) *
                          100
                      )}
                      status={
                        status === "approved"
                          ? "success"
                          : status === "pending"
                          ? "active"
                          : "exception"
                      }
                      strokeWidth={10}
                      showInfo={false}
                    />
                  </div>
                )
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Payment Statistics" bodyStyle={{ padding: "24px" }}>
            <div className="space-y-6">
              {Object.entries(statistics?.payments || {}).map(
                ([status, data]) => (
                  <div key={status}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize font-medium text-gray-700">
                        {status}
                      </span>
                      <span className="text-gray-600">
                        {data?.count || 0} payments
                      </span>
                    </div>
                    <Progress
                      percent={Math.round(
                        ((data?.count || 0) / (overview?.totalPayments || 1)) *
                          100
                      )}
                      status={
                        status === "completed"
                          ? "success"
                          : status === "pending"
                          ? "active"
                          : "exception"
                      }
                      strokeWidth={10}
                      showInfo={false}
                    />
                  </div>
                )
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
