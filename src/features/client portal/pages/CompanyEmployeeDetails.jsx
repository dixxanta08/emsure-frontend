import React, { Children, useEffect, useState } from "react";
import { Form, DatePicker, Spin, message, Tabs, Tag } from "antd";
import Input from "../components/customantd/input";
import Select from "../components/customantd/select";
import FormItem from "../components/customantd/formitem";
import Button from "../components/customantd/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import companyService from "@/features/authentication/services/companyService";
import employeeService from "@/features/authentication/services/employeeService";
import { ArrowLeft } from "lucide-react";
import AppDataTable from "@/components/app-data-table";
// import { FormItem } from "react-hook-form-antd";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toDateObject, toFormattedDate } from "@/utils/dateUtils";
import claimService from "../services/claimService";
import SearchBar from "@/components/app-searchbar";
import subscriptionService from "../services/subscriptionService";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .nonempty({ message: "Name is required" }),
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address." }),
  phoneNumber: z
    .string()
    .min(10, { message: "Invalid phone number." })
    .nonempty({ message: "Phone number is required" }),
  hireDate: z
    .string()
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Invalid date format. Must be YYYY-MM-DD.",
    })
    .transform((val) => new Date(val)),
  status: z.string().nonempty({ message: "Status is required" }),
  companyName: z.string().nonempty({ message: "Company Name is required" }),
  isEmployer: z.boolean({
    required_error: "Please select if this is an employer.",
  }),
});
const CompanyEmployeeDetails = () => {
  const { employeeId } = useParams();
  const { loggedInUser } = useAuth();
  const companyId = loggedInUser?.companyId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("plans");

  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      const data = await employeeService.getEmployee(employeeId);

      return {
        ...data.employee,
      };
    },
    enabled: employeeId && employeeId !== "new",
  });

  const { data: companyName, error: companyNameError } = useQuery({
    queryKey: ["companyName", companyId],
    queryFn: async () => {
      const data = await companyService.getCompany(companyId);
      return data.company.companyName;
    },
    retry: false,
    enabled: employeeId === "new",
  });
  const {
    data: claims,
    isLoading: isClaimsLoading,
    isError: isClaimsError,
    error: claimsError,
  } = useQuery({
    queryKey: ["claims", employeeId, pageIndex, pageSize, searchTerm],
    queryFn: async () => {
      const data = await claimService.getClaimsByEmployeeId(
        employeeId,
        pageIndex,
        pageSize,
        searchTerm
      );
      return data;
    },
    retry: false,
    enabled: activeTab === "claims" && employeeId && employeeId !== "new",
  });

  const {
    data: payments,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
    error: paymentsError,
  } = useQuery({
    queryKey: ["payments", employeeId, pageIndex, pageSize, searchTerm],
    queryFn: async () => {
      const data =
        await subscriptionService.getEmployeeSubscriptionPaymentsByEmployeeId(
          employeeId,
          pageIndex,
          pageSize,
          searchTerm
        );
      return data;
    },
    retry: false,
    enabled: activeTab === "payments" && employeeId && employeeId !== "new",
  });

  const {
    data: plans,
    isLoading: isPlansLoading,
    isError: isPlansError,
    error: plansError,
  } = useQuery({
    queryKey: ["plans", employeeId, pageIndex, pageSize, searchTerm],
    queryFn: async () => {
      const data = await subscriptionService.getSubscriptionsByEmployeeId(
        employeeId,
        pageIndex,
        pageSize,
        searchTerm,
        "all"
      );
      return data;
    },
    retry: false,
    enabled: activeTab === "plans" && employeeId && employeeId !== "new",
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (employeeId && employeeId !== "new") {
        return employeeService.updateEmployee(companyId, employeeId, values);
      } else {
        return employeeService.createEmployee(companyId, values);
      }
    },
    onSuccess: (data) => {
      if (employeeId && employeeId !== "new") {
        toast({
          variant: "success",
          title: "Employee Updated successfully",
          description: "Employee has been updated successfully.",
        });
      } else {
        toast({
          variant: "success",
          title: "Employee Created successfully",
          description: "Employee has been created successfully.",
        });
        navigate(`/employees/${data.employeeId}/details`);
      }

      queryClient.invalidateQueries(["company", companyId]);
    },
    onError: (error) => {
      if (employeeId && employeeId !== "new") {
        console.error("Error updating employee:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem while updating employee.",
        });
      } else {
        console.error("Error creating employee:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem while creating employee.",
        });
      }
    },
  });

  const { control, watch, handleSubmit, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      hireDate: "",
      status: "",
      companyName: "",
      isEmployer: false,
    },
  });

  useEffect(() => {
    if (employeeData) {
      setValue("companyName", employeeData.companyName);
      setValue("email", employeeData.email);
      setValue("phoneNumber", employeeData.phoneNumber);
      setValue("name", employeeData.name);
      setValue("hireDate", employeeData.hireDate);
      setValue("status", employeeData.status);
      setValue("isEmployer", employeeData.isEmployer);
    }
    if (companyName) {
      setValue("companyName", companyName);
    }
  }, [employeeData, companyName, setValue]);

  const onSubmit = (data) => {
    console.log(data);
    // return;
    mutation.mutate(data);
  };
  const claimsColumns = [
    {
      accessorKey: "claimId",
      header: "Claim Id",
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
  const paymentsColumns = [
    {
      accessorKey: "paymentId",
      header: "Payment Id",
    },

    {
      accessorKey: "planName",
      header: "Plan Name",
    },
    {
      accessorKey: "amount",
      header: "Total Amount",
    },

    {
      accessorKey: "date",
      header: "Payment Date",
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
    },
  ];

  const plansColumns = [
    {
      accessorKey: "employeeSubscriptionId",
      header: "Subscription Id",
    },
    {
      accessorKey: "planName",
      header: "Plan Name",
    },

    {
      accessorKey: "monthlyPayment",
      header: "Monthly Payment",
    },
    {
      accessorKey: "employeeSubscriptionStatus",
      header: "Employee Subscription Status",
    },
  ];
  const items = [
    {
      key: "plans",
      label: "Plans",
      children: (
        <>
          <div className="w-full flex items-center justify-between my-4">
            <SearchBar onSearchClick={(value) => setSearchTerm(value)} />
          </div>

          <AppDataTable
            rowIdKey="subscriptionId"
            columns={plansColumns}
            data={plans?.employeeSubscriptions}
            loading={isPlansLoading}
            error={plansError}
            onRowClick={(row) =>
              navigate(
                `/subscribed-plans/${row.subscriptionId}/employees/${employeeId}`
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
            columns={paymentsColumns}
            data={payments?.payments}
            loading={isPaymentsLoading}
            error={paymentsError}
            onRowClick={(row) =>
              navigate(
                `/subscribed-plans/${row.subscriptionId}/employees/${employeeId}`
              )
            }
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
            data={claims?.claims}
            loading={isClaimsLoading}
            error={claimsError}
            onRowClick={(row) => navigate(`/claims/${row.claimId}/details`)}
          />
        </>
      ),
    },
  ];

  // const columns = [
  //   {
  //     header: "Employee ID",
  //     accessorKey: "employeeId",
  //   },
  //   {
  //     header: "Employee Name",
  //     accessorKey: "name",
  //   },
  //   {
  //     header: "Phone Number",
  //     accessorKey: "phoneNumber",
  //   },
  //   {
  //     header: "Email",
  //     accessorKey: "email",
  //   },
  // ];

  if (isLoading) {
    return <Spin size="large" />;
  }

  return (
    <div className="p-8 bg-gray-100 h-full">
      <div className="flex items-center justify-start gap-4 mb-6">
        <Button
          icon={<ArrowLeft />}
          onClick={() => navigate(-1)}
          variant="empty"
        ></Button>
        <h1 className="font-semibold text-lg">Employee Details</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 py-4 gap-x-8">
            <FormItem label="Name" name="name" control={control}>
              <Input />
            </FormItem>
            <FormItem label="Email" name="email" control={control}>
              <Input />
            </FormItem>

            <FormItem label="Phone Number" name="phoneNumber" control={control}>
              <Input />
            </FormItem>
            <FormItem label="Company Name" name="companyName" control={control}>
              <Input disabled />
            </FormItem>
            <FormItem label="Hire Date " name="hireDate" control={control}>
              <Input aType="date" />
            </FormItem>

            <FormItem label="Status" name="status" control={control}>
              <Select>
                <Select.Option value={"ACTIVE"}>Active</Select.Option>
                <Select.Option value={"INACTIVE"}>Inactive</Select.Option>
                <Select.Option value={"TERMINATED"}>Terminated</Select.Option>
              </Select>
            </FormItem>
            <FormItem label="Is Employer?" name="isEmployer" control={control}>
              <Select>
                <Select.Option value={true}>Yes</Select.Option>
                <Select.Option value={false}>No</Select.Option>
              </Select>
            </FormItem>
            {/* uneditable field to jsut dispaly the value dont use form item*/}
            <div>
              <h3 className="text-gray-800 font-semibold">Is User Active?</h3>
              <Tag
                className={`mt-2 bg-${
                  employeeData?.isActive ? "green-200" : "red-200"
                } text-${
                  employeeData?.isActive ? "green-500" : "red-500"
                } text-base font-medium`}
              >
                {employeeData?.isActive ? "Active" : "Inactive"}
              </Tag>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              htmlType="submit"
              loading={mutation.isLoading}
            >
              {employeeId && employeeId !== "new"
                ? "Update Employee"
                : "Create Employee"}
            </Button>
          </div>
        </Form>
      </div>
      {/* Employees Table */}
      {employeeId && employeeId !== "new" && (
        <div className="mt-8 bg-white rounded-lg shadow p-4 px-8">
          <Tabs
            defaultActiveKey="plans"
            onChange={(key) => setActiveTab(key)}
            items={items}
          />
        </div>
      )}
      {/* <div className="w-full flex items-center justify-between p-4">
          <h2 className="font-semibold text-md text-gray-800">Employees</h2>
          {employeesData?.employees.length > 0 && (
            <Button
              variant="outline"
              className="w-[120px] border border-none shadow-none !text-[hsl(273,83.8%,53.9%)] hover:bg-white hover:text-[hsl(273,53%,15%)]"
              onClick={() => {
                navigate(`/company/${companyId}/employees`);
              }}
            >
              View All
            </Button>
          )}
        </div>
        <AppDataTable
          rowIdKey="employeeId"
          columns={columns}
          data={employeesData?.employees}
          loading={isEmployeesLoading}
          error={employeesError}
          onRowClick={handleEmployeeRowClick}
        />
      </div> */}
    </div>
  );
};

export default CompanyEmployeeDetails;
