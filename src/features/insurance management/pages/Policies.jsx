import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useEffect, useMemo, useState } from "react";

import Button from "../../client portal/components/customantd/button";

import policyService from "../services/policyService";
import AppDataTable from "@/components/app-data-table";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTablePagination } from "@/components/app-pagination";
import SearchBar from "@/components/app-searchbar";
import { useAuth } from "@/auth/AuthContext";
import { PlusIcon } from "lucide-react";

const Policies = () => {
  const { loggedInUser } = useAuth();
  const isAgent = useMemo(
    () => loggedInUser.roleName === "AGENT",
    [loggedInUser]
  );
  const columns = [
    {
      accessorKey: "policyId",
      header: "Plan  Id",
    },
    {
      accessorKey: "policyName",
      header: "Name",
    },

    {
      accessorKey: "amount",
      header: "Amount",
    },

    {
      accessorKey: "description",
      header: "Description",
    },
  ];

  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [isActiveTab, setIsActiveTab] = useState("active");
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    data: policies,
    error: policiesError,
    isPending,
  } = useQuery({
    queryKey: ["policies", pageIndex, pageSize, searchTerm, isActiveTab],
    queryFn: async () => {
      const data = await policyService.getPolicies(
        pageIndex,
        pageSize,
        searchTerm,
        isActiveTab
      );
      return data;
    },
    retry: false,
  });

  useEffect(() => {
    if (policies) {
      setTotalRows(policies.pagination.totalItems);
      setPageIndex(policies.pagination.pageIndex);
      setPageSize(policies.pagination.pageSize);
    }
  }, [policies]);

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
    navigate(`/insurance-management/policies/${row.policyId}/details`);
  };

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Policies</h1>
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
              {!isAgent && (
                <Button
                  icon={<PlusIcon className="h-4 w-4" />}
                  variant="outline"
                  onClick={() => {
                    navigate("/insurance-management/policies/new");
                  }}
                >
                  Add Policy
                </Button>
              )}
            </div>
            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={policies?.policies}
              loading={isPending}
              error={policiesError}
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
              {!isAgent && (
                <Button
                  icon={<PlusIcon className="h-4 w-4" />}
                  variant="outline"
                  onClick={() => {
                    navigate("/insurance-management/policies/new");
                  }}
                >
                  Add Policy
                </Button>
              )}
            </div>
            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={policies?.policies}
              loading={isPending}
              error={policiesError}
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

export default Policies;
