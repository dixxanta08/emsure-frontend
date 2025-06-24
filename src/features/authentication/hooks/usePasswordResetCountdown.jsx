import { useState, useEffect, useRef, useCallback } from "react";
import { getCookie, setCookie } from "@/utils/cookieUtils";
import { useToast } from "@/hooks/use-toast";

const usePasswordResetCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const countdownRef = useRef(null);
  const { toast } = useToast();

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
        countdownRef.current = null;
        setTimeLeft(0); // Reset to 0 when countdown is over
      }
    }, 1000);
  }, []);

  // Effect to check the time left when the component mounts
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

  // Function to handle success after sending email request
  const handleSuccess = (data) => {
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
  };

  // Function to handle error when the request fails
  const handleError = (error) => {
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
      error?.response?.data?.message || "An error occurred. Please try again.";
    toast({
      variant: "destructive",
      title: "Request Failed",
      description: errorMessage,
      duration: 5000,
    });
  };

  return {
    timeLeft,
    startCountdown,
    handleSuccess,
    handleError,
  };
};

export default usePasswordResetCountdown;
