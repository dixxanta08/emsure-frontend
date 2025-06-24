import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Lottie from "lottie-react";
import paymentSuccessAnimation from "@/assets/images/payment/payment-success-lottie.json";
import { Button } from "antd";
import claimService from "../services/claimService";
import { useToast } from "@/hooks/use-toast";

// Move the decryption function outside of the component for optimization
const decryptPaymentResponse = (encodedResponse) => {
  const decodedResponse = atob(encodedResponse);
  const responseData = JSON.parse(decodedResponse);
  console.log("Decoded Response:", responseData);

  const {
    transaction_code,
    status,
    total_amount,
    transaction_uuid,
    product_code,
    signature,
  } = responseData;

  return {
    transactionCode: transaction_code,
    status,
    totalAmount: total_amount,
    transactionUuid: transaction_uuid,
    productCode: product_code,
    signature,
  };
};

const ClaimPaymentSuccess = () => {
  const { employeeSubscriptionClaimPaymentId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const data = queryParams.get("data");
  const [claimId, setClaimId] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Memoize the payment data to avoid recalculation on each render
  const paymentData = useMemo(() => {
    if (data) {
      return decryptPaymentResponse(data);
    }
    return {};
  }, [data]);

  useEffect(() => {
    const updatePaymentStatus = async () => {
      const status = paymentData?.status?.toLowerCase();

      try {
        const response = await claimService.updateClaimPaymentStatus(
          employeeSubscriptionClaimPaymentId,
          {
            status: "complete"
          }
        );
        console.log("Payment Update Response", response);
        setClaimId(response.payment.Claim.claimId);
        toast({
          variant: "success",
          title: "Claim Payment Successful",
          description: "Your claim payment has been processed successfully.",
        });
      } catch (error) {
        console.error("Error updating payment status:", error);
        toast({
          variant: "destructive",
          title: "Payment Update Failed",
          description: "There was an error updating your payment status.",
        });
      }
    };

    if (paymentData.status) {
      updatePaymentStatus();
    }
  }, [paymentData, employeeSubscriptionClaimPaymentId, toast]);

  return (
    <div className="w-full min-h-[100vh] h-full bg-[#fafafa] flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-md ">
        <Lottie
          className="w-64 h-64 mx-auto"
          animationData={paymentSuccessAnimation}
          loop={true}
          alt="Payment Success"
        />
        <h2 className="my-4 text-xl text-center font-semibold text-gray-800">
          Claim Payment Successful
        </h2>
        <p className="text-gray-500">
          Your claim payment was successful. You can now view your claim details.
        </p>

        <div className="mt-6 text-center">
          {claimId && (
            <Button
              onClick={() =>
                navigate(`/subscription-management/claims/${claimId}/details`)
              }
              className="px-6 py-2 text-white bg-[#9227EC] hover:bg-[#771fc0] rounded-md"
            >
              View Claim
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimPaymentSuccess;
