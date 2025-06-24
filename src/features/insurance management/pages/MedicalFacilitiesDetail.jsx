import React, { useEffect, useState } from "react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import medicalFacilityService from "../services/medicalFacilityService";
import { Form } from "antd";
import FormItem from "@/features/client portal/components/customantd/formitem";
import Button from "@/features/client portal/components/customantd/button";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cloneDeep } from "lodash";
import Select from "@/features/client portal/components/customantd/select";
import Input from "@/features/client portal/components/customantd/input";
const formSchema = z.object({
  medicalFacilityName: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .nonempty({ message: "Name is required" }),
  medicalFacilityEmail: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address." }),
  medicalFacilityPhoneNumber: z
    .string()
    .min(10, { message: "Invalid phone number." })
    .nonempty({ message: "Phone number is required" }),
  medicalFacilityType: z.string().nonempty({ message: "Type is required" }),
  medicalFacilityAddress: z
    .string()
    .min(3, { message: "Address must be at least 3 characters." })
    .nonempty({ message: "Address is required" }),
  isMedicalFacilityActive: z.boolean(),
});

const MedicalFacilitiesDetail = () => {
  const { medicalFacilityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicalFacilityName: "",
      medicalFacilityEmail: "",
      medicalFacilityPhoneNumber: "",
      medicalFacilityType: "",
      medicalFacilityAddress: "",
      isMedicalFacilityActive: false,
    },
  });

  const {
    data: medicalFacilityData,
    isLoading: isMedicalFacilityLoading,
    isError: isMedicalFacilityError,
    error: medicalFacilityError,
  } = useQuery({
    queryKey: ["medicalFacility", medicalFacilityId],
    queryFn: async () => {
      const data = await medicalFacilityService.getMedicalFacility(
        medicalFacilityId
      );
      return data.medicalFacility;
    },
    retry: false,
    enabled: medicalFacilityId && medicalFacilityId !== "new",
  });

  useEffect(() => {
    if (medicalFacilityData) {
      setValue("medicalFacilityName", medicalFacilityData.medicalFacilityName);
      setValue(
        "medicalFacilityEmail",
        medicalFacilityData.medicalFacilityEmail
      );
      setValue(
        "medicalFacilityPhoneNumber",
        medicalFacilityData.medicalFacilityPhoneNumber
      );
      setValue(
        "medicalFacilityAddress",
        medicalFacilityData.medicalFacilityAddress
      );
      setValue("medicalFacilityType", medicalFacilityData.medicalFacilityType);
      setValue(
        "isMedicalFacilityActive",
        medicalFacilityData.isMedicalFacilityActive
      );
    }
  }, [medicalFacilityData, setValue]);

  const mutation = useMutation({
    mutationFn: async ({ medicalFacilityId, medicalFacilityFormData }) => {
      return medicalFacilityId && medicalFacilityId !== "new"
        ? medicalFacilityService.updateMedicalFacility(
            medicalFacilityId,
            medicalFacilityFormData
          )
        : medicalFacilityService.createMedicalFacility(medicalFacilityFormData);
    },
    onSuccess: (response) => {
      if (medicalFacilityId && medicalFacilityId !== "new") {
        toast({
          variant: "success",
          title: "MedicalFacility updated successfully",
          description: "The medicalFacility has been updated successfully.",
        });
        queryClient.invalidateQueries(["medicalFacility", medicalFacilityId]);
      } else {
        toast({
          variant: "success",
          title: "MedicalFacility created successfully",
          description: "The medicalFacility has been created successfully.",
        });
        navigate(
          `/insurance-management/medical-facilities/${response.medicalFacilityId}/details`
        );
      }
    },
    onError: (error) => {
      console.error("Failed to update medicalFacility:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while updating the medicalFacility.",
      });
    },
  });

  const onSubmit = (formData) => {
    const medicalFacilityFormData = cloneDeep(formData);

    mutation.mutate({ medicalFacilityId, medicalFacilityFormData });
  };

  return (
    <div className="p-8 bg-gray-100 h-full">
      <div className="flex items-center justify-start gap-4 mb-6">
        <Button
          icon={<ArrowLeft />}
          onClick={() => navigate("/insurance-management/medical-facilities")}
          variant="empty"
        ></Button>
        <h1 className="font-semibold text-lg">Medical Facility</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 py-4 gap-x-8">
            <FormItem
              label="Medical Facility Name"
              name="medicalFacilityName"
              control={control}
            >
              <Input />
            </FormItem>
            <FormItem
              label="Email"
              name="medicalFacilityEmail"
              control={control}
            >
              <Input />
            </FormItem>
            <FormItem
              label="Phone Number"
              name="medicalFacilityPhoneNumber"
              control={control}
            >
              <Input />
            </FormItem>
            <FormItem
              label="Medical Facility Address"
              name="medicalFacilityAddress"
              control={control}
            >
              <Input />
            </FormItem>
            <FormItem
              label="Facility Type"
              name="medicalFacilityType"
              control={control}
            >
              <Input />
            </FormItem>
            {medicalFacilityId && medicalFacilityId !== "new" && (
              <FormItem
                label="Status"
                name="isMedicalFacilityActive"
                control={control}
              >
                <Select>
                  <Select.Option value={true}>Active</Select.Option>
                  <Select.Option value={false}>Inactive</Select.Option>
                </Select>
              </FormItem>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              htmlType="submit"
              loading={mutation.isLoading}
            >
              {medicalFacilityId && medicalFacilityId !== "new"
                ? "Update Medical Facility"
                : "Create Medical Facility"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default MedicalFacilitiesDetail;
