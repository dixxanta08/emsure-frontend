import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Lottie from "lottie-react";
import paymentFailureAnimation from "@/assets/images/payment/payment-failed-lottie.json";
import { Button } from "antd";
import claimService from "../services/claimService";
import { useToast } from "@/hooks/use-toast";

// Move the decryption function outside of the component for optimization
const decryptPaymentResponse = (encodedResponse) => {
  try {
    console.log("Raw encoded response:", encodedResponse);
    const decodedResponse = atob(encodedResponse);
    console.log("Decoded response string:", decodedResponse);
    const responseData = JSON.parse(decodedResponse);
    console.log("Parsed response data:", responseData);

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
  } catch (error) {
    console.error("Error decrypting response:", error);
    return {};
  }
};

const ClaimPaymentFailed = () => {
  const { employeeSubscriptionClaimPaymentId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const data = queryParams.get("data");
  console.log("Raw query params:", window.location.search);
  console.log("Data from query params:", data);
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
      try {
        // For eSewa, we need to check the actual status from the response
        const status = paymentData?.status?.toLowerCase();
        console.log("Payment status:", status);
        
        // Only update if we have a valid status
        if (status) {
          const response = await claimService.updateClaimPaymentStatus(
            employeeSubscriptionClaimPaymentId,
            {
              status: status
            }
          );
          console.log("Payment Update Response", response);
          setClaimId(response.payment.Claim.claimId);
          
          if (status === "complete") {
            toast({
              variant: "success",
              title: "Claim Payment Successful",
              description: "Your claim payment has been processed successfully.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Claim Payment Failed",
              description: "There was an error processing your claim payment. Please try again.",
            });
          }
        } else {
          console.log("No valid status found in payment data");
        }
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
    } else {
      console.log("No payment data status found");
    }
  }, [paymentData, employeeSubscriptionClaimPaymentId, toast]);

  return (
    <div className="w-full min-h-[100vh] h-full bg-[#fafafa] flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-md ">
        <Lottie
          className="w-64 h-64 mx-auto"
          animationData={paymentFailureAnimation}
          loop={true}
          alt="Payment Failed"
        />
        <h2 className="my-4 text-xl text-center font-semibold text-gray-800">
          Claim Payment Failed
        </h2>
        <p className="text-gray-500">
          Your claim payment was not successful. Please try again later.
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

export default ClaimPaymentFailed;
