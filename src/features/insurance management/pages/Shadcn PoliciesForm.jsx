import React, { useEffect, useState } from "react";
import { z } from "zod";
import AppForm from "@/components/app-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cloneDeep } from "lodash";
import policyService from "../services/policyService";
import MultipleSelector from "@/components/extended-ui/multiple-selector";
import medicalFacilityService from "../services/medicalFacilityService";

const formSchema = z.object({
  policyName: z
    .string()
    .trim()
    .min(3, { message: "Policy name must be at least 3 characters." })
    .max(100, { message: "Policy name must be at most 100 characters." })
    .nonempty({ message: "Policy name is required." }),

  description: z
    .string()
    .trim()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(500, { message: "Description must be at most 500 characters." })
    .nonempty({ message: "Description is required." }),

  amount: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .positive({ message: "Amount must be a positive number." })
      .min(0, { message: "Amount must be at least 0." })
  ),

  maxUsers: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .int()
      .positive({ message: "Max users must be a positive integer." })
      .min(1, { message: "At least 1 user is required." })
  ),

  isActive: z.boolean(),

  premiumCalculation: z
    .string()
    .nonempty({ message: "Premium calculation is required." }),

  paymentFrequency: z.enum(
    ["monthly", "quarterly", "semi-annually", "annually"],
    {
      message: "Invalid payment frequency.",
    }
  ),

  latePaymentPenalties: z.string().optional(),

  termsAndConditionsFilePath: z
    .string()
    .url({ message: "Invalid file URL." })
    .optional(),

  // benefits: z
  //   .array(
  //     z.object({
  //       benefitId: z
  //         .number()
  //         .int()
  //         .positive({ message: "Invalid benefit ID." }),
  //       inNetworkPay: z.number().min(0, { message: "Invalid in-network pay." }),
  //       outNetworkPay: z
  //         .number()
  //         .min(0, { message: "Invalid out-network pay." }),
  //       copayAmount: z.number().min(0, { message: "Invalid copay amount." }),
  //       copayPercentage: z
  //         .number()
  //         .min(0)
  //         .max(100, { message: "Invalid percentage." }),
  //       copayType: z.enum(["fixed", "percentage"], {
  //         message: "Invalid copay type.",
  //       }),
  //       frequency: z.string().nonempty({ message: "Frequency is required." }),
  //     })
  //   )
  //   .optional(),

  medicalFacilities: z
    .array(
      z.number().int().positive({ message: "Invalid medical facility ID." })
    )
    .optional(),
});

