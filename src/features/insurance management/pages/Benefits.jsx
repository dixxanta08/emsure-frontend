import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import benefitService from "../services/benefitService";
import AppDataTable from "@/components/app-data-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTablePagination } from "@/components/app-pagination";
import { cloneDeep } from "lodash";
import { useToast } from "@/hooks/use-toast";
import SearchBar from "@/components/app-searchbar";
import benefitTypeService from "../services/benefitTypeService";
import { Modal, Form, Descriptions } from "antd"; // Added Descriptions for display modal
import FormItem from "../../client portal/components/customantd/formitem";
import Input from "../../client portal/components/customantd/input";
import Button from "../../client portal/components/customantd/button";
import Select from "../../client portal/components/customantd/select";
import { useAuth } from "@/auth/AuthContext";
import { PlusIcon } from "lucide-react";

const formSchema = z.object({
  benefitName: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." }),
  benefitDescription: z.string(),
  benefitTypeId: z.number(),
  isBenefitActive: z.boolean(),
});

const Benefits = () => {
  const { loggedInUser } = useAuth();
  const isAgent = useMemo(
    () => loggedInUser?.roleName === "AGENT",
    [loggedInUser]
  );
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      benefitName: "",
      benefitDescription: "",
      benefitTypeId: null,
      isBenefitActive: true,
    },
  });

  const columns = [
    { accessorKey: "benefitId", header: "Benefit Id" },
    { accessorKey: "benefitName", header: "Name" },
    { accessorKey: "benefitTypeName", header: "Type" },
    { accessorKey: "benefitDescription", header: "Description" },
  ];

  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Form modal for non-agents
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false); // Display modal for agents
  const [selectedRow, setSelectedRow] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [benefitTypesTotalRows, setBenefitTypesTotalRows] = useState(0);
  const [benefitTypesPageIndex, setBenefitTypesPageIndex] = useState(0);
  const [benefitTypesPageSize, setBenefitTypesPageSize] = useState(10);
  const [benefitTypesSearchTerm, setBenefitTypesSearchTerm] = useState("");
  const [isActiveTab, setIsActiveTab] = useState("active");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: benefits,
    error: benefitsError,
    isPending,
  } = useQuery({
    queryKey: ["benefits", pageIndex, pageSize, searchTerm, isActiveTab],
    queryFn: async () => {
      const data = await benefitService.getBenefits(
        pageIndex,
        pageSize,
        searchTerm,
        isActiveTab
      );
      return data;
    },
    retry: false,
  });

  const {
    data: benefitTypesData,
    error: benefitTypesError,
    isLoading: benefitTypesIsLoading,
  } = useQuery({
    queryKey: [
      "benefitTypes",
      benefitTypesPageIndex,
      benefitTypesPageSize,
      benefitTypesSearchTerm,
    ],
    queryFn: async () => {
      const data = await benefitTypeService.getBenefitTypes(
        benefitTypesPageIndex,
        benefitTypesPageSize,
        benefitTypesSearchTerm,
        "active"
      );
      return data;
    },
    retry: false,
  });

  useEffect(() => {
    if (benefits) {
      setTotalRows(benefits.pagination.totalItems);
      setPageIndex(benefits.pagination.pageIndex);
      setPageSize(benefits.pagination.pageSize);
    }
  }, [benefits]);

  useEffect(() => {
    if (benefitTypesData) {
      setBenefitTypesTotalRows(benefitTypesData.pagination.totalItems);
      setBenefitTypesPageIndex(benefitTypesData.pagination.pageIndex);
      setBenefitTypesPageSize(benefitTypesData.pagination.pageSize);
    }
  }, [benefitTypesData]);

  const benefitTypeOptions = benefitTypesData?.benefitTypes
    ? benefitTypesData.benefitTypes.map((bt) => ({
        value: bt.benefitTypeId,
        label: bt.benefitTypeName,
      }))
    : [];

  const { control, handleSubmit, reset } = form;

  const handleSearch = (searchTerm) => setSearchTerm(searchTerm);
  const handlePageChange = (newPageIndex) => setPageIndex(newPageIndex);
  const handlePageSizeChange = (newPageSize) => setPageSize(newPageSize);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    if (isAgent) {
      setIsDisplayModalOpen(true); // Open display modal for agents
    } else {
      reset({
        benefitName: row.benefitName,
        benefitDescription: row.benefitDescription,
        benefitTypeId: row.benefitTypeId,
        isBenefitActive: Boolean(row.isBenefitActive),
      });
      setIsFormModalOpen(true); // Open form modal for non-agents
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ benefitId, benefitFormData }) => {
      return benefitId && benefitId !== "new"
        ? benefitService.updateBenefit(benefitId, benefitFormData)
        : benefitService.createBenefit(benefitFormData);
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Benefit updated successfully",
        description: "Benefit has been updated successfully.",
      });
      queryClient.invalidateQueries([
        "benefits",
        pageIndex,
        pageSize,
        searchTerm,
        isActiveTab,
      ]);
      reset();
      setIsFormModalOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error.message || "There was a problem while updating the benefit.",
      });
    },
  });

  const onSubmit = (formData) => {
    const benefitId = selectedRow?.benefitId;
    const benefitFormData = cloneDeep(formData);
    mutation.mutate({ benefitId, benefitFormData });
    setIsFormModalOpen(false);
  };

  const onCancel = () => {
    setIsFormModalOpen(false);
    reset({
      benefitName: "",
      benefitDescription: "",
      benefitTypeId: null,
      isBenefitActive: true,
    });
  };

  const onDisplayModalClose = () => {
    setIsDisplayModalOpen(false);
    setSelectedRow(null);
  };

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Benefits</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
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
              {!isAgent && (
                <Button
                  variant="outline"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => {
                    setIsFormModalOpen(true);
                    setSelectedRow(null);
                    form.reset({
                      benefitName: "",
                      benefitDescription: "",
                      isBenefitActive: true,
                      benefitTypeId: null,
                    });
                  }}
                >
                  Add Benefit
                </Button>
              )}
            </div>
            <AppDataTable
              rowIdKey="benefitId"
              columns={columns}
              data={benefits?.benefits}
              loading={isPending}
              error={benefitsError}
              onRowClick={handleRowClick}
            />
            <div className="mt-8">
              <DataTablePagination
                totalRows={totalRows}
                pageIndex={pageIndex}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </TabsContent>
          <TabsContent value="inactive">
            <div className="flex items-center justify-between">
              <div className="w-1/3 mt-8 mb-4">
                <SearchBar onSearchClick={handleSearch} />
              </div>
              {!isAgent && (
                <Button
                  variant="outline"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => {
                    setIsFormModalOpen(true);
                    setSelectedRow(null);
                    form.reset({
                      benefitName: "",
                      benefitDescription: "",
                      isBenefitActive: true,
                      benefitTypeId: null,
                    });
                  }}
                >
                  Add Benefit
                </Button>
              )}
            </div>
            <AppDataTable
              rowIdKey="benefitId" // Fixed typo from "userId" to "benefitId"
              columns={columns}
              data={benefits?.benefits}
              loading={isPending}
              error={benefitsError}
              onRowClick={handleRowClick}
            />
            <div className="mt-8">
              <DataTablePagination
                totalRows={totalRows}
                pageIndex={pageIndex}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Modal for Non-Agents */}
      {!isAgent && (
        <Modal
          open={isFormModalOpen}
          title={selectedRow ? "Edit Benefit" : "Add Benefit"}
          className="!w-[600px]"
          onCancel={onCancel}
          onClose={onCancel}
          onOk={handleSubmit(onSubmit)}
        >
          <Form
            onSubmit={handleSubmit(onSubmit)}
            layout="vertical"
            className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2"
          >
            <FormItem label="Benefit Name" name="benefitName" control={control}>
              <Input />
            </FormItem>
            <FormItem
              label="Benefit Type"
              name="benefitTypeId"
              control={control}
            >
              <Select options={benefitTypeOptions} />
            </FormItem>
            {selectedRow && (
              <FormItem label="Status" name="isBenefitActive" control={control}>
                <Select>
                  <Select.Option value={true}>Active</Select.Option>
                  <Select.Option value={false}>Inactive</Select.Option>
                </Select>
              </FormItem>
            )}
            <FormItem
              label="Benefit Description"
              name="benefitDescription"
              control={control}
              className="!h-auto col-span-full"
            >
              <Input aType="textarea" />
            </FormItem>
          </Form>
        </Modal>
      )}

      {/* Display Modal for Agents */}
      {isAgent && (
        <Modal
          open={isDisplayModalOpen}
          title="Benefit Details"
          className="!w-[600px]"
          onCancel={onDisplayModalClose}
          onClose={onDisplayModalClose}
          footer={[
            <Button key="close" onClick={onDisplayModalClose}>
              Close
            </Button>,
          ]}
        >
          {selectedRow && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Benefit ID">
                {selectedRow.benefitId}
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                {selectedRow.benefitName}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {selectedRow.benefitTypeName}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedRow.benefitDescription}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedRow.isBenefitActive ? "Active" : "Inactive"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Benefits;
