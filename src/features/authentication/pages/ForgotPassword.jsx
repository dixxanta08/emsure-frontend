import React, { useState } from "react";
import authService from "../services/authService";
import AuthForm from "../components/auth-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import usePasswordResetCountdown from "../hooks/usePasswordResetCountdown";
import { z } from "zod";

const formSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address." }),
});
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "" });

  const {
    timeLeft,

    startCountdown,
    handleSuccess,
    handleError,
  } = usePasswordResetCountdown();

  const fields = [
    {
      name: "email",
      label: "Email",
      placeholder: "Enter email",
      value: formData.email,
      onChange: (e) => setFormData({ ...formData, email: e.target.value }),
    },
  ];

  const mutation = useMutation({
    mutationFn: async (email) => {
      const data = await authService.sendPasswordResetEmail(null, email);
      return data;
    },
    onSuccess: (data) => {
      handleSuccess(data);
      navigate("/email-sent");
    },
    onError: (error) => {
      handleError(error);
    },
  });

  const handleFormSubmit = (formData) => {
    mutation.mutate(formData.email);
  };

  return (
    <div className="px-4 min-w-[320px] max-w-[420px] w-full">
      <AuthForm
        title="Forgot Password"
        description="Enter your email address to reset your password"
        saveButton={"Send Email"}
        schema={formSchema}
        defaultValues={formData || { email: "" }}
        fields={fields}
        onSubmit={handleFormSubmit}
        isSubmitting={mutation.isPending}
        saveButtonDisabled={timeLeft > 0}
      />
      <div className="mt-4">
        <p className="text-sm">
          {timeLeft > 0
            ? `You can request a new email in ${timeLeft} seconds.`
            : `If you haven't received the email, you can request it again.`}
        </p>

        <p className="text-[#515158] mt-6">
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

export default ForgotPassword;
