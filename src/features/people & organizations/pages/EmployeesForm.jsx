import authService from "@/features/authentication/services/authService";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import AppForm from "@/components/app-form";
import { useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cloneDeep } from "lodash";
import employeeService from "@/features/authentication/services/employeeService";
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
    .nonempty({ message: "Hire date is required" })
    .transform((val) => new Date(val)),
  status: z.string().nonempty({ message: "Status is required" }),
  isActive: z.boolean(),
});

const EmployeesForm = () => {
  const { toast } = useToast();
  const { companyId, employeeId } = useParams();
  const navigate = useNavigate();
  const { timeLeft, handleSuccess, handleError } = usePasswordResetCountdown();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    hireDate: formatToDateInput(Date.now()),
    status: "ACTIVE",
    isActive: false,
    companyName: "",
  });

  const { data, error, isLoading } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      const fetchedData = await employeeService.getEmployee(employeeId);
      return fetchedData.employee;
    },
    enabled: employeeId !== "new",
    retry: false,
  });

  const { data: company } = useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const fetchedData = await companyService.getCompany(companyId);
      return fetchedData.company;
    },
    retry: false,
  });

  useEffect(() => {
    if (data) {
      // For edit mode, populate fields from fetched employee data and company info
      queryClient.setQueryData(["employee", employeeId], data);
      setFormData((prevState) => ({
        ...prevState,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        hireDate: formatToDateInput(new Date(data.hireDate)),
        companyName: company?.companyName || "",
        isActive: data.isActive,
        status: data.status,
      }));
    } else if (employeeId === "new" && company) {
      // For new employee mode, set companyName from the company info
      setFormData((prevState) => ({
        ...prevState,
        companyName: company.companyName,
      }));
    }
  }, [data, company, employeeId, queryClient]);

  const mutation = useMutation({
    mutationFn: async ({ employeeId, employeeFormData }) => {
      return employeeId && employeeId !== "new"
        ? employeeService.updateEmployee(
            companyId,
            employeeId,
            employeeFormData
          )
        : employeeService.createEmployee(companyId, employeeFormData);
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Employee updated successfully",
        description: "The employee has been updated successfully.",
      });
      navigate(
        `/people-organizations/companies/${companyId}/employees/${response.employeeId}/details`
      );
    },
    onError: () => {
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
      placeholder: "Enter hire date",
      type: "date",
      onChange: (e) => setFormData({ ...formData, hireDate: e.target.value }),
    },
    {
      name: "companyName",
      label: "Company",
      placeholder: "Company name",
      disabled: true,
      // value: company?.companyName || "",
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
      onChange: (value) => setFormData({ ...formData, status: value }),
    },
    {
      name: "sendPasswordReset",
      label: "Password Reset",
      type: "other",
      render: () => (
        <PasswordResetButton
          userId={data?.userId}
          timeLeft={timeLeft}
          disabled={!formData.isActive || timeLeft > 0}
          onSuccess={handleSuccess}
          onError={handleError}
          buttonTitle="Send Reset Link"
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
      onChange: (value) => setFormData({ ...formData, isActive: value }),
    },
  ];

  const filteredFields =
    employeeId === "new"
      ? fields.filter(
          (field) =>
            field.name !== "isActive" && field.name !== "sendPasswordReset"
        )
      : fields;
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading employee details.</div>;

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
          defaultValues={formData}
          fields={filteredFields}
          onSubmit={handleFormSubmit}
          cancelButton="Cancel"
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default EmployeesForm;
