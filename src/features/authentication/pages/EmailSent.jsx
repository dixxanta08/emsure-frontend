import React from "react";
import { useNavigate } from "react-router-dom"; // Importing useNavigate
import Lottie from "lottie-react";
import emailSentAnimation from "@/assets/images/auth/email-sent-lottie.json";
import { Button } from "@/components/ui/button";

const EmailSent = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="w-full min-h-[100vh] h-full bg-[#fafafa] flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-md ">
        <Lottie
          className="w-64 h-64 mx-auto"
          animationData={emailSentAnimation}
          loop={true}
          alt="Email Sent"
        />
        <h2 className="my-4 text-xl text-center font-semibold text-gray-800">
          Check your email
        </h2>
        <p className="text-gray-500">
          We have sent you instructions on how to reset your password.
        </p>

        <div className="mt-6 text-center">
          <Button
            onClick={handleLoginRedirect}
            className="px-6 py-2 text-white bg-[#9227EC] hover:bg-[#771fc0] rounded-md"
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailSent;
