import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import subscriptionService from "../services/subscriptionService";

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

const MonthlyPaymentSuccess = () => {
  const { employeeSubscriptionPaymentId } = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const data = queryParams.get("data");

  // Memoize the payment data to avoid recalculation on each render
  const paymentData = useMemo(() => decryptPaymentResponse(data), [data]);

  useEffect(() => {
    const updatePaymentStatus = async () => {
      const status = paymentData.status.toLowerCase();

      try {
        const response =
          await subscriptionService.updateEmployeeSubscriptionPaymentStatus(
            employeeSubscriptionPaymentId,
            {
              status,
            }
          );
        console.log("Payment Update Response", response);
      } catch (error) {
        console.error("Error updating payment status:", error);
      }
    };

    updatePaymentStatus();
  }, [paymentData.status, employeeSubscriptionPaymentId]);

  return (
    <div>
      <h2>Payment Success</h2>
      <p>Subscription ID: {employeeSubscriptionPaymentId}</p>
      <p>Data: {data}</p>
      <p>Payment Data: {paymentData.totalAmount}</p>
    </div>
  );
};

export default MonthlyPaymentSuccess;
