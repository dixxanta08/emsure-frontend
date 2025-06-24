import { useAuth } from "@/auth/AuthContext";
import React from "react";
import { useNavigate } from "react-router-dom";
import planService from "@/features/insurance management/services/planService";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Check, Users, CreditCard, Building2 } from "lucide-react";
import { Card, Row, Col, Typography, Space, Spin } from "antd";
import Button  from '../features/client portal/components/customantd/button';
import Header from "./components/Header";

const { Title, Paragraph } = Typography;

const LandingPlans = () => {
  const { loggedInUser } = useAuth();
  const navigate = useNavigate();

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      try {
        const response = await planService.getPlans(0, 100, '', 'active');
        return response.plans;
      } catch (error) {
        console.error("Error fetching plans:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  const handlePlanClick = (planId) => {
    if (!loggedInUser) {
      navigate("/login");
      return;
    }

    if (loggedInUser.roleName === "EMPLOYEE" || loggedInUser.roleName === "EMPLOYER") {
      navigate(`/explore-plans/${planId}`);
    } else {
      navigate(`/insurance-management/plans/${planId}/details`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <Title level={2} className="text-red-600 mb-4">
            Error Loading Plans
          </Title>
          <Paragraph className="text-gray-600">
            We're sorry, but we couldn't load the insurance plans. Please try again later.
          </Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Title level={1} className="mb-6">
            Choose Your Insurance Plan
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect insurance plan that suits your needs. We offer comprehensive coverage with flexible options for both individuals and businesses.
          </Paragraph>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[32, 32]} className="mb-16">
            {plans && plans.length > 0 ? (
              plans.map((plan) => (
                <Col xs={24} sm={24} md={12} lg={8} key={plan.id}>
                  <Card
                    hoverable
                    className="h-full transition-all duration-300 hover:shadow-lg p-6"
                    onClick={() => handlePlanClick(plan.planId)}
                  >
                    <div className="mb-6">
                      <Title level={4} className="mb-3 text-xl">
                        {plan.planName}
                      </Title>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {plan.planType}
                      </Badge>
                    </div>

                    <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        Rs. {plan.price.toLocaleString()}
                        <span className="text-sm text-gray-500 ml-1">/month</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Initial: Rs. {plan.initialPayment.toLocaleString()}
                      </div>
                    </div>

                    <Paragraph className="mb-8 text-gray-600 line-clamp-3">
                      {plan.planDescription}
                    </Paragraph>

                    <Space direction="vertical" className="w-full mb-8">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-700">
                          Up to {plan.maxUsers} users
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-700">
                          Comprehensive coverage
                        </span>
                      </div>
                    </Space>

                    <Button
                      type="primary"
                      block
                      size="large"
                      onClick={() => handlePlanClick(plan.id)}
                      className="mt-4"
                    >
                      {loggedInUser ? "View Details" : "Get Started"}
                    </Button>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24} className="text-center">
                <Title level={3} className="text-gray-600">
                  No plans available at the moment
                </Title>
              </Col>
            )}
          </Row>
        )}

        <div className="mt-24 text-center">
          <Title level={2} className="mb-12">
            Why Choose Our Insurance Plans?
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card className="h-full p-6">
                <Check className="w-8 h-8 text-blue-500 mx-auto mb-6" />
                <Title level={4} className="mb-4">
                  Comprehensive Coverage
                </Title>
                <Paragraph className="text-gray-600">
                  Our plans provide extensive coverage for various medical needs
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full p-6">
                <Check className="w-8 h-8 text-blue-500 mx-auto mb-6" />
                <Title level={4} className="mb-4">
                  Flexible Options
                </Title>
                <Paragraph className="text-gray-600">
                  Choose from a range of plans that suit your specific requirements
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full p-6">
                <Check className="w-8 h-8 text-blue-500 mx-auto mb-6" />
                <Title level={4} className="mb-4">
                  24/7 Support
                </Title>
                <Paragraph className="text-gray-600">
                  Our dedicated support team is always here to help you
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default LandingPlans;
