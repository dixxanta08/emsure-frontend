import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthContext";
import unifiedPaymentService from "../../client portal/services/unifiedPaymentService";
import companyService from "@/features/authentication/services/companyService";
import AppDataTable from "@/components/app-data-table";
import SearchBar from "@/components/app-searchbar";
import {
  Select,
  DatePicker,
  Button,
  Modal,
  Descriptions,
  Pagination,
} from "antd";
import { format } from "date-fns";

const InsurancePayments = () => {
  const { loggedInUser } = useAuth();
  const isAgent = useMemo(
    () => loggedInUser?.roleName === "AGENT",
    [loggedInUser]
  );
  const agentId = useMemo(() => loggedInUser?.agentId, [loggedInUser]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentType, setPaymentType] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: payments, isLoading } = useQuery({
    queryKey: [
      "payments",
      pageIndex,
      pageSize,
      searchTerm,
      paymentType,
      paymentStatus,
      dateRange,
      isAgent,
      agentId,
    ],
    queryFn: async () => {
      const startDate = dateRange?.[0]
        ? dateRange[0].startOf("day").toDate()
        : null;
      const endDate = dateRange?.[1]
        ? dateRange[1].endOf("day").toDate()
        : null;

      console.log("Sending to backend:", { startDate, endDate }); // Debug

      if (isAgent) {
        return await unifiedPaymentService.getAgentPayments(
          agentId,
          pageIndex,
          pageSize,
          searchTerm,
          paymentType,
          paymentStatus,
          startDate,
          endDate
        );
      } else {
        return await unifiedPaymentService.getAllPayments(
          pageIndex,
          pageSize,
          searchTerm,
          paymentType,
          paymentStatus,
          startDate,
          endDate
        );
      }
    },
  });

  const { data: companyData } = useQuery({
    queryKey: ["company", selectedPayment?.companyId],
    queryFn: async () => {
      if (!selectedPayment?.companyId) return null;
      const data = await companyService.getCompany(selectedPayment.companyId);
      return data.company;
    },
    enabled: !!selectedPayment?.companyId,
  });

  const columns = [
    {
      accessorKey: "transactionUUID",
      header: "Transaction ID",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.transactionUUID}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "User",
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => `Rs. ${row.original.totalAmount.toLocaleString()}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : status === "complete"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedPayment(row.original);
            setIsModalVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handlePageChange = (page, size) => {
    setPageIndex(page - 1);
    setPageSize(size);
  };

  const handleResetFilters = () => {
    setPaymentType("all");
    setPaymentStatus("all");
    setDateRange(null);
    setSearchTerm("");
    setPageIndex(0);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Payments</h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <SearchBar onSearchClick={setSearchTerm} value={searchTerm} />
          </div>

          <Select
            className="min-w-[150px]"
            placeholder="Payment Type"
            value={paymentType}
            onChange={setPaymentType}
          >
            <Select.Option value="all">All Types</Select.Option>
            <Select.Option value="claim">Claim Payment</Select.Option>
            <Select.Option value="employee_subscription">
              Subscription Payment
            </Select.Option>
          </Select>

          <Select
            className="min-w-[150px]"
            placeholder="Payment Status"
            value={paymentStatus}
            onChange={setPaymentStatus}
          >
            <Select.Option value="all">All Status</Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="complete">Complete</Select.Option>
            <Select.Option value="failed">Failed</Select.Option>
          </Select>

          {/* <DatePicker.RangePicker
            className="min-w-[250px]"
            value={dateRange}
            onChange={setDateRange}
          /> */}

          <Button onClick={handleResetFilters}>Reset Filters</Button>
        </div>

        <AppDataTable
          columns={columns}
          data={payments?.payments || []}
          loading={isLoading}
        />

        <div className="mt-4 flex justify-end">
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            total={payments?.totalItems || 0}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
          />
        </div>

        <Modal
          title="Payment Details"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedPayment && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Transaction ID">
                {selectedPayment.transactionUUID}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Type">
                {selectedPayment.paymentType === "claim"
                  ? "Claim Payment"
                  : "Subscription Payment"}
              </Descriptions.Item>
              <Descriptions.Item label="User Name">
                {selectedPayment.name}
              </Descriptions.Item>
              <Descriptions.Item label="Company Name">
                {companyData?.companyName || "Loading..."}
              </Descriptions.Item>
              <Descriptions.Item label="Plan Name">
                {selectedPayment.planName}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                Rs. {selectedPayment.totalAmount.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedPayment.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedPayment.status === "complete"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedPayment.status.charAt(0).toUpperCase() +
                    selectedPayment.status.slice(1)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedPayment.paymentMethod.toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {format(new Date(selectedPayment.date), "PPP")}
              </Descriptions.Item>
              {selectedPayment.paymentType === "claim" && (
                <Descriptions.Item label="Claim ID">
                  {selectedPayment.claimId}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Employee ID">
                {selectedPayment.employeeId}
              </Descriptions.Item>
              <Descriptions.Item label="Company ID">
                {selectedPayment.companyId}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default InsurancePayments;
