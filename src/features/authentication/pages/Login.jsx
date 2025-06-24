import React, { useState } from "react";
import authService from "../services/authService";
import AuthForm from "../components/auth-form";
import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { AGENT_ROLE, EMPLOYEE_ROLE, EMPLOYER_ROLE } from "@/utils/constants";

const formSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address." }),

  password: z.string().nonempty({ message: "Password is required" }),
});
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { toast } = useToast();
  const fields = [
    {
      name: "email",
      label: "Email",
      placeholder: "Enter email",
      value: formData.email,
      onChange: (e) => setFormData({ ...formData, email: e.target.value }),
    },
    {
      name: "password",
      label: "Password",
      placeholder: "Enter your password",
      type: "password",
      value: formData.password,
      onChange: (e) => setFormData({ ...formData, password: e.target.value }),
    },
  ];

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (logInFormData) => {
      const data = await login(logInFormData.email, logInFormData.password);
      if (data) return data;
      throw new Error("Invalid credentials or response");
    },
    onSuccess: (data) => {
      const successMessage = data?.message || "User logged in successfully";
      toast({
        variant: "success",
        title: "Login Successful",
        description: successMessage,
        duration: 5000,
      });
      console.log("Data: ", data.user);
      if (data.user?.roleName === EMPLOYEE_ROLE) {
        navigate("/employee-dashboard");
      }
      if (data.user?.roleName === EMPLOYER_ROLE) {
        navigate("/company-dashboard");
      }
      if (data.user?.roleName === "SUPER_ADMIN") {
        navigate("/main-dashboard");
      }
      if (data.user?.roleName === "INSURANCE_WORKER") {
        navigate("/main-dashboard");
      }
      if (data.user?.roleName === AGENT_ROLE) {
        navigate("/agent-dashboard");
      }
    },
    onError: (error) => {
      console.log("Error: ", error);
      const errorMessage =
        error?.response?.data?.message ||
        "An error occurred. Please try again.";

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  const handleFormSubmit = async (formData) => {
    mutation.mutate(formData);
  };
  return (
    <div className="px-4  min-w-[320px] max-w-[400px] w-full  ">
      <AuthForm
        title="Welcome Back"
        description="Please enter your details to login"
        saveButton={"Login"}
        schema={formSchema}
        defaultValues={
          formData || {
            email: "",
            password: "",
          }
        }
        fields={fields}
        onSubmit={handleFormSubmit}
        isSubmitting={mutation.isPending}
      />
      <div className=" mt-4 flex flex-col">
        {/* 9227EC in hsl */}
        <Link
          to="/forgot-password"
          className="text-[hsl(273_20%_30%)] underline hover:text-[hsl(273_80%_40%)]"
        >
          Forgot Password?
        </Link>
        <p>
          {" "}
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[hsl(273_20%_30%)] underline hover:text-[hsl(273_80%_40%)]"
          >
            Create an account
          </Link>{" "}
        </p>
      </div>

      {/* <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          authService.test();
        }}
      >
        Test
      </button> */}
    </div>
  );
};

export default Login;
