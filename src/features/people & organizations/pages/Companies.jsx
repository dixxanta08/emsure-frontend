import AppDataTable from "@/components/app-data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useEffect, useMemo, useState } from "react";
import Button from "../../client portal/components/customantd/button";

import { z } from "zod";
import { PlusIcon } from "lucide-react";
import SearchBar from "@/components/app-searchbar";
import { DataTablePagination } from "@/components/app-pagination";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import companyService from "@/features/authentication/services/companyService";
import { useAuth } from "@/auth/AuthContext";

// const formSchema = z.object({
//   companyName: z.string().min(2, {
//     message: "Username must be at least 2 characters.",
//   }),
//   email: z.string().email({ message: "Invalid email address." }),
//   phoneNumber: z.string().min(10, { message: "Invalid phone number." }),
//   licenseNumber: z.string(),
//   companyRegistrationNumber: z.string().transform((val) => new Date(val)),
//   contractStartDate: z.string().transform((val) => new Date(val)),
//   contractEndDate: z.string().transform((val) => new Date(val)),
//   isActive: z.boolean(),
// });

const Companies = () => {
  const { loggedInUser } = useAuth();
  const { isAgent, agentId } = useMemo(() => {
    return {
      isAgent: loggedInUser.roleName === "AGENT",
      agentId: loggedInUser.agentId,
    };
  }, [loggedInUser]);
  const columns = [
    {
      accessorKey: "companyId",
      header: "CompanyId",
    },
    {
      accessorKey: "companyName",
      header: "Company Name",
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "companyRegistrationNumber",
      header: "Registration Number",
    },
  ];

  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handlePageChange = (newPageIndex) => {
    setPageIndex(newPageIndex);
  };
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveTab, setIsActiveTab] = useState("active");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, error, isLoading, isFetching, isPending } = useQuery({
    queryKey: ["companies", pageIndex, pageSize, searchTerm, isActiveTab],
    queryFn: async () => {
      if (isAgent) {
        const data = await companyService.getCompaniesByAgentId(
          agentId,
          pageIndex,
          pageSize,
          searchTerm,
          isActiveTab
        );
        return data;
      } else {
        const data = await companyService.getCompanies(
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
    if (data) {
      setTotalRows(data.pagination.totalItems);
      setPageIndex(data.pagination.pageIndex); // 0-based index
      setPageSize(data.pagination.pageSize);
    }
  }, [data, queryClient, pageIndex, pageSize, searchTerm, isActiveTab]);

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
  };

  const handleRowClick = (row) => {
    navigate(`${row.companyId}/details`);
  };

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Companies</h1>
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
              <Button
                variant="outline"
                onClick={() => {
                  navigate("new/details");
                }}
              >
                <PlusIcon className="h-4 w-4 " />
                Add Company
              </Button>
            </div>

            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={data?.companies}
              loading={isPending}
              error={error}
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
              <Button
                variant="outline"
                onClick={() => {
                  navigate("new");
                }}
              >
                <PlusIcon className="h-4 w-4 " />
                Add Company
              </Button>
            </div>

            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={data?.companies}
              loading={isPending}
              error={error}
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

export default Companies;
