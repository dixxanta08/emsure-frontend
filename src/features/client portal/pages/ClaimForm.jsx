import authService from "@/features/authentication/services/authService";
import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/AuthContext";
import { Upload, Form } from "antd";
import Input from "../components/customantd/input";
import Button from "../components/customantd/button";
import Select from "../components/customantd/select";
import FormItem from "../components/customantd/formitem";
import { useForm as useAntdForm } from "antd/lib/form/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import subscriptionService from "../services/subscriptionService";
import claimService from "../services/claimService";
import apiService from "@/services/apiService";
import { UploadOutlined } from "@ant-design/icons";

const formSchema = z.object({
  employeeSubscriptionId: z
    .number()
    .min(1, { message: "Employee Subscription ID is required" }),
  claimAmount: z.number(),
  billAmount: z.number().min(1, { message: "Bill Amount is required" }),
  claimDate: z.string().nonempty({ message: "Claim Date is required" }),
  claimStatus: z.string().nonempty({ message: "Claim Status is required" }),
  isClaimInNetwork: z.boolean(),
  policyBenefitId: z
    .number()
    .min(1, { message: "Policy Benefit ID is required" }),
  medicalFacilityId: z
    .number()
    .min(-1, { message: "Medical Facility ID is required" }),
  claimDescription: z
    .string()
    .nonempty({ message: "Claim Description is required" }),
  documentUrls: z.array(z.string()).optional(),
});

