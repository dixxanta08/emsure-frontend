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
import { Tabs, Tooltip } from "antd";
import { FaExternalLinkAlt } from "react-icons/fa";
import subscriptionService from "../../client portal/services/subscriptionService";
import { render } from "react-dom";
import SearchBar from "@/components/app-searchbar";
import Select from "@/features/client portal/components/customantd/select";
import { DataTablePagination } from "@/components/app-pagination";

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

const PlanDetails = () => {
  const { loggedInUser } = useAuth();
  const isAgent = useMemo(
    () => loggedInUser.roleName === "AGENT",
    [loggedInUser.roleName]
  );
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
  const subscriptionColumns = [
    {
      accessorKey: "subscriptionId",
      header: "Subscriptions Id",
      width: "15%",
    },
    {
      accessorKey: "companyName",
      header: "Company Name",
      width: "25%",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      render: (row) => row.startDate,
      width: "20%",
    },
    {
      accessorKey: "numberOfUsers",
      header: "Number of Users",
      width: "20%",
    },
    {
      accessorKey: "subscriptionStatus",
      header: "Status",
      width: "20%",
    },
  ];

  const { planId } = useParams();

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

  const [subscriptionPageIndex, setSubscriptionPageIndex] = useState(0);
  const [subscriptionPageSize, setSubscriptionPageSize] = useState(10);
  const [subscriptionSearchTerm, setSubscriptionSearchTerm] = useState("");
  const [subscriptionIsActiveTab, setSubscriptionIsActiveTab] = useState("all");
  const [subscriptionsTotalRows, setSubscriptionsTotalRows] = useState(0);
  const {
    data: subscriptionsData,
    isLoading: isSubscriptionsLoading,
    isError: isSubscriptionsError,
    error: subscriptionsError,
  } = useQuery({
    queryKey: [
      "subscriptions",
      planId,
      subscriptionPageIndex,
      subscriptionPageSize,
      subscriptionSearchTerm,
      subscriptionIsActiveTab,
    ],
    queryFn: async () => {
      const data = await subscriptionService.getSubscriptionsByPlanId(
        planId,
        subscriptionPageIndex,
        subscriptionPageSize,
        subscriptionSearchTerm,
        subscriptionIsActiveTab
      );
      setSubscriptionPageIndex(data.pagination?.pageIndex || 0);
      setSubscriptionPageSize(data.pagination?.pageSize || 10);
      setSubscriptionsTotalRows(data.pagination?.totalItems || 0);
      return data.planSubscriptions;
    },
    retry: false,
  });

  if (isPlanLoading) {
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
          {planData.isActive === "Active" ? (
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
            {planData.termsAndConditionsFilePath && (
              <div className="col-span-2">
                <a
                  className="text-sm font-semibold text-blue-800 underline flex items-center"
                  href={planData.termsAndConditionsFilePath}
                >
                  <span>View Terms & conditions</span>
                  <FaExternalLinkAlt className="ml-2" />
                </a>
              </div>
            )}
          </div>
          <hr />

          <div>
            <div className="w-full flex items-center justify-between mb-4">
              <Tabs
                defaultActiveKey="policies"
                items={[
                  {
                    key: "policies",
                    label: "Policies",
                    children: (
                      <>
                        {/* Header for consistency, can be empty or add controls later */}
                        <div className="flex items-center justify-between py-4">
                          {/* Placeholder for potential future search/filter */}
                          <div></div>
                          <div></div>
                        </div>
                        <AppDataTable
                          rowIdKey="policyId"
                          columns={columns}
                          data={planData?.Policies}
                          loading={isPlanLoading}
                          error={planError}
                          onRowClick={(row) =>
                            navigate(
                              `/insurance-management/policies/${row.policyId}/details`
                            )
                          }
                        />
                        {/* Footer for consistency, can be empty or add pagination later */}
                        <div className="py-4">
                          {/* Placeholder for potential future pagination */}
                        </div>
                      </>
                    ),
                  },
                  {
                    key: "subscriptions",
                    label: "Plan Subscriptions",
                    children: (
                      <>
                        <div className="flex items-center justify-between py-4">
                          <SearchBar
                            onSearchClick={(value) =>
                              setSubscriptionSearchTerm(value)
                            }
                          />
                          <Select
                            defaultValue="all"
                            onChange={(value) =>
                              setSubscriptionIsActiveTab(value)
                            }
                            className="w-[120px]"
                          >
                            <Select.Option value="all">All</Select.Option>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">
                              Inactive
                            </Select.Option>
                          </Select>
                        </div>
                        <AppDataTable
                          rowIdKey="subscriptionId"
                          columns={subscriptionColumns}
                          data={subscriptionsData}
                          loading={isSubscriptionsLoading}
                          error={subscriptionsError}
                          onRowClick={(row) =>
                            navigate(
                              `/subscription-management/subscriptions/${row.subscriptionId}/details`
                            )
                          }
                        />
                        <div className="py-4">
                          <DataTablePagination
                            pageIndex={subscriptionPageIndex}
                            pageSize={subscriptionPageSize}
                            totalRows={subscriptionsTotalRows}
                            onPageChange={(page) =>
                              setSubscriptionPageIndex(page)
                            }
                            onPageSizeChange={(size) =>
                              setSubscriptionPageSize(size)
                            }
                          />
                        </div>
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {!isAgent && (
          <div className="flex items-center gap-4 m-auto justify-center  w-full mt-4 mb-8">
            <Button
              variant="outline"
              className="w-[120px] bg-[hsl(273,83.8%,53.9%)] text-white"
              onClick={() => navigate(`/insurance-management/plans/${planId}`)}
            >
              <Pencil /> Edit Plan
            </Button>
          </div>
        )}
      </div>
      <hr />
    </div>
  );
};

export default PlanDetails;
