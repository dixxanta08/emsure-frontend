import React, { useState } from "react";
import planService from "../services/planService";
import { useQuery } from "@tanstack/react-query";
import { Button, Empty, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SearchBar from "@/components/app-searchbar";

const ExplorePlans = () => {
  const navigate = useNavigate();

  const [plansPageIndex, setPlansPageIndex] = useState(0);
  const [plansPageSize, setPlansPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: plansData,
    error: plansError,
    isLoading: plansIsLoading,
  } = useQuery({
    queryKey: ["plans", plansPageIndex, plansPageSize, searchTerm],
    queryFn: async () => {
      const data = await planService.getPlans(
        plansPageIndex,
        plansPageSize,
        searchTerm,
        "active"
      );
      return data;
    },
    retry: false,
  });

  const handlePageChange = (page, pageSize) => {
    setPlansPageIndex(page - 1); // Ant Design starts pages at 1, so subtract 1
    setPlansPageSize(pageSize);
  };

  if (plansIsLoading) {
    return (
      <div className="h-full">
        <Loader2 className="animate-spin m-auto" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 h-full">
      <div className="container mx-auto p-8 h-full bg-white">
        <h1 className="text-lg font-semibold mb-8">Explore Plans</h1>

        <SearchBar onSearchClick={(value) => setSearchTerm(value)} />

        <div className="mt-8">
          {plansError && <div>Error: {plansError.message}</div>}
          {plansData?.plans?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plansData.plans.map((plan) => (
                  <PlanCard plan={plan} key={plan.planId} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <Pagination
                  current={plansPageIndex + 1}
                  total={plansData.pagination.totalItems}
                  pageSize={plansPageSize}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={[10, 20, 30]}
                />
              </div>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No plans found"
              className="mt-8 border border-gray-200 p-16 rounded-md"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const PlanCard = ({ plan }) => {
  const navigate = useNavigate();

  return (
    <div key={plan.planId} className="border p-4 rounded-md shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-sm">{plan.planName}</h2>
        <p className="text-lg font-semibold">Rs. {plan.price}</p>
      </div>
      <p className="text-gray-500">
        {plan.planType.charAt(0).toUpperCase() + plan.planType.slice(1)}
      </p>
      <p className="text-gray-500 text-sm mt-4">{plan.description}</p>
      <Button
        className="w-full p-4 mt-8 bg-[#9227ec] text-md font-semibold 
          hover:!bg-white hover:!border-[#9227ec] hover:!text-[#9227ec]"
        type="primary"
        onClick={() => navigate(`/explore-plans/${plan.planId}`)}
      >
        View Plan
      </Button>
    </div>
  );
};

export default ExplorePlans;
