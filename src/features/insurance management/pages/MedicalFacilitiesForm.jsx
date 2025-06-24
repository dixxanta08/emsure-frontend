import React, { useEffect, useState } from "react";
import { z } from "zod";
import AppForm from "@/components/app-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cloneDeep } from "lodash";
import medicalFacilityService from "../services/medicalFacilityService";

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

const MedicalFacilitiesForm = () => {
  const { toast } = useToast();
  const { medicalFacilityId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    medicalFacilityName: "",
    medicalFacilityEmail: "",
    medicalFacilityPhoneNumber: "",
    medicalFacilityType: "",
    medicalFacilityAddress: "",
    isMedicalFacilityActive: false,
  });

  const queryClient = useQueryClient();

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["medicalFacility", medicalFacilityId],
    queryFn: async () => {
      const fetchedData = await medicalFacilityService.getMedicalFacility(
        medicalFacilityId
      );
      return fetchedData.medicalFacility;
    },
    enabled: medicalFacilityId !== "new",
    retry: false,
  });

  useEffect(() => {
    if (data) {
      console.log("Fetched Data: ", data);
      queryClient.setQueryData(["medicalFacility", medicalFacilityId], data);
      setFormData((prevState) => ({
        ...prevState,
        medicalFacilityName: data.medicalFacilityName,
        medicalFacilityEmail: data.medicalFacilityEmail,
        medicalFacilityPhoneNumber: data.medicalFacilityPhoneNumber,
        medicalFacilityType: data.medicalFacilityType,
        medicalFacilityAddress: data.medicalFacilityAddress,
        isMedicalFacilityActive: data.isMedicalFacilityActive,
      }));
    }
  }, [data, queryClient, medicalFacilityId]);

  const mutation = useMutation({
    mutationFn: async ({ medicalFacilityId, medicalFacilityFormData }) => {
      console.log(medicalFacilityId, medicalFacilityFormData);
      return medicalFacilityId && medicalFacilityId !== "new"
        ? medicalFacilityService.updateMedicalFacility(
            medicalFacilityId,
            medicalFacilityFormData
          )
        : medicalFacilityService.createMedicalFacility(medicalFacilityFormData);
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "MedicalFacility updated successfully",
        description: "The medicalFacility has been updated successfully.",
      });
      navigate(
        `/insurance-management/medical-facilities/${response.medicalFacilityId}/details`
      );
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

  const handleFormSubmit = (formData) => {
    const medicalFacilityFormData = cloneDeep(formData);
    mutation.mutate({ medicalFacilityId, medicalFacilityFormData });
  };

  const fields = [
    {
      name: "medicalFacilityName",
      label: "Name",
      placeholder: "Enter medicalFacility name",
      onChange: (e) =>
        setFormData({ ...formData, medicalFacilityName: e.target.value }),
    },
    {
      name: "medicalFacilityEmail",
      label: "Email",
      placeholder: "Enter email",
      onChange: (e) =>
        setFormData({ ...formData, medicalFacilityEmail: e.target.value }),
    },
    {
      name: "medicalFacilityPhoneNumber",
      label: "Phone Number",
      placeholder: "Enter phone number",
      onChange: (e) =>
        setFormData({
          ...formData,
          medicalFacilityPhoneNumber: e.target.value,
        }),
    },
    {
      name: "medicalFacilityType",
      label: "Facility Type",
      placeholder: "Enter Facility Type",
      onChange: (e) =>
        setFormData({
          ...formData,
          medicalFacilityType: e.target.value,
        }),
    },
    {
      name: "medicalFacilityAddress",
      label: "Address",
      placeholder: "Enter medicalFacility address",
      onChange: (e) =>
        setFormData({ ...formData, medicalFacilityAddress: e.target.value }),
    },

    {
      name: "isMedicalFacilityActive",
      label: "Status",
      type: "switch",
      disabled: data?.verifiedAt === null,
      activeText: "Active",
      inactiveText: "Inactive",
      onChange: (value) => {
        setFormData({ ...formData, isMedicalFacilityActive: value });
      }, // Use e.target.checked for boolean
    },
  ];

  const filteredFields =
    medicalFacilityId === "new"
      ? fields.filter((field) => field.name !== "isMedicalFacilityActive")
      : fields;

  if (isLoading || (isFetching && medicalFacilityId !== "new")) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading medical Facility details.</div>;
  }

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">
          Medical Facilities
        </h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <AppForm
          title={
            medicalFacilityId !== "new"
              ? "Edit Medical Facility Profile"
              : "Add Medical Facility"
          }
          description="Fill out the details below and click save."
          saveButton={
            medicalFacilityId !== "new" ? "Update Facility" : "Add Facility"
          }
          schema={formSchema}
          defaultValues={
            formData || {
              medicalFacilityName: "",
              medicalFacilityEmail: "",
              medicalFacilityPhoneNumber: "",
              medicalFacilityType: "",
              medicalFacilityAddress: "",
              isMedicalFacilityActive: false,
            }
          }
          fields={filteredFields}
          onSubmit={handleFormSubmit}
          cancelButton={
            medicalFacilityId !== "new" ? "Cancel Update" : "Cancel Add"
          }
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default MedicalFacilitiesForm;
