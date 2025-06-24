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

const CompanyEmployeeDetails = () => {
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
    <div className="p-8 bg-gray-100 h-full">
      <div className="flex items-center justify-start gap-4 mb-6">
        <Button
          icon={<ArrowLeft />}
          onClick={() => navigate(-1)}
          variant="empty"
        ></Button>
        <h1 className="font-semibold text-lg">Company Details</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 py-4 gap-x-8">
            <FormItem label="Company Name" name="companyName" control={control}>
              <Input />
            </FormItem>

            <FormItem label="Email" name="email" control={control}>
              <Input />
            </FormItem>

            <FormItem label="Phone Number" name="phoneNumber" control={control}>
              <Input />
            </FormItem>
            <FormItem
              label="Company Address"
              name="companyAddress"
              control={control}
            >
              <Input />
            </FormItem>
            <FormItem
              label={
                <span className="text-xs font-medium text-black ">
                  Registration Number
                </span>
              }
              name="companyRegistrationNumber"
              control={control}
            >
              <Input />
            </FormItem>

            <FormItem label="Status" name="isActive" control={control}>
              <Select>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </FormItem>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              htmlType="submit"
              loading={mutation.isLoading}
            >
              Update Company
            </Button>
          </div>
        </Form>
      </div>
      {/* Employees Table */}
      {/* <div className="mt-8 bg-white rounded-lg shadow ">
      <div className="w-full flex items-center justify-between p-4">
        <h2 className="font-semibold text-md text-gray-800">Employees</h2>
        {employeesData?.employees.length > 0 && (
          <Button
            variant="outline"
            className="w-[120px] border border-none shadow-none !text-[hsl(273,83.8%,53.9%)] hover:bg-white hover:text-[hsl(273,53%,15%)]"
            onClick={() => {
              navigate(`/company/${companyId}/employees`);
            }}
          >
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
    </div> */}
    </div>
  );
};

export default CompanyEmployeeDetails;
