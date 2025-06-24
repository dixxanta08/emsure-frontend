import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

import planService from "../services/planService";
import AppDataTable from "@/components/app-data-table";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTablePagination } from "@/components/app-pagination";
import SearchBar from "@/components/app-searchbar";
import subscriptionService from "../services/subscriptionService";
import { useAuth } from "@/auth/AuthContext";

const SubscribedPlans = () => {
  const { loggedInUser } = useAuth();
  const { isAgent, agentId } = useMemo(() => {
    return {
      isAgent: loggedInUser.roleName === "AGENT",
      agentId: loggedInUser.agentId,
    };
  }, [loggedInUser]);
  const columns = [
    {
      accessorKey: "planId",
      header: "Plan  Id",
    },
    {
      accessorKey: "companyName",
      header: "Company Name",
    },
    {
      accessorKey: "planName",
      header: "Plan Name",
    },
    {
      accessorKey: "renewalDate",
      header: "Renewal Date",
    },

    {
      accessorKey: "numberOfUsers",
      header: "Number of Users",
    },
  ];

  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [isActiveTab, setIsActiveTab] = useState("active");
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const { companyId } = useParams();

  const {
    data: subscriptions,
    error: plansError,
    isPending,
  } = useQuery({
    queryKey: [
      "subscriptions",
      pageIndex,
      pageSize,
      searchTerm,
      isActiveTab,
      loggedInUser.companyId,
    ],
    queryFn: async () => {
      if (companyId) {
        const data = await subscriptionService.getSubscriptionsByCompanyId(
          pageIndex,
          pageSize,
          searchTerm,
          isActiveTab,
          companyId
        );
        return data;
      }
      if (isAgent && agentId) {
        const data = await subscriptionService.getSubscriptionsByAgentId(
          agentId,
          pageIndex,
          pageSize,
          searchTerm,
          isActiveTab
        );
        return data;
      } else {
        const data = await subscriptionService.getSubscriptions(
          pageIndex,
          pageSize,
          searchTerm,
          isActiveTab
        );
        return data;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (subscriptions) {
      setTotalRows(subscriptions.pagination.totalItems);
      setPageIndex(subscriptions.pagination.pageIndex);
      setPageSize(subscriptions.pagination.pageSize);
    }
  }, [subscriptions]);

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
  };

  const handlePageChange = (newPageIndex) => {
    setPageIndex(newPageIndex);
  };
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
  };

  const handleRowClick = (row) => {
    navigate(
      `/subscription-management/plan-subscriptions/${row.subscriptionId}/details`
    );
  };

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Subscriptions</h1>
      </div>
      <div className="bg-white p-4 mt-4  rounded-md ">
        <Tabs
          defaultValue="active"
          className="w-full"
          onValueChange={(value) => setIsActiveTab(value)}
        >
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <div className="flex items-center justify-between">
              <div className="w-1/3 mt-8 mb-4 ">
                <SearchBar onSearchClick={handleSearch} />
              </div>
            </div>
            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={subscriptions?.subscriptions}
              loading={isPending}
              error={plansError}
              onRowClick={handleRowClick}
            />

            <div className="mt-8">
              <DataTablePagination
                totalRows={totalRows}
                pageIndex={pageIndex}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </TabsContent>
          <TabsContent value="inactive">
            <div className="flex items-center justify-between">
              <div className="w-1/3 mt-8 mb-4 ">
                <SearchBar onSearchClick={handleSearch} />
              </div>
            </div>
            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={subscriptions?.subscriptions}
              loading={isPending}
              error={plansError}
              onRowClick={handleRowClick}
            />

            <div className="mt-8">
              <DataTablePagination
                totalRows={totalRows}
                pageIndex={pageIndex}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SubscribedPlans;
