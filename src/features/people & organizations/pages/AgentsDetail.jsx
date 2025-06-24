import React, { Children, useEffect, useState } from "react";
import { Form, DatePicker, Spin, message, Tabs } from "antd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import companyService from "@/features/authentication/services/companyService";
import agentService from "@/features/authentication/services/agentService";
import { ArrowLeft } from "lucide-react";
import AppDataTable from "@/components/app-data-table";

import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toDateObject, toFormattedDate } from "@/utils/dateUtils";
import claimService from "../../client portal/services/claimService";
import SearchBar from "@/components/app-searchbar";
import subscriptionService from "../../client portal/services/subscriptionService";

import Input from "../../client portal/components/customantd/input";
import Select from "../../client portal/components/customantd/select";
import FormItem from "../../client portal/components/customantd/formitem";
import Button from "../../client portal/components/customantd/button";

const formSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters." })
      .nonempty({ message: "Name is required" }),
    email: z
      .string()
      .nonempty({ message: "Email is required" })
      .email({ message: "Invalid email address." }),
    phoneNumber: z
      .string()
      .min(10, { message: "Invalid phone number." })
      .nonempty({ message: "Phone number is required" }),
    licenseNumber: z.string(),
    licenseExpirationDate: z
      .string()
      .nonempty({ message: "License Expiration Date is required" }),
    contractStartDate: z
      .string()
      .nonempty({ message: "Contract Start Date is required" }),
    contractEndDate: z
      .string()
      .nonempty({ message: "Contract End Date is required" }),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const contractStartDate = new Date(data.contractStartDate);
    const contractEndDate = new Date(data.contractEndDate);

    if (contractStartDate >= contractEndDate) {
      ctx.addIssue({
        path: ["contractEndDate"],
        message: "Contract End Date must be later than Contract Start Date",
      });
      ctx.addIssue({
        path: ["contractStartDate"],
        message: "Contract Start Date must be before Contract Start Date",
      });
    }
  });

const AgentsDetail = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: agentData, isLoading } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: async () => {
      const data = await agentService.getAgent(agentId);

      return {
        ...data.agent,
      };
    },
    enabled: agentId && agentId !== "new",
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (agentId && agentId !== "new") {
        return agentService.updateAgent(agentId, values);
      } else {
        return agentService.createAgent(values);
      }
    },
    onSuccess: (data) => {
      if (agentId && agentId !== "new") {
        toast({
          variant: "success",
          title: "Agent Updated successfully",
          description: "Agent has been updated successfully.",
        });
      } else {
        toast({
          variant: "success",
          title: "Agent Created successfully",
          description: "Agent has been created successfully.",
        });
        navigate(`/people-organizations/agents/${data.agentId}/details`);
      }

      queryClient.invalidateQueries(["agent", agentId]);
    },
    onError: (error) => {
      if (agentId && agentId !== "new") {
        console.error("Error updating agent:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem while updating agent.",
        });
      } else {
        console.error("Error creating agent:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem while creating agent.",
        });
      }
    },
  });

  const { control, watch, handleSubmit, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      licenseNumber: "",
      licenseExpirationDate: "",
      contractStartDate: "",
      contractEndDate: "",
      isActive: false,
    },
  });

  useEffect(() => {
    if (agentData) {
      setValue("name", agentData.name);
      setValue("email", agentData.email);
      setValue("phoneNumber", agentData.phoneNumber);
      setValue("licenseNumber", agentData.licenseNumber);
      setValue(
        "licenseExpirationDate",
        toFormattedDate(agentData.licenseExpirationDate)
      );
      setValue(
        "contractStartDate",
        toFormattedDate(agentData.contractStartDate)
      );
      setValue("contractEndDate", toFormattedDate(agentData.contractEndDate));
      setValue("isActive", agentData.isActive);
    }
  }, [agentData, setValue]);

  const onSubmit = (data) => {
    console.log(data);

    mutation.mutate(data);
  };
  console.log(watch());

  if (isLoading) {
    return <Spin size="large" />;
  }

  return (
    <div className="p-8 bg-gray-100 h-full">
      <div className="flex items-center justify-start gap-4 mb-6">
        <Button
          icon={<ArrowLeft />}
          onClick={() => navigate(-1)}
          variant="empty"
        ></Button>
        <h1 className="font-semibold text-lg">Agent Details</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 py-4 gap-x-8">
            <FormItem label="Name" name="name" control={control}>
              <Input />
            </FormItem>
            <FormItem label="Email" name="email" control={control}>
              <Input />
            </FormItem>

            <FormItem label="Phone Number" name="phoneNumber" control={control}>
              <Input />
            </FormItem>
            <FormItem
              label="License Number"
              name="licenseNumber"
              control={control}
            >
              <Input />
            </FormItem>
            <FormItem
              label="License Expiration Date "
              name="licenseExpirationDate"
              control={control}
            >
              <Input aType="date" />
            </FormItem>
            <FormItem
              label="Contract Start Date "
              name="contractStartDate"
              control={control}
            >
              <Input aType="date" />
            </FormItem>
            <FormItem
              label="Contract End Date "
              name="contractEndDate"
              control={control}
            >
              <Input aType="date" />
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
              {agentId && agentId !== "new" ? "Update Agent" : "Create Agent"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AgentsDetail;
