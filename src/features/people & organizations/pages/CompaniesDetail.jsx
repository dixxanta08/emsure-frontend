// import React, { useEffect, useMemo } from "react";
// import { Form, Spin, Tabs } from "antd";
// import Input from "../../client portal/components/customantd/input";
// import Select from "../../client portal/components/customantd/select";
// import FormItem from "../../client portal/components/customantd/formitem";
// import Button from "../../client portal/components/customantd/button";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useNavigate, useParams } from "react-router-dom";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import companyService from "@/features/authentication/services/companyService";
// import employeeService from "@/features/authentication/services/employeeService";
// import subscriptionService from "@/features/subscription management/services/subscriptionService"; // Assuming you have a service for plans
// import { ArrowLeft, Verified } from "lucide-react";
// import AppDataTable from "@/components/app-data-table";
// import { useAuth } from "@/auth/AuthContext";
// import { useToast } from "@/hooks/use-toast";
// import { set } from "date-fns";

// const formSchema = z.object({
//   companyName: z
//     .string()
//     .min(3, { message: "Name must be at least 3 characters." })
//     .nonempty({ message: "Name is required" }),
//   email: z
//     .string()
//     .nonempty({ message: "Email is required" })
//     .email({ message: "Invalid email address." }),
//   phoneNumber: z
//     .string()
//     .min(10, { message: "Invalid phone number." })
//     .nonempty({ message: "Phone number is required" }),
//   companyRegistrationNumber: z
//     .string()
//     .nonempty({ message: "License number is required" }),
//   companyAddress: z
//     .string()
//     .min(3, { message: "Address must be at least 3 characters." })
//     .nonempty({ message: "Address is required" }),

//   isActive: z.boolean(),
//   Verified: z.boolean().optional(),
//   documentUrl: z.string().optional(),
// });

