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
import agentService from "@/features/authentication/services/agentService";
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
    .nonempty({ message: "Name is required" }),
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address." }),
  phoneNumber: z
    .string()
    .min(10, { message: "Invalid phone number." })
    .nonempty({ message: "Phone number is required" }),
  licenseNumber: z.string().nonempty({ message: "License number is required" }),
  licenseExpirationDate: z
    .string()
    .nonempty({ message: "License expiration date is required" })
    .transform((val) => new Date(val)),
  contractStartDate: z
    .string()
    .nonempty({ message: "Contract start date is required" })
    .transform((val) => new Date(val)),
  contractEndDate: z
    .string()
    .nonempty({ message: "Contract end date is required" })
    .transform((val) => new Date(val)),
  isActive: z.boolean(),
});
const AgentsForm = () => {
  const { toast } = useToast();
  const { agentId } = useParams();
  const navigate = useNavigate();

  const { timeLeft, startCountdown, handleSuccess, handleError } =
    usePasswordResetCountdown();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    licenseNumber: "",
    licenseExpirationDate: "",
    contractStartDate: "",
    contractEndDate: "",
    isActive: false,
  });

  const queryClient = useQueryClient();

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: async () => {
      const fetchedData = await agentService.getAgent(agentId);
      return fetchedData.agent;
    },
    enabled: agentId !== "new",
    retry: false,
  });

  useEffect(() => {
    if (data) {
      console.log("Fetched Data: ", data);
      queryClient.setQueryData(["agent", agentId], data);
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
  }, [data, queryClient, agentId]);

  const mutation = useMutation({
    mutationFn: async ({ agentId, agentFormData }) => {
      return agentId && agentId !== "new"
        ? agentService.updateAgent(agentId, agentFormData)
        : agentService.createAgent(agentFormData);
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Agent updated successfully",
        description: "The agent has been updated successfully.",
      });
      navigate(`/people-organizations/agents/${response.agentId}/details`);
    },
    onError: (error) => {
      console.error("Failed to update agent:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while updating the agent.",
      });
    },
  });

  const handleFormSubmit = (formData) => {
    const agentFormData = cloneDeep(formData);
    mutation.mutate({ agentId, agentFormData });
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
      name: "licenseNumber",
      label: "License Number",
      placeholder: "Enter license number",
      onChange: (e) =>
        setFormData({ ...formData, licenseNumber: e.target.value }),
    },
    {
      name: "licenseExpirationDate",
      label: "License Expiration Date",
      type: "date",
      onChange: (e) =>
        setFormData({ ...formData, licenseExpirationDate: e.target.value }),
    },
    {
      name: "contractStartDate",
      label: "Contract Start Date",
      type: "date",
      onChange: (e) =>
        setFormData({ ...formData, contractStartDate: e.target.value }),
    },
    {
      name: "contractEndDate",
      label: "Contract End Date",
      type: "date",
      onChange: (e) => {
        console.log(e.target.value);
        setFormData({ ...formData, contractEndDate: e.target.value });
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
    agentId === "new"
      ? fields.filter(
          (field) =>
            field.name !== "isActive" && field.name !== "sendPasswordReset"
        )
      : fields;

  if (isLoading || (isFetching && agentId !== "new")) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading agent details.</div>;
  }

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Agents</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <AppForm
          title={agentId !== "new" ? "Edit Agent Profile" : "Add Agent"}
          description="Fill out the details below and click save."
          saveButton={agentId !== "new" ? "Update Agent" : "Add Agent"}
          schema={formSchema}
          defaultValues={
            formData || {
              name: "",
              email: "",
              phoneNumber: "",
              licenseNumber: "",
              licenseExpirationDate: "",
              contractStartDate: "",
              contractEndDate: "",
              isActive: false,
            }
          }
          fields={filteredFields}
          onSubmit={handleFormSubmit}
          cancelButton={agentId !== "new" ? "Cancel Update" : "Cancel Add"}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default AgentsForm;
