import React, { useEffect, useState } from "react";
import Button from "../components/customantd/button";
import Select from "../components/customantd/select";
import FormItem from "../components/customantd/formitem";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import Details from "../components/app-detail";
import AppDataTable from "@/components/app-data-table";
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import planService from "../services/planService";
import companyService from "@/features/authentication/services/companyService";
import { useAuth } from "@/auth/AuthContext";
import { Form, Modal, Popconfirm, Tabs, Tooltip } from "antd";
import subscriptionService from "../services/subscriptionService";
import employeeService from "@/features/authentication/services/employeeService";
import { useToast } from "@/hooks/use-toast";
import { FaExternalLinkAlt } from "react-icons/fa";
import { set } from "date-fns";
import { MAX_PAGE_SIZE } from "@/utils/constants";
import SearchBar from "@/components/app-searchbar";

const formSchema = z.object({
  employeeId: z.number().int().min(1, {
    message: "Employee is required.",
  }),
});

const SubscribedPlanDetail = () => {
  const fields = [
    { name: "subscriptionId", label: "Subscription Id" },
    {
      name: "planName",
      label: "Plan Name",
      type: "dynamiclink",
      hrefTemplate: "/explore-plans/{{planId}}",
    },
    {
      name: "numberOfUsers",
      label: "Number of Users",
    },
    {
      name: "startDate",
      label: "Start Date",
    },

    {
      name: "renewalDate",
      label: "Renewal Date",
    },
    {
      name: "subscriptionStatus",
      label: "Subscription Status",
    },
  ];

  const columns = [
    {
      accessorKey: "employeeSubscriptionId",
      header: "Employee Subscription Id",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "employeeStartDate",
      header: "Start Date",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleEmployeeRowClick(row.original);
            }}
            disabled={cancelSubscriptionMutation.isPending}
          >
            Remove
          </Button>
        </div>
      ),
    },
  ];
  const paymentColumns = [
    {
      accessorKey: "paymentId",
      header: "Payment Id",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "status",
      header: "Status",
    },

    {
      accessorKey: "paymentDate",
      header: "Payment Date",
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
    },
    // {
    //   accessorKey
    // }
  ];
  const claimsColumns = [
    {
      accessorKey: "claimId",
      header: "Claim Id",
    },
    {
      accessorKey: "claimantName",
      header: "Claimant Name",
    },
    {
      accessorKey: "claimDate",
      header: "Claim Date",
    },
    {
      accessorKey: "claimStatus",
      header: "Claim Status",
    },
    {
      accessorKey: "claimAmount",
      header: "Claim Amount",
    },
  ];

  const { subscriptionId } = useParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Modal
  const [modalEmployeeSearchTerm, setModalEmployeeSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("activeEmployees");

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: null,
      subscriptionId: subscriptionId,
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ subscriptionId, employeeSubscriptionFormData }) => {
      if (editingEmployee) {
        return subscriptionService.deleteEmployeeSubscription(
          subscriptionId,
          employeeSubscriptionFormData.employeeId
        );
      } else {
        return subscriptionService.createEmployeeSubscription(
          subscriptionId,
          employeeSubscriptionFormData
        );
      }
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Employee Subcription added successfully",
        description: "Employee Subscription has been added successfully.",
      });
      queryClient.invalidateQueries([
        "subscriptionEmployeeData",
        subscriptionId,
      ]);
      setEditingEmployee(null);
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      console.error("Failed to add employee subscription :", error);

      const errorMessage =
        error.response?.data?.message ||
        "There was a problem while updating the company.";

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessage,
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return subscriptionService.deleteSubscription(subscriptionId);
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Subcription cancelled successfully",
        description: "Employee Subscription has been cancelled successfully.",
      });
      queryClient.invalidateQueries([
        "subscriptionEmployeeData",
        subscriptionId,
      ]);
      setEditingEmployee(null);
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      console.error("Failed to cancel subscription :", error);

      const errorMessage =
        error.response?.data?.message ||
        "There was a problem while cancelling the subscription.";

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessage,
      });
    },
  });
  const onSubmit = (data) => {
    console.log("ADDING EMPLOYEE", data); //this doesn't
    const employeeSubscriptionFormData = {
      employeeId: data.employeeId,
      subscriptionId: subscriptionId,
      employeeStartDate: formatToDateInput(new Date()),
    };
    mutation.mutate({ subscriptionId, employeeSubscriptionFormData });
  };
  const handleOk = () => {
    console.log("handleOk"); // this runs
    console.log("error");
    console.log(employees);
    handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    reset();
  };
  const handleCancelSubscription = () => {
    cancelSubscriptionMutation.mutate();
  };
  const handleModalSelectSearch = (searchTerm) => {
    setModalEmployeeSearchTerm((modalEmployeeSearchTerm) => searchTerm);
  };
  const handleEmployeeRowClick = (row) => {
    setIsModalOpen(true);
    setEditingEmployee(row.employeeId);
    setValue("employeeId", row.employeeId);
  };

  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Active Employees
  const {
    data: subscriptionEmployeesData,
    isLoading: isSubscriptionEmployeesLoading,
    isError: isSubscriptionEmployeesError,
    error: subscriptionEmployeesError,
  } = useQuery({
    queryKey: [
      "subscriptionActiveEmployeeData",
      subscriptionId,
      pageIndex,
      pageSize,
      searchTerm,
    ],
    queryFn: async () => {
      const data = await subscriptionService.getSubscriptionEmployees(
        subscriptionId,
        pageIndex,
        pageSize,
        searchTerm,
        "active"
      );
      return data;
    },
    retry: false,
    enabled: activeTab === "activeEmployees",
  });

  // Inactive Employees
  const {
    data: subscriptionInactiveEmployeesData,
    isLoading: isSubscriptionInactiveEmployeesLoading,
    isError: isSubscriptionInactiveEmployeesError,
    error: subscriptionInactiveEmployeesError,
  } = useQuery({
    queryKey: [
      "subscriptionInactiveEmployeeData",
      subscriptionId,
      pageIndex,
      pageSize,
      searchTerm,
    ],
    queryFn: async () => {
      const data = await subscriptionService.getSubscriptionEmployees(
        subscriptionId,
        pageIndex,
        pageSize,
        searchTerm,
        "inactive"
      );
      return data;
    },
    retry: false,
    enabled: activeTab === "inactiveEmployees",
  });

  // Payments
  const {
    data: subscriptionPaymentsData,
    isLoading: isSubscriptionPaymentsLoading,
    isError: isSubscriptionPaymentsError,
    error: subscriptionPaymentsError,
  } = useQuery({
    queryKey: [
      "subscriptionPaymentsData",
      subscriptionId,
      pageIndex,
      pageSize,
      searchTerm,
    ],
    queryFn: async () => {
      const data = await subscriptionService.getSubscriptionPayments(
        subscriptionId,
        pageIndex,
        pageSize,
        searchTerm
      );
      return data;
    },
    retry: false,
    enabled: activeTab === "payments",
  });

  // Claims
  const {
    data: subscriptionClaimsData,
    isLoading: isSubscriptionClaimsLoading,
    isError: isSubscriptionClaimsError,
    error: subscriptionClaimsError,
  } = useQuery({
    queryKey: [
      "subscriptionClaimsData",
      subscriptionId,
      pageIndex,
      pageSize,
      searchTerm,
    ],
    queryFn: async () => {
      const data = await subscriptionService.getSubscriptionClaims(
        subscriptionId,
        pageIndex,
        pageSize,
        searchTerm
      );
      return data;
    },
    retry: false,
    enabled: activeTab === "claims",
  });

  const {
    data: planSubscriptionData,
    isLoading: isPlanSubscriptionLoading,
    isError: isPlanSubscriptionError,
    error: planSubscriptionError,
  } = useQuery({
    queryKey: ["subscription", subscriptionId],
    queryFn: async () => {
      const data = await subscriptionService.getSubscription(subscriptionId);
      return {
        ...data.subscription,
        isActive:
          data.subscription.subscriptionStatus === "active"
            ? "Active"
            : "Inactive",
      };
    },
    retry: false,
  });

  const {
    data: employees,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
    error: employeesError,
  } = useQuery({
    queryKey: ["employees", subscriptionId, modalEmployeeSearchTerm],
    queryFn: async () => {
      const data = await employeeService.getEmployeesByCompany(
        planSubscriptionData?.companyId,
        0,
        MAX_PAGE_SIZE,
        modalEmployeeSearchTerm,
        "active"
      );
      return data.employees;
    },
    enabled: !!planSubscriptionData?.companyId, // Only run when companyId is available
    retry: false,
  });

  const items = [
    {
      key: "activeEmployees",
      label: "Active Employees",
      children: (
        <>
          <div className="w-full flex items-center justify-between my-4">
            <SearchBar onSearchClick={(value) => setSearchTerm(value)} />
            {planSubscriptionData?.isActive === "Active" && (
              <Button
                variant="primary"
                onClick={() => {
                  setIsModalOpen(true);
                }}
                disabled={cancelSubscriptionMutation.isPending}
              >
                Add Employee
              </Button>
            )}

            <Modal
              title={editingEmployee ? "Remove Employee" : "Add Employee"}
              open={isModalOpen}
              onOk={handleOk}
              okText={editingEmployee ? "Remove" : "Add"}
              okButtonProps={editingEmployee ? { danger: true } : {}}
              onCancel={handleCancel}
            >
              <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
                <FormItem
                  label="Employee"
                  name="employeeId"
                  control={control}
                  help={null}
                >
                  <Select
                    placeholder={"Select Employee"}
                    showSearch
                    onSearch={handleModalSelectSearch}
                    filterOption={false}
                    disabled={editingEmployee}
                  >
                    {employees?.map((employee) => (
                      <Select.Option
                        value={employee.employeeId}
                        key={employee.employeeId}
                        disabled={subscriptionEmployeesData?.employees?.find(
                          (emp) => emp.employeeId === employee.employeeId
                        )}
                      >
                        {employee.name}
                      </Select.Option>
                    ))}
                  </Select>
                </FormItem>
              </Form>
            </Modal>
          </div>

          <AppDataTable
            rowIdKey="employeeSubscriptionId"
            columns={columns}
            data={subscriptionEmployeesData?.employees}
            loading={isSubscriptionEmployeesLoading}
            error={subscriptionEmployeesError}
            onRowClick={(row) =>
              navigate(
                `/subscribed-plans/${subscriptionId}/employees/${row.employeeId}`
              )
            }
          />
        </>
      ),
    },
    {
      key: "inactiveEmployees",
      label: "Inactive Employees",
      children: (
        <>
          <div className="w-full flex items-center justify-between my-4">
            <SearchBar onSearchClick={(value) => setSearchTerm(value)} />
          </div>

          <AppDataTable
            rowIdKey="employeeSubscriptionId"
            columns={columns}
            data={subscriptionInactiveEmployeesData?.employees}
            loading={isSubscriptionInactiveEmployeesLoading}
            error={subscriptionInactiveEmployeesError}
            onRowClick={(row) =>
              navigate(
                `/subscribed-plans/${subscriptionId}/employees/${row.employeeId}`
              )
            }
          />
        </>
      ),
    },
    {
      key: "payments",
      label: "Payments",
      children: (
        <>
          <div className="w-full flex items-center justify-between my-4">
            <SearchBar onSearchClick={(value) => setSearchTerm(value)} />
          </div>

          <AppDataTable
            rowIdKey="paymentId"
            columns={paymentColumns}
            data={subscriptionPaymentsData?.payments}
            loading={isSubscriptionPaymentsLoading}
            error={isSubscriptionPaymentsError}
          />
        </>
      ),
    },
    {
      key: "claims",
      label: "Claims",
      children: (
        <>
          <div className="w-full flex items-center justify-between my-4">
            <SearchBar onSearchClick={(value) => setSearchTerm(value)} />
          </div>

          <AppDataTable
            rowIdKey="claimId"
            columns={claimsColumns}
            data={subscriptionClaimsData?.claims}
            loading={isSubscriptionClaimsLoading}
            error={isSubscriptionEmployeesError}
            onRowClick={(row) => navigate(`/claims/${row.claimId}/details`)}
          />
        </>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#fafafa] h-full ">
      <div className="bg-white p-4 ">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeft />}
              onClick={() => navigate(-1)}
              variant="empty"
              disabled={cancelSubscriptionMutation.isPending}
            ></Button>
            <h1 className="font-bold text-lg text-gray-800">
              {/* {planSubscriptionData?.planName} */}
              Subscription ID: {planSubscriptionData?.subscriptionId}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className=" text-[#9227ec]">
              <span className="text-xl font-bold ">
                Rs.{planSubscriptionData?.monthlyPayment}
              </span>
              /month
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end ">
          {/* <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Subscription ID: {planSubscriptionData?.subscriptionId}
            </p>
          </div> */}
          {planSubscriptionData?.isActive === "Active" ? (
            <p className="text-xs border border-green-500  bg-green-200 rounded-3xl px-2 py-1 text-green-800">
              Active
            </p>
          ) : (
            <p className="text-xs border border-red-500  bg-red-200 rounded-3xl px-2 py-1 text-red-800">
              Inactive
            </p>
          )}
        </div>

        <div className=" p-4 mt-4  rounded-md flex flex-col gap-8 mb-4">
          <div className="w-full grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Plan Name</h3>
              <Link to={`/explore-plans/${planSubscriptionData?.planId}`}>
                <p className="text-purple-500 hover:text-purple-800 underline  font-semibold">
                  {planSubscriptionData?.planName}
                </p>
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Number of Users
              </h3>
              <p className="text-black font-semibold">
                {planSubscriptionData?.numberOfUsers}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
              <p className="text-black  font-semibold">
                {planSubscriptionData?.startDate}
              </p>
            </div>
            {/* <div>
              <h3 className="text-sm font-medium text-gray-500">Plan Type</h3>
              <p className="text-black  font-semibold">
                {planSubscriptionData?.planType?.charAt(0)?.toUpperCase() +
                  planSubscriptionData?.planType?.slice(1)}
              </p>
            </div> */}
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Renewal Date
              </h3>
              <p className="text-black  font-semibold">
                {planSubscriptionData?.renewalDate}
              </p>
            </div>
          </div>
          <hr />

          <div className="mt-8">
            <Tabs
              defaultActiveKey="activeEmployees"
              onChange={(key) => setActiveTab(key)}
              items={items}
            />
          </div>
        </div>
        <div className="flex items-center gap-4 m-auto justify-center  w-full  my-8">
          {planSubscriptionData?.isActive === "Active" && (
            <Popconfirm
              title="Are you sure you want to cancel this subscription?"
              description="This action is final and cannot be undone. Once cancelled, this subscription cannot be reactivated."
              onConfirm={handleCancelSubscription}
              okText="Yes, Cancel"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                variant="danger"
                isLoading={cancelSubscriptionMutation.isPending}
                disabled={cancelSubscriptionMutation.isPending}
              >
                Cancel Plan Subscription
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribedPlanDetail;
