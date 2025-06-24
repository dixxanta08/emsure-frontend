import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Form } from "antd";
import FormItem from "@/features/client portal/components/customantd/formitem";
import Input from "@/features/client portal/components/customantd/input";
import Button from "@/features/client portal/components/customantd/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";

const formSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  // password: z.string().nonempty({ message: "Password is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be between 8 and 32 characters" })
    .max(32, { message: "Password must be between 8 and 32 characters" })
    .refine(
      (val) =>
        /[a-z]/.test(val) && // lowercase
        /[A-Z]/.test(val) && // uppercase
        /[0-9]/.test(val) && // number
        /[^a-zA-Z0-9]/.test(val), // special character
      {
        message:
          "Password must include uppercase, lowercase, number, and special character",
      }
    ),
  companyEmail: z.string().email({ message: "Invalid email address" }),
  companyName: z.string().nonempty({ message: "Company name is required" }),
  companyRegistrationNumber: z
    .string()
    .nonempty({ message: "Company registration number is required" }),
});

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formPage, setFormPage] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyEmail: "",
    companyName: "",
    companyRegistrationNumber: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });

  // Sync formData state with form values when formPage changes
  useEffect(() => {
    if (formPage === 0) {
      setValue("name", watch("name"));
      setValue("email", watch("email"));
      setValue("password", watch("password"));
    } else if (formPage === 1) {
      setValue("companyName", watch("companyName"));
      setValue("companyEmail", watch("companyEmail"));
      setValue("companyRegistrationNumber", watch("companyRegistrationNumber"));
    }
  }, [formPage, watch, setValue]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await authService.signup(data);
      console.log("Registration response:", response);
      toast({
        variant: "success",
        title: "Registered Successfully",
        description: "You have been registered.",
        duration: 5000,
      });
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Please try again later.",
        duration: 5000,
      });
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 min-w-[320px] max-w-[400px] w-full">
      <div className="w-full">
        <h2 className="text-2xl font-medium mb-4">Register</h2>
        <p className="text-[#515158]">Register now to join us.</p>
      </div>
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <div className="py-4 flex flex-col gap-4">
          {formPage === 0 ? (
            <>
              <FormItem label="Name" name="name" control={control}>
                <Input />
              </FormItem>
              <FormItem label="Email" name="email" control={control}>
                <Input />
              </FormItem>
              <FormItem label="Password" name="password" control={control}>
                <Input type="password" />
              </FormItem>
            </>
          ) : (
            <>
              <FormItem
                label="Company Name"
                name="companyName"
                control={control}
              >
                <Input />
              </FormItem>
              <FormItem
                label="Company Email"
                name="companyEmail"
                control={control}
              >
                <Input />
              </FormItem>
              <FormItem
                label="Company Registration Number"
                name="companyRegistrationNumber"
                control={control}
              >
                <Input />
              </FormItem>
            </>
          )}
        </div>
        {formPage === 0 ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setFormPage(1);
            }}
          >
            Next
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setFormPage(0)}>
              Previous
            </Button>
            <Button className="w-full" htmlType="submit">
              Register
            </Button>
          </div>
        )}
      </Form>
      <div className="mt-8">
        <Link
          to="/login"
          className="text-[hsl(273_20%_30%)] underline hover:text-[hsl(273_80%_40%)]"
        >
          Already Registered? Login Now
        </Link>
      </div>
    </div>
  );
};

export default Register;
