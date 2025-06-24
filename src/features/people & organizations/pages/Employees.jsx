import { useParams, useNavigate } from "react-router-dom";
import AppDataTable from "@/components/app-data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import SearchBar from "@/components/app-searchbar";
import { DataTablePagination } from "@/components/app-pagination";
import { useQuery } from "@tanstack/react-query";
import employeeService from "@/features/authentication/services/employeeService";
import { useState, useEffect } from "react";

const Employees = () => {
  const { companyId } = useParams(); // Get companyId if present
  console.log(companyId);
  const isCompanyRoute = Boolean(companyId); // Determine if the route is company-specific

  const columns = [
    { accessorKey: "employeeId", header: "EmployeeId", id: "employeeId" },
    { accessorKey: "name", header: "Employee Name", id: "name" },
    !isCompanyRoute && {
      accessorKey: "companyName",
      header: "Company Name",
      id: "companyName",
    },
    { accessorKey: "phoneNumber", header: "Phone Number", id: "phoneNumber" },
    { accessorKey: "email", header: "Email", id: "email" },
  ].filter(Boolean);
  // This will filter out any undefined values (like when isCompanyRoute is true)

  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveTab, setIsActiveTab] = useState("active");

  const navigate = useNavigate();

  // Fetch employees based on the route (company-specific or global)
  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: [
      "employees",
      companyId,
      pageIndex,
      pageSize,
      searchTerm,
      isActiveTab,
    ],
    queryFn: async () => {
      if (isCompanyRoute) {
        return await employeeService.getEmployeesByCompany(
          companyId,
          pageIndex,
          pageSize,
          searchTerm,
          isActiveTab
        );
      } else {
        return await employeeService.getEmployees(
          pageIndex,
          pageSize,
          searchTerm,
          isActiveTab
        ); // General employees
      }
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
    const companyId = isCompanyRoute ? row.companyId : companyId;
    navigate(
      `/people-organizations/companies/${companyId}/employees/${row.employeeId}/details`
    ); // Navigate to company-specific employee details
  };

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Employees</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md ">
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
              <div className="w-1/3 mt-8 mb-4">
                <SearchBar onSearchClick={handleSearch} />
              </div>
              {isCompanyRoute && (
                <Button
                  variant="outline"
                  onClick={() => navigate("new/details")}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Employee
                </Button>
              )}
            </div>

            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={data?.employees || data?.employee} // Adjust for list vs. single employee
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
          </TabsContent>
          <TabsContent value="inactive">
            <div className="flex items-center justify-between">
              <div className="w-1/3 mt-8 mb-4">
                <SearchBar onSearchClick={handleSearch} />
              </div>
              {isCompanyRoute && (
                <Button variant="outline" onClick={() => navigate("new")}>
                  <PlusIcon className="h-4 w-4" />
                  Add Employee
                </Button>
              )}
            </div>

            <AppDataTable
              rowIdKey="userId"
              columns={columns}
              data={data?.employees || data?.employee} // Adjust for list vs. single employee
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Employees;

{
  /* <div>
    <Link to={`/companies/${companyId}`} style={{ fontSize: '24px', fontWeight: 'bold', color: 'blue' }}>
      {companyName} - Employees
    </Link>
  </div> */
}
