import AppDataTable from "@/components/app-data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { PlusIcon } from "lucide-react";
import SearchBar from "@/components/app-searchbar";
import { DataTablePagination } from "@/components/app-pagination";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import agentService from "@/features/authentication/services/agentService";

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

const Agents = () => {
  const columns = [
    {
      accessorKey: "userId",
      header: "UserId",
    },
    {
      accessorKey: "name",
      header: "Name",
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
      accessorKey: "licenseNumber",
      header: "License Number",
    },
    // {
    //   accessorKey: "actions",
    //   header: "Actions",
    //   cell: ({ row }) => {
    //     return (
    //       <Button variant="link" onClick={() => {}}>
    //         View Companies
    //       </Button>
    //     );
    //   },
    // },
  ];

  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handlePageChange = (newPageIndex) => {
    console.log(newPageIndex);
    setPageIndex(newPageIndex);
  };
  const handlePageSizeChange = (newPageSize) => {
    console.log(newPageSize);
    setPageSize(newPageSize);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveTab, setIsActiveTab] = useState("active");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, error, isLoading, isFetching, isPending } = useQuery({
    queryKey: ["agents", pageIndex, pageSize, searchTerm, isActiveTab],
    queryFn: async () => {
      const data = await agentService.getAgents(
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
    navigate(`${row.agentId}/details`);
  };

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Agents</h1>
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
                Add Agent
              </Button>
            </div>

            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={data?.agents}
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
                  navigate("new/details");
                }}
              >
                <PlusIcon className="h-4 w-4 " />
                Add Agent
              </Button>
            </div>

            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={data?.agents}
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

export default Agents;