const ClaimForm = () => {
  const { toast } = useToast();
  const { loggedInUser } = useAuth();
  const { subscriptionId, employeeId } = useParams();
  const navigate = useNavigate();

  const [form] = useAntdForm();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeSubscriptionId: 0,
      billAmount: 0,
      claimAmount: 0,
      claimDate: formatToDateInput(new Date()),
      claimStatus: "submitted",
      isClaimInNetwork: true,
      policyBenefitId: null,
      claimDescription: "",
      documentUrls: [],
      medicalFacilityId: null,
    },
  });

  const queryClient = useQueryClient();

  const {
    data: employeeSubscriptionData,
    isLoading: isEmployeeSubscriptionDataLoading,
    isError: isEmployeeSubscriptionDataError,
    error: employeeSubscriptionDataError,
  } = useQuery({
    queryKey: ["subscription", subscriptionId, employeeId],
    queryFn: async () => {
      const data = await subscriptionService.getEmployeeSubscription(
        subscriptionId,
        employeeId
      );
      setValue(
        "employeeSubscriptionId",
        data.employeeSubscription.employeeSubscriptionId
      );
      return { ...data.employeeSubscription };
    },
    retry: false,
  });

  // Select Policy Benefit and Medical Facility
  const [selectedPolicyBenefit, setSelectedPolicyBenefit] = useState(null);
  const [selectedMedicalFacility, setSelectedMedicalFacility] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const policyBenefits = useMemo(() => {
    let benefits = [];
    if (employeeSubscriptionData) {
      employeeSubscriptionData.Policies.forEach((policy) => {
        benefits = benefits.concat(policy.PolicyBenefits);
      });
    }
    return benefits;
  }, [employeeSubscriptionData]);

  const medicalFacilities = useMemo(() => {
    if (!employeeSubscriptionData || !selectedPolicyBenefit) return [];

    let facilities = employeeSubscriptionData.Policies.filter((policy) =>
      policy.PolicyBenefits.some(
        (benefit) =>
          benefit.policyBenefitId === selectedPolicyBenefit.policyBenefitId
      )
    ).flatMap((policy) => policy.MedicalFacilities);

    return [
      { medicalFacilityId: -1, medicalFacilityName: "Other" },
      ...facilities,
    ];
  }, [employeeSubscriptionData, selectedPolicyBenefit]);

  useEffect(() => {
    if (medicalFacilities.length > 0) {
      setSelectedMedicalFacility(medicalFacilities[0]);
      setValue("medicalFacilityId", medicalFacilities[0].medicalFacilityId);
    }
  }, [medicalFacilities]);

  useEffect(() => {
    setValue(
      "isClaimInNetwork",
      selectedMedicalFacility?.medicalFacilityId !== -1
    );
  }, [selectedMedicalFacility]);

  const mutation = useMutation({
    mutationFn: async (claimFormData) => {
      return claimService.createClaim(claimFormData);
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Claim Created successfully",
        description: "Claim has been created successfully.",
      });
      navigate(`/claims/${response.claimId}/details`);
    },
    onError: (error) => {
      console.error("Failed to create claim:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while creating claim.",
      });
    },
  });

  const handleFileUpload = async (file) => {
    if (!file) return;

    const fileId = file.uid;
    setUploadedFiles((prev) => [
      ...prev,
      { uid: fileId, name: file.name, status: "uploading", url: "" },
    ]);
    setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", "claim");

    try {
      const response = await apiService.post("/file-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : 0;
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
        },
      });

      const fileName = response.data?.file?.filename;
      const filePath = `http://localhost:8080/uploads/documents/${fileName}`;

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.uid === fileId ? { ...f, status: "success", url: filePath } : f
        )
      );
      setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

      // Update form data with new file URL
      console.log("filePath", filePath);
      console.log("watch", watch("documentUrls"));
      const currentUrls = watch("documentUrls") || [];
      // Only add the URL if it's not already in the array
      if (!currentUrls.includes(filePath)) {
        setValue("documentUrls", [...currentUrls, filePath]);
      }

      toast({
        variant: "success",
        title: "File Uploaded",
        description: `${file.name} uploaded successfully.`,
      });
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) => (f.uid === fileId ? { ...f, status: "error" } : f))
      );
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));
      toast({
        variant: "destructive",
        title: "File Upload Failed",
        // description: `Error uploading ${file.name}.`,

        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error.message ||
          "There was a problem while uploading the file.",
      });
      console.error("File upload error:", error);
    }
  };

  const onSubmit = async (formData) => {
    try {
      // Validate required fields
      if (
        !formData.policyBenefitId ||
        !formData.medicalFacilityId ||
        !formData.billAmount
      ) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields.",
        });
        return;
      }

      // Validate bill amount
      if (formData.billAmount <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid Amount",
          description: "Bill amount must be greater than 0.",
        });
        return;
      }

      // Validate claim amount
      if (formData.claimAmount <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid Claim Amount",
          description: "Claimable amount must be greater than 0.",
        });
        return;
      }

      // Get the document URLs array and ensure it's properly formatted
      const documentUrls = formData.documentUrls || [];
      const formattedDocumentUrls = Array.isArray(documentUrls)
        ? documentUrls.filter((url) => url && url.startsWith("http")) // Only include valid URLs
        : [];

      const claimFormData = {
        employeeSubscriptionId: formData.employeeSubscriptionId,
        billAmount: formData.billAmount,
        claimAmount: formData.claimAmount,
        claimDate: formData.claimDate,
        claimStatus: formData.claimStatus,
        isClaimInNetwork: formData.isClaimInNetwork,
        medicalFacilityId:
          formData.medicalFacilityId === -1 ? null : formData.medicalFacilityId,
        policyBenefitId: formData.policyBenefitId,
        claimDescription: formData.claimDescription,
        claimantName: loggedInUser.name,
        userId: loggedInUser.userId,
        documentUrls: JSON.stringify(formattedDocumentUrls),
      };

      console.log(claimFormData);

      await mutation.mutateAsync(claimFormData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description:
          "There was a problem submitting your claim. Please try again.",
      });
    }
  };

  const [claimDetails, setClaimDetails] = useState({
    inNetworkCoverage: 0,
    outNetworkCoverage: 0,
    inNetworkUsageLeft: 0,
    outNetworkUsageLeft: 0,
    copayAmount: 0,
    copayPercentage: 0,
    billAmount: 0,
    claimableAfterCopay: 0,
    totalClaimable: 0,
    isInNetwork: false,
    frequency: "",
    copayType: "",
    amountToBeCoPaid: 0,
    inNetworkPay: 0,
    outNetworkPay: 0,
  });

  useEffect(() => {
    if (
      !selectedPolicyBenefit ||
      !selectedMedicalFacility ||
      !watch("billAmount")
    ) {
      setClaimDetails({
        inNetworkCoverage: 0,
        outNetworkCoverage: 0,
        inNetworkUsageLeft: 0,
        outNetworkUsageLeft: 0,
        copayAmount: 0,
        copayPercentage: 0,
        billAmount: 0,
        claimableAfterCopay: 0,
        totalClaimable: 0,
        isInNetwork: false,
        frequency: "",
        copayType: "",
        amountToBeCoPaid: 0,
        inNetworkPay: 0,
        outNetworkPay: 0,
      });
      return;
    }

    const billAmount = watch("billAmount");
    const isInNetwork = selectedMedicalFacility?.medicalFacilityId !== -1;

    const inNetworkCoverage = selectedPolicyBenefit?.inNetworkMaxCoverage || 0;
    const outNetworkCoverage =
      selectedPolicyBenefit?.outNetworkMaxCoverage || 0;

    const inNetworkUsageLeft = selectedPolicyBenefit?.inNetworkUsageLeft || 0;
    const outNetworkUsageLeft = selectedPolicyBenefit?.outNetworkUsageLeft || 0;

    const inNetworkPay = selectedPolicyBenefit?.inNetworkPay || 0;
    const outNetworkPay = selectedPolicyBenefit?.outNetworkPay || 0;

    const copayType = selectedPolicyBenefit?.copayType || "fixed";
    const copayAmount =
      copayType === "fixed" ? selectedPolicyBenefit?.copayAmount || 0 : 0;
    const copayPercentage =
      copayType === "percentage"
        ? selectedPolicyBenefit?.copayPercentage || 0
        : 0;

    const amountToBeCoPaid =
      copayType === "fixed"
        ? Math.min(copayAmount, billAmount)
        : (copayPercentage * billAmount) / 100;

    const claimableAfterCopay = Math.max(billAmount - amountToBeCoPaid, 0);

    const totalClaimable = Math.max(
      Math.min(
        claimableAfterCopay *
          (isInNetwork ? inNetworkPay / 100 : outNetworkPay / 100),
        isInNetwork ? inNetworkUsageLeft : outNetworkUsageLeft
      ),
      0
    );

    setClaimDetails({
      inNetworkCoverage,
      outNetworkCoverage,
      inNetworkUsageLeft,
      outNetworkUsageLeft,
      copayAmount,
      copayPercentage,
      billAmount,
      claimableAfterCopay,
      totalClaimable,
      isInNetwork,
      frequency: selectedPolicyBenefit?.frequency || "",
      copayType,
      amountToBeCoPaid,
      inNetworkPay,
      outNetworkPay,
    });
    setValue("claimAmount", totalClaimable);
  }, [watch("billAmount"), selectedMedicalFacility, selectedPolicyBenefit]);

  if (isEmployeeSubscriptionDataLoading) {
    return <div>Loading...</div>;
  }

  if (isEmployeeSubscriptionDataError) {
    return (
      <div>
        Error loading company details: {employeeSubscriptionDataError.message}
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <h1 className="font-semibold text-lg text-gray-800">Create Claim</h1>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Form form={form} onFinish={handleSubmit(onSubmit)} layout="vertical">
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 py-4 gap-x-8">
            <FormItem
              control={control}
              name="billAmount"
              label="Bill Amount"
              errors={errors.billAmount?.message}
            >
              <Input aType="number" />
            </FormItem>
            <FormItem
              control={control}
              name="policyBenefitId"
              label="Policy Benefit"
              errors={errors.policyBenefitId?.message}
            >
              <Select
                className="w-full"
                onChange={(value) => {
                  setSelectedPolicyBenefit(
                    policyBenefits.find(
                      (benefit) => benefit.policyBenefitId === value
                    )
                  );
                  setValue("policyBenefitId", value);
                }}
              >
                {policyBenefits?.map((benefit) => (
                  <Select.Option
                    key={benefit.policyBenefitId}
                    value={benefit.policyBenefitId}
                  >
                    {benefit.benefitName}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>
            <FormItem
              control={control}
              name="medicalFacilityId"
              label="Medical Facility"
              errors={errors.medicalFacilityId?.message}
            >
              <Select
                className="w-full"
                onChange={(value) => {
                  setSelectedMedicalFacility(
                    medicalFacilities.find(
                      (facility) => facility.medicalFacilityId === value
                    )
                  );
                  setValue("medicalFacilityId", value);
                }}
              >
                {medicalFacilities?.map((medicalFacility) => (
                  <Select.Option
                    key={medicalFacility.medicalFacilityId}
                    value={medicalFacility.medicalFacilityId}
                  >
                    {medicalFacility.medicalFacilityName}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>
            <FormItem
              control={control}
              name="documentUrls"
              label="Supporting Documents"
              errors={errors.documentUrls?.message}
            >
              <div>
                <input type="hidden" />
                <Upload
                  multiple
                  customRequest={({ file, onSuccess, onError }) => {
                    handleFileUpload(file)
                      .then(() => onSuccess("ok"))
                      .catch((err) => onError(err));
                  }}
                  fileList={uploadedFiles.map((file) => ({
                    uid: file.uid,
                    name: file.name,
                    status: file.status,
                    url: file.url,
                    percent: uploadProgress[file.uid] || 0,
                  }))}
                  onRemove={(file) => {
                    setUploadedFiles((prev) =>
                      prev.filter((f) => f.uid !== file.uid)
                    );
                    const currentUrls = watch("documentUrls") || [];
                    setValue(
                      "documentUrls",
                      currentUrls.filter((url) => url !== file.url)
                    );
                  }}
                >
                  <Button icon={<UploadOutlined />}>Upload Documents</Button>
                </Upload>
              </div>
            </FormItem>
            <FormItem
              control={control}
              name="claimDescription"
              label="Description"
              errors={errors.claimDescription?.message}
              className="col-span-full md:col-span-2"
            >
              <Input aType="textarea" />
            </FormItem>
          </div>

          <div className="flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isLoading}
            >
              Make Claim
            </Button>
          </div>
        </Form>
      </div>
      <div className="mt-8 bg-white p-4 rounded-md text-base grid grid-cols-1 md:grid-cols-2 gap-4">
        <p>
          Claim Type:
          {claimDetails.isInNetwork ? "In Network Claim" : "Out Network Claim"}
        </p>
        <p>
          Max Coverage:
          {claimDetails.isInNetwork
            ? claimDetails.inNetworkCoverage
            : claimDetails.outNetworkCoverage}
        </p>
        <p>
          Usage Left:
          {claimDetails.isInNetwork
            ? claimDetails.inNetworkUsageLeft
            : claimDetails.outNetworkUsageLeft}
        </p>
        <p>
          Pay Percentage:{" "}
          {claimDetails.isInNetwork
            ? claimDetails.inNetworkPay
            : claimDetails.outNetworkPay}
          %
        </p>
        <p>Frequency: {claimDetails.frequency}</p>
        <p>Copay Type: {claimDetails.copayType}</p>
        <p>
          {claimDetails?.copayType === "fixed"
            ? "Copay Amount: " + claimDetails?.copayAmount
            : "Copay Percentage: " + claimDetails?.copayPercentage + "%"}
        </p>
        <p>Bill Amount: Rs. {watch("billAmount")}</p>
        <p>Amount To be copaid: Rs. {claimDetails?.amountToBeCoPaid}</p>
        <p>
          Claimable Amount After Copay: Rs. {claimDetails.claimableAfterCopay}
        </p>
        <p>Claimable Amount: Rs. {claimDetails.totalClaimable}</p>
      </div>
    </div>
  );
};

export default ClaimForm;
