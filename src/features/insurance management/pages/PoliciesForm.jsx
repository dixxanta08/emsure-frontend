import React, { useEffect, useState } from "react";
import { Form, Table, Switch, InputNumber, Spin, Modal } from "antd";
import Input from "@/features/client portal/components/customantd/input";
import Select from "@/features/client portal/components/customantd/select";
import Button from "@/features/client portal/components/customantd/button";
import FormItem from "@/features/client portal/components/customantd/formitem";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import policyService from "../services/policyService";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import benefitService from "../services/benefitService";
import medicalFacilityService from "../services/medicalFacilityService";
import { Delete } from "lucide-react";

// Define the Zod schema for form validation
const formSchema = z.object({
  policyName: z.string().min(1, "Policy name is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be a positive number"),
  isActive: z.boolean(),
  benefits: z
    .array(
      z.object({
        benefitId: z.number().int().positive(),
        inNetworkPay: z.number().min(0),
        outNetworkPay: z.number().min(0),
        copayType: z.enum(["fixed", "percentage"]),
        copayAmount: z.number().min(0).optional(),
        copayPercentage: z.number().min(0).max(100).optional(),
        frequency: z.enum(["monthly", "quaterly", "semi-annually", "annually"]),
      })
    )
    .min(1, "At least one benefit is required"),
  medicalFacilities: z
    .array(z.number().int().positive())
    .min(1, "At least one medical facility is required"),
});
const modalFormSchema = z
  .object({
    benefitId: z.number().int().positive(),
    inNetworkPay: z.number().min(0),
    outNetworkPay: z.number().min(0),
    copayType: z.enum(["fixed", "percentage"]),
    copayAmount: z.number().min(0).optional().nullable(),
    copayPercentage: z.number().min(0).max(100).optional().nullable(),
    frequency: z.enum(["monthly", "quarterly", "semi-annually", "annually"]),
    inNetworkMaxCoverage: z.number().min(0),
    outNetworkMaxCoverage: z.number().min(0),
  })
  .superRefine((data, ctx) => {
    if (data.inNetworkPay > data.inNetworkMaxCoverage) {
      ctx.addIssue({
        path: ["inNetworkPay"],
        message: "Pay must be less than or equal to Max Coverage",
        code: z.ZodIssueCode.custom,
      });
      ctx.addIssue({
        path: ["inNetworkMaxCoverage"],
        message: "Max Coverage must be greater than or equal to Pay",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.outNetworkPay > data.outNetworkMaxCoverage) {
      ctx.addIssue({
        path: ["outNetworkPay"],
        message: "Pay must be less than or equal to Max Coverage",
        code: z.ZodIssueCode.custom,
      });
      ctx.addIssue({
        path: ["outNetworkMaxCoverage"],
        message: "Max Coverage must be greater than or equal to Pay",
        code: z.ZodIssueCode.custom,
      });
    }

    if (
      data.copayType === "fixed" &&
      (!data.copayAmount || data.copayAmount <= 0)
    ) {
      ctx.addIssue({
        path: ["copayAmount"],
        message:
          "Copay amount is required and must be greater than 0 when type is fixed",
        code: z.ZodIssueCode.custom,
      });
    }

    if (
      data.copayType === "percentage" &&
      (!data.copayPercentage || data.copayPercentage <= 0)
    ) {
      ctx.addIssue({
        path: ["copayPercentage"],
        message:
          "Copay percentage is required and must be greater than 0 when type is percentage",
        code: z.ZodIssueCode.custom,
      });
    }
  });

const PoliciesForm = () => {
  const { policyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Setup react-hook-form
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
      policyName: "", // Default to an empty string
      description: "", // Default to an empty string
      amount: 0, // Default to 0 (as a number)
      isActive: false, // Default to false
      benefits: [], // Default to an empty array (no benefits)
      medicalFacilities: [], // Default to an empty array (no medical facilities)
    },
  });

  const {
    control: modalControl,
    handleSubmit: handleModalSubmit,
    setValue: setModalValue,
    reset: resetModal,
    formState: { modalErrors },
    watch: watchModal,
  } = useForm({
    resolver: zodResolver(modalFormSchema),
    defaultValues: {
      benefitId: null,
      inNetworkPay: null,
      outNetworkPay: null,
      copayAmount: null,
      copayPercentage: null,
      copayType: null,
      frequency: null,
      inNetworkMaxCoverage: null,
      outNetworkMaxCoverage: null,
    },
  });
  // Use `useFieldArray` for benefits
  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: "benefits",
  });

  // Use `useFieldArray` for medicalFacilities
  const {
    fields: facilityFields,
    append: appendFacility,
    remove: removeFacility,
  } = useFieldArray({
    control,
    name: "medicalFacilities",
  });

  // Fetch all benefits for dropdown options
  const { data: benefits, isLoading: loadingBenefits } = useQuery({
    queryKey: ["benefits"],
    queryFn: async () => {
      const fetchedData = await benefitService.getBenefits();
      return fetchedData.benefits;
    },
  });

  // Fetch all medicalFacilities for dropdown options
  const { data: medicalFacilities, isLoading: loadingMedicalFacilities } =
    useQuery({
      queryKey: ["medicalFacilities"],
      queryFn: async () => {
        const fetchedData = await medicalFacilityService.getMedicalFacilities();
        return fetchedData.medicalFacilities;
      },
    });

  // Fetch policy data if policyId is present
  const { data: policy, isLoading: isPolicyLoading } = useQuery({
    queryKey: ["policy", policyId],
    queryFn: async () => {
      if (policyId) {
        const fetchedData = await policyService.getPolicy(policyId);
        return fetchedData.policy;
      }
      return null;
    },
    enabled: !!policyId && policyId !== "new",
  });
  // Populate form fields when policy data is fetched
  useEffect(() => {
    if (policy) {
      setValue("policyName", policy.policyName);
      setValue("description", policy.description);
      setValue("amount", policy.amount);
      setValue("isActive", policy.isActive);
      setValue(
        "medicalFacilities",
        policy.MedicalFacilities.map(
          (medicalFacility) => medicalFacility.medicalFacilityId
        )
      );
      policy.Benefits?.map((benefit, index) => {
        setValue(`benefits.${index}.benefitId`, benefit.benefitId);
        setValue(`benefits.${index}.benefitName`, benefit.benefitName);
        setValue(
          `benefits.${index}.benefitDescription`,
          benefit.benefitDescription
        );
        setValue(`benefits.${index}.inNetworkPay`, benefit.inNetworkPay);
        setValue(`benefits.${index}.outNetworkPay`, benefit.outNetworkPay);
        setValue(`benefits.${index}.copayAmount`, benefit.copayAmount);
        setValue(`benefits.${index}.copayPercentage`, benefit.copayPercentage);
        setValue(`benefits.${index}.copayType`, benefit.copayType);
        setValue(`benefits.${index}.frequency`, benefit.frequency);
        setValue(
          `benefits.${index}.inNetworkMaxCoverage`,
          benefit.inNetworkMaxCoverage
        );
        setValue(
          `benefits.${index}.outNetworkMaxCoverage`,
          benefit.outNetworkMaxCoverage
        );
      });
    }
  }, [policy, setValue, reset]);

  // Mutation for form submission
  const mutation = useMutation({
    mutationFn: async (data) => {
      return policyId && policyId !== "new"
        ? policyService.updatePolicy(policyId, data)
        : policyService.createPolicy(data);
    },
    onSuccess: (data) => {
      toast({ variant: "success", title: "Policy updated successfully" });
      navigate(`/insurance-management/policies/${data.policyId}/details`);
    },
    onError: (error) => {
      console.error(error);
      toast({ variant: "destructive", title: "Something went wrong" });
    },
  });
  const onSubmit = (values) => {
    console.log("Value:", values); //this doesn't have the values
    const payload = {
      ...watch(),
    };
    mutation.mutate(payload);
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBenefitIndex, setSelectedBenefitIndex] = useState(null);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBenefitIndex(null);
    resetModal({
      benefitId: null,
      inNetworkPay: null,
      outNetworkPay: null,
      copayAmount: null,
      copayPercentage: null,
      copayType: null,
      frequency: null,
      inNetworkMaxCoverage: null,
      outNetworkMaxCoverage: null,
    });
  };

  const handleAddBenefit = () => {
    setModalOpen(true);
    setSelectedBenefitIndex(null);
    resetModal({
      benefitId: null,
      inNetworkPay: null,
      outNetworkPay: null,
      copayAmount: null,
      copayPercentage: null,
      copayType: null,
      frequency: null,
      inNetworkMaxCoverage: null,
      outNetworkMaxCoverage: null,
    });
  };

  const columns = [
    {
      title: "Benefit",
      dataIndex: "benefitName",
      width: "15%",
    },
    {
      title: "Description",
      dataIndex: "benefitDescription",
      width: "15%",
    },

    {
      title: "In Network Max Coverage",
      dataIndex: "inNetworkMaxCoverage",
      width: "10%",
    },

    {
      title: "Out Network Max Coverage",
      dataIndex: "outNetworkMaxCoverage",
      width: "10%",
    },
  ];
  // Only depend on setValue, not watch

  console.log("modal errors", errors);
  const onModalSubmit = (values) => {
    const selectedBenefit = benefits?.find(
      (b) => b.benefitId === values.benefitId
    );

    const benefitData = {
      ...values,
      benefitName: selectedBenefit?.benefitName || "",
      benefitDescription: selectedBenefit?.benefitDescription || "",
      copayAmount: values.copayType === "fixed" ? values.copayAmount : 0,
      copayPercentage:
        values.copayType === "percentage" ? values.copayPercentage : 0,
    };
    console.log("benefitData", benefitData);

    if (selectedBenefitIndex !== null) {
      // Update existing benefit
      const currentBenefits = watch("benefits") || [];
      currentBenefits[selectedBenefitIndex] = benefitData;
      setValue("benefits", currentBenefits);
    } else {
      // Add new benefit
      appendBenefit(benefitData);
    }

    handleCloseModal();
  };

  useEffect(() => {
    const benefits = watch("benefits"); // Get benefits once

    if (benefits) {
      const amount = benefits.reduce(
        (acc, benefit) =>
          acc +
          Math.max(
            benefit.inNetworkMaxCoverage,
            benefit.outNetworkMaxCoverage
          ) *
            (benefit.frequency === "semi-annually"
              ? 2
              : benefit.frequency === "quarterly"
              ? 4
              : benefit.frequency === "monthly"
              ? 12
              : 1),
        0
      );

      setValue("amount", amount || 0);
    }
  }, [setValue, onModalSubmit]);

  if (isPolicyLoading || loadingBenefits || loadingMedicalFacilities) {
    return <Spin />;
  }

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <h1 className="font-semibold text-lg text-gray-800">Policies</h1>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Form
          onFinish={handleSubmit(onSubmit)}
          onFinishFailed={(errors) => console.log(errors)}
          layout="vertical"
        >
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 py-4 gap-x-8">
            <FormItem
              control={control}
              name="policyName"
              label="Policy Name"
              help={null}
            >
              <Input className="!z-0" />
            </FormItem>

            <FormItem control={control} name="amount" label="Amount per year">
              <Input aType="number" min={0} disabled />
            </FormItem>
            <FormItem control={control} name="isActive" label="Active">
              <Select>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </FormItem>
            <FormItem
              control={control}
              name="medicalFacilities"
              label="Medical Facilities"
              className="!h-auto "
            >
              <Select mode="multiple">
                {medicalFacilities?.map((facility) => (
                  <Select.Option
                    key={facility.medicalFacilityId}
                    value={facility.medicalFacilityId}
                  >
                    {facility.medicalFacilityName}
                  </Select.Option>
                ))}
              </Select>
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
          <div className="flex justify-between items-center py-4">
            <h2 className="text-lg font-semibold">Benefits</h2>
            <Button onClick={handleAddBenefit} type="primary">
              Add Benefit
            </Button>
            <Modal
              title="Benefit"
              onClose={handleCloseModal}
              onCancel={handleCloseModal} // Close the modal without removing the benefit
              onOk={handleModalSubmit(onModalSubmit)}
              open={modalOpen}
              className="md:!w-[768px]"
              cancelText="Cancel"
              okText="Save"
              footer={[
                selectedBenefitIndex !== null && (
                  <Button
                    key="remove"
                    variant="danger"
                    onClick={() => {
                      Modal.confirm({
                        title: "Are you sure you want to remove this benefit?",
                        onOk: () => {
                          selectedBenefitIndex !== null &&
                            removeBenefit(selectedBenefitIndex); // Remove the selected benefit
                          handleCloseModal(); // Close the modal after removal
                          setSelectedBenefitIndex(null);
                        },
                      });
                    }}
                  >
                    Remove Benefit
                  </Button>
                ),
                <Button
                  key="cancel"
                  variant="secondary-outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>,
                <Button
                  key="save"
                  variant="primary"
                  onClick={handleModalSubmit(onModalSubmit)}
                >
                  Save
                </Button>,
              ]}
            >
              <Form
                layout="vertical"
                onFinish={handleModalSubmit(onModalSubmit)}
              >
                <div className="grid grid-cols-2 gap-4 ">
                  <FormItem
                    name="benefitId"
                    control={modalControl}
                    label="Name"
                  >
                    <Select>
                      {benefits?.map((benefit) => (
                        <Select.Option
                          key={benefit.benefitId}
                          value={benefit.benefitId}
                        >
                          {benefit.benefitName}
                        </Select.Option>
                      ))}
                    </Select>
                  </FormItem>
                  <FormItem
                    name="inNetworkPay"
                    control={modalControl}
                    label="In Network Pay Percentage"
                  >
                    <Input aType="number" min={0} max={100} />
                  </FormItem>
                  <FormItem
                    name="outNetworkPay"
                    control={modalControl}
                    label="Out Network Pay Percentage"
                  >
                    <Input aType="number" min={0} max={100} />
                  </FormItem>
                  <FormItem
                    name="inNetworkMaxCoverage"
                    control={modalControl}
                    label="In Network Max Coverage"
                  >
                    <Input aType="number" min={0} />
                  </FormItem>
                  <FormItem
                    name="outNetworkMaxCoverage"
                    control={modalControl}
                    label="Out Network Max Coverage"
                  >
                    <Input aType="number" min={0} />
                  </FormItem>
                  <FormItem
                    name="copayType"
                    control={modalControl}
                    label="Copay Type"
                  >
                    <Select
                      onChange={(value) => {
                        if (value === "fixed") {
                          setModalValue("copayAmount", 0);
                          setModalValue("copayPercentage", undefined);
                        } else {
                          setModalValue("copayPercentage", 0);
                          setModalValue("copayAmount", undefined);
                        }
                      }}
                    >
                      <Select.Option value="fixed">Fixed Amount</Select.Option>
                      <Select.Option value="percentage">
                        Percentage
                      </Select.Option>
                    </Select>
                  </FormItem>

                  {watchModal("copayType") === "fixed" ? (
                    <FormItem
                      name="copayAmount"
                      control={modalControl}
                      label="Copay Amount"
                    >
                      <Input
                        aType="number"
                        min={0}
                        onChange={(value) => {
                          console.log(value);
                          if (value) {
                            setModalValue("copayPercentage", undefined);
                            setModalValue("copayAmount", value);
                          }
                        }}
                      />
                    </FormItem>
                  ) : (
                    <FormItem
                      name="copayPercentage"
                      control={modalControl}
                      label="Copay Percentage"
                    >
                      <Input
                        aType="number"
                        min={0}
                        max={100}
                        onChange={(value) => {
                          if (value) {
                            setModalValue("copayAmount", undefined);
                            setModalOpen("copayPercentage", value);
                          }
                        }}
                      />
                    </FormItem>
                  )}
                  <FormItem
                    name="frequency"
                    control={modalControl}
                    label="Frequency"
                  >
                    <Select>
                      <Select.Option value="monthly">Monthly</Select.Option>
                      <Select.Option value="quaterly">Quaterly</Select.Option>
                      <Select.Option value="semi-annually">
                        Semi-Annually
                      </Select.Option>
                      <Select.Option value="annually">Annually</Select.Option>
                    </Select>
                  </FormItem>
                </div>
              </Form>
            </Modal>
          </div>
          <Table
            columns={columns}
            dataSource={watch("benefits") || []}
            loading={isPolicyLoading}
            pagination={{
              hideOnSinglePage: true,
              pageSize: 10,
            }}
            rowKey="benefitId"
            onRow={(record, index) => ({
              onClick: () => {
                setSelectedBenefitIndex(index);
                setModalOpen(true);
                resetModal({
                  benefitId: record.benefitId,
                  inNetworkPay: record.inNetworkPay,
                  outNetworkPay: record.outNetworkPay,
                  copayAmount: record.copayAmount,
                  copayPercentage: record.copayPercentage,
                  copayType: record.copayType,
                  frequency: record.frequency,
                  inNetworkMaxCoverage: record.inNetworkMaxCoverage,
                  outNetworkMaxCoverage: record.outNetworkMaxCoverage,
                });
              },
            })}
          />

          <div className="w-full flex justify-end mt-8 gap-4">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PoliciesForm;
