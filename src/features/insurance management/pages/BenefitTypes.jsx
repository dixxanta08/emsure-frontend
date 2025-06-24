import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import benefitTypeService from "../services/benefitTypeService";
import AppDataTable from "@/components/app-data-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTablePagination } from "@/components/app-pagination";
import { cloneDeep } from "lodash";
import { useToast } from "@/hooks/use-toast";
import SearchBar from "@/components/app-searchbar";
import { Modal, Form, Descriptions } from "antd"; // Added Descriptions for display modal
import FormItem from "../../client portal/components/customantd/formitem";
import Input from "../../client portal/components/customantd/input";
import Button from "../../client portal/components/customantd/button";
import Select from "../../client portal/components/customantd/select";
import { useAuth } from "@/auth/AuthContext"; // Added for role checking
import { PlusIcon } from "lucide-react";

const formSchema = z.object({
  benefitTypeName: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." }),
  benefitTypeDescription: z.string(),
  isBenefitTypeActive: z.boolean(),
});

const BenefitTypes = () => {
  const { loggedInUser } = useAuth();
  const isAgent = loggedInUser?.roleName === "AGENT"; // Determine if user is an agent

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      benefitTypeName: "",
      benefitTypeDescription: "",
      isBenefitTypeActive: true,
    },
  });

  const columns = [
    { accessorKey: "benefitTypeId", header: "Benefit Type Id" },
    { accessorKey: "benefitTypeName", header: "Name" },
    { accessorKey: "benefitTypeDescription", header: "Description" },
  ];

  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Form modal for non-agents
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false); // Display modal for agents
  const [selectedRow, setSelectedRow] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveTab, setIsActiveTab] = useState("active");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: benefitTypes,
    error: benefitTypesError,
    isPending,
  } = useQuery({
    queryKey: ["benefitTypes", pageIndex, pageSize, searchTerm, isActiveTab],
    queryFn: async () => {
      const data = await benefitTypeService.getBenefitTypes(
        pageIndex,
        pageSize,
        searchTerm,
        isActiveTab
      );
      return data;
    },
    retry: false,
  });

  useEffect(() => {
    if (benefitTypes) {
      setTotalRows(benefitTypes.pagination.totalItems);
      setPageIndex(benefitTypes.pagination.pageIndex);
      setPageSize(benefitTypes.pagination.pageSize);
    }
  }, [benefitTypes]);

  const handleSearch = (searchTerm) => setSearchTerm(searchTerm);
  const handlePageChange = (newPageIndex) => setPageIndex(newPageIndex);
  const handlePageSizeChange = (newPageSize) => setPageSize(newPageSize);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    if (isAgent) {
      setIsDisplayModalOpen(true); // Open display modal for agents
    } else {
      reset({
        benefitTypeName: row.benefitTypeName,
        benefitTypeDescription: row.benefitTypeDescription,
        isBenefitTypeActive: Boolean(row.isBenefitTypeActive),
      });
      setIsFormModalOpen(true); // Open form modal for non-agents
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ benefitTypeId, benefitTypeFormData }) => {
      return benefitTypeId && benefitTypeId !== "new"
        ? benefitTypeService.updateBenefitType(
            benefitTypeId,
            benefitTypeFormData
          )
        : benefitTypeService.createBenefitType(benefitTypeFormData);
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Benefit type updated successfully",
        description: "Benefit type has been updated successfully.",
      });
      queryClient.invalidateQueries([
        "benefitTypes",
        pageIndex,
        pageSize,
        searchTerm,
        isActiveTab,
      ]);
      setIsFormModalOpen(false);
      reset({
        benefitTypeName: "",
        benefitTypeDescription: "",
        isBenefitTypeActive: true,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error.message ||
          "There was a problem while updating the benefit type.",
      });
    },
  });

  const onSubmit = (formData) => {
    const benefitTypeId = selectedRow?.benefitTypeId;
    const benefitTypeFormData = cloneDeep(formData);
    mutation.mutate({ benefitTypeId, benefitTypeFormData });
  };

  const onCancel = () => {
    setIsFormModalOpen(false);
    reset({
      benefitTypeName: "",
      benefitTypeDescription: "",
      isBenefitTypeActive: true,
    });
  };

  const onDisplayModalClose = () => {
    setIsDisplayModalOpen(false);
    setSelectedRow(null);
  };

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Benefit Types</h1>
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
              {!isAgent && ( // Hide "Add" button for agents
                <Button
                  variant="outline"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => {
                    setIsFormModalOpen(true);
                    setSelectedRow(null);
                    reset({
                      benefitTypeName: "",
                      benefitTypeDescription: "",
                      isBenefitTypeActive: true,
                    });
                  }}
                >
                  Add Benefit Type
                </Button>
              )}
            </div>
            <AppDataTable
              rowIdKey="benefitTypeId" // Fixed from "userId"
              columns={columns}
              data={benefitTypes?.benefitTypes}
              loading={isPending}
              error={benefitTypesError}
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
              {!isAgent && ( // Hide "Add" button for agents
                <Button
                  variant="outline"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => {
                    setIsFormModalOpen(true);
                    setSelectedRow(null);
                    reset({
                      benefitTypeName: "",
                      benefitTypeDescription: "",
                      isBenefitTypeActive: true,
                    });
                  }}
                >
                  Add Benefit Type
                </Button>
              )}
            </div>
            <AppDataTable
              rowIdKey="benefitTypeId"
              columns={columns}
              data={benefitTypes?.benefitTypes}
              loading={isPending}
              error={benefitTypesError}
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
          title={selectedRow ? "Edit Benefit Type" : "Add Benefit Type"}
          open={isFormModalOpen}
          onCancel={onCancel}
          onClose={onCancel}
          onOk={handleSubmit(onSubmit)}
          okText={selectedRow ? "Update Benefit Type" : "Add Benefit Type"}
          cancelText="Cancel"
        >
          <Form
            layout="vertical"
            onFinish={handleSubmit(onSubmit)}
            className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2"
          >
            <FormItem
              label="Name"
              name="benefitTypeName"
              control={control}
              className={!selectedRow && "!col-span-full"}
            >
              <Input />
            </FormItem>
            {selectedRow && (
              <FormItem
                label="Status"
                name="isBenefitTypeActive"
                control={control}
              >
                <Select>
                  <Select.Option value={true}>Active</Select.Option>
                  <Select.Option value={false}>Inactive</Select.Option>
                </Select>
              </FormItem>
            )}
            <FormItem
              label="Description"
              name="benefitTypeDescription"
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
          title="Benefit Type Details"
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
              <Descriptions.Item label="Benefit Type ID">
                {selectedRow.benefitTypeId}
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                {selectedRow.benefitTypeName}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedRow.benefitTypeDescription}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedRow.isBenefitTypeActive ? "Active" : "Inactive"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      )}
    </div>
  );
};

export default BenefitTypes;
