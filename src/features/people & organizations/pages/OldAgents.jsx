import AppTable from "@/components/app-table";
import authService from "@/features/authentication/services/authService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

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
      name: "userId",
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

  const onSubmit = (formData) => {
    console.log("submitted: ", formData);
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:min-w-[600px]">
          <Form {...form} orientation="vertical">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8  "
            >
              <DialogHeader>
                <DialogTitle>Edit Agent Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4 gap-x-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="License Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseExpirationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Expiration Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="License Expiration Date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Contract Start Date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Contract End Date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <div className=" flex items-center h-10">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="ml-2">
                            {field.value ? `Active` : `Inactive`}
                          </span>
                        </div>
                        {/* <Input placeholder="License Number" {...field} /> */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value="@peduarte" className="col-span-3" />
            </div>
          </div> */}
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agents;
