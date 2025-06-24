import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useEffect, useMemo, useState } from "react";

import Button from "../../client portal/components/customantd/button";
import planService from "../services/planService";
import AppDataTable from "@/components/app-data-table";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTablePagination } from "@/components/app-pagination";
import SearchBar from "@/components/app-searchbar";
import { useAuth } from "@/auth/AuthContext";
import { PlusIcon } from "lucide-react";

const Plans = () => {
  const { loggedInUser } = useAuth();
  const isAgent = useMemo(
    () => loggedInUser.roleName === "AGENT",
    [loggedInUser]
  );
  const columns = [
    {
      accessorKey: "planId",
      header: "Plan  Id",
    },
    {
      accessorKey: "planName",
      header: "Name",
    },
    {
      accessorKey: "planType",
      header: "Type",
    },

    {
      accessorKey: "price",
      header: "Price",
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
    data: plans,
    error: plansError,
    isPending,
  } = useQuery({
    queryKey: ["plans", pageIndex, pageSize, searchTerm, isActiveTab],
    queryFn: async () => {
      const data = await planService.getPlans(
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
    if (plans) {
      setTotalRows(plans.pagination.totalItems);
      setPageIndex(plans.pagination.pageIndex);
      setPageSize(plans.pagination.pageSize);
    }
  }, [plans]);

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
    navigate(`/insurance-management/plans/${row.planId}/details`);
  };

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Plans</h1>
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
                    navigate("/insurance-management/plans/new");
                  }}
                >
                  Add Plan
                </Button>
              )}
            </div>
            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={plans?.plans}
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
              {!isAgent && (
                <Button
                  icon={<PlusIcon className="h-4 w-4" />}
                  variant="outline"
                  onClick={() => {
                    navigate("/insurance-management/plans/new");
                  }}
                >
                  Add Plan
                </Button>
              )}
            </div>
            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={plans?.plans}
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

export default Plans;
