import React, { useState, useEffect, useRef, useCallback } from "react";
import authService from "../services/authService";
import AuthForm from "../components/auth-form";
import z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { getCookie, setCookie } from "@/utils/cookieUtils";

const formSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address." }),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "" });
  const [timeLeft, setTimeLeft] = useState(0); // 0 means no countdown running, -1 means not available
  const countdownRef = useRef(null); // Use useRef to store the interval reference

  const { toast } = useToast();
  const fields = [
    {
      name: "email",
      label: "Email",
      placeholder: "Enter email",
      value: formData.email,
      onChange: (e) => setFormData({ ...formData, email: e.target.value }),
    },
  ];

  // Countdown logic
  const startCountdown = useCallback((timeLeftInMillis) => {
    let timeRemaining = Math.floor(timeLeftInMillis / 1000); // Convert to seconds for display
    setTimeLeft(timeRemaining);

    // Clear any existing interval
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    countdownRef.current = setInterval(() => {
      timeRemaining -= 1;
      setTimeLeft(timeRemaining); // Update state with the remaining time

      if (timeRemaining <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null; // Clear interval reference
        setTimeLeft(0); // Reset to 0 when countdown is over
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const storedTime = getCookie("timeUntilNextResetRequest");

    if (storedTime) {
      const storedTimestamp = new Date(storedTime);
      const currentTime = new Date();
      const timeLeftInMillis = storedTimestamp - currentTime;

      if (timeLeftInMillis > 0) {
        startCountdown(timeLeftInMillis); // Start countdown if time is left
      } else {
        setTimeLeft(0); // No time left, reset to 0
      }
    }

    return () => {
      // Cleanup countdown interval on unmount
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [startCountdown]);

  const mutation = useMutation({
    mutationFn: async (email) => {
      const data = await authService.sendPasswordResetEmail(null, email);
      return data;
    },
    onSuccess: (data) => {
      const timeUntilNextResetRequest = data.timeUntilNextResetRequest;
      const storedTimestamp = new Date(timeUntilNextResetRequest);
      const currentTime = new Date();
      const timeLeftInMillis = storedTimestamp - currentTime;

      setCookie(
        "timeUntilNextResetRequest",
        timeUntilNextResetRequest,
        Math.ceil(timeLeftInMillis / 1000), // Store remaining time in seconds
        "seconds"
      );
      startCountdown(timeLeftInMillis); // Restart the countdown

      const successMessage =
        "Check your email for instructions to reset your password.";
      toast({
        variant: "success",
        title: "Email Sent",
        description: successMessage,
        duration: 10000,
      });
      navigate("/email-sent");
    },
    onError: (error) => {
      if (error?.response?.status === 429) {
        const timeUntilNextResetRequest =
          error?.response?.data?.timeUntilNextResetRequest;

        const storedTimestamp = new Date(timeUntilNextResetRequest);
        const currentTime = new Date();
        const timeLeftInMillis = storedTimestamp - currentTime;

        setCookie(
          "timeUntilNextResetRequest",
          timeUntilNextResetRequest,
          Math.ceil(timeLeftInMillis / 1000),
          "seconds"
        );
        startCountdown(timeLeftInMillis); // Restart countdown with new time
      }

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
        {/* Display countdown message */}
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