const PoliciesForm = () => {
  const { toast } = useToast();
  const { policyId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    policyName: "",
    amount: "",
    maxUsers: "",
    premiumCalculation: "",
    description: "",
    paymentFrequency: "",
    latePaymentPenalties: "",
    isActive: false,
    termsAndConditionsFilePath: "",
    medicalFacilities: [],
  });

  const queryClient = useQueryClient();

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["policy", policyId],
    queryFn: async () => {
      const fetchedData = await policyService.getMedicalFacility("new");
      return fetchedData.policy;
    },
    enabled: policyId !== "new",
    retry: false,
  });

  useEffect(() => {
    if (data) {
      console.log("Fetched Data: ", data);
      queryClient.setQueryData(["policy", policyId], data);
      setFormData((prevState) => ({
        ...prevState,
        policyName: data.policyName,
        policyEmail: data.policyEmail,
        policyPhoneNumber: data.policyPhoneNumber,
        policyType: data.policyType,
        policyAddress: data.policyAddress,
        isMedicalFacilityActive: data.isMedicalFacilityActive,
      }));
    }
  }, [data, queryClient, policyId]);

  const mutation = useMutation({
    mutationFn: async ({ policyId, policyFormData }) => {
      console.log(policyId, policyFormData);
      return policyId && policyId !== "new"
        ? policyService.updatePolicy(policyId, policyFormData)
        : policyService.createPolicy(policyFormData);
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "MedicalFacility updated successfully",
        description: "The policy has been updated successfully.",
      });
      navigate(
        `/insurance-management/medical-facilities/${response.policyId}/details`
      );
    },
    onError: (error) => {
      console.error("Failed to update policy:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error?.response?.data?.message ||
          "There was a problem while updating the policy.",
      });
    },
  });

  const handleFormSubmit = (formData) => {
    const policyFormData = cloneDeep(formData);
    mutation.mutate({ policyId, policyFormData });
  };

  const fields = [
    {
      name: "policyName",
      label: "Name",
      placeholder: "Enter policy name",
      onChange: (e) => setFormData({ ...formData, policyName: e.target.value }),
    },
    {
      name: "amount",
      label: "Amount",
      placeholder: "Enter coverage amount",
      type: "number",
      onChange: (e) =>
        setFormData({
          ...formData,
          amount: e.target.value,
        }),
    },
    {
      name: "maxUsers",
      label: "Maximum Users",
      placeholder: "Enter maximum users",
      type: "number",
      onChange: (e) =>
        setFormData({
          ...formData,
          maxUsers: e.target.value,
        }),
    },
    {
      name: "premiumCalculation",
      label: "Premium Calculation",
      placeholder: "Enter premium calculation",
      onChange: (e) =>
        setFormData({ ...formData, premiumCalculation: e.target.value }),
    },
    {
      name: "paymentFrequency",
      label: "Premium Frequency",
      placeholder: "Enter premium calculation",
      onChange: (e) =>
        setFormData({ ...formData, paymentFrequency: e.target.value }),
    },
    {
      name: "latePaymentPenalties",
      label: "Late Payment Penalties",
      placeholder: "Enter Payment Penalties",
      onChange: (e) =>
        setFormData({ ...formData, latePaymentPenalties: e.target.value }),
    },
    {
      name: "isActive",
      label: "Status",
      type: "switch",
      disabled: data?.verifiedAt === null,
      activeText: "Active",
      inactiveText: "Inactive",
      onChange: (value) => {
        setFormData({ ...formData, isMedicalFacilityActive: value });
      }, // Use e.target.checked for boolean
    },
    {
      name: "medicalFacilities",
      label: "Medical Facilities",
      type: "multiple",
      placeholder: "",
      onSearch: async (search) => {
        const response = await medicalFacilityService.getMedicalFacilities(
          search
        );
        return response.medicalFacilities.map((facility) => ({
          value: facility.medicalFacilityId,
          label: facility.medicalFacilityName,
        }));
      },
      onChange: (value) => {
        // const values = value.map((v) => v.value);
        setFormData({
          ...formData,
          medicalFacilities: value,
        });
      },
    },
    {
      name: "termsAndConditionsFilePath",
      label: "Terms and Conditions",
      type: "file",
      documentType: "terms&conditions",
      onChange: (filePath) => {
        setFormData({
          ...formData,
          termsAndConditionsFilePath: filePath,
        });
      },
    },
    {
      name: "description",
      label: "Description",
      placeholder: "Enter Description",
      type: "textarea",
      onChange: (e) =>
        setFormData({ ...formData, description: e.target.value }),
    },
  ];

  const filteredFields =
    policyId === "new"
      ? fields.filter((field) => field.name !== "isActive")
      : fields;

  if (isLoading || (isFetching && policyId !== "new")) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading medical Facility details.</div>;
  }

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Policy</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <AppForm
          title={policyId !== "new" ? "Edit Policy" : "Add Policy"}
          saveButton={policyId !== "new" ? "Update Policy" : "Add Policy"}
          schema={formSchema}
          defaultValues={
            formData || {
              policyName: "",
              amount: "",
              maxUsers: "",
              premiumCalculation: "",
              description: "",
              paymentFrequency: "",
              latePaymentPenalties: "",
              isActive: false,
              termsAndConditionsFilePath: "",
              medicalFacilities: [],
            }
          }
          fields={filteredFields}
          onSubmit={handleFormSubmit}
          cancelButton={policyId !== "new" ? "Cancel Update" : "Cancel Add"}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default PoliciesForm;
