import authService from "@/features/authentication/services/authService";
import React, { act, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import AppForm from "@/components/app-form";
import { useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cloneDeep } from "lodash";
import employeeService from "@/features/authentication/services/employeeService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import usePasswordResetCountdown from "@/features/authentication/hooks/usePasswordResetCountdown";
import PasswordResetButton from "@/features/authentication/components/send-password-mail-button";
import companyService from "@/features/authentication/services/companyService";

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
    .nonempty({ message: "License expiration date is required" })
    .transform((val) => new Date(val)),
  companyId: z.string().nonempty({ message: "Company is required" }),

  status: z.string().nonempty({ message: "Status is required" }),
  isActive: z.boolean(),
});
const EmployeesForm = () => {
  const { toast } = useToast();
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const { timeLeft, startCountdown, handleSuccess, handleError } =
    usePasswordResetCountdown();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    hireDate: "",
    status: "",
    companyId: "",
    isActive: false,
  });

  const queryClient = useQueryClient();

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      const fetchedData = await employeeService.getEmployee(employeeId);
      return fetchedData.employee;
    },
    enabled: employeeId !== "new",
    retry: false,
  });
  const {
    data: companies,
    error: companiesError,
    isLoading: isCompaniesLoading,
  } = useQuery({
    queryKey: ["companies", employeeId],
    queryFn: async () => {
      const fetchedData = await companyService.getCompanies();
      return fetchedData.companies;
    },
    retry: false,
  });

  useEffect(() => {
    if (data) {
      console.log("Fetched Data: ", data);
      queryClient.setQueryData(["employee", employeeId], data);
      setFormData((prevState) => ({
        ...prevState,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        hireDate: formatToDateInput(new Date(data.hireDate)),
        companyId: data.companyId,
        isActive: data.isActive,
        status: data.status,
      }));
    }
  }, [data, queryClient, employeeId]);

  const mutation = useMutation({
    mutationFn: async ({ employeeId, employeeFormData }) => {
      return employeeId && employeeId !== "new"
        ? employeeService.updateEmployee(
            employeeFormData.companyId,
            employeeId,
            employeeFormData
          )
        : employeeService.createEmployee(employeeFormData);
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Employee updated successfully",
        description: "The employee has been updated successfully.",
      });
      navigate(
        `/people-organizations/employees/${response.employeeId}/details`
      );
    },
    onError: (error) => {
      console.error("Failed to update employee:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while updating the employee.",
      });
    },
  });

  const handleFormSubmit = (formData) => {
    const employeeFormData = cloneDeep(formData);
    mutation.mutate({ employeeId, employeeFormData });
  };

  const fields = [
    {
      name: "name",
      label: "Name",
      placeholder: "Enter name",
      onChange: (e) => setFormData({ ...formData, name: e.target.value }),
    },
    {
      name: "email",
      label: "Email",
      placeholder: "Enter email",
      onChange: (e) => setFormData({ ...formData, email: e.target.value }),
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      placeholder: "Enter phone number",
      onChange: (e) =>
        setFormData({ ...formData, phoneNumber: e.target.value }),
    },
    {
      name: "hireDate",
      label: "Hire Date",
      placeholder: "Enter hire date ",
      type: "date",
      onChange: (e) => setFormData({ ...formData, hireDate: e.target.value }),
    },

    {
      name: "companyId",
      label: "Company",
      placeholder: "Choose company",
      type: "select",
      options: companies
        ? companies?.map((company) => ({
            value: company.companyId + "",
            label: company.companyName,
          }))
        : [],
      onChange: (value) => {
        console.log(value);
        setFormData({ ...formData, companyId: value });
      },
      disabled: isCompaniesLoading || employeeId !== "new",
    },
    {
      name: "status",
      label: "Employee Status",
      placeholder: "Choose status",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
        { value: "TERMINATED", label: "Terminated" },
      ],
      onChange: (value) => {
        setFormData({ ...formData, status: value });
      },
    },

    {
      name: "sendPasswordReset",
      label: "Password Reset",
      type: "other",
      render: () => (
        <PasswordResetButton
          userId={data?.userId}
          timeLeft={timeLeft}
          disabled={!formData.isActive || timeLeft > 0} // Check isActive state
          onSuccess={handleSuccess}
          onError={handleError}
          buttonTitle={`Send Reset Link ${formData.isActive}`}
        />
      ),
    },

    {
      name: "isActive",
      label: "User Status",
      type: "switch",
      disabled: data?.verifiedAt === null,
      activeText: "Active",
      inactiveText: "Inactive",
      onChange: (value) => {
        setFormData({ ...formData, isActive: value });
      }, // Use e.target.checked for boolean
    },
  ];
  const filteredFields =
    employeeId === "new"
      ? fields.filter(
          (field) =>
            field.name !== "isActive" && field.name !== "sendPasswordReset"
        )
      : fields;

  if (isLoading || (isFetching && employeeId !== "new")) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading employee details.</div>;
  }

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Employees</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <AppForm
          title={
            employeeId !== "new" ? "Edit Employee Profile" : "Add Employee"
          }
          description="Fill out the details below and click save."
          saveButton={employeeId !== "new" ? "Update Employee" : "Add Employee"}
          schema={formSchema}
          defaultValues={
            formData || {
              name: "",
              email: "",
              phoneNumber: "",
              companyId: 1,
              hiredate: "",
              status: "",
              isActive: false,
            }
          }
          fields={filteredFields}
          onSubmit={handleFormSubmit}
          cancelButton={employeeId !== "new" ? "Cancel Update" : "Cancel Add"}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default EmployeesForm;
