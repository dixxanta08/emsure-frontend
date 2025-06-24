import React from "react";
import { Typography, Row, Col, Card, Button, Steps } from "antd";
import {
  ShoppingCartOutlined,
  TeamOutlined,
  FileSearchOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import Header from "./components/Header";
import Footer from "./components/Footer";

const { Title, Paragraph } = Typography;

const Features = () => {
  const features = [
    {
      title: "Easy Insurance Plan Purchase",
      description:
        "Browse and compare insurance plans with just a few clicks. Our intuitive interface makes it simple to find the perfect coverage for your company.",
      icon: <ShoppingCartOutlined className="text-4xl text-blue-500" />,
      steps: [
        "Browse available plans",
        "Compare coverage options",
        "Select your plan",
        "Complete payment",
      ],
    },
    {
      title: "Employee Management",
      description:
        "Effortlessly manage your workforce with our comprehensive employee management system. Add, remove, or update employee information with ease.",
      icon: <TeamOutlined className="text-4xl text-green-500" />,
      steps: [
        "Add new employees",
        "Update information",
        "Manage coverage",
        "Track status",
      ],
    },
    {
      title: "Streamlined Claims Process",
      description:
        "File and track insurance claims effortlessly. Our system guides you through the process and keeps you updated on the status.",
      icon: <FileSearchOutlined className="text-4xl text-purple-500" />,
      steps: [
        "Submit claim details",
        "Upload documents",
        "Track progress",
        "Receive updates",
      ],
    },
    {
      title: "Secure Payment System",
      description:
        "Make payments securely and conveniently. Our platform supports multiple payment methods and provides detailed transaction history.",
      icon: <DollarOutlined className="text-4xl text-orange-500" />,
      steps: [
        "Choose payment method",
        "Enter payment details",
        "Confirm transaction",
        "Receive confirmation",
      ],
    },
  ];

  const claimProcess = [
    {
      title: "Submit Claim",
      description: "Fill out the claim form with required information",
      icon: <CheckCircleOutlined />,
    },
    {
      title: "Document Upload",
      description: "Upload necessary supporting documents",
      icon: <ClockCircleOutlined />,
    },
    {
      title: "Review Process",
      description: "Our team reviews your claim",
      icon: <SyncOutlined />,
    },
    {
      title: "Approval",
      description: "Receive claim approval and payment",
      icon: <CheckOutlined />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-[radial-gradient(ellipse_200%_100%_at_bottom_left,#9789e6,#fbfcff_100%)] text-white py-20">
        <div className="container mx-auto px-4">
          <Title level={1} className="text-center text-white mb-6">
            Powerful Features for Your Business
          </Title>
          <Paragraph className="text-center text-lg max-w-3xl mx-auto">
            Discover how Emsure simplifies employee insurance management with
            our comprehensive suite of features designed for modern businesses.
          </Paragraph>
        </div>
      </div>

      {/* Main Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} key={index}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center mb-6">
                    {feature.icon}
                    <Title level={3} className="mt-4">
                      {feature.title}
                    </Title>
                    <Paragraph className="text-gray-600">
                      {feature.description}
                    </Paragraph>
                  </div>
                  <Steps
                    direction="vertical"
                    current={-1}
                    items={feature.steps.map((step) => ({
                      title: step,
                    }))}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Claims Process Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">
            Simple Claims Process
          </Title>
          <Row gutter={[32, 32]} justify="center">
            {claimProcess.map((step, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <Title level={4}>{step.title}</Title>
                    <Paragraph className="text-gray-600">
                      {step.description}
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Title level={2} className="mb-6">
            Ready to Get Started?
          </Title>
          <Paragraph className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust Emsure for their employee
            insurance needs. Start managing your insurance plans efficiently
            today.
          </Paragraph>
          <Button type="primary" size="large" className="mr-4">
            Get Started
          </Button>
          <Button size="large">Contact Sales</Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Features;
