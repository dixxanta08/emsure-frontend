import AppDataTable from "@/components/app-data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import SearchBar from "@/components/app-searchbar";
import { DataTablePagination } from "@/components/app-pagination";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import medicalFacilityService from "../services/medicalFacilityService";
import { Modal, Descriptions, Form } from "antd";
import Button from "../../client portal/components/customantd/button";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cloneDeep } from "lodash";
import FormItem from "@/features/client portal/components/customantd/formitem";
import Input from "@/features/client portal/components/customantd/input";
import Select from "@/features/client portal/components/customantd/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  medicalFacilityName: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .nonempty({ message: "Name is required" }),
  medicalFacilityEmail: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address." }),
  medicalFacilityPhoneNumber: z
    .string()
    .min(10, { message: "Invalid phone number." })
    .nonempty({ message: "Phone number is required" }),
  medicalFacilityType: z.string().nonempty({ message: "Type is required" }),
  medicalFacilityAddress: z
    .string()
    .min(3, { message: "Address must be at least 3 characters." })
    .nonempty({ message: "Address is required" }),
  isMedicalFacilityActive: z.boolean(),
});

const MedicalFacilities = () => {
  const { loggedInUser } = useAuth();
  const isAgent = loggedInUser?.roleName === "AGENT";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const columns = [
    { accessorKey: "medicalFacilityId", header: "Medical Facility Id" },
    { accessorKey: "medicalFacilityName", header: "Name" },
    { accessorKey: "medicalFacilityPhoneNumber", header: "Phone Number" },
    { accessorKey: "medicalFacilityEmail", header: "Email" },
    { accessorKey: "medicalFacilityType", header: "Medical Facility Type" },
  ];

  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveTab, setIsActiveTab] = useState("active");
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingFacilityId, setEditingFacilityId] = useState(null);

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicalFacilityName: "",
      medicalFacilityEmail: "",
      medicalFacilityPhoneNumber: "",
      medicalFacilityType: "",
      medicalFacilityAddress: "",
      isMedicalFacilityActive: true,
    },
  });

  const { data, error, isPending } = useQuery({
    queryKey: [
      "medicalFacilities",
      pageIndex,
      pageSize,
      searchTerm,
      isActiveTab,
    ],
    queryFn: async () => {
      const data = await medicalFacilityService.getMedicalFacilities(
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
    if (data) {
      setTotalRows(data.pagination.totalItems);
      setPageIndex(data.pagination.pageIndex);
      setPageSize(data.pagination.pageSize);
    }
  }, [data]);

  const handleSearch = (searchTerm) => setSearchTerm(searchTerm);
  const handlePageChange = (newPageIndex) => setPageIndex(newPageIndex);
  const handlePageSizeChange = (newPageSize) => setPageSize(newPageSize);

  const handleRowClick = (row) => {
    if (isAgent) {
      setSelectedRow(row);
      setIsDisplayModalOpen(true);
    } else {
      setEditingFacilityId(row.medicalFacilityId);
      setSelectedRow(row);
      setIsFormModalOpen(true);
      // Set form values
      setValue("medicalFacilityName", row.medicalFacilityName);
      setValue("medicalFacilityEmail", row.medicalFacilityEmail);
      setValue("medicalFacilityPhoneNumber", row.medicalFacilityPhoneNumber);
      setValue("medicalFacilityType", row.medicalFacilityType);
      setValue("medicalFacilityAddress", row.medicalFacilityAddress);
      setValue("isMedicalFacilityActive", row.isMedicalFacilityActive);
    }
  };

  const onDisplayModalClose = () => {
    setIsDisplayModalOpen(false);
    setSelectedRow(null);
  };

  const onFormModalClose = () => {
    setIsFormModalOpen(false);
    setSelectedRow(null);
    setEditingFacilityId(null);
    reset();
  };

  const onSubmit = async (formData) => {
    try {
      const medicalFacilityFormData = cloneDeep(formData);
      if (editingFacilityId) {
        await medicalFacilityService.updateMedicalFacility(
          editingFacilityId,
          medicalFacilityFormData
        );
        toast({
          variant: "success",
          title: "Medical Facility updated successfully",
          description: "The medical facility has been updated successfully.",
        });
      } else {
        await medicalFacilityService.createMedicalFacility(
          medicalFacilityFormData
        );
        toast({
          variant: "success",
          title: "Medical Facility created successfully",
          description: "The medical facility has been created successfully.",
        });
      }
      queryClient.invalidateQueries(["medicalFacilities"]);
      onFormModalClose();
    } catch (error) {
      console.error("Failed to save medical facility:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while saving the medical facility.",
      });
    }
  };

  const handleAddNew = () => {
    setEditingFacilityId(null);
    reset();
    setIsFormModalOpen(true);
  };

  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">
          Medical Facilities
        </h1>
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
                <Button variant="outline" onClick={handleAddNew}>
                  <PlusIcon className="h-4 w-4" />
                  Add Medical Facility
                </Button>
              )}
            </div>
            <AppDataTable
              rowIdKey="medicalFacilityId"
              columns={columns}
              data={data?.medicalFacilities}
              loading={isPending}
              error={error}
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
                <Button variant="outline" onClick={handleAddNew}>
                  <PlusIcon className="h-4 w-4" />
                  Add Medical Facility
                </Button>
              )}
            </div>
            <AppDataTable
              rowIdKey="medicalFacilityId"
              columns={columns}
              data={data?.medicalFacilities}
              loading={isPending}
              error={error}
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

      {/* Display Modal for Agents */}
      {isAgent && (
        <Modal
          open={isDisplayModalOpen}
          title="Medical Facility Details"
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
              <Descriptions.Item label="Medical Facility ID">
                {selectedRow.medicalFacilityId}
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                {selectedRow.medicalFacilityName}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {selectedRow.medicalFacilityPhoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedRow.medicalFacilityEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {selectedRow.medicalFacilityType}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {isActiveTab === "active" ? "Active" : "Inactive"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      )}

      {/* Form Modal for Add/Edit */}
      <Modal
        open={isFormModalOpen}
        title={
          editingFacilityId ? "Edit Medical Facility" : "Add Medical Facility"
        }
        className="!w-[800px]"
        onCancel={onFormModalClose}
        footer={null}
      >
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 py-4 gap-x-8">
            <FormItem
              label="Medical Facility Name"
              name="medicalFacilityName"
              control={control}
            >
              <Input />
            </FormItem>
            <FormItem
              label="Email"
              name="medicalFacilityEmail"
              control={control}
            >
              <Input />
            </FormItem>
            <FormItem
              label="Phone Number"
              name="medicalFacilityPhoneNumber"
              control={control}
            >
              <Input />
            </FormItem>
            <FormItem
              label="Medical Facility Address"
              name="medicalFacilityAddress"
              control={control}
            >
              <Input />
            </FormItem>
            <FormItem
              label="Facility Type"
              name="medicalFacilityType"
              control={control}
            >
              <Input />
            </FormItem>
            {editingFacilityId && (
              <FormItem
                label="Status"
                name="isMedicalFacilityActive"
                control={control}
              >
                <Select>
                  <Select.Option value={true}>Active</Select.Option>
                  <Select.Option value={false}>Inactive</Select.Option>
                </Select>
              </FormItem>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onFormModalClose}>
              Cancel
            </Button>
            <Button variant="primary" htmlType="submit">
              {editingFacilityId ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalFacilities;
