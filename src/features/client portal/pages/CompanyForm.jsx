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
import companyService from "@/features/authentication/services/companyService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import usePasswordResetCountdown from "@/features/authentication/hooks/usePasswordResetCountdown";
import PasswordResetButton from "@/features/authentication/components/send-password-mail-button";
import { useAuth } from "@/auth/AuthContext";

const formSchema = z.object({
  companyName: z
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
  companyRegistrationNumber: z
    .string()
    .nonempty({ message: "License number is required" }),
  companyAddress: z
    .string()
    .min(3, { message: "Address must be at least 3 characters." })
    .nonempty({ message: "Address is required" }),

  isActive: z.boolean(),
});
const CompanyForm = () => {
  const { toast } = useToast();
  const { loggedInUser } = useAuth();
  const companyId = loggedInUser?.companyId;
  const navigate = useNavigate();

  const { timeLeft, startCountdown, handleSuccess, handleError } =
    usePasswordResetCountdown();

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    companyRegistrationNumber: "",
    companyAddress: "",
    isActive: false,
  });

  const queryClient = useQueryClient();

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const fetchedData = await companyService.getCompany(companyId);
      return fetchedData.company;
    },
    enabled: companyId !== "new",
    retry: false,
  });

  useEffect(() => {
    if (data) {
      console.log("Fetched Data: ", data);
      queryClient.setQueryData(["company", companyId], data);
      setFormData((prevState) => ({
        ...prevState,
        companyName: data.companyName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        companyRegistrationNumber: data.companyRegistrationNumber,
        companyAddress: data.companyAddress,
        isActive: data.isActive,
      }));
    }
  }, [data, queryClient, companyId]);

  const mutation = useMutation({
    mutationFn: async ({ companyId, companyFormData }) => {
      console.log(companyId, companyFormData);
      return companyId && companyId !== "new"
        ? companyService.updateCompany(companyId, companyFormData)
        : companyService.createCompany(companyFormData);
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Company updated successfully",
        description: "The company has been updated successfully.",
      });
      navigate(`/company/${response.companyId}/details`);
    },
    onError: (error) => {
      console.error("Failed to update company:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while updating the company.",
      });
    },
  });

  const handleFormSubmit = (formData) => {
    const companyFormData = cloneDeep(formData);
    mutation.mutate({ companyId, companyFormData });
  };

  const fields = [
    {
      name: "companyName",
      label: "Name",
      placeholder: "Enter company name",
      onChange: (e) =>
        setFormData({ ...formData, companyName: e.target.value }),
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
      name: "companyRegistrationNumber",
      label: "Registration Number",
      placeholder: "Enter registration number",
      onChange: (e) =>
        setFormData({ ...formData, companyRegistrationNumber: e.target.value }),
    },
    {
      name: "companyAddress",
      label: "Address",
      placeholder: "Enter company address",
      onChange: (e) =>
        setFormData({ ...formData, companyAddress: e.target.value }),
    },
    // {
    //   name: "sendPasswordReset",
    //   label: "Password Reset",
    //   type: "other",
    //   render: () => (
    //     <PasswordResetButton
    //       userId={data?.userId}
    //       timeLeft={timeLeft}
    //       disabled={!formData.isActive || timeLeft > 0} // Check isActive state
    //       onSuccess={handleSuccess}
    //       onError={handleError}
    //       buttonTitle={`Send Reset Link ${formData.isActive}`}
    //     />
    //   ),
    // },

    {
      name: "isActive",
      label: "Status",
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
    companyId === "new"
      ? fields.filter(
          (field) =>
            field.name !== "isActive" && field.name !== "sendPasswordReset"
        )
      : fields;

  if (isLoading || (isFetching && companyId !== "new")) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading company details.</div>;
  }

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Companies</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <AppForm
          title={companyId !== "new" ? "Edit Company Profile" : "Add Company"}
          description="Fill out the details below and click save."
          saveButton={companyId !== "new" ? "Update Company" : "Add Company"}
          schema={formSchema}
          defaultValues={
            formData || {
              companyName: "",
              email: "",
              phoneNumber: "",
              companyRegistrationNumber: "",
              companyAddress: "",
              isActive: false,
            }
          }
          fields={filteredFields}
          onSubmit={handleFormSubmit}
          cancelButton={companyId !== "new" ? "Cancel Update" : "Cancel Add"}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default CompanyForm;
