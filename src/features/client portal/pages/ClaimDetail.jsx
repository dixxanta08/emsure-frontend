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

    const copayType = claimData?.PolicyBenefit.copayType || "fixed"; // Default to "fixed"
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
          <div
            className="mt-4 py-4 px-8 bg-blue-200 flex items-start justify-start gap-2
          "
          >
            <InfoIcon className="text-gray-800" size={16} />

            <div>
              <p>
                Current Status:{" "}
                <span className="font-semibold">
                  {claimData?.claimStatus?.toUpperCase()}
                </span>
              </p>
              <p className="text-blue-700">
                Last updated: {formatTimestamp(claimData?.updatedAt)}
              </p>
            </div>
          </div>
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-8 py-4 ">
            <div className="p-4  rounded-md border border-gray-300">
              <h2 className=" font-semibold mb-4">Claim Details</h2>
              <div className="grid grid-cols-2 gap-1">
                <h3>Claimant Name</h3>
                <p>{claimData?.claimantName}</p>
                <h3>Subscription Id</h3>
                <Link
                  to={`/subscribed-plans/${claimData?.subscriptionId}/employees/${claimData?.employeeId}`}
                >
                  <p className="underline">
                    {claimData?.employeeSubscriptionId}
                  </p>
                </Link>
                <h3>Medical Facility</h3>
                <p>
                  {claimData?.MedicalFacility
                    ? claimData?.MedicalFacility?.medicalFacilityName
                    : "Other"}
                </p>
                <h3>Claim Type</h3>
                <p>
                  {claimData?.isClaimInNetwork ? "In Network" : " Out Network"}
                </p>
                <h3>Benefit Name</h3>
                <p>{claimData?.PolicyBenefit.benefitName}</p>
              </div>
            </div>

            <div className="p-4  rounded-md border border-gray-300">
              <h2 className=" font-semibold mb-4">Claimant Details</h2>
              <div className="grid grid-cols-2 gap-1">
                <h3>Max Coverage</h3>
                <p>
                  Rs.{" "}
                  {claimData?.isClaimInNetwork
                    ? claimData?.PolicyBenefit.inNetworkMaxCoverage
                    : claimData?.PolicyBenefit.outNetworkMaxCoverage}
                </p>
                {claimData?.claimStatus !== "insurance_approved" &&
                  claimData?.claimStatus !== "PAID" && (
                    <>
                      <h3>Usage Left </h3>
                      <p>
                        Rs.{" "}
                        {claimData?.isClaimInNetwork
                          ? claimData?.PolicyBenefit.inNetworkUsageLeft
                          : claimData?.PolicyBenefit.outNetworkUsageLeft}
                      </p>
                    </>
                  )}
                <h3>Bill Amount</h3>
                <p>Rs. {claimData?.billAmount}</p>
                <h3>Pay Percentage</h3>
                <p>
                  {claimData?.isClaimInNetwork
                    ? claimData?.PolicyBenefit.inNetworkPay
                    : claimData?.PolicyBenefit.outNetworkPay}
                  %
                </p>
                <h3>Amount To be Copaid</h3>
                <p>Rs. {claimDetails?.amountToBeCoPaid}</p>
                <h3>Claimable Amount After Copay</h3>
                <p>Rs. {claimDetails?.claimableAfterCopay}</p>
                <h3>Total Claim Amount</h3>
                <p>Rs. {claimDetails?.totalClaimable}</p>
              </div>
            </div>

            <div className="p-4  rounded-md border border-gray-300 col-span-2">
              <h2 className=" font-semibold mb-4">Claim Description</h2>
              <div className="my-2">
                <p>{claimData?.claimDescription}</p>
                {/* files */}
                {claimData?.documentUrls && (
                  <>
                    <h3 className="mt-2 font-semibold">Attached Documents</h3>
                    <div className="space-y-2">
                      {parseDocumentUrls(claimData.documentUrls).map(
                        (url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full p-1 my-2 bg-slate-200 rounded inline-flex items-center gap-2 text-slate-800 hover:bg-slate-300 transition-colors"
                          >
                            <FaFilePdf className="text-red-600" size={16} />
                            <span>View Document {index + 1}</span>
                          </a>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
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
  const handleClaimPay = () => {
    console.log("Payment with esewa");
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    reset();
  };

  const mutation = useMutation({
    mutationFn: async ({ claimId, claimUpdateStatusData }) => {
      return claimService.updateClaimStatus(claimId, claimUpdateStatusData);
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
    <div className="p-8 bg-[#fafafa] h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="icon"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft className="cursor-pointer" />
          </Button>
          <h1 className="font-semibold text-lg text-gray-800">Claim</h1>
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
                  className="w-[120px] bg-[hsl(145,84%,54%)] text-white"
                  onClick={handleClaimPay}
                >
                  <Check /> Pay Claim
                </Button>
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="w-[120px] bg-red-500 text-white"
                  onClick={handleCancelClaimApprove}
                >
                  <XIcon /> Reject
                </Button> */}
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
                  className="w-[120px] bg-[hsl(273,83.8%,53.9%)]  text-white "
                  onClick={handleCompanyApprove}
                >
                  <Check /> Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[120px] bg-red-500  text-white "
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
      <div className="bg-white p-4 mt-4  rounded-md flex flex-col gap-8">
        <Tabs
          defaultActiveKey="details"
          items={items}
          // onChange={onChange}
        />
      </div>
    </div>
  );
};

export default ClaimDetail;
