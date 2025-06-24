import React from "react";
import { useNavigate } from "react-router-dom"; // Importing useNavigate
import Lottie from "lottie-react";
import invalidResetTokenAnimation from "@/assets/images/auth/invalid-reset-token-lottie.json";
import { Button } from "@/components/ui/button";

const InvalidResetToken = () => {
  const navigate = useNavigate();

  const handleForgotPasswordRedirect = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="w-full min-h-[100vh] h-full bg-[#fafafa] flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-md ">
        <Lottie
          className="w-64 h-64 mx-auto"
          animationData={invalidResetTokenAnimation}
          loop={true}
          alt="Email Sent"
        />
        <h2 className="my-4 text-xl text-center font-semibold text-gray-800">
          Invalid or Expired Token
        </h2>
        <p className="text-gray-500">
          The reset password token is invalid or has expired.
        </p>

        <div className="mt-6 text-center">
          <Button
            onClick={handleForgotPasswordRedirect}
            className="px-6 py-2 text-white bg-[#9227EC] hover:bg-[#771fc0] rounded-md"
          >
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvalidResetToken;
