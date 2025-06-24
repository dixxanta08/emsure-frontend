import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import Details from "../components/app-detail";
import AppDataTable from "@/components/app-data-table";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import employeeService from "@/features/authentication/services/employeeService";

const EmployeesDetail = () => {
  const fields = [
    { name: "employeeId", label: "Employee Id" },
    { name: "name", label: "Name" },
    {
      name: "email",
      label: "Email",
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
    },

    {
      name: "hireDate",
      label: "Hire Date",
    },
    {
      name: "status",
      label: "Employee Status",
    },
    {
      name: "companyName",
      label: "Company Name",
    },
    { name: "isActive", label: "User Status", type: "switch" },
  ];

  //   ----------------------------
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    data: employeeData,
    error,
    isLoading,
    isFetching,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      const data = await employeeService.getEmployee(employeeId);
      console.log(data);
      return {
        ...data.employee,
        isActive: data.employee.isActive === true ? "Active" : "Inactive",
        hireDate: formatToDateInput(new Date(data.employee.hireDate)),
      };
    },
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      console.log(isError);
      console.log("error : ", error);
      navigate("/error");
    }
  }, [isError]);

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
          <h1 className="font-semibold text-lg text-gray-800">
            {/* <Link
              to={`/people-organizations/companies/${employeeData.companyId}/employees`}
            > */}
            Employees
            {/* </Link> */}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="w-[120px] bg-[hsl(273,83.8%,53.9%)]  text-white "
            onClick={() => {
              navigate(
                `/people-organizations/companies/${employeeData.companyId}/employees/${employeeId}`
              );
            }}
          >
            <Pencil /> Edit Employee
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-[120px] border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 />
            Delete Employee
          </Button>
        </div>
      </div>
      <div className="bg-white p-4 mt-4  rounded-md flex flex-col gap-8">
        <Details
          fields={fields}
          defaultValues={
            employeeData || {
              employeeId: "",
              name: "",
              email: "",
              phoneNumber: "",
              hireDate: "",
              companyName: "",
              status: "",
              isActive: false,
            }
          }
        />
      </div>
    </div>
  );
};

export default EmployeesDetail;
