import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import Details from "../components/app-detail";
import AppDataTable from "@/components/app-data-table";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
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

const AgentsDetail = () => {
  const fields = [
    { name: "agentId", label: "Agent Id" },
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
      name: "licenseNumber",
      label: "License Number",
      placeholder: "Enter license nuKmber",
    },
    {
      name: "licenseExpirationDate",
      label: "License Expiration Date",
    },
    { name: "contractStartDate", label: "Contract Start Date", type: "date" },
    { name: "contractEndDate", label: "Contract End Date", type: "date" },

    { name: "isActive", label: "Status", type: "switch" },
  ];

  //   ----------------------------
  const { agentId } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    data: agentData,
    error,
    isLoading,
    isFetching,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: async () => {
      const data = await agentService.getAgent(agentId);
      console.log(data);
      return {
        ...data.agent,
        isActive: data.agent.isActive === true ? "Active" : "Inactive",
        contractStartDate: formatToDateInput(
          new Date(data.agent.contractStartDate)
        ),
        contractEndDate: formatToDateInput(
          new Date(data.agent.contractEndDate)
        ),
        licenseExpirationDate: formatToDateInput(
          new Date(data.agent.licenseExpirationDate)
        ),
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
          <h1 className="font-semibold text-lg text-gray-800">Agents</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="w-[120px] bg-[hsl(273,83.8%,53.9%)]  text-white "
            onClick={() => {
              navigate(`/people-organizations/agents/${agentId}`);
            }}
          >
            <Pencil /> Edit Agent
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-[120px] border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 />
            Delete Agent
          </Button>
        </div>
      </div>
      <div className="bg-white p-4 mt-4  rounded-md flex flex-col gap-8">
        <Details
          fields={fields}
          defaultValues={
            agentData || {
              agentId: "",
              name: "",
              email: "",
              phoneNumber: "",
              licenseNumber: "",
              licenseExpirationDate: "",
              contractStartDate: "",
              contractEndDate: "",
              isActive: false,
            }
          }
        />

        <div>
          <h2 className="font-semibold text-md text-gray-800">Companies</h2>
          {/* <AppDataTable
            rowIdKey="companyId"
            columns={columns}
            data={data}
            loading={loading}
            error={error}
            onRowClick={handleRowClick}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default AgentsDetail;
