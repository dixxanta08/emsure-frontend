import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import Details from "../components/app-detail";
import AppDataTable from "@/components/app-data-table";
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import policyService from "../services/policyService";

const PoliciesDetail = () => {
  const fields = [
    { name: "policyId", label: "Policy Id" },
    { name: "policyName", label: "Policy Name" },
    {
      name: "amount",
      label: "Coverage Amount",
    },
    {
      name: "maxUsers",
      label: "Max Users",
    },
    {
      name: "termsAndConditionsFilePath",
      label: "Terms and Conditions",
      type: "link",
      href: "termsAndConditionsFilePath",
    },
    {
      name: "PaymentInfo.premiumCalculation",
      label: "Premuim Calculation",
    },

    {
      name: "PaymentInfo.paymentFrequency",
      label: "Payment Frequency",
    },

    {
      name: "PaymentInfo.latePaymentPenalties",
      label: "Late Payment Penalties",
    },
    { name: "isPolicyActive", label: "Status", type: "switch" },
    { name: "description", label: "Description" },
  ];

  const { policyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: policyData,
    isLoading: isPolicyLoading,
    isError: isPolicyError,
    error: policyError,
  } = useQuery({
    queryKey: ["policy", policyId],
    queryFn: async () => {
      const data = await policyService.getPolicy(policyId);
      return {
        ...data.policy,
        isPolicyActive: data.policy.isActive ? "Active" : "Inactive",
      };
    },
    retry: false,
  });
  const columns = [
    {
      header: "Benefit",
      accessorKey: "benefitName",
    },
    {
      header: "In Network Pay",
      accessorKey: "inNetworkPay",
    },

    {
      header: "Out Network Pay",
      accessorKey: "outNetworkPay",
    },
    {
      header: "Copay Amount",
      accessorKey: "copayAmount",
    },
    {
      header: "Frequency",
      accessorKey: "frequency",
    },
  ];

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
          <h1 className="font-semibold text-lg text-gray-800">Policy</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="w-[120px] bg-[hsl(273,83.8%,53.9%)]  text-white "
            onClick={() => {
              navigate(`/insurance-management/policies/${policyId}`);
            }}
          >
            <Pencil /> Edit Policy
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-[120px] border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 />
            Delete Policy
          </Button>
        </div>
      </div>
      <div className="bg-white p-4 mt-4  rounded-md flex flex-col gap-8">
        <Details
          fields={fields}
          defaultValues={
            policyData || {
              policyId: "",
              policyName: "",
              isActive: false,
            }
          }
        />
        <div className="mt-8">
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="font-semibold text-md text-gray-800">Benefits</h2>
          </div>
          <AppDataTable
            rowIdKey="benefitId"
            columns={columns}
            data={policyData?.Benefits}
            loading={isPolicyLoading}
            error={isPolicyError}
            onRowClick={() => {
              console.log("row clicked");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PoliciesDetail;
