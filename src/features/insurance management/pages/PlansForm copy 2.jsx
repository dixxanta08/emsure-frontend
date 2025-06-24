import React, { useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Table,
  Switch,
  InputNumber,
  Spin,
} from "antd";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { FormItem } from "react-hook-form-antd";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import planService from "../services/planService";
import policyService from "../services/policyService";
import { useParams } from "react-router-dom";

const { Option } = Select;

// Define Zod schema for form validation
const formSchema = z.object({
  planName: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." }),
  description: z
    .string()
    .min(10, { message: "Invalid description." })
    .optional(),
  planType: z.string().nonempty({ message: "Type is required" }),
  price: z.number().min(1, { message: "Price must be at least 1." }),
  isActive: z.boolean(),
  policies: z
    .array(
      z.object({
        policyId: z.number().min(1, { message: "Invalid policy ID." }),
        amount: z.number().optional(),
        maxUsers: z.number().optional(),
      })
    )
    .nonempty({ message: "At least one policy is required" }),
});

const PlansForm = () => {
  const { planId } = useParams();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planName: "",
      description: "",
      planType: "",
      price: 0,
      isActive: false,
      policies: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "policies",
  });

  // Fetch all policies for dropdown options
  const { data: policies, isLoading: loadingPolicies } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      const fetchedData = await policyService.getPolicies();
      return fetchedData.policies;
    },
  });

  // Fetch plan data if planId is present
  const { data: plan, isLoading: loadingPlan } = useQuery({
    queryKey: ["plan", planId],
    queryFn: async () => {
      if (planId) {
        const fetchedData = await planService.getPlan(planId);
        return fetchedData.plan;
      }
      return null;
    },
    enabled: !!planId,
  });

  // Populate form fields with fetched plan data
  useEffect(() => {
    if (plan) {
      setValue("planName", plan.planName);
      setValue("description", plan.description);
      setValue("planType", plan.planType);
      setValue("price", plan.price);
      setValue("isActive", plan.isActive);

      // Populate policies
      if (plan.Policies) {
        reset({
          ...plan,
          policies: plan.Policies.map((p) => ({
            id: p.policyId,
            policyId: p.policyId,
            amount: p.amount,
            maxUsers: p.maxUsers,
          })),
        });
      }
    }
  }, [plan, setValue, reset]);

  const mutation = useMutation({
    mutationFn: async ({ planId, planFormData }) => {
      return planId && planId !== "new"
        ? planService.updatePlan(planId, planFormData)
        : planService.createPlan(planFormData);
    },
    onSuccess: (response) => {
      toast({ variant: "success", title: "Plan updated successfully" });
      navigate(`/insurance-management/plans/${response.planId}/details`);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Something went wrong" });
    },
  });
  const onSubmit = (values) => {
    // Extract only policyIds to send to backend
    console.log(values);
    const payload = {
      ...values,
      policyIds: values.policies.map((policy) => policy.policyId),
    };
    console.log("Payload:", payload);
  };

  const handleAdd = () => {
    append({ policyId: null, amount: null, maxUsers: null });
  };

  const columns = [
    {
      title: "Policy",
      dataIndex: "policyId",
      render: (_, __, index) => (
        <Controller
          control={control}
          name={`policies.${index}.policyId`}
          render={({ field }) => (
            <FormItem
              validateStatus={errors.policies?.[index]?.policyId ? "error" : ""}
              help={errors.policies?.[index]?.policyId?.message}
            >
              <Select
                {...field}
                onChange={(value) => field.onChange(value)}
                placeholder="Select Policy"
              >
                {policies?.map((policy) => {
                  // Check if the policy is already included
                  if (
                    !fields.some(
                      (fieldItem) => fieldItem.policyId === policy.policyId
                    ) ||
                    field.value === policy.policyId
                  ) {
                    return (
                      <Option key={policy.policyId} value={policy.policyId}>
                        {policy.policyName}
                      </Option>
                    );
                  }
                  return null; // Don't render the option if policy is already included
                })}
              </Select>
            </FormItem>
          )}
        />
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (_, __, index) => (
        <Controller
          control={control}
          name={`policies.${index}.amount`}
          render={({ field }) => (
            <FormItem>
              <InputNumber {...field} placeholder="Amount" />
            </FormItem>
          )}
        />
      ),
    },
    {
      title: "Max Users",
      dataIndex: "maxUsers",
      render: (_, __, index) => (
        <Controller
          control={control}
          name={`policies.${index}.maxUsers`}
          render={({ field }) => (
            <FormItem>
              <InputNumber {...field} placeholder="Max Users" />
            </FormItem>
          )}
        />
      ),
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_, __, index) => (
        <Button danger onClick={() => remove(index)}>
          Delete
        </Button>
      ),
    },
  ];

  if (loadingPlan || loadingPolicies) {
    return <Spin />;
  }

  return (
    <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
      <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 py-4 gap-x-8">
        <FormItem label="Plan Name">
          <Controller
            control={control}
            name="planName"
            render={({ field }) => <Input {...field} />}
          />
        </FormItem>
        <FormItem label="Description">
          <Controller
            control={control}
            name="description"
            render={({ field }) => <Input.TextArea {...field} />}
          />
        </FormItem>
        <FormItem label="Plan Type">
          <Controller
            control={control}
            name="planType"
            render={({ field }) => (
              <Select {...field} placeholder="Select Plan Type">
                <Option value="basic">Basic</Option>
                <Option value="premium">Premium</Option>
              </Select>
            )}
          />
        </FormItem>
        <FormItem label="Price">
          <Controller
            control={control}
            name="price"
            render={({ field }) => <InputNumber {...field} min={1} />}
          />
        </FormItem>
        <FormItem label="Active">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={(checked) => field.onChange(checked)}
              />
            )}
          />
        </FormItem>
      </div>
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add Policy
      </Button>
      <Table
        dataSource={fields}
        columns={columns}
        pagination={false}
        rowKey="id"
      />

      <FormItem>
        <Button type="primary" htmlType="submit">
          Save All
        </Button>
      </FormItem>
    </Form>
  );
};

export default PlansForm;