// const CompaniesDetail = () => {
//   const { loggedInUser } = useAuth();
//   const { isAgent, agentId } = useMemo(() => {
//     return {
//       isAgent: loggedInUser.roleName === "AGENT",
//       agentId: loggedInUser.agentId,
//     };
//   }, [loggedInUser]);
//   const { companyId } = useParams();
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   const { data: companyData, isLoading } = useQuery({
//     queryKey: ["company", companyId],
//     queryFn: async () => {
//       const data = await companyService.getCompany(companyId);
//       return {
//         ...data.company,
//         isActive: data.company.isActive ? true : false,
//       };
//     },
//     enabled: companyId && companyId !== "new",
//   });

//   const {
//     data: employeesData,
//     loading: isEmployeesLoading,
//     error: employeesError,
//   } = useQuery({
//     queryKey: ["companyEmployees", companyId],
//     queryFn: async () =>
//       employeeService.getEmployeesByCompany(companyId, 0, 5, "", "active"),
//     enabled: !!companyId,
//   });

//   const {
//     data: planData,
//     loading: isPlanLoading,
//     error: planError,
//   } = useQuery({
//     queryKey: ["companyPlans", companyId],
//     queryFn: async () =>
//       subscriptionService.getSubscriptionsByCompanyId(
//         0,
//         10,
//         "",
//         "active",
//         companyId
//       ),
//     enabled: !!companyId,
//   });

//   const mutation = useMutation({
//     mutationFn: async (values) => {
//       if (companyId && companyId !== "new") {
//         return companyService.updateCompany(companyId, values);
//       } else {
//         if (isAgent && agentId) {
//           values.agentId = agentId;
//         }
//         return companyService.createCompany(values);
//       }
//     },
//     onSuccess: () => {
//       if (companyId && companyId !== "new") {
//         toast({
//           variant: "success",
//           title: "Company updated successfully",
//           description: "Company has been created successfully.",
//         });
//       } else {
//         toast({
//           variant: "success",
//           title: "Company created successfully",
//           description: "Company has been created successfully.",
//         });
//       }
//       queryClient.invalidateQueries(["company", companyId]);
//       navigate(
//         companyId && companyId !== "new"
//           ? `/people-organizations/companies/${companyId}/details`
//           : `/people-organizations/companies`
//       );
//     },
//     onError: (error) => {
//       console.error("Error creating company:", error);
//       toast({
//         variant: "destructive",
//         title: "Uh oh! Something went wrong.",
//         description: "There was a problem while creating company.",
//       });
//     },
//   });

//   const { control, watch, handleSubmit, setValue } = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       phoneNumber: "",
//       companyAddress: "",
//       companyRegistrationNumber: "",
//       isActive: false,
//       verified: false,
//       documentUrl: "",
//     },
//   });

//   useEffect(() => {
//     if (companyData) {
//       setValue("companyName", companyData.companyName);
//       setValue("email", companyData.email);
//       setValue("phoneNumber", companyData.phoneNumber);
//       setValue("companyAddress", companyData.companyAddress);
//       setValue(
//         "companyRegistrationNumber",
//         companyData.companyRegistrationNumber
//       );
//       setValue("isActive", companyData.isActive);
//       setValue("verified", companyData.verified);
//       setValue("documentUrl", companyData.documentUrl);
//     }
//   }, [companyData, setValue]);

//   const onSubmit = (data) => {
//     mutation.mutate(data);
//   };

//   const handleEmployeeRowClick = (row) => {
//     navigate(
//       `/people-organizations/companies/${companyId}/employees/${row.employeeId}/details`
//     );
//   };

//   const handlePlanRowClick = (row) => {
//     navigate(
//       `/subscription-management/plan-subscriptions/${row.subscriptionId}/details`
//     );
//   };

//   const columnsEmployees = [
//     {
//       header: "Employee ID",
//       accessorKey: "employeeId",
//     },
//     {
//       header: "Employee Name",
//       accessorKey: "name",
//     },
//     {
//       header: "Phone Number",
//       accessorKey: "phoneNumber",
//     },
//     {
//       header: "Email",
//       accessorKey: "email",
//     },
//   ];

//   const columnsPlans = [
//     {
//       header: "Plan Subscription ID",
//       accessorKey: "subscriptionId",
//     },
//     {
//       header: "Plan Name",
//       accessorKey: "planName",
//     },
//     {
//       header: "Renewal Date",
//       accessorKey: "renewalDate",
//     },
//     {
//       header: "Number of Users",
//       accessorKey: "numberOfUsers",
//     },
//   ];

//   const handleFileUpload = async (file) => {
//     if (!file) return;

//     const fileId = file.uid;
//     setUploadedFiles((prev) => [
//       ...prev,
//       { uid: fileId, name: file.name, status: "uploading", url: "" },
//     ]);
//     setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("documentType", "companyDocument");
//     formData.append("companyId", companyId);

//     try {
//       const response = await apiService.post("/file-upload", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         onUploadProgress: (progressEvent) => {
//           const progress = progressEvent.total
//             ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
//             : 0;
//           setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
//         },
//       });

//       const fileName = response.data?.file?.filename;
//       const filePath = `http://localhost:8080/uploads/documents/${fileName}`;

//       setUploadedFiles((prev) =>
//         prev.map((f) =>
//           f.uid === fileId ? { ...f, status: "success", url: filePath } : f
//         )
//       );
//       setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

//       // Update form data with new file URL
//       console.log("filePath", filePath);
//       console.log("watch", watch("documentUrl"));
//       const currentUrl = watch("documentUrl") || [];

//       toast({
//         variant: "success",
//         title: "File Uploaded",
//         description: `${file.name} uploaded successfully.`,
//       });
//     } catch (error) {
//       setUploadedFiles((prev) =>
//         prev.map((f) => (f.uid === fileId ? { ...f, status: "error" } : f))
//       );
//       setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));
//       toast({
//         variant: "destructive",
//         title: "File Upload Failed",
//         description: `Error uploading ${file.name}.`,
//       });
//       console.error("File upload error:", error);
//     }
//   };

//   if (isLoading) {
//     return <Spin size="large" />;
//   }

//   return (
//     <div className="p-8 bg-gray-100 h-full">
//       <div className="flex items-center justify-start gap-4 mb-6">
//         <Button
//           icon={<ArrowLeft />}
//           onClick={() => navigate(-1)}
//           variant="empty"
//         ></Button>
//         <h1 className="font-semibold text-lg">Company Details</h1>
//       </div>
//       <div className="bg-white p-4 mt-4 rounded-md">
//         <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
//           <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 py-4 gap-x-8">
//             <FormItem label="Company Name" name="companyName" control={control}>
//               <Input />
//             </FormItem>

//             <FormItem label="Email" name="email" control={control}>
//               <Input />
//             </FormItem>

//             <FormItem label="Phone Number" name="phoneNumber" control={control}>
//               <Input />
//             </FormItem>
//             <FormItem
//               label="Company Address"
//               name="companyAddress"
//               control={control}
//             >
//               <Input />
//             </FormItem>
//             <FormItem
//               label={
//                 <span className="text-xs font-medium text-black ">
//                   Registration Number
//                 </span>
//               }
//               name="companyRegistrationNumber"
//               control={control}
//             >
//               <Input />
//             </FormItem>

//             <FormItem label="Status" name="isActive" control={control}>
//               <Select>
//                 <Select.Option value={true}>Active</Select.Option>
//                 <Select.Option value={false}>Inactive</Select.Option>
//               </Select>
//             </FormItem>
//             <Upload
//               customRequest={({ file, onSuccess, onError }) => {
//                 handleFileUpload(file)
//                   .then(() => onSuccess("ok"))
//                   .catch((err) => onError(err));
//               }}
//               fileList={uploadedFiles.map((file) => ({
//                 uid: file.uid,
//                 name: file.name,
//                 status: file.status,
//                 url: file.url,
//                 percent: uploadProgress[file.uid] || 0,
//               }))}
//               onRemove={(file) => {
//                 setUploadedFiles((prev) =>
//                   prev.filter((f) => f.uid !== file.uid)
//                 );
//                 const currentUrls = watch("documentUrls") || [];
//                 setValue(
//                   "documentUrls",
//                   currentUrls.filter((url) => url !== file.url)
//                 );
//               }}
//             >
//               <Button icon={<UploadOutlined />}>Upload Documents</Button>
//             </Upload>
//           </div>
//           <div className="flex justify-end">
//             <Button
//               variant="primary"
//               htmlType="submit"
//               loading={mutation.isLoading}
//             >
//               Update Company
//             </Button>
//           </div>
//         </Form>
//       </div>

//       {companyId && companyId !== "new" && (
//         <div className="mt-8 p-8 bg-white rounded-lg shadow ">
//           <Tabs defaultActiveKey="1" className="w-full">
//             <Tabs.TabPane
//               tab={<span className="text-base">Employees</span>}
//               key="1"
//             >
//               <div className="w-full flex items-center justify-between p-4">
//                 <h2 className="font-semibold text-base text-gray-800">
//                   Employees
//                 </h2>
//                 {
//                   <Button
//                     variant="outline"
//                     className="w-[120px] border border-none shadow-none !text-[hsl(273,83.8%,53.9%)] hover:bg-white hover:text-[hsl(273,53%,15%)]"
//                     onClick={() => {
//                       navigate(
//                         `/people-organizations/companies/${companyId}/employees`
//                       );
//                     }}
//                   >
//                     View All
//                   </Button>
//                 }
//               </div>
//               <AppDataTable
//                 rowIdKey="employeeId"
//                 columns={columnsEmployees}
//                 data={employeesData?.employees}
//                 loading={isEmployeesLoading}
//                 error={employeesError}
//                 onRowClick={handleEmployeeRowClick}
//               />
//             </Tabs.TabPane>
//             <Tabs.TabPane
//               tab={<span className="text-base">Plan Subscriptions</span>}
//               key="2"
//             >
//               <div className="w-full flex items-center justify-between p-4">
//                 <h2 className="font-semibold text-base text-gray-800">
//                   Plan Subscriptions
//                 </h2>
//                 {
//                   <Button
//                     variant="outline"
//                     className="w-[120px] text-base border border-none shadow-none !text-[hsl(273,83.8%,53.9%)] hover:bg-white hover:text-[hsl(273,53%,15%)]"
//                     onClick={() => {
//                       navigate(
//                         `/subscription-management/company/${companyId}/plan-subscriptions`
//                       );
//                     }}
//                   >
//                     View All
//                   </Button>
//                 }
//               </div>
//               <AppDataTable
//                 rowIdKey="subscriptionId"
//                 columns={columnsPlans}
//                 data={planData?.subscriptions}
//                 loading={isPlanLoading}
//                 error={planError}
//                 onRowClick={handlePlanRowClick}
//               />
//             </Tabs.TabPane>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CompaniesDetail;
import React, { useEffect, useMemo, useState } from "react";
import { Form, Spin, Tabs, Tag, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Input from "../../client portal/components/customantd/input";
import Select from "../../client portal/components/customantd/select";
import FormItem from "../../client portal/components/customantd/formitem";
import Button from "../../client portal/components/customantd/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import companyService from "@/features/authentication/services/companyService";
import employeeService from "@/features/authentication/services/employeeService";
import subscriptionService from "@/features/subscription management/services/subscriptionService";
import { ArrowLeft } from "lucide-react";
import AppDataTable from "@/components/app-data-table";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";

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

const CompaniesDetail = () => {
  const { loggedInUser } = useAuth();
  const { isAgent, agentId } = useMemo(
    () => ({
      isAgent: loggedInUser.roleName === "AGENT",
      agentId: loggedInUser.agentId,
    }),
    [loggedInUser]
  );
  const { companyId } = useParams();
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
    enabled: companyId && companyId !== "new",
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

  const {
    data: planData,
    loading: isPlanLoading,
    error: planError,
  } = useQuery({
    queryKey: ["companyPlans", companyId],
    queryFn: async () =>
      subscriptionService.getSubscriptionsByCompanyId(
        0,
        10,
        "",
        "active",
        companyId
      ),
    enabled: !!companyId,
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (companyId && companyId !== "new") {
        return companyService.updateCompany(companyId, values);
      } else {
        if (isAgent && agentId) {
          values.agentId = agentId;
        }
        return companyService.createCompany(values);
      }
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title:
          companyId && companyId !== "new"
            ? "Company updated successfully"
            : "Company created successfully",
        description: "Company has been processed successfully.",
      });
      queryClient.invalidateQueries(["company", companyId]);
      navigate(
        companyId && companyId !== "new"
          ? `/people-organizations/companies/${companyId}/details`
          : `/people-organizations/companies`
      );
    },
    onError: (error) => {
      console.error("Error creating/updating company:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while processing the company.",
      });
    },
  });

  const { control, watch, handleSubmit, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
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

  const handleEmployeeRowClick = (row) => {
    navigate(
      `/people-organizations/companies/${companyId}/employees/${row.employeeId}/details`
    );
  };

  const handlePlanRowClick = (row) => {
    navigate(
      `/subscription-management/plan-subscriptions/${row.subscriptionId}/details`
    );
  };

  const columnsEmployees = [
    { header: "Employee ID", accessorKey: "employeeId" },
    { header: "Employee Name", accessorKey: "name" },
    { header: "Phone Number", accessorKey: "phoneNumber" },
    { header: "Email", accessorKey: "email" },
  ];

  const columnsPlans = [
    { header: "Plan Subscription ID", accessorKey: "subscriptionId" },
    { header: "Plan Name", accessorKey: "planName" },
    { header: "Renewal Date", accessorKey: "renewalDate" },
    { header: "Number of Users", accessorKey: "numberOfUsers" },
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
        />
        <h1 className="font-semibold text-lg">Company Details</h1>
      </div>
      <div className="bg-white p-4 mt-4 rounded-md">
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
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
                <span className="text-xs font-medium text-black">
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
            {/* Upload component is not controlled by react-hook-form */}
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
            {companyData?.agentId && (
              <div>
                <h3 className=" font-semibold">Agent</h3>
                <Link
                  to={`/people-organizations/agents/${companyData?.agentId}/details`}
                  className="text-purple-500 underline text-base"
                >
                  {companyData?.agentName}
                </Link>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              htmlType="submit"
              loading={mutation.isLoading}
            >
              {companyId && companyId !== "new"
                ? "Update Company"
                : "Create Company"}
            </Button>
          </div>
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
          {(loggedInUser.roleName === "ADMIN" ||
            loggedInUser.roleName === "INSURANCE_WORKER") &&
            companyData?.documentUrl &&
            !companyData?.verified && (
              <Button
                variant="secondary-outline"
                onClick={async () => {
                  await companyService
                    .verifyCompany(companyId)
                    .then(() => {
                      queryClient.invalidateQueries(["company", companyId]);
                      toast({
                        variant: "success",
                        title: "Company Verified",
                        description: "Company has been verified successfully.",
                      });
                    })
                    .error((error) => {
                      console.error("Error verifying company:", error);
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description:
                          "There was a problem while verifying the company.",
                      });
                    });
                }}
              >
                Verify Company
              </Button>
            )}
        </div>
      </div>

      {companyId && companyId !== "new" && (
        <div className="mt-8 p-8 bg-white rounded-lg shadow">
          <Tabs
            defaultActiveKey="1"
            className="w-full"
            items={[
              {
                key: "1",
                label: <span className="text-base">Employees</span>,
                children: (
                  <>
                    <div className="w-full flex items-center justify-between p-4">
                      <h2 className="font-semibold text-base text-gray-800">
                        Employees
                      </h2>
                      <Button
                        variant="outline"
                        className="w-[120px] border border-none shadow-none !text-[hsl(273,83.8%,53.9%)] hover:bg-white hover:text-[hsl(273,53%,15%)]"
                        onClick={() =>
                          navigate(
                            `/people-organizations/companies/${companyId}/employees`
                          )
                        }
                      >
                        View All
                      </Button>
                    </div>
                    <AppDataTable
                      rowIdKey="employeeId"
                      columns={columnsEmployees}
                      data={employeesData?.employees}
                      loading={isEmployeesLoading}
                      error={employeesError}
                      onRowClick={handleEmployeeRowClick}
                    />
                  </>
                ),
              },
              {
                key: "2",
                label: <span className="text-base">Plan Subscriptions</span>,
                children: (
                  <>
                    <div className="w-full flex items-center justify-between p-4">
                      <h2 className="font-semibold text-base text-gray-800">
                        Plan Subscriptions
                      </h2>
                      <Button
                        variant="outline"
                        className="w-[120px] text-base border border-none shadow-none !text-[hsl(273,83.8%,53.9%)] hover:bg-white hover:text-[hsl(273,53%,15%)]"
                        onClick={() =>
                          navigate(
                            `/subscription-management/company/${companyId}/plan-subscriptions`
                          )
                        }
                      >
                        View All
                      </Button>
                    </div>
                    <AppDataTable
                      rowIdKey="subscriptionId"
                      columns={columnsPlans}
                      data={planData?.subscriptions}
                      loading={isPlanLoading}
                      error={planError}
                      onRowClick={handlePlanRowClick}
                    />
                  </>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default CompaniesDetail;
