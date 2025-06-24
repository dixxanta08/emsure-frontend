import React from "react";
import { useQuery } from "@tanstack/react-query";
import dashboardService from "../services/dashboardService";
import { Card, Row, Col, Statistic, Table, Progress, Empty, Tag, Timeline } from "antd";
import { UserOutlined, FileTextOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, InsuranceOutlined, WalletOutlined, HistoryOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { useAuth } from "@/auth/AuthContext";

const EmployeeDashboard = () => {
  const { loggedInUser } = useAuth();
  const employeeId = loggedInUser?.employeeId;

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["employee-dashboard", employeeId],
    queryFn: () => dashboardService.getEmployeeDashboard(employeeId),
    enabled: !!employeeId,
  });

  const upcomingPaymentsColumns = [
    {
      title: "Plan Name",
      dataIndex: "planName",
      key: "planName",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `Rs. ${amount?.toLocaleString() || 0}`,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => format(new Date(date), "PPP"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "pending" ? "gold" : "green"}>
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </Tag>
      ),
    },
  ];

  const recentClaimsColumns = [
    {
      title: "Claim ID",
      dataIndex: "claimId",
      key: "claimId",
    },
    {
      title: "Plan Name",
      dataIndex: "planName",
      key: "planName",
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
        <Tag color={
          status === "approved" ? "success" :
          status === "pending" ? "gold" :
          status === "rejected" ? "error" : "default"
        }>
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => format(new Date(date), "PPP"),
    },
  ];

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="p-8">No data available</div>;
  }

  const { employee, subscriptions, upcomingPayments, recentClaims, statistics, recentClaimHistory } = dashboardData;

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Employee Info */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{employee?.name}</h1>
            <p className="text-gray-600">{employee?.companyName}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">{employee?.email}</p>
            <p className="text-gray-600">{employee?.phoneNumber}</p>
          </div>
        </div>
      </Card>

      {/* Active Subscriptions */}
      <Card title="Active Insurance Plans" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptions?.length > 0 ? (
            subscriptions.map((subscription) => (
              <Card key={subscription.planName} size="small" className="hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-lg mb-2">{subscription.planName}</h3>
                <p className="text-gray-600 mb-4">{subscription.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Start: {format(new Date(subscription.startDate), "PPP")}</span>
                  <span>End: {format(new Date(subscription.endDate), "PPP")}</span>
                </div>
                <Tag color="success" className="mt-2">{subscription.status}</Tag>
              </Card>
            ))
          ) : (
            <div className="col-span-2">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No active insurance plans"
                imageStyle={{ height: 60 }}
              >
                <InsuranceOutlined className="text-4xl text-gray-400 mb-4" />
              </Empty>
            </div>
          )}
        </div>
      </Card>

      {/* Upcoming Payments */}
      <Card title="Upcoming Payments" className="mb-6">
        {upcomingPayments?.length > 0 ? (
          <Table
            dataSource={upcomingPayments}
            columns={upcomingPaymentsColumns}
            pagination={false}
            scroll={{ x: true }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No upcoming payments"
            imageStyle={{ height: 60 }}
          >
            <WalletOutlined className="text-4xl text-gray-400 mb-4" />
          </Empty>
        )}
      </Card>

      {/* Recent Claims */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Recent Claims">
            {recentClaims?.length > 0 ? (
              <Table
                dataSource={recentClaims}
                columns={recentClaimsColumns}
                pagination={false}
                scroll={{ x: true }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No recent claims"
                imageStyle={{ height: 60 }}
              >
                <FileTextOutlined className="text-4xl text-gray-400 mb-4" />
              </Empty>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Claim History">
            {recentClaimHistory?.length > 0 ? (
              <Timeline>
                {recentClaimHistory.map((claim) => (
                  <Timeline.Item
                    key={claim.claimId}
                    color={
                      claim.status === "approved" ? "green" :
                      claim.status === "pending" ? "gold" :
                      claim.status === "rejected" ? "red" : "blue"
                    }
                  >
                    <p className="font-medium">{claim.description}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(claim.createdAt), "PPP")}
                    </p>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No claim history"
                imageStyle={{ height: 60 }}
              >
                <HistoryOutlined className="text-4xl text-gray-400 mb-4" />
              </Empty>
            )}
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Claims Statistics">
            {Object.keys(statistics?.claims || {}).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(statistics.claims).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize font-medium text-gray-700">{status}</span>
                      <span className="text-gray-600">{count} claims</span>
                    </div>
                    <Progress
                      percent={Math.round((count / Object.values(statistics.claims).reduce((a, b) => a + b, 0)) * 100)}
                      status={status === "approved" ? "success" : status === "pending" ? "active" : "exception"}
                      strokeWidth={10}
                      showInfo={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No claims statistics available"
                imageStyle={{ height: 60 }}
              >
                <FileTextOutlined className="text-4xl text-gray-400 mb-4" />
              </Empty>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Payment Summary">
            {(statistics?.payments?.totalPaid > 0 || statistics?.payments?.totalPayments > 0) ? (
              <div className="space-y-4">
                <Statistic
                  title="Total Amount Paid"
                  value={statistics.payments.totalPaid}
                  prefix={<DollarOutlined className="text-green-500" />}
                  formatter={(value) => `Rs. ${value?.toLocaleString() || 0}`}
                />
                <Statistic
                  title="Total Payments"
                  value={statistics.payments.totalPayments}
                  prefix={<CheckCircleOutlined className="text-blue-500" />}
                />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No payment history available"
                imageStyle={{ height: 60 }}
              >
                <WalletOutlined className="text-4xl text-gray-400 mb-4" />
              </Empty>
            )}
          </Card>
        </Col>
      </Row>

      {/* Benefit Usage */}
      <Card title="Benefit Usage Summary" className="mt-6">
        {statistics?.benefitUsage?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statistics.benefitUsage.map((benefit) => (
              <Card key={benefit.benefitId} size="small">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">In-Network Usage</h4>
                    <Progress
                      percent={Math.round((benefit.totalInNetworkUsed / (benefit.totalInNetworkUsed + benefit.totalOutNetworkUsed)) * 100)}
                      status="success"
                      strokeWidth={10}
                      showInfo={false}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Rs. {benefit.totalInNetworkUsed?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Out-Network Usage</h4>
                    <Progress
                      percent={Math.round((benefit.totalOutNetworkUsed / (benefit.totalInNetworkUsed + benefit.totalOutNetworkUsed)) * 100)}
                      status="exception"
                      strokeWidth={10}
                      showInfo={false}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Rs. {benefit.totalOutNetworkUsed?.toLocaleString() || 0}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Total Usage Count: {benefit.usageCount}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No benefit usage data available"
            imageStyle={{ height: 60 }}
          >
            <InsuranceOutlined className="text-4xl text-gray-400 mb-4" />
          </Empty>
        )}
      </Card>
    </div>
  );
};

export default EmployeeDashboard; 