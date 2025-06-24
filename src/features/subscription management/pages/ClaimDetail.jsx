import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import Details from "../components/app-detail";
import AppDataTable from "@/components/app-data-table";
import {
  ArrowLeft,
  Check,
  Cross,
  Eye,
  File,
  InfoIcon,
  Pencil,
  Trash2,
  XIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthContext";
import claimService from "../services/claimService";
import { Form, Input, Modal, Tabs, Timeline } from "antd";
import { format, set } from "date-fns";
import { FaFilePdf } from "react-icons/fa";
import { FormItem } from "react-hook-form-antd";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  actionDescription: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  claimStatus: z.string().min(2, {
    message: "Claim status is required.",
  }),
  actionType: z.string().min(2, {
    message: "Action type is required.",
  }),
});

const ClaimDetail = () => {
  const { loggedInUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { claimId } = useParams();

  const parseDocumentUrls = (urlsString) => {
    try {
      return JSON.parse(urlsString);
    } catch (error) {
      console.error("Error parsing document URLs:", error);
      return [];
    }
  };
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actionDescription: "",
      claimStatus: "",
      actionType: "",
    },
  });
  const queryClient = useQueryClient();
  const {
    data: claimData,
    isLoading: isClaimDataLoading,
    isError: isClaimDataError,
    error: claimDataError,
  } = useQuery({
    queryKey: ["claimData", claimId],
    queryFn: async () => {
      const data = await claimService.getClaim(claimId);
      return {
        ...data.claim,
      };
    },
    retry: false,
  });

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return format(date, "MMMM dd, yyyy h:mm a");
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
  });
  useEffect(() => {
    if (!claimData) {
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
      });
      return;
    }

    const billAmount = claimData?.billAmount || 0;
    const isInNetwork = claimData?.isClaimInNetwork;

    const inNetworkCoverage =
      claimData?.PolicyBenefit.inNetworkMaxCoverage || 0;
    const outNetworkCoverage =
      claimData?.PolicyBenefit.outNetworkMaxCoverage || 0;

    const inNetworkUsageLeft = claimData?.PolicyBenefit.inNetworkUsageLeft || 0;
    const outNetworkUsageLeft =
      claimData?.PolicyBenefit.outNetworkUsageLeft || 0;

    const copayType = claimData?.PolicyBenefit.copayType || "fixed";
    const copayAmount =
      copayType === "fixed" ? claimData?.PolicyBenefit.copayAmount || 0 : 0;
    const copayPercentage =
      copayType === "percentage"
        ? claimData?.PolicyBenefit.copayPercentage || 0
        : 0;

    const amountToBeCoPaid =
      copayType === "fixed"
        ? Math.min(copayAmount, billAmount)
        : (copayPercentage * billAmount) / 100;

    const claimableAfterCopay = Math.max(billAmount - amountToBeCoPaid, 0);

    const totalClaimable = Math.max(
      Math.min(
        claimableAfterCopay,
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
      frequency: claimData?.PolicyBenefit.frequency || "",
      copayType,
      amountToBeCoPaid,
    });
  }, [claimData]);
  const items = [
    {
      key: "details",
      label: "Details",
      children: (
        <>
          <div className="mt-4 py-4 px-8 bg-blue-100 rounded-lg flex items-center justify-start gap-3 shadow-sm">
            <InfoIcon className="text-blue-600" size={20} />
            <div>
              <p className="text-sm">
                Current Status:{" "}
                <span className="font-semibold text-blue-800">
                  {claimData?.claimStatus?.toUpperCase()}
                </span>
              </p>
              <p className="text-xs text-blue-600">
                Last updated: {formatTimestamp(claimData?.updatedAt)}
              </p>
            </div>
          </div>

          {claimData?.documentUrls && (
            <div className="mt-4 px-6 py-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaFilePdf className="text-red-500" size={18} />
                Claim Documents
              </h3>
              <div className="space-y-2">
                {parseDocumentUrls(claimData.documentUrls)?.map(
                  (url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <File className="w-4 h-4" />
                      <span className="underline">
                        View Document {index + 1}
                      </span>
                    </a>
                  )
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-semibold text-lg text-gray-800 mb-4">
                Claim Details
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <h3 className="text-gray-600">Claimant Name</h3>
                <p className="text-gray-800">{claimData?.claimantName}</p>

                {/* <h3 className="text-gray-600">Subscription Id</h3>
                <Link
                  to={`/subscription-management/plan-subscriptions/${claimData?.subscriptionId}/details`}
                  className="text-blue-600 hover:underline"
                >
                  {claimData?.subscriptionId}
                </Link> */}

                <h3 className="text-gray-600">Employee Subscription Id</h3>
                <Link
                  to={`/subscription-management/plan-subscriptions/${claimData?.subscriptionId}/employees/${claimData?.employeeId}`}
                  className="text-blue-600 hover:underline"
                >
                  {claimData?.employeeSubscriptionId}
                </Link>

                <h3 className="text-gray-600">Medical Facility</h3>
                <p className="text-gray-800">
                  {claimData?.MedicalFacility
                    ? claimData?.MedicalFacility?.medicalFacilityName
                    : "Other"}
                </p>

                <h3 className="text-gray-600">Claim Type</h3>
                <p className="text-gray-800">
                  {claimData?.isClaimInNetwork ? "In Network" : "Out Network"}
                </p>

                <h3 className="text-gray-600">Benefit Name</h3>
                <p className="text_gray-800">
                  {claimData?.PolicyBenefit.benefitName}
                </p>
                <h3 className="text-gray-600">Claim Documents</h3>
                <div className="space-y-1">
                  {parseDocumentUrls(claimData?.documentUrls)?.map(
                    (url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block"
                      >
                        Document {index + 1}
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-semibold text-lg text-gray-800 mb-4">
                Claimant Details
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <h3 className="text-gray-600">Max Coverage</h3>
                <p className="text-gray-800">
                  Rs.{" "}
                  {claimData?.isClaimInNetwork
                    ? claimData?.PolicyBenefit.inNetworkMaxCoverage
                    : claimData?.PolicyBenefit.outNetworkMaxCoverage}
                </p>
                {claimData?.claimStatus !== "insurance_approved" &&
                  claimData?.claimStatus !== "PAID" && (
                    <>
                      <h3 className="text-gray-600">Usage Left</h3>
                      <p className="text-gray-800">
                        Rs.{" "}
                        {claimData?.isClaimInNetwork
                          ? claimData?.PolicyBenefit.inNetworkUsageLeft
                          : claimData?.PolicyBenefit.outNetworkUsageLeft}
                      </p>
                    </>
                  )}

                <h3 className="text-gray-600">Bill Amount</h3>
                <p className="text-gray-800">Rs. {claimData?.billAmount}</p>
                <h3 className="text-gray-600">Pay Percentage</h3>
                <p className="text-gray-800">
                  {claimData?.isClaimInNetwork
                    ? claimData?.PolicyBenefit.inNetworkPay
                    : claimData?.PolicyBenefit.outNetworkPay}
                  %
                </p>
                <h3 className="text-gray-600">Amount To be Copaid</h3>
                <p className="text-gray-800">
                  Rs. {claimDetails?.amountToBeCoPaid}
                </p>

                <h3 className="text-gray-600">Claimable After Copay</h3>
                <p className="text-gray-800">
                  Rs. {claimDetails?.claimableAfterCopay}
                </p>

                <h3 className="text-gray-600">Total Claim Amount</h3>
                <p className="text-gray-800">
                  Rs. {claimDetails?.totalClaimable}
                </p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <h2 className="font-semibold text-lg text-gray-800 mb-4">
                Claim Description
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {claimData?.claimDescription}
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      key: "history",
      label: "History",
      children: (
        <div className="p-8">
          <Timeline
            items={claimData?.ClaimHistories?.map((history) => ({
              children: (
                <div className="p-4 bg-white shadow-md rounded-lg border border-gray-200">
                  <h2 className="text-[14px] font-bold text-gray-800">
                    {history?.actionType.toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(history?.actionDate).toLocaleDateString()}
                  </p>
                  <div className="mt-2 border-t pt-2">
                    <p className="text-gray-700 font-medium">
                      {history?.User?.name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {history?.actionDescription}
                    </p>
                  </div>
                </div>
              ),
            }))}
          />
        </div>
      ),
    },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCompanyApprove = () => {
    setIsModalOpen(true);
    setValue("claimStatus", "company_approved");
    setValue("actionType", "Company Approved");
  };
  const handleCompanyReject = () => {
    setIsModalOpen(true);
    setValue("claimStatus", "company_rejected");
    setValue("actionType", "Company Rejected");
  };
  const handleInsuranceApprove = () => {
    setIsModalOpen(true);
    setValue("claimStatus", "insurance_approved");
    setValue("actionType", "Insurance Approved");
  };
  const handleInsuranceReject = () => {
    setIsModalOpen(true);
    setValue("claimStatus", "insurance_rejected");
    setValue("actionType", "Insurance Rejected");
  };
  const handleInsuranceRevert = () => {
    setIsModalOpen(true);
    setValue("claimStatus", "insurance_approved");
    setValue("actionType", "Reverted Insurance Approval");
  };
  async function generateHMAC(
    total_amount,
    transaction_uuid,
    product_code,
    secretKey
  ) {
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(message);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, messageData);
    const base64Signature = btoa(
      String.fromCharCode(...new Uint8Array(signature))
    );

    return base64Signature;
  }
  const handleRevertInsuranceApproval = async (claimId, actionDescription) => {
    try {
      const response = await claimService.revertInsuranceApproval(
        claimId,
        actionDescription
      );
      console.log("response", response);
      // refetch the claim data
      queryClient.invalidateQueries("claimData");
      toast({
        variant: "success",
        title: "Insurance Approval Reverted successfully",
        description: "Insurance Approval has been reverted successfully.",
      });
    } catch (error) {
      console.error("Failed to revert insurance approval:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
      });
    }
  };
  const handleClaimPay = async (data) => {
    const totalAmount = claimDetails?.totalClaimable;
    const transaction_uuid = "emsure_" + claimId + "_" + new Date().getTime();
    const product_code = "EPAYTEST";
    const secretKey = "8gBm/:&EnhH.1/q";

    const response = await claimService.payClaimAmount({
      claimId: claimId,
      status: "pending",
      transactionUUID: transaction_uuid,
      totalAmount: totalAmount,
      paymentMethod: "esewa",
    });

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    generateHMAC(totalAmount, transaction_uuid, product_code, secretKey)
      .then((signature) => {
        const inputs = [
          { name: "amount", value: totalAmount },
          { name: "tax_amount", value: 0 },
          { name: "total_amount", value: totalAmount },
          { name: "transaction_uuid", value: transaction_uuid },
          { name: "product_code", value: product_code },
          { name: "product_service_charge", value: "0" },
          { name: "product_delivery_charge", value: "0" },
          {
            name: "success_url",
            value: `http://localhost:5173/subscription-management/claim-payment-success/${response.payment.employeeSubscriptionClaimPaymentId}`,
          },
          {
            name: "failure_url",
            value: `http://localhost:5173/subscription-management/claim-payment-failed?transaction_uuid=${transaction_uuid}&amount=${totalAmount}`,
          },
          {
            name: "signed_field_names",
            value: "total_amount,transaction_uuid,product_code",
          },
          {
            name: "signature",
            value: signature,
          },
        ];

        inputs.forEach((input) => {
          const inputElement = document.createElement("input");
          inputElement.type = "text";
          inputElement.name = input.name;
          inputElement.value = input.value;
          form.appendChild(inputElement);
        });

        document.body.appendChild(form);
        console.log("form values", inputs);
        form.submit();
      })
      .catch((error) => {
        console.error("Error generating HMAC:", error);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    reset();
  };

  const mutation = useMutation({
    mutationFn: async ({ claimId, claimUpdateStatusData }) => {
      if (claimData.claimStatus === "insurance_approved") {
        // claimData not claimUpdateStatusData becuase we need to check the current status
        await handleRevertInsuranceApproval(
          claimId,
          claimUpdateStatusData.actionDescription
        );
      } else {
        return claimService.updateClaimStatus(claimId, claimUpdateStatusData);
      }
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Claim Status Updated successfully",
        description: "Claim Status has been updated successfully.",
      });
      queryClient.invalidateQueries("claimData");
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      console.error("Failed to update claim status:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while creating claim.",
      });
    },
  });

  const onSubmit = async (data) => {
    const claimUpdateStatusData = {
      ...data,
    };
    console.log("payload", { claimId, claimUpdateStatusData });
    mutation.mutate({ claimId, claimUpdateStatusData });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-gray-200 hover:bg-gray-100"
          >
            <ArrowLeft className="text-gray-600" />
          </Button>
          <h1 className="font-semibold text-xl text-gray-900">Claim Details</h1>
        </div>
        <div className="flex items-center gap-4">
          {(loggedInUser?.roleName === "INSURANCE_WORKER" ||
            loggedInUser?.roleName === "SUPER_ADMIN") &&
            claimData?.claimStatus === "company_approved" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[120px] bg-[hsl(273,83.8%,53.9%)] text-white"
                  onClick={handleInsuranceApprove}
                >
                  <Check /> Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[120px] bg-red-500 text-white"
                  onClick={handleInsuranceReject}
                >
                  <XIcon /> Reject
                </Button>
                <Modal
                  open={isModalOpen}
                  onCancel={handleCancel}
                  onClose={handleCancel}
                  onOk={handleSubmit(onSubmit)}
                  title={watch("actionType")}
                >
                  <Form
                    onFinish={handleSubmit(onSubmit)}
                    layout="vertical"
                    className="mt-4"
                  >
                    <FormItem
                      control={control}
                      name="actionDescription"
                      label="Action Description"
                    >
                      <Input.TextArea
                        className="!h-32 !resize-none"
                        placeholder="Enter your comments here"
                      />
                    </FormItem>
                  </Form>
                </Modal>
              </>
            )}

          {(loggedInUser?.roleName === "INSURANCE_WORKER" ||
            loggedInUser?.roleName === "SUPER_ADMIN") &&
            claimData?.claimStatus === "insurance_approved" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[120px] bg-red-600 text-white"
                  onClick={handleInsuranceRevert}
                  disabled={claimData?.claimStatus !== "insurance_approved"}
                >
                  <XIcon /> Revert Approval
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[120px] bg-[hsl(145,84%,54%)] text-white"
                  onClick={handleClaimPay}
                >
                  <Check /> Pay Claim
                </Button>
                <Modal
                  open={isModalOpen}
                  onCancel={handleCancel}
                  onClose={handleCancel}
                  onOk={handleSubmit(onSubmit)}
                  title={watch("actionType")}
                >
                  <Form
                    onFinish={handleSubmit(onSubmit)}
                    layout="vertical"
                    className="mt-4"
                  >
                    <FormItem
                      control={control}
                      name="actionDescription"
                      label="Action Description"
                    >
                      <Input.TextArea
                        className="!h-32 !resize-none"
                        placeholder="Enter your comments here"
                      />
                    </FormItem>
                  </Form>
                </Modal>
              </>
            )}

          {loggedInUser?.roleName === "EMPLOYER" &&
            claimData?.claimStatus === "submitted" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[120px] bg-[hsl(273,83.8%,53.9%)] text-white"
                  onClick={handleCompanyApprove}
                >
                  <Check /> Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[120px] bg-red-500 text-white"
                  onClick={handleCompanyReject}
                >
                  <XIcon /> Reject
                </Button>
                <Modal
                  open={isModalOpen}
                  onCancel={handleCancel}
                  onClose={handleCancel}
                  onOk={handleSubmit(onSubmit)}
                  title={watch("actionType")}
                >
                  <Form
                    onFinish={handleSubmit(onSubmit)}
                    layout="vertical"
                    className="mt-4"
                  >
                    <FormItem
                      control={control}
                      name="actionDescription"
                      label="Action Description"
                    >
                      <Input.TextArea
                        className="!h-32 !resize-none"
                        placeholder="Enter your comments here"
                      />
                    </FormItem>
                  </Form>
                </Modal>
              </>
            )}
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <Tabs defaultActiveKey="details" items={items} />
      </div>
    </div>
  );
};

export default ClaimDetail;
