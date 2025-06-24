import authService from "@/features/authentication/services/authService";
import React, { act, useEffect, useState } from "react";

import { z } from "zod";
import AppForm from "@/components/app-form";
import { useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cloneDeep } from "lodash";
import insuranceWorkerService from "@/features/authentication/services/insuranceWorkerService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import usePasswordResetCountdown from "@/features/authentication/hooks/usePasswordResetCountdown";
import PasswordResetButton from "@/features/authentication/components/send-password-mail-button";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(64, { message: "Name must be less than 64 characters." })
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
    .nonempty({ message: "Name is required" }),
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address." }),
  phoneNumber: z
    .string()
    .min(10, { message: "Invalid phone number." })
    .nonempty({ message: "Phone number is required" })
    .regex(/^[0-9]+$/, "Phone number can only contain numbers."),

  isActive: z.boolean(),
});
const InsuranceWorkersForm = () => {
  const { toast } = useToast();
  const { userId } = useParams();
  const navigate = useNavigate();

  const { timeLeft, startCountdown, handleSuccess, handleError } =
    usePasswordResetCountdown();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    isActive: false,
  });

  const queryClient = useQueryClient();

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["insuranceWorker", userId],
    queryFn: async () => {
      const fetchedData = await insuranceWorkerService.getInsuranceWorker(
        userId
      );
      return fetchedData.insuranceWorker;
    },
    enabled: userId !== "new",
    retry: false,
  });

  useEffect(() => {
    if (data) {
      console.log("Fetched Data: ", data);
      queryClient.setQueryData(["insuranceWorker", userId], data);
      setFormData((prevState) => ({
        ...prevState,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        licenseNumber: data.licenseNumber,
        licenseExpirationDate: formatToDateInput(
          new Date(data.licenseExpirationDate)
        ),
        contractStartDate: formatToDateInput(new Date(data.contractStartDate)),
        contractEndDate: formatToDateInput(new Date(data.contractEndDate)),
        isActive: data.isActive,
      }));
    }
  }, [data, queryClient, userId]);

  const mutation = useMutation({
    mutationFn: async ({ userId, insuranceWorkerFormData }) => {
      return userId && userId !== "new"
        ? insuranceWorkerService.updateInsuranceWorker(
            userId,
            insuranceWorkerFormData
          )
        : insuranceWorkerService.createInsuranceWorker(insuranceWorkerFormData);
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "InsuranceWorker updated successfully",
        description: "The insuranceWorker has been updated successfully.",
      });
      navigate(
        `/people-organizations/insurance-workers/${response.insuranceWorkerId}/details`
      );
    },
    onError: (error) => {
      console.error("Failed to update insuranceWorker:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while updating the insuranceWorker.",
      });
    },
  });

  const handleFormSubmit = (formData) => {
    const insuranceWorkerFormData = cloneDeep(formData);
    mutation.mutate({ userId, insuranceWorkerFormData });
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
          buttonTitle={`Send Reset Link `}
        />
      ),
    },

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
    userId === "new"
      ? fields.filter(
          (field) =>
            field.name !== "isActive" && field.name !== "sendPasswordReset"
        )
      : fields;

  if (isLoading || (isFetching && userId !== "new")) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading insuranceWorker details.</div>;
  }

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">
          Insurance Workers
        </h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <AppForm
          title={
            userId !== "new"
              ? "Edit InsuranceWorker Profile"
              : "Add InsuranceWorker"
          }
          description="Fill out the details below and click save."
          saveButton={
            userId !== "new" ? "Update InsuranceWorker" : "Add InsuranceWorker"
          }
          schema={formSchema}
          defaultValues={
            formData || {
              name: "",
              email: "",
              phoneNumber: "",

              isActive: false,
            }
          }
          fields={filteredFields}
          onSubmit={handleFormSubmit}
          cancelButton={userId !== "new" ? "Cancel Update" : "Cancel Add"}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default InsuranceWorkersForm;
