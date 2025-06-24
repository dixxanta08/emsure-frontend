import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatToDateInput } from "@/utils/dateUtils";
import Details from "../components/app-detail";
import AppDataTable from "@/components/app-data-table";
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import policyService from "../services/policyService";
import { Modal } from "antd";
import { set } from "date-fns";
import { useAuth } from "@/auth/AuthContext";

const PoliciesDetail = () => {
  const { loggedInUser } = useAuth();
  const isAgent = useMemo(() => {
    return loggedInUser.roleName === "AGENT";
  }, [loggedInUser.roleName]);

  const fields = [
    { name: "policyId", label: "Policy Id" },
    { name: "policyName", label: "Policy Name" },
    {
      name: "amount",
      label: "Coverage Amount",
    },
    {
      name: "maxUsers",
      label: "Max Users",
    },
    {
      name: "termsAndConditionsFilePath",
      label: "Terms and Conditions",
      type: "link",
      href: "termsAndConditionsFilePath",
    },
    {
      name: "PaymentInfo.premiumCalculation",
      label: "Premuim Calculation",
    },

    {
      name: "PaymentInfo.paymentFrequency",
      label: "Payment Frequency",
    },

    {
      name: "PaymentInfo.latePaymentPenalties",
      label: "Late Payment Penalties",
    },
    { name: "isPolicyActive", label: "Status", type: "switch" },
    { name: "description", label: "Description" },
  ];

  const { policyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: policyData,
    isLoading: isPolicyLoading,
    isError: isPolicyError,
    error: policyError,
  } = useQuery({
    queryKey: ["policy", policyId],
    queryFn: async () => {
      const data = await policyService.getPolicy(policyId);
      return {
        ...data.policy,
        isPolicyActive: data.policy.isActive ? "Active" : "Inactive",
      };
    },
    retry: false,
  });
  const columns = [
    {
      header: "Benefit",
      accessorKey: "benefitName",
    },
    {
      header: "Description",
      accessorKey: "benefitDescription",
    },
    {
      header: "In Network Max Coverage",
      accessorKey: "inNetworkMaxCoverage",
    },

    {
      header: "Out Network Max Coverage",
      accessorKey: "outNetworkMaxCoverage",
    },
  ];
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const handleRowClick = (row) => {
    console.log(row);
    setModalOpen(true);
    setSelectedRow(row);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
  };

  return (
    <div className="p-8 bg-[#fafafa] h-full ">
      <div className="bg-white p-4 ">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="icon"
              onClick={() => {
                navigate(-1);
              }}
            >
              <ArrowLeft className="cursor-pointer" />
            </Button>
            <h1 className="font-bold text-lg text-gray-800">
              {policyData?.policyName}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className=" text-[#9227ec]">
              <span className="text-xl font-bold ">
                Rs.{policyData?.amount}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Policy ID: {policyData?.policyId}
            </p>
          </div>
          {policyData?.isActive && (
            <p className="text-xs border border-green-500  bg-green-200 rounded-3xl px-2 py-1 text-green-800">
              Active
            </p>
          )}
        </div>

        <div className=" p-4 mt-4  rounded-md flex flex-col gap-8 mb-4">
          <div className="w-full grid grid-cols-2 gap-4">
            {/* <div>
              <h3 className="text-sm font-medium text-gray-500">Max Users</h3>
              <p className="text-black font-semibold">{planData.maxUsers}</p>
            </div> */}
            {/* <div>
              <h3 className="text-sm font-medium text-gray-500">
                Initial Payment
              </h3>
              <p className="text-black  font-semibold">
                Rs.{planData.initialPayment}
              </p>
            </div> */}
            {/* <div>
              <h3 className="text-sm font-medium text-gray-500">Plan Type</h3>
              <p className="text-black  font-semibold">
                {planData.planType.charAt(0).toUpperCase() +
                  planData.planType.slice(1)}
              </p>
            </div> */}
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Network Medical Facilities
              </h3>
              <ul className="list-disc list-inside">
                {policyData?.MedicalFacilities?.map((facility) => (
                  <li
                    key={facility.medicalFacilityId}
                    className="text-gray-800 text-sm font-medium leading-relaxed"
                  >
                    <Link
                      to={`/insurance-management/medical-facilities/${facility.medicalFacilityId}/details`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {facility.medicalFacilityName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 mt-4">
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="text-sm  text-gray-500 ">
                {policyData?.description}
              </p>
            </div>
            {/* <div className="col-span-2">
              <a
                className="text-sm font-semibold text-blue-800 underline flex items-center"
                href={planData.termsAndConditionsFilePath}
              >
                <span>View Terms & conditions</span>
                <FaExternalLinkAlt className="ml-2" />
              </a>
            </div> */}
          </div>
          <hr />
        </div>
        <div className="mt-8">
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="font-semibold text-md text-gray-800">Benefits</h2>
          </div>
          <AppDataTable
            rowIdKey="benefitId"
            columns={columns}
            data={policyData?.Benefits}
            loading={isPolicyLoading}
            error={isPolicyError}
            onRowClick={handleRowClick}
          />
          <Modal
            title="Benefit"
            onClose={handleCloseModal}
            onCancel={handleCloseModal}
            open={modalOpen}
            footer={null}
          >
            <div className="flex flex-col gap-4 mt-4 p-4">
              {selectedRow && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Benefit Name
                    </h3>
                    <p className="text-black font-semibold">
                      {selectedRow.benefitName}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Frequency
                    </h3>
                    <p className="text-black  font-semibold">
                      {selectedRow.frequency.charAt(0).toUpperCase() +
                        selectedRow.frequency.slice(1).toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      In Network Pay
                    </h3>
                    <p className="text-black  font-semibold">
                      {selectedRow.inNetworkPay}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      In Network Max Coverage
                    </h3>
                    <p className="text-black  font-semibold">
                      Rs.{selectedRow.inNetworkMaxCoverage}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Out Network Pay
                    </h3>
                    <p className="text-black  font-semibold">
                      {selectedRow.outNetworkPay}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Out Network Max Coverage
                    </h3>
                    <p className="text-black  font-semibold">
                      Rs.{selectedRow.outNetworkMaxCoverage}
                    </p>
                  </div>
                  {selectedRow.copayType === "percentage" ? (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Copay Percentage
                      </h3>
                      <p className="text-black  font-semibold">
                        {selectedRow.copayPercentage}%
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Copay Amount
                      </h3>
                      <p className="text-black  font-semibold">
                        Rs.{selectedRow.copayAmount}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Modal>
        </div>
      </div>
      {!isAgent && (
        <div className="flex items-center gap-4 m-auto justify-center  w-full mt-8 mb-8">
          <Button
            variant="outline"
            className="w-[120px] bg-[hsl(273,83.8%,53.9%)] text-white"
            onClick={() =>
              navigate(`/insurance-management/policies/${policyId}`)
            }
          >
            <Pencil /> Edit Policy
          </Button>
        </div>
      )}
    </div>
  );
};

export default PoliciesDetail;
