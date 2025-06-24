import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import Details from "../components/app-detail";
import AppDataTable from "@/components/app-data-table";
import { ArrowLeft, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import planService from "../services/planService";
import companyService from "@/features/authentication/services/companyService";
import { useAuth } from "@/auth/AuthContext";
import { Tooltip } from "antd";
import { FaExternalLinkAlt } from "react-icons/fa";
import subscriptionService from "../services/subscriptionService";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().min(10, { message: "Invalid phone number." }),
  licenseNumber: z.string(),
  licenseExpirationDate: z.string().transform((val) => new Date(val)),
  contractStartDate: z.string().transform((val) => new Date(val)),
  contractEndDate: z.string().transform((val) => new Date(val)),
  isActive: z.boolean(),
});

const ExplorePlanDetails = () => {
  const fields = [
    { name: "planId", label: "Plan Id" },
    { name: "planName", label: "Plan Name" },

    {
      name: "price",
      label: "Price",
    },
    {
      name: "maxUsers",
      label: "Max Users",
    },

    {
      name: "initialPayment",
      label: "Initial Payments",
    },
    {
      name: "termsAndConditionsFilePath",
      label: "Terms and Conditions",
      type: "link",
      href: "termsAndConditionsFilePath",
    },
    {
      name: "planType",
      label: "Plan Type",
    },
    { name: "isActive", label: "Status", type: "switch" },

    {
      name: "description",
      label: "Description",
      type: "description",
    },
  ];

  const columns = [
    {
      accessorKey: "policyId",
      header: "Policy Id",
      width: "15%",
    },
    {
      accessorKey: "policyName",
      header: "Policy Name",
      width: "25%",
    },
    {
      accessorKey: "amount",
      header: "Coverage Amount",
      width: "20%",
    },
    {
      accessorKey: "description",
      header: "Description",
      width: "40%",
    },
  ];

  const { planId } = useParams();

  const { loggedInUser } = useAuth();
  const companyId = loggedInUser?.companyId;
  const isEmployer = loggedInUser?.roleName === "EMPLOYER";
  const employeeId = useMemo(() => loggedInUser?.employeeId, [loggedInUser]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: planData,
    isLoading: isPlanLoading,
    isError: isPlanError,
    error: planError,
  } = useQuery({
    queryKey: ["plan", planId],
    queryFn: async () => {
      const data = await planService.getPlan(planId);
      return {
        ...data.plan,
        isActive: data.plan.isActive ? "Active" : "Inactive",
      };
    },
    retry: false,
  });
  const {
    data: isCompanyProfileComplete,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
    error: companyError,
  } = useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const data = await companyService.isCompanyProfileComplete(companyId);
      return data.isComplete;
    },
    retry: false,
  });
  const {
    data: companySubscribedPlans,
    isLoading: isCompanySubscriptionsLoading,
    isError: isCompanySubscriptionsError,
    error: companySubscriptionsError,
  } = useQuery({
    queryKey: ["companySubscriptions", companyId],
    queryFn: async () => {
      const data = await subscriptionService.getSubscriptionsByCompanyId(
        0,
        100,
        "",
        "all",
        companyId
      );
      return data.subscriptions.map((sub) => {
        return {
          planId: sub.planId,
          subscriptionId: sub.subscriptionId,
          paymentStatus: sub.paymentStatus,
        };
      });
    },
    retry: false,
  });
  const {
    data: employeeSubscribedPlans,
    isLoading: isEmployeeSubscriptionsLoading,
    isError: isEmployeeSubscriptionsError,
    error: employeeSubscriptionsError,
  } = useQuery({
    queryKey: ["employeeSubscriptions", employeeId],
    queryFn: async () => {
      const data = await subscriptionService.getSubscriptionsByEmployeeId(
        employeeId,
        0,
        100,
        "",
        "all"
      );
      return data.employeeSubscriptions.map((sub) => {
        return {
          planId: sub.planId,
          subscriptionId: sub.subscriptionId,
          paymentStatus: sub.paymentStatus,
        };
      });
    },
    retry: false,
  });
  
  console.log(companySubscribedPlans);
  console.log(isEmployer);
  console.log(employeeSubscribedPlans);
  if (isPlanLoading || isCompanyLoading) {
    return (
      <div className="h-full">
        <Loader2 className="animate-spin m-auto" />;
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#fafafa] h-full ">
      <div className="bg-white p-4 ">
        <div className="flex items-center justify-between ">
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
            <h1 className="font-bold text-lg text-gray-800">
              {planData.planName}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className=" text-[#9227ec]">
              <span className="text-xl font-bold ">
                Rs.{planData.monthlyPayment}
              </span>
              /month
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">Plan ID: {planData.planId}</p>
          </div>
          {planData.isActive && (
            <p className="text-xs border border-green-500  bg-green-200 rounded-3xl px-2 py-1 text-green-800">
              Active
            </p>
          )}
        </div>

        <div className=" p-4 mt-4  rounded-md flex flex-col gap-8 mb-4">
          <div className="w-full grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Max Users</h3>
              <p className="text-black font-semibold">{planData.maxUsers}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Initial Payment
              </h3>
              <p className="text-black  font-semibold">
                Rs.{planData.initialPayment}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Plan Type</h3>
              <p className="text-black  font-semibold">
                {planData.planType.charAt(0).toUpperCase() +
                  planData.planType.slice(1)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Price</h3>
              <p className="text-black  font-semibold">Rs.{planData.price}</p>
            </div>
            <div className="col-span-2 mt-4">
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="text-sm  text-gray-500 ">{planData.description}</p>
            </div>
            <div className="col-span-2">
              <a
                className="text-sm font-semibold text-blue-800 underline flex items-center"
                href={planData.termsAndConditionsFilePath}
              >
                <span>View Terms & conditions</span>
                <FaExternalLinkAlt className="ml-2" />
              </a>
            </div>
          </div>
          <hr />
          {/* <Details
            fields={fields}
            defaultValues={
              planData || {
                planId: "",
                planName: "",
                isActive: false,
              }
            }
          /> */}

          <div>
            <div className="w-full flex items-center justify-between mb-4">
              <h2 className="font-semibold text-md text-gray-500">
                Included Policies
              </h2>
            </div>
            <AppDataTable
              rowIdKey="policyId"
              columns={columns}
              data={planData?.Policies}
              loading={isPlanLoading}
              error={planError}
              onRowClick={(row) =>
                navigate(`/policies/${row.policyId}`)
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-4 m-auto justify-center w-full mt-4 mb-8">
          {!isCompanyProfileComplete && (
            <p className="text-sm text-red-500">
              Complete Company Profile Before Buying Plan
            </p>
          )}
          <Tooltip
            color="red"
            title={
              !isCompanyProfileComplete
                ? "Complete your profile to buy a plan"
                : ""
            }
          >
            <span>
              {isEmployer ? (
                // Employer buttons
                companySubscribedPlans?.some(
                  (sub) =>
                    sub.planId === planData.planId &&
                    sub.paymentStatus === "complete"
                ) ? (
                  <Button
                    variant="outline"
                    className="border border-[#9227ec] text-[#9227ec] w-[220px]
                    hover:bg-[#9227ec] hover:text-white"
                    onClick={() => {
                      const subscription = companySubscribedPlans.find(
                        (sub) => sub.planId === planData.planId
                      )?.subscriptionId;
                      if (subscription) {
                        navigate(`/subscribed-plans/${subscription}/details/`);
                      }
                    }}
                  >
                    <Eye /> View Subscription
                  </Button>
                ) : (
                  // Only show Buy Plan button if plan is not subscribed or payment is not complete
                  <Button
                    variant="outline"
                    className="w-[120px] bg-[hsl(273,83.8%,53.9%)] text-white"
                    onClick={() => navigate(`/buy-plan/${planId}`)}
                    disabled={!isCompanyProfileComplete}
                  >
                    <Pencil /> Buy Plan
                  </Button>
                )
              ) : (
                // Employee buttons
                employeeSubscribedPlans?.some(
                  (sub) =>
                    sub.planId === planData.planId &&
                    sub.paymentStatus === "complete"
                ) ? (
                  <Button
                    variant="outline"
                    className="border border-[#9227ec] text-[#9227ec] w-[220px]
                    hover:bg-[#9227ec] hover:text-white"
                    onClick={() => {
                      const subscription = employeeSubscribedPlans.find(
                        (sub) => sub.planId === planData.planId
                      )?.subscriptionId;
                      if (subscription) {
                        navigate(
                          `/subscribed-plans/${subscription}/employees/${employeeId}`
                        );
                      }
                    }}
                  >
                    <Eye /> View Subscription
                  </Button>
                ) : null // Don't show Buy Plan button for employees
              )}
            </span>
          </Tooltip>
        </div>
      </div>{" "}
      <hr />
    </div>
  );
};

export default ExplorePlanDetails;
