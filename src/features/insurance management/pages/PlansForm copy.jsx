import React, { useEffect, useState } from "react";
import { z } from "zod";
import AppFormExtended from "@/components/app-form-extended";
import AppTableForm from "@/components/app-table-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cloneDeep } from "lodash";
import planService from "../services/planService";
import policyService from "../services/policyService";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

// Form validation schema
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
  policyIds: z
    .array(z.number().min(1, { message: "Invalid policy ID." }))
    .nonempty({ message: "At least one policy is required" }),
});

const PlansForm = () => {
  const { toast } = useToast();
  const { planId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tableData, setTableData] = useState([
    { policyId: "", policyName: "", amount: 0, maxUsers: 0 },
  ]);
  const [tableDataOptions, setTableDataOptions] = useState([]);

  // Fetch existing plan data if editing
  const { data, isLoading, error } = useQuery({
    queryKey: ["plan", planId],
    queryFn: async () => {
      const fetchedData = await planService.getPlan(planId);
      return fetchedData.plan;
    },
    enabled: planId !== "new",
  });

  // Fetch policies
  const { data: policies } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      const fetchedData = await policyService.getPolicies();
      return fetchedData.policies;
    },
  });

  // React Hook Form
  const formMethods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planName: "",
      description: "",
      planType: "",
      price: 0,
      isActive: true,
      policyIds: [],
    },
  });

  const { handleSubmit, reset } = formMethods;

  // Populate form when data is available
  useEffect(() => {
    if (data) {
      // Populate form fields
      reset({
        planName: data.planName,
        description: data.description,
        planType: data.planType,
        price: data.price,
        isActive: data.isActive,
        policyIds: data.Policies.map((policy) => policy.policyId),
      });

      // Set table data, making sure to add the empty row at the end

      setTableData([
        ...data.Policies.map((policy) => ({
          policyId: policy.policyId,
          policyName: policy.policyName,
          amount: policy.amount,
          maxUsers: policy.maxUsers,
        })),
        // Add an empty row with default values
        { policyId: "", policyName: "", amount: 0, maxUsers: 0 },
      ]);
    }
  }, [data, reset]);
  console.log("tableData", tableData);

  useEffect(() => {
    if (policies) {
      setTableDataOptions(
        policies.map((policy) => ({
          value: policy.policyId,
          label: policy.policyName,
        }))
      );
    }
  }, [policies]);

  // Mutation for form submission
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
  const onSubmit = (formData) => {
    mutation.mutate({ planId, planFormData: cloneDeep(formData) });
  };

  // Handle table changes
  const handleAppTableFormChange = async (data, rowIndex) => {
    console.log("HANDLE APP TABLE FORM CHANGE", data, rowIndex);
    const policyId = data[rowIndex].policyId;
    if (!policyId) return;

    const response = await policyService.getPolicy(policyId);

    const updatedData = data.map((item, index) => {
      if (index === rowIndex) {
        return {
          ...item,
          policyId: response.policy.policyId,
          policyName: response.policy.policyName,
          amount: response.policy.amount,
          maxUsers: response.policy.maxUsers,
        };
      }
      return item;
    });

    // Only update state if there is a change in data
    const newData = [
      ...updatedData,
      { policyId: "", policyName: "", amount: 0, maxUsers: 0 },
    ];

    // Compare newData with tableData to prevent unnecessary updates
    if (JSON.stringify(newData) !== JSON.stringify(tableData)) {
      setTableData(newData);
    }
  };

  // Fields definition
  const fields = [
    { name: "planName", label: "Name", placeholder: "Enter plan name" },
    {
      name: "description",
      label: "Description",
      placeholder: "Enter description",
      type: "textarea",
    },
    { name: "planType", label: "Plan Type", placeholder: "Enter plan type" },
    {
      name: "price",
      label: "Price",
      placeholder: "Enter price",
      type: "number",
    },
    {
      name: "isActive",
      label: "Status",
      type: "switch",
      activeText: "Active",
      inactiveText: "Inactive",
    },
  ];

  const filteredFields =
    planId === "new" ? fields.filter((f) => f.name !== "isActive") : fields;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading plan details.</div>;

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <h1 className="font-semibold text-lg text-gray-800">Plans</h1>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AppFormExtended form={formMethods} fields={filteredFields} />
            <h2 className="font-semibold text-md text-gray-800 my-4">
              Policies
            </h2>
            <AppTableForm
              data={tableData}
              columns={[
                {
                  accessorKey: "policyId",
                  header: "Policy Name",
                  cell: ({
                    cellValue,
                    row,
                    rowIndex,
                    handleInputChange,
                    formData,
                  }) => {
                    console.log("tableDataOptions", tableDataOptions);
                    console.log("formData", formData);
                    return (
                      <Select
                        value={cellValue}
                        onValueChange={(value) =>
                          handleInputChange(
                            rowIndex,
                            "policyId",
                            parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {tableDataOptions.length > 0 &&
                          rowIndex < tableDataOptions.length ? (
                            tableDataOptions.map(
                              (option) =>
                                !(
                                  formData
                                    .map((d) => d.policyId)
                                    .includes(option.value) &&
                                  option.value !== row.policyId
                                ) && (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                )
                            )
                          ) : (
                            <SelectItem disabled>No records</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    );
                  },
                },
                {
                  accessorKey: "amount",
                  header: "Coverage Amount",
                  cell: ({ cellValue }) => cellValue,
                },
                {
                  accessorKey: "maxUsers",
                  header: "Max Users",
                  cell: ({ cellValue }) => cellValue,
                },
              ]}
              onChange={handleAppTableFormChange}
            />
            <Button type="submit" className="mt-4">
              Save Plan
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PlansForm;
