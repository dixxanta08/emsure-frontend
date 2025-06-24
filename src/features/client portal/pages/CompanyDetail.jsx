import React, { useEffect, useMemo, useState } from "react";
import { Form, DatePicker, Spin, message, Upload, Tag } from "antd";
import Input from "../components/customantd/input";
import Select from "../components/customantd/select";
import FormItem from "../components/customantd/formitem";
import Button from "../components/customantd/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import companyService from "@/features/authentication/services/companyService";
import employeeService from "@/features/authentication/services/employeeService";
import { ArrowLeft, Verified } from "lucide-react";
import AppDataTable from "@/components/app-data-table";
// import { FormItem } from "react-hook-form-antd";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UploadOutlined } from "@ant-design/icons";

const formSchema = z.object({
  companyName: z
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
  companyRegistrationNumber: z
    .string()
    .nonempty({ message: "License number is required" }),
  companyAddress: z
    .string()
    .min(3, { message: "Address must be at least 3 characters." })
    .nonempty({ message: "Address is required" }),

  isActive: z.boolean(),
  verified: z.boolean().optional(),
  documentUrl: z.string().optional(),
});
const CompanyDetail = () => {
  const { loggedInUser } = useAuth();
  const companyId = loggedInUser?.companyId;
  const isEmployer = useMemo(
    () => loggedInUser?.roleName === "EMPLOYER",
    [loggedInUser]
  );
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const { data: companyData, isLoading } = useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const data = await companyService.getCompany(companyId);
      return {
        ...data.company,
        isActive: data.company.isActive ? true : false,
      };
    },
    enabled: !!companyId,
  });

  const {
    data: employeesData,
    loading: isEmployeesLoading,
    error: employeesError,
  } = useQuery({
    queryKey: ["companyEmployees", companyId],
    queryFn: async () =>
      employeeService.getEmployeesByCompany(companyId, 0, 5, "", "active"),
    enabled: !!companyId,
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (companyId) {
        return companyService.updateCompany(companyId, values);
      }
      return companyService.createCompany(values);
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Claim Created successfully",
        description: "Claim has been created successfully.",
      });
      queryClient.invalidateQueries(["company", companyId]);
    },
    onError: (error) => {
      console.error("Error updating company:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while creating claim.",
      });
    },
  });

  const { control, watch, handleSubmit, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      companyAddress: "",
      companyRegistrationNumber: "",
      isActive: false,
      verified: false,
      documentUrl: "",
    },
  });

  useEffect(() => {
    if (companyData) {
      setValue("companyName", companyData.companyName);
      setValue("email", companyData.email);
      setValue("phoneNumber", companyData.phoneNumber);
      setValue("companyAddress", companyData.companyAddress);
      setValue(
        "companyRegistrationNumber",
        companyData.companyRegistrationNumber
      );
      setValue("isActive", companyData.isActive);
      setValue("verified", companyData.verified);
      setValue("documentUrl", companyData.documentUrl);
      if (companyData.documentUrl) {
        setUploadedFiles([
          {
            uid: "-1",
            name: "Existing Document",
            status: "done",
            url: companyData.documentUrl,
          },
        ]);
      }
    }
  }, [companyData, setValue]);

  const handleFileUpload = async (file) => {
    if (!file) return;

    const fileId = file.uid;
    setUploadedFiles((prev) => [
      ...prev,
      { uid: fileId, name: file.name, status: "uploading", url: "" },
    ]);
    setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", "companyDocument");
    if (companyId) formData.append("companyId", companyId);

    try {
      const response = await apiService.post("/file-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : 0;
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
        },
      });

      const fileName = response.data?.file?.filename;
      const filePath = `http://localhost:8080/uploads/documents/${fileName}`;

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.uid === fileId ? { ...f, status: "done", url: filePath } : f
        )
      );
      setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
      setValue("documentUrl", filePath);

      toast({
        variant: "success",
        title: "File Uploaded",
        description: `${file.name} uploaded successfully.`,
      });
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) => (f.uid === fileId ? { ...f, status: "error" } : f))
      );
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));
      toast({
        variant: "destructive",
        title: "File Upload Failed",
        description: `Error uploading ${file.name}.`,
      });
      console.error("File upload error:", error);
    }
  };

  const onSubmit = (data) => {
    const latestFile = uploadedFiles.find((file) => file.status === "done");
    if (latestFile) {
      data.documentUrl = latestFile.url;
    }
    mutation.mutate(data);
  };
  // const onSubmit = (data) => {
  //   console.log(data);
  //   mutation.mutate(data);
  // };
  const handleEmployeeRowClick = (row) => {
    navigate(`/employees/${row.employeeId}/details`);
  };
  console.log("form data", watch());
  const columns = [
    {
      header: "Employee ID",
      accessorKey: "employeeId",
    },
    {
      header: "Employee Name",
      accessorKey: "name",
    },
    {
      header: "Phone Number",
      accessorKey: "phoneNumber",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
  ];

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
        <h1 className="font-semibold text-lg">Company Details</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Form
          onFinish={handleSubmit(onSubmit)}
          layout="vertical"
          disabled={!isEmployer}
        >
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
            {loggedInUser?.roleName === "EMPLOYER" && (
              <div>
                <Upload
                  customRequest={({ file, onSuccess, onError }) => {
                    handleFileUpload(file)
                      .then(() => onSuccess("ok"))
                      .catch((err) => onError(err));
                  }}
                  fileList={uploadedFiles.map((file) => ({
                    uid: file.uid,
                    name: file.name,
                    status: file.status,
                    url: file.url,
                    percent: uploadProgress[file.uid] || 0,
                  }))}
                  onRemove={(file) => {
                    setUploadedFiles((prev) =>
                      prev.filter((f) => f.uid !== file.uid)
                    );
                    setValue("documentUrl", ""); // Reset documentUrl on remove
                  }}
                >
                  <Button icon={<UploadOutlined />}>Upload Document</Button>
                </Upload>
              </div>
            )}
          </div>
          {isEmployer && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                htmlType="submit"
                loading={mutation.isLoading}
              >
                Update Company
              </Button>
            </div>
          )}
        </Form>
      </div>
      <div className="mt-8 p-8 bg-white rounded-lg shadow">
        <div className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            {" "}
            <h2 className="font-semibold text-base text-gray-800">
              Document Verification Status
            </h2>
            <Tag
              color={companyData?.verified ? "green" : "red"}
              className="text-base"
            >
              {companyData?.verified ? "Verified" : "Not Verified"}
            </Tag>
          </div>
        </div>
      </div>
      {/* Employees Table */}
      {isEmployer && (
        <div className="mt-8 bg-white rounded-lg shadow ">
          <div className="w-full flex items-center justify-between p-4">
            <h2 className="font-semibold text-md text-gray-800">Employees</h2>
            {employeesData?.employees.length > 0 && (
              <Button
                variant="outline"
                className="w-[120px] border border-none shadow-none !text-[hsl(273,83.8%,53.9%)] hover:bg-white hover:text-[hsl(273,53%,15%)]"
                onClick={() => {
                  navigate(`/employees`);
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
        </div>
      )}
    </div>
  );
};

export default CompanyDetail;
