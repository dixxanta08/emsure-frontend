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
import companyService from "@/features/authentication/services/companyService";
import employeeService from "@/features/authentication/services/employeeService";

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

const CompaniesDetail = () => {
  const fields = [
    { name: "companyId", label: "Company Id" },
    { name: "companyName", label: "Company Name" },
    {
      name: "email",
      label: "Email",
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
    },
    {
      name: "companyAddress",
      label: "Company Address",
    },
    {
      name: "companyRegistrationNumber",
      label: "Registration Number",
    },
    // {
    //   name: "licenseExpirationDate",
    //   label: "License Expiration Date",
    // },
    // { name: "contractStartDate", label: "Contract Start Date", type: "date" },
    // { name: "contractEndDate", label: "Contract End Date", type: "date" },

    { name: "isActive", label: "Status", type: "switch" },
  ];

  const columns = [
    {
      accessorKey: "employeeId",
      header: "EmployeeId",
    },
    {
      accessorKey: "name",
      header: "Employee Name",
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
  ];

  //   ----------------------------
  const { companyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: companyData,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
    error: companyError,
  } = useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const data = await companyService.getCompany(companyId);
      return {
        ...data.company,
        isActive: data.company.isActive ? "Active" : "Inactive",
      };
    },
    retry: false,
  });

  const {
    data: employeesData,
    isLoading: isEmployeesLoading,
    error: employeesError,
    isError: isEmployeesError,
  } = useQuery({
    queryKey: ["companyEmployees", companyId],
    queryFn: async () =>
      employeeService.getEmployeesByCompany(companyId, 0, 5, "", "active"),
    retry: false,
  });

  const handleEmployeeRowClick = (row) => {
    navigate(`${row.employeeId}/details`);
  };
  useEffect(() => {
    if (isEmployeesError) {
      console.log("employees error : ", employeesError);
      navigate("/error");
    }

    if (isCompanyError) {
      console.log("employees error : ", companyError);
      navigate("/error");
    }
  }, [isEmployeesError, isCompanyError]);

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
          <h1 className="font-semibold text-lg text-gray-800">Companies</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="w-[120px] bg-[hsl(273,83.8%,53.9%)]  text-white "
            onClick={() => {
              navigate(`/people-organizations/companies/${companyId}`);
            }}
          >
            <Pencil /> Edit Company
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-[120px] border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 />
            Delete Company
          </Button>
        </div>
      </div>
      <div className="bg-white p-4 mt-4  rounded-md flex flex-col gap-8">
        <Details
          fields={fields}
          defaultValues={
            companyData || {
              companyId: "",
              companyName: "",
              email: "",
              phoneNumber: "",
              companyAddress: "",
              companyRegistrationNumber: "",
              isActive: false,
            }
          }
        />

        <div className="mt-8">
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="font-semibold text-md text-gray-800">Employees</h2>
            {employeesData?.employees.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-[120px] border border-[hsl(273,83.8%,53.9%)]  text-[hsl(273,83.8%,53.9%)]  hover:bg-[hsl(273,83.8%,53.9%)] hover:text-white"
                onClick={() => {
                  navigate(
                    `/people-organizations/companies/${companyId}/employees`
                  );
                }}
              >
                <Eye />
                View All
              </Button>
            )}
          </div>
          <AppDataTable
            rowIdKey="employeeId"
            columns={columns}
            data={employeesData?.employees}
            loading={isEmployeesLoading}
            error={employeesError}
            onRowClick={handleEmployeeRowClick}
          />
        </div>
      </div>
    </div>
  );
};

export default CompaniesDetail;
