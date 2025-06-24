import { useNavigate } from "react-router-dom";
import AppDataTable from "@/components/app-data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import SearchBar from "@/components/app-searchbar";
import { DataTablePagination } from "@/components/app-pagination";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import claimService from "../services/claimService";

const Claims = () => {
  const { loggedInUser } = useAuth();
  const companyId = loggedInUser?.companyId;
  const isCompanyRoute = Boolean(companyId);

  const columns = [
    { accessorKey: "claimId", header: "Claim Id", id: "claimId" },
    {
      accessorKey: "claimantName",
      header: "Claimant Name",
      id: "claimantName",
    },
    { accessorKey: "claimDate", header: "Claim Date", id: "claimDate" },
    { accessorKey: "claimAmount", header: "Claim Amount", id: "claimAmount" },
  ].filter(Boolean);

  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [claimStatus, setClaimStatus] = useState("submitted");

  const navigate = useNavigate();

  // Fetch claims instead of employees
  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["claims", pageIndex, pageSize, searchTerm, claimStatus],
    queryFn: async () => {
      return await claimService.getClaims(
        pageIndex,
        pageSize,
        searchTerm,
        claimStatus // Pass claimStatus to filter claims by status
      );
    },
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setTotalRows(data.pagination?.totalItems || 0);
      setPageIndex(data.pagination?.pageIndex || 0);
      setPageSize(data.pagination?.pageSize || 10);
    }
  }, [data]);

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
  };

  const handleRowClick = (row) => {
    navigate(`/subscription-management/claims/${row.claimId}/details`);
  };

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Claims</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Tabs
          defaultValue="submitted"
          className="w-full"
          onValueChange={(value) => setClaimStatus(value)} // Set the selected claimStatus
        >
          <TabsList>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="insurance_approved">
              Insurance Approved
            </TabsTrigger>
            <TabsTrigger value="insurance_rejected">
              Insurance Rejected
            </TabsTrigger>
            <TabsTrigger value="company_approved">Company Approved</TabsTrigger>
            <TabsTrigger value="company_rejected">Company Rejected</TabsTrigger>
            <TabsTrigger value="PAID">Paid</TabsTrigger>
          </TabsList>

          {[
            "submitted",
            "insurance_approved",
            "insurance_rejected",
            "company_approved",
            "company_rejected",
            "PAID",
          ].map((status) => (
            <TabsContent key={status} value={status}>
              <div className="mt-8">
                <AppDataTable
                  rowIdKey="claimId"
                  columns={columns}
                  data={
                    data?.claims.filter(
                      (claim) => claim.claimStatus === status
                    ) || []
                  } // Ensure we use data?.claims here
                  loading={isLoading || isFetching}
                  error={error}
                  onRowClick={handleRowClick}
                />

                <div className="mt-8">
                  <DataTablePagination
                    totalRows={totalRows}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    onPageChange={setPageIndex}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Claims;
