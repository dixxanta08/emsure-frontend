import React, { useEffect, useState } from "react";
import authService from "../services/authService";
import { useAuth } from "@/auth/AuthContext";
import AuthForm from "../components/auth-form";
import z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .nonempty({ message: "Password is required" }),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    { message: "Passwords do not match" }
  );

const ResetPassword = () => {
  const { resetPasswordToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const resetPasswordFlag = urlParams.get("reset-password");

    if (resetPasswordFlag === "true") {
      setIsReset(true);
    } else {
      setIsReset(false);
    }
  }, [location.search]);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const { toast } = useToast();
  const fields = [
    {
      name: "password",
      label: "Password",
      placeholder: "Enter password",
      type: "password",
      value: formData.password,
      onChange: (e) => setFormData({ ...formData, password: e.target.value }),
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      placeholder: "Enter confirm password",
      type: "password",
      value: formData.confirmPassword,
      onChange: (e) =>
        setFormData({ ...formData, confirmPassword: e.target.value }),
    },
  ];

  const queryClient = useQueryClient();

  const { data, error, isLoading, isPending, isFetching } = useQuery({
    queryKey: ["token", resetPasswordToken],
    queryFn: async () => {
      const data = await authService.verifyPasswordResetToken(
        resetPasswordToken
      );
      console.log("data: ", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("success data: ", data);
    },
    onError: (error) => {
      console.log("error: ", error);
    },
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: async ({ resetToken, newPassword }) => {
      const data = await authService.resetPassword(resetToken, newPassword);
      return data;
    },
    onSuccess: (data) => {
      const successMessage = data?.message || "Reset password successful";
      toast({
        variant: "success",
        title: "Reset password Successful",
        description: successMessage,
        duration: 5000,
      });
      navigate("/login");
    },
    onError: (error) => {
      console.log("Error: ", error);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 404) {
        errorMessage = "Invalid reset password token.";
      }

      toast({
        variant: "destructive",
        title: "Reset Password Failed",
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  const handleFormSubmit = async (formData) => {
    mutation.mutate({
      resetToken: resetPasswordToken,
      newPassword: formData.password,
    });
  };
  if (isLoading || isPending || isFetching) {
    return <div>Loading...</div>;
  }
  if (error) {
    navigate("/invalid-reset-token");
  }
  return (
    <div className="px-4  min-w-[320px] max-w-[420px] w-full ">
      <AuthForm
        title={isReset ? "Reset Password" : "Set Password"}
        description="Enter your new password"
        saveButton={isReset ? "Reset Password" : "Set Password"}
        schema={formSchema}
        defaultValues={
          formData || {
            password: "",
            confirmPassword: "",
          }
        }
        fields={fields}
        onSubmit={handleFormSubmit}
        isSubmitting={mutation.isPending}
      />
      <div className=" mt-4">
        <p className="text-[#515158]">
          Remembered Password? &nbsp;
          <Link
            to="/login"
            className="text-[hsl(273_20%_30%)] underline hover:text-[hsl(273_80%_40%)]"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
