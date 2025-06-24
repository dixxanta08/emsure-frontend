import React, { useEffect } from "react";
import { Form, Table, Switch, InputNumber, Spin } from "antd";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import planService from "../services/planService";
import policyService from "../services/policyService";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import FileUploader from "@/components/extended-ui/file-uploader";

import FormItem from "@/features/client portal/components/customantd/formitem";
import Input from "@/features/client portal/components/customantd/input";
import Button from "@/features/client portal/components/customantd/button";
import Select from "@/features/client portal/components/customantd/select";
import { ArrowLeft, Trash, Trash2 } from "lucide-react";
// Define the Zod schema for form validation
const formSchema = z.object({
  planName: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().optional(),
  planType: z.string().min(1, { message: "Plan Type is required" }),
  price: z.number().min(1, { message: "Price must be at least 1." }),

  monthlyPayment: z
    .number()
    .min(1, { message: "Monthly Payment must be at least 1." }),
  maxUsers: z.number().min(1, { message: "Max Users must be at least 1." }),
  initialPayment: z
    .number()
    .min(0, { message: "Initial Payment must be zero or more." }),
  termsAndConditionsFilePath: z.string().optional(),
  isActive: z.boolean(),
  policyIds: z
    .array(z.number().min(1, { message: "Invalid policy ID." }))
    .min(1, { message: "At least one policy must be selected." }),
});

const PlansForm = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planName: "",
      description: "",
      planType: "",
      price: 0,
      monthlyPayment: 0,
      maxUsers: 0,
      initialPayment: 0,
      termsAndConditionsFilePath: "",
      isActive: false,
      policies: [],
    },
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
    enabled: !!planId && planId !== "new",
  });
  // Populate form fields when plan data is fetched
  useEffect(() => {
    if (plan) {
      setValue("planName", plan.planName);
      setValue("description", plan.description);
      setValue("planType", plan.planType);
      setValue("price", plan.price);
      setValue("monthlyPayment", plan.monthlyPayment);
      setValue("maxUsers", plan.maxUsers);
      setValue("initialPayment", plan.initialPayment);
      setValue("termsAndConditionsFilePath", plan.termsAndConditionsFilePath);
      setValue("isActive", plan.isActive);

      if (plan.Policies) {
        console.log("Policies:", plan.Policies);
        setValue(
          "policyIds",
          plan.Policies.map((policy) => policy.policyId)
        );
      }
    }
  }, [plan, setValue, reset]);
  // Mutation for form submission
  const mutation = useMutation({
    mutationFn: async (data) => {
      return planId && planId !== "new"
        ? planService.updatePlan(planId, data)
        : planService.createPlan(data);
    },
    onSuccess: (data) => {
      toast({ variant: "success", title: "Plan updated successfully" });
      navigate(`/insurance-management/plans/${data.planId}/details`);
    },
    onError: (error) => {
      console.error(error);
      toast({ variant: "destructive", title: "Something went wrong" });
    },
  });

  // Handle form submission
  const onSubmit = (values) => {
    // Extract only policyIds to send to backend
    const payload = {
      ...values,
    };
    console.log("Payload:", payload);
    mutation.mutate(payload);
  };

  useEffect(() => {
    const filteredPolicies = policies?.filter((policy) =>
      watch("policyIds")?.includes(policy.policyId)
    );
    setValue(
      "price",
      filteredPolicies?.reduce((acc, policy) => acc + policy.amount, 0)
    );
  }, [policies, watch("policyIds"), setValue]);

  if (loadingPlan || loadingPolicies) {
    return <Spin />;
  }

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <div className="flex items-center justify-start gap-4 mb-6">
        <Button
          variant="empty"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft />}
        ></Button>
        <h1 className="font-semibold text-lg text-gray-800">Plans</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 py-4 gap-x-8">
            <FormItem
              control={control}
              name="planName"
              label="Plan Name"
              help={null}
            >
              <Input className="!z-0" />
            </FormItem>
            <FormItem control={control} name="planType" label="Plan Type">
              <Select>
                <Select.Option value="basic">Basic</Select.Option>
                <Select.Option value="premium">Premium</Select.Option>
              </Select>
            </FormItem>
            <FormItem control={control} name="price" label="Price">
              <Input aType="number" min={1} disabled />
            </FormItem>
            <FormItem control={control} name="maxUsers" label="Max Users">
              <Input aType="number" min={1} />
            </FormItem>
            <FormItem
              control={control}
              name="initialPayment"
              label="Initial Payment"
            >
              <Input aType="number" min={1} />
            </FormItem>{" "}
            <FormItem
              control={control}
              name="monthlyPayment"
              label="Monthly Payment"
            >
              <Input aType="number" min={1} />
            </FormItem>
            <FormItem control={control} name="isActive" label="Active">
              <Select>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </FormItem>
            <FormItem control={control} name="policyIds" label="Policies">
              <Select placeholder="Select Policy" mode="multiple">
                {policies?.map((policy) => (
                  <Select.Option key={policy.policyId} value={policy.policyId}>
                    {policy.policyName}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>
            <FormItem
              control={control}
              name="termsAndConditionsFilePath"
              label="Terms and Conditions File"
            >
              <FileUploader />
              {plan?.termsAndConditionsFilePath && (
                <a href={plan?.termsAndConditionsFilePath} target="_blank">
                  View File
                </a>
              )}
            </FormItem>
            <FormItem
              control={control}
              name="description"
              label="Description"
              className="!h-auto col-span-2"
            >
              <Input aType="textarea" />
            </FormItem>
          </div>

          <div className="w-full flex justify-end mt-8 gap-4">
            <Button
              variant="secondary-outline"
              onClick={() =>
                navigate(`/insurance-management/plans/${planId}/details`)
              }
            >
              Cancel
            </Button>
            <Button variant="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PlansForm;
