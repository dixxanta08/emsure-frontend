import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import subscriptionService from "../services/subscriptionService";
import Lottie from "lottie-react";
import paymentFailureAnimation from "@/assets/images/payment/payment-failed-lottie.json";
import { Button } from "antd";

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

const PaymentFailed = () => {
  const { paymentId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const data = queryParams.get("data");
  const [subscriptionId, setSubscriptionId] = useState(null);
  const navigate = useNavigate();

  // Memoize the payment data to avoid recalculation on each render
  const paymentData = useMemo(() => {
    if (data) {
      return decryptPaymentResponse(data);
    }
    return {};
  }, [data]);

  console.log("decrypted data", paymentData);

  useEffect(() => {
    const updatePaymentStatus = async () => {
      const status = paymentData?.status?.toLowerCase();

      try {
        const response =
          await subscriptionService.updateSubscriptionPaymentStatus(paymentId, {
            status,
          });
        setSubscriptionId(response.planSubscription.subscriptionId);
      } catch (error) {
        console.error("Error updating payment status:", error);
      }
    };

    if (paymentData.status) {
      updatePaymentStatus();
    }
  }, [paymentData, paymentId]);

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
          Payment Failed
        </h2>
        <p className="text-gray-500">Your payment failed. Try again later.</p>

        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate(`/explore-plans/`)}
            className="px-6 py-2 text-white bg-[#9227EC] hover:bg-[#771fc0] rounded-md"
          >
            Explore Plans
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
