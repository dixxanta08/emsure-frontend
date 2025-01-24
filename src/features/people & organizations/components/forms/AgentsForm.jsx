// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import DialogForm from "@/components/DialogForm"; // Import the reusable DialogForm
// import AppTable from "@/components/app-table";
// import authService from "@/features/authentication/services/authService";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { z } from "zod";

// const formSchema = z.object({
//   name: z.string().min(2, { message: "Username must be at least 2 characters." }),
//   email: z.string().email({ message: "Invalid email address." }),
//   phoneNumber: z.string().min(10, { message: "Invalid phone number." }),
//   licenseNumber: z.string(),
//   licenseExpirationDate: z.string().transform((val) => new Date(val)),
//   contractStartDate: z.string().transform((val) => new Date(val)),
//   contractEndDate: z.string().transform((val) => new Date(val)),
//   isActive: z.boolean(),
// });

// const Agents = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);

//   const fields = [
//     { name: "name", label: "Name", placeholder: "Enter name" },
//     { name: "email", label: "Email", placeholder: "Enter email" },
//     { name: "phoneNumber", label: "Phone Number", placeholder: "Enter phone number" },
//     { name: "licenseNumber", label: "License Number", placeholder: "Enter license number" },
//     { name: "licenseExpirationDate", label: "License Expiration Date", type: "date" },
//     { name: "contractStartDate", label: "Contract Start Date", type: "date" },
//     { name: "contractEndDate", label: "Contract End Date", type: "date" },
//     { name: "isActive", label: "Status", type: "switch" },
//   ];

//   const handleFormSubmit = (formData) => {
//     console.log("Form submitted:", formData);
//     setIsDialogOpen(false);
//   };

//   return (
//     <div className="p-8 bg-white">
//       <div className="flex items-center justify-between">
//         <h1 className="font-semibold text-lg text-gray-800">Agents</h1>
//         <Button
//           variant="outline"
//           onClick={() => {
//             setSelectedRow(null);
//             setIsDialogOpen(true);
//           }}
//         >
//           Add Agent
//         </Button>
//       </div>
//       <Tabs defaultValue="active" className="mt-4">
//         <TabsList>
//           <TabsTrigger value="active">Active</TabsTrigger>
//           <TabsTrigger value="inactive">Inactive</TabsTrigger>
//         </TabsList>
//         <TabsContent value="active">
//           <AppTable
//             rowIdKey="userId"
//             columns={columns}
//             data={data}
//             loading={loading}
//             error={error}
//           />
//         </TabsContent>
//       </TabsContent>

//     </div>
//   );
// };

import AppTable from "@/components/app-table";
import authService from "@/features/authentication/services/authService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DialogForm from "@/components/dialog-form";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().min(10, { message: "Invalid phone number." }),
  licenseNumber: z.string(),
  licenseExpirationDate: z.string().transform((val) => new Date(val)),
  contractStartDate: z.string().transform((val) => new Date(val)),
  contractEndDate: z.string().transform((val) => new Date(val)),
  isActive: z.boolean(),
});

const Agents = () => {
  const columns = [
    {
      accessorKey: "userId",
      headerName: "UserId",
      headerClassName: "w-[100px] ",
      cellClassName: "",
    },
    {
      name: "name",
      headerName: "Name",
    },
    {
      name: "phoneNumber",
      headerName: "Phone Number",
    },
    {
      name: "email",
      headerName: "Email",
    },
    {
      name: "actions",
      headerName: "Actions",
      render: (row) => <Button variant="link">View Companies</Button>,
    },
  ];

  const fields = [
    { name: "name", label: "Name", placeholder: "Enter name" },
    { name: "email", label: "Email", placeholder: "Enter email" },
    {
      name: "phoneNumber",
      label: "Phone Number",
      placeholder: "Enter phone number",
    },
    {
      name: "licenseNumber",
      label: "License Number",
      placeholder: "Enter license number",
    },
    {
      name: "licenseExpirationDate",
      label: "License Expiration Date",
      type: "date",
    },
    { name: "contractStartDate", label: "Contract Start Date", type: "date" },
    { name: "contractEndDate", label: "Contract End Date", type: "date" },
    { name: "isActive", label: "Status", type: "switch" },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const form = useForm({
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
    const fetchData = async () => {
      try {
        const data = await authService.getUsers();
        setData(data.users);
      } catch (error) {
        console.log(error); // this returns axios error
        console.log(error.message); // this returns the error message
        setError("An error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRowClick = (row) => {
    console.log(row);
    setSelectedRow(row);
    form.reset(row);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (selectedRow) {
      console.log("submitted for editing: ", formData);
    } else {
      console.log("submitted new : ", formData);
    }
  };
  return (
    <div className="p-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg text-gray-800">Agents</h1>
        <Button
          variant="outline"
          onClick={() => {
            setIsDialogOpen(true);
            setSelectedRow(null);
            form.reset({
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
          }}
        >
          Add Agent
        </Button>
      </div>
      <div className="bg-white p-4 mt-4  rounded-md ">
        <Tabs
          defaultValue="active"
          className="w-full"
          onValueChange={(value) => console.log(value)}
        >
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <AppTable
              rowIdKey="userId"
              columns={columns}
              data={data}
              loading={loading}
              error={error}
              onRowClick={handleRowClick} // log the row values on click
            />
          </TabsContent>
          <TabsContent value="inactive">
            <AppTable
              rowIdKey="userId"
              columns={columns}
              data={data}
              loading={loading}
              error={error}
            />
          </TabsContent>
        </Tabs>
      </div>
      <DialogForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={selectedRow ? "Edit Agent Profile" : "Add Agent"}
        description="Fill out the details below and click save."
        saveButton={selectedRow ? "Update Agent" : "Add Agent"}
        schema={formSchema}
        defaultValues={
          selectedRow || {
            name: "",
            email: "",
            phoneNumber: "",
            licenseNumber: "",
            licenseExpirationDate: "",
            contractStartDate: "",
            contractEndDate: "",
            isActive: false,
          }
        }
        fields={fields}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Agents;
