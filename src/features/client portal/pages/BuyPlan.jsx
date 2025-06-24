import { Button, Checkbox, Form, InputNumber } from "antd";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom"; // Updated to useNavigate
import { useQuery, useQueryClient } from "@tanstack/react-query";
import planService from "../services/planService";
import { FormItem } from "react-hook-form-antd";
import subscriptionService from "../services/subscriptionService";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  numberOfUsers: z.number().int().min(1, {
    message: "Number of users must be at least 1.",
  }),
  paymentMethod: z.string().min(1, {
    message: "Payment method is required.",
  }),
});

const BuyPlan = () => {
  const { planId } = useParams();
  const { loggedInUser } = useAuth();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfUsers: 1,
      paymentMethod: "esewa",
    },
  });

  const navigate = useNavigate(); // Using useNavigate for navigation
  const queryClient = useQueryClient();
  const {
    data: plan,
    isLoading: isPlanLoading,
    isError: isPlanError,
    error: planError,
  } = useQuery({
    queryKey: ["plan", planId],
    queryFn: async () => {
      const data = await planService.getPlan(planId);
      return {
        ...data.plan,
        isActive: data.plan.isActive ? "Active" : "Inactive",
      };
    },
    retry: false,
  });
  async function generateHMAC(
    total_amount,
    transaction_uuid,
    product_code,
    secretKey
  ) {
    // Construct the message string
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    // Encode the secret key and message
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(message);

    // Import the secret key for HMAC usage
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Generate the HMAC signature
    const signature = await crypto.subtle.sign("HMAC", key, messageData);

    // Convert the ArrayBuffer signature to a Base64 string
    const base64Signature = btoa(
      String.fromCharCode(...new Uint8Array(signature))
    );

    return base64Signature;
  }

  const onSubmit = async (data) => {
    const startDate = new Date().toISOString().split("T")[0];
    const renewalDate = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    )
      .toISOString()
      .split("T")[0];
    const totalAmount = data.numberOfUsers * plan?.initialPayment;
    const transaction_uuid =
      "emsure_" + plan?.planName + "_" + new Date().getTime();
    const product_code = "EPAYTEST";
    const secretKey = "8gBm/:&EnhH.1/q";
    let response;
    try {
      response = await subscriptionService.createSubscription({
        companyId: loggedInUser.companyId,
        planId: plan.planId,
        paymentStatus: "pending",
        subscriptionStatus: "inactive",
        numberOfUsers: data.numberOfUsers,
        startDate: startDate,
        renewalDate: renewalDate,
        paymentData: {
          status: "pending",
          type: "initialPayment",
          transactionUUID: transaction_uuid,
          totalAmount: totalAmount,
          paymentMethod: data.paymentMethod,
        },
      });
    } catch (error) {
      console.log(error);

      // Check if the error has a response property and extract the message
      const errorMessage =
        error?.response?.data?.message ||
        "There was a problem while creating the subscription.";

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessage, // Display the error message from the response
      });
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    generateHMAC(totalAmount, transaction_uuid, product_code, secretKey)
      .then((signature) => {
        console.log("HMAC Signature:", signature);
        const inputs = [
          { name: "amount", value: totalAmount },
          { name: "tax_amount", value: 0 },
          { name: "total_amount", value: totalAmount },
          { name: "transaction_uuid", value: transaction_uuid },
          { name: "product_code", value: product_code },
          { name: "product_service_charge", value: "0" },
          { name: "product_delivery_charge", value: "0" },
          {
            name: "success_url",
            value: `http://localhost:5173/payment-success/${response.payment.paymentId}`,
            // ?paymentMethod=${encodeURIComponent(data.paymentMethod)}
          },
          {
            name: "failure_url",
            value: `http://localhost:5173/payment-failed/${response.payment.paymentId}`,
          },
          {
            name: "signed_field_names",
            value: "total_amount,transaction_uuid,product_code",
          },
          {
            name: "signature",
            value: signature,
          },
        ];

        inputs.forEach((input) => {
          const inputElement = document.createElement("input");
          inputElement.type = "text";
          inputElement.name = input.name;
          inputElement.value = input.value;
          form.appendChild(inputElement);
        });

        document.body.appendChild(form);
        form.submit();
      })
      .catch((error) => {
        console.error("Error generating HMAC:", error);
      });
  };

  return (
    <div className="p-8 bg-[#fafafa] h-full">
      <div className="bg-white  shadow-md p-4 rounded-md">
        <h1 className="font-semibold text-lg text-gray-800 ">
          Plan Subscription
        </h1>
        <div className="bg-white  mt-4 rounded-md ">
          <Form
            onFinish={handleSubmit(onSubmit)}
            layout="vertical"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          >
            <FormItem
              className="font-semibold"
              label="Number of Users"
              name="numberOfUsers"
              control={control}
              help={null}
            >
              <InputNumber min={1} max={plan?.maxUsers} />
            </FormItem>

            <div>
              <Checkbox
                value={agreeToTerms}
                onChange={(e) => {
                  setAgreeToTerms(e.target.checked);
                }}
              >
                <span className="font-semibold ml-2 text">
                  {" "}
                  I agree to the{" "}
                  <a
                    href={plan?.termsAndConditionsFilePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    terms and conditions
                  </a>{" "}
                  of this insurance plan.
                </span>
              </Checkbox>
              <p className="text-gray-500 text-sm mt-4 p-4 rounded bg-blue-100">
                By proceeding, you acknowledge and accept the coverage details,
                payment terms, and renewal policies of this plan.
              </p>
            </div>
          </Form>
        </div>
      </div>
      <div className=" bg-white  shadow-md rounded-md mt-6">
        <h1 className="font-semibold text-base text-gray-800 mb-4 p-4 pb-0 ">
          Subscription Summary
        </h1>
        <div className="flex flex-col  p-4 border-b border-b-gray-200">
          <div className="flex justify-between items-center py-2 border-b border-b-gray-200">
            <p className="text-gray-500 text-sm">Plan Name</p>
            <p className="text-sm font-semibold">{plan?.planName}</p>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-b-gray-200">
            <p className="text-gray-500 text-sm">Plan Start Date</p>
            <p className="text-sm font-semibold">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </p>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-b-gray-200">
            <p className="text-gray-500 text-sm">Plan Renewal Date</p>
            <p className="text-sm font-semibold">
              {new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </p>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-b-gray-200">
            <p className="text-gray-500 text-sm"> Coverage amount per user</p>
            <p className="text-sm font-semibold">Rs.{plan?.price}</p>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-b-gray-200">
            <p className="text-gray-500 text-sm">
              Initial Payment Amount per user
            </p>
            <p className="text-sm font-semibold">Rs.{plan?.initialPayment}</p>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-b-gray-200">
            <p className="text-gray-500 text-sm">Number of users</p>
            <p className="text-sm font-semibold">{watch("numberOfUsers")}</p>
          </div>

          <div className="flex justify-between items-center py-4">
            <p className="text-black font-semibold">Total Initial Payment</p>
            <p className=" font-semibold text-lg text-blue-700">
              Rs.{watch("numberOfUsers") * plan?.initialPayment}
            </p>
          </div>
        </div>
        <div className=" bg-[#fafafa] p-4 rounded-md">
          <Button
            type="primary"
            className="w-full bg-purple-500 hover:bg-purple-800 py-4 text-base font-semibold
            disabled:hover:bg-gray-800 disabled:hover:text-gray-300 disbabled:bg-gray-300"
            size="middle"
            htmlType="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={
              !agreeToTerms
              //  ||watch("numberOfUsers") * plan?.initialPayment === 0
            }
          >
            Proceed To Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyPlan;
