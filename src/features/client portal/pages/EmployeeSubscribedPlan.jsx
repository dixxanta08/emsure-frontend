import React, { act, useEffect, useState } from "react";
import Button from "../components/customantd/Button";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import Details from "../components/app-detail";
import AppDataTable from "@/components/app-data-table";
import { ArrowLeft, CreditCard, Eye, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import planService from "../services/planService";
import companyService from "@/features/authentication/services/companyService";
import { useAuth } from "@/auth/AuthContext";
import { Form, Modal, Select, Tabs, Tooltip } from "antd";
import subscriptionService from "../services/subscriptionService";
import { FormItem } from "react-hook-form-antd";
import employeeService from "@/features/authentication/services/employeeService";
import { useToast } from "@/hooks/use-toast";
import claimService from "../services/claimService";

const formSchema = z.object({
  employeeId: z.number().int().min(1, {
    message: "Employee is required.",
  }),
});

const EmployeeSubscribedPlan = () => {
  const fields = [
    { name: "employeeSubscriptionId", label: "Employee Subscription Id" },
    { name: "subscriptionId", label: "Subscription Id" },
    {
      name: "name",
      label: "Policyholder Name",
      type: "dynamiclink",
      hrefTemplate: "/company/{{companyId}}/employees/{{employeeId}}",
    },
    {
      name: "planName",
      label: "Plan Name",
      type: "dynamiclink",
      hrefTemplate: "/explore-plans/{{planId}}",
    },
    {
      name: "employeeStartDate",
      label: "Start Date",
    },
    {
      name: "removedDate",
      label: "Removed Date",
    },
    {
      name: "employeeSubscriptionStatus",
      label: "Employee Subscription Status",
    },
    {
      name: "monthlyPayment",
      label: "Monthly Payment",
    },
  ];

  const columns = [
    {
      accessorKey: "benefitName",
      header: "Benefit Name",
    },
    {
      accessorKey: "inNetworkMaxCoverage",
      header: "In Network Coverage",
    },
    {
      accessorKey: "inNetworkUsageLeft",
      header: "In Network Left",
    },
    {
      accessorKey: "outNetworkMaxCoverage",
      header: "Out Network Coverage",
    },
    {
      accessorKey: "outNetworkUsageLeft",
      header: "Out Network Left",
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
    },
  ];
  const paymentColumns = [
    {
      accessorKey: "employeeSubscriptionPaymentId",
      header: "Payment Id",
    },
    {
      accessorKey: "createdAt",
      header: "Payment Date",
    },
    {
      accessorKey: "totalAmount",
      header: "Payment Amount",
    },
    {
      accessorKey: "status",
      header: "Payment Status",
    },
  ];
  const claimsColumns = [
    {
      accessorKey: "claimId",
      header: "Claim Id",
    },
    {
      accessorKey: "claimantName",
      header: "Claimant Name",
    },
    {
      accessorKey: "claimDate",
      header: "Claim Date",
    },
    {
      accessorKey: "claimAmount",
      header: "Claim Amount",
    },
    {
      accessorKey: "claimStatus",
      header: "Claim Status",
    },
  ];

  const { subscriptionId, employeeId } = useParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal
  const [modalEmployeeSearchTerm, setModalEmployeeSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      employeeId: null,
      subscriptionId: subscriptionId,
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ subscriptionId, employeeSubscriptionFormData }) => {
      return subscriptionService.createEmployeeSubscription(
        subscriptionId,
        employeeSubscriptionFormData
      );
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Employee Subcription added successfully",
        description: "Employee Subscription has been added successfully.",
      });
      queryClient.invalidateQueries([
        "subscriptionEmployeeData",
        subscriptionId,
      ]);
    },
    onError: (error) => {
      console.error("Failed to add employee subscription :", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while updating the company.",
      });
    },
  });
  const onSubmit = (data) => {
    const employeeSubscriptionFormData = {
      employeeId: data.employeeId,
      subscriptionId: subscriptionId,
      employeeStartDate: formatToDateInput(new Date()),
    };
    mutation.mutate({ subscriptionId, employeeSubscriptionFormData });
    setIsModalOpen(false);
    reset();
  };

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
      return {
        ...data.employeeSubscription,
      };
    },
    retry: false,
  });

  const {
    data: pendingPayment,
    isLoading: isPendingPaymentLoading,
    isError: isPendingPaymentError,
    error: pendingPaymentError,
  } = useQuery({
    queryKey: ["pendingPayment", employeeSubscriptionData],
    queryFn: async () => {
      const data =
        await subscriptionService.getEmployeeSubscriptionPendingPayment(
          employeeSubscriptionData.employeeSubscriptionId
        );
      return data.pendingPayment;
    },
    retry: false,
  });

  const {
    data: payments,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
    error: paymentsError,
  } = useQuery({
    queryKey: ["payments", employeeSubscriptionData],
    queryFn: async () => {
      const data = await subscriptionService.getEmployeeSubscriptionPayments(
        employeeSubscriptionData.employeeSubscriptionId
      );
      return data;
    },
    retry: false,
  });

  const {
    data: claims,
    isLoading: isClaimsLoading,
    isError: isClaimsError,
    error: claimsError,
  } = useQuery({
    queryKey: ["claims", employeeSubscriptionData],
    queryFn: async () => {
      const data = await claimService.getClaimsByEmployeeSubscriptionId(
        employeeSubscriptionData.employeeSubscriptionId
      );
      return data;
    },
    retry: false,
  });

  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [selectedPolicyBenefitData, setSelectedPolicyBenefitData] =
    useState(null);
  const [activeTab, setActiveTab] = useState("claims");
  const [isPolicyBenfitModalOpen, setIsPolicyBenfitModalOpen] = useState(false);
  const [selectedPolicyBenefit, setSelectedPolicyBenefit] = useState(null);
  const items = [
    {
      key: "policy",
      label: "Policy",
      children: (
        <>
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="font-semibold text-md text-gray-800">
              Policy Benefits
            </h2>
            <Select
              value={selectedPolicyId}
              className="w-[120px]"
              onChange={(value) => setSelectedPolicyId(value)}
            >
              {employeeSubscriptionData?.Policies.map((policy) => (
                <Select.Option key={policy.policyId} value={policy.policyId}>
                  {policy.policyName}
                </Select.Option>
              ))}
            </Select>
            {/* <Button
        variant="outline"
        className="w-[144px] bg-[hsl(273,83.8%,53.9%)] text-white"
        onClick={() => setIsModalOpen(true)}
      >
        <Pencil /> Add Employee
      </Button> */}
          </div>
          <AppDataTable
            rowIdKey="employeeSubscriptionId"
            columns={columns}
            data={selectedPolicyBenefitData}
            onRowClick={(row) => {
              setSelectedPolicyBenefit(row);
              setIsPolicyBenfitModalOpen(true);
            }}
            // loading={isSubscriptionEmployeesLoading}
            // error={subscriptionEmployeesError}
            // onRowClick={(row) =>
            //   navigate(
            //     `/subscribed-plans/${subscriptionId}/employees/${row.employeeId}`
            //   )
            // }
          />
        </>
      ),
    },
    {
      key: "payments",
      label: "Payments",
      children: (
        <>
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="font-semibold text-md text-gray-800">Payments</h2>
          </div>
          <AppDataTable
            rowIdKey="paymentId"
            columns={paymentColumns}
            data={payments?.employeeSubscriptionPayments}
            // loading={isSubscriptionEmployeesLoading}
            // error={subscriptionEmployeesError}
            // onRowClick={(row) =>
            //   navigate(
            //     `/subscribed-plans/${subscriptionId}/employees/${row.employeeId}`
            //   )
            // }
          />
        </>
      ),
    },
    {
      key: "claims",
      label: "Claims",
      children: (
        <>
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base text-gray-800 py-2">
              Claims
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate(`claims/new`)}
              disabled={
                employeeSubscriptionData?.employeeSubscriptionStatus?.toLowerCase() !==
                "active"
              }
            >
              Make Claim
            </Button>
          </div>
          <AppDataTable
            rowIdKey="claimId"
            columns={claimsColumns}
            data={claims?.claims}
            // loading={isSubscriptionEmployeesLoading}
            // error={subscriptionEmployeesError}
            // onRowClick={(row) =>
            //   navigate(
            //     `/subscribed-plans/${subscriptionId}/employees/${row.employeeId}`
            //   )
            // }
          />
        </>
      ),
    },
  ];

  useEffect(() => {
    if (selectedPolicyId) {
      const policy = employeeSubscriptionData.Policies.find(
        (policy) => policy.policyId === selectedPolicyId
      );
      setSelectedPolicyBenefitData(policy.PolicyBenefits);
    } else {
      setSelectedPolicyId(employeeSubscriptionData?.Policies[0].policyId);
    }
  }, [selectedPolicyId, employeeSubscriptionData]);
  async function generateHMAC(
    total_amount,
    transaction_uuid,
    product_code,
    secretKey
  ) {
    // Construct the message string
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    // Encode the secret key and message
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(message);

    // Import the secret key for HMAC usage
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Generate the HMAC signature
    const signature = await crypto.subtle.sign("HMAC", key, messageData);

    // Convert the ArrayBuffer signature to a Base64 string
    const base64Signature = btoa(
      String.fromCharCode(...new Uint8Array(signature))
    );

    return base64Signature;
  }

  const handlePayPremium = async (data) => {
    const totalAmount = pendingPayment?.pendingAmount;
    const transaction_uuid =
      "emsure_" +
      employeeSubscriptionData?.planName +
      "_" +
      new Date().getTime();
    const product_code = "EPAYTEST";
    const secretKey = "8gBm/:&EnhH.1/q";
    console.log(
      totalAmount,
      transaction_uuid,
      product_code,
      secretKey,
      employeeSubscriptionData
    );
    const response =
      await subscriptionService.createEmployeeSubscriptionPayment({
        employeeSubscriptionId: employeeSubscriptionData.employeeSubscriptionId,
        status: "pending",
        type: "monthlyPayment",
        transactionUUID: transaction_uuid,
        totalAmount: totalAmount,
        paymentMethod: "esewa",
      });

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    generateHMAC(totalAmount, transaction_uuid, product_code, secretKey)
      .then((signature) => {
        console.log("HMAC Signature:", signature);
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
            value: `http://localhost:5173/monthly-payment-success/${response.employeeSubscriptionPaymentId}`,
            // ?paymentMethod=${encodeURIComponent(data.paymentMethod)}
          },
          {
            name: "failure_url",
            value: "http://localhost:5173/monthly-payment-failed",
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
        form.submit();
      })
      .catch((error) => {
        console.error("Error generating HMAC:", error);
      });
  };

  return (
    <div className="p-8 bg-[#fafafa] h-full ">
      <div className="bg-white p-4 ">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeft />}
              onClick={() => navigate(-1)}
              variant="empty"
            ></Button>
            <h1 className="font-bold text-lg text-gray-800">
              {/* {planSubscriptionData?.planName} */}
              Employee Subscription ID:{" "}
              {employeeSubscriptionData?.employeeSubscriptionId}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className=" text-[#9227ec]">
              <span className="text-xl font-bold ">
                Rs.{employeeSubscriptionData?.monthlyPayment}
              </span>
              /month
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end ">
          {/* <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      Subscription ID: {planSubscriptionData?.subscriptionId}
                    </p>
                  </div> */}
          {employeeSubscriptionData?.employeeSubscriptionStatus?.toLowerCase() ===
          "active" ? (
            <p className="text-xs border border-green-500  bg-green-200 rounded-3xl px-2 py-1 text-green-800">
              Active
            </p>
          ) : (
            <p className="text-xs border border-red-500  bg-red-200 rounded-3xl px-2 py-1 text-red-800">
              Inactive
            </p>
          )}
        </div>

        <div className=" p-4 mt-4  rounded-md flex flex-col gap-8 mb-4">
          <div className="w-full grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Plan Name</h3>
              <Link to={`/explore-plans/${employeeSubscriptionData?.planId}`}>
                <p className="text-purple-500 hover:text-purple-800 underline  font-semibold">
                  {employeeSubscriptionData?.planName}
                </p>
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Policyholder Name
              </h3>
              <p className="text-black  font-semibold">
                {employeeSubscriptionData?.name}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
              <p className="text-black font-semibold">
                {employeeSubscriptionData?.employeeStartDate}
              </p>
            </div>

            {employeeSubscriptionData?.removedDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Removed Date
                </h3>
                <p className="text-black  font-semibold">
                  {employeeSubscriptionData?.removedDate}
                </p>
              </div>
            )}

            {pendingPayment && pendingPayment?.pendingAmount > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Paid Date
                  </h3>
                  <p className="text-black  font-semibold">
                    {
                      new Date(pendingPayment?.lastPaidDate)
                        .toISOString()
                        .split("T")[0]
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Pending Amount
                  </h3>
                  <p className="text-black  font-semibold">
                    Rs.{pendingPayment?.pendingAmount}
                  </p>
                </div>
              </>
            )}
          </div>

          <hr />
        </div>

        <div className="flex items-center justify-end gap-4">
          {isEmployeeSubscriptionDataLoading || isPendingPaymentLoading ? (
            <p className="text-sm font-semibold text-gray-500">
              Checking payment status...
            </p>
          ) : pendingPayment?.pendingAmount > 0 ? (
            <>
              <p className="text-sm font-semibold text-red-500">
                You have pending payments.
              </p>
              <Button
                variant="primary"
                className="w-[120px] bg-[hsl(273,83.8%,53.9%)] text-white"
                onClick={handlePayPremium}
                // onClick={() => navigate(`/buy-plan/${planId}`)}
                // disabled={!isCompanyProfileComplete} // Disable when profile is incomplete
              >
                <CreditCard /> Pay Premium
              </Button>
            </>
          ) : (
            <p className="text-sm font-semibold text-green-500">
              Policy holder has no pending payments.
            </p>
          )}
        </div>
      </div>
      <div className="bg-white p-4 mt-4  rounded-md flex flex-col gap-8">
        <div className="mt-8">
          <Tabs
            defaultActiveKey="claims"
            activeKey={activeTab}
            items={items}
            onChange={(key) => setActiveTab(key)}
          />
          <Modal
            title="Benefit"
            onClose={() => setIsPolicyBenfitModalOpen(false)}
            onCancel={() => setIsPolicyBenfitModalOpen(false)}
            open={isPolicyBenfitModalOpen}
            footer={null}
          >
            <div className="flex flex-col gap-4 mt-4 p-4">
              {selectedPolicyBenefit && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Benefit Name
                    </h3>
                    <p className="text-black font-semibold">
                      {selectedPolicyBenefit.benefitName}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Frequency
                    </h3>
                    <p className="text-black  font-semibold">
                      {selectedPolicyBenefit.frequency.charAt(0).toUpperCase() +
                        selectedPolicyBenefit.frequency.slice(1).toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      In Network Pay
                    </h3>
                    <p className="text-black  font-semibold">
                      {selectedPolicyBenefit.inNetworkPay}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      In Network Max Coverage
                    </h3>
                    <p className="text-black  font-semibold">
                      Rs.{selectedPolicyBenefit.inNetworkMaxCoverage}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Out Network Pay
                    </h3>
                    <p className="text-black  font-semibold">
                      {selectedPolicyBenefit.outNetworkPay}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Out Network Max Coverage
                    </h3>
                    <p className="text-black  font-semibold">
                      Rs.{selectedPolicyBenefit.outNetworkMaxCoverage}
                    </p>
                  </div>
                  {selectedPolicyBenefit.copayType === "percentage" ? (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Copay Percentage
                      </h3>
                      <p className="text-black  font-semibold">
                        {selectedPolicyBenefit.copayPercentage}%
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Copay Amount
                      </h3>
                      <p className="text-black  font-semibold">
                        Rs.{selectedPolicyBenefit.copayAmount}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSubscribedPlan;
