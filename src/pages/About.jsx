import React from "react";
import { Typography, Row, Col, Card, Avatar, Statistic } from "antd";
import {
  TeamOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import Header from "./components/Header";
import Footer from "./components/Footer";

const { Title, Paragraph } = Typography;

const About = () => {
  const stats = [
    {
      title: "Active Users",
      value: "10,000+",
      icon: <TeamOutlined className="text-4xl text-blue-500" />,
    },
    {
      title: "Insurance Plans",
      value: "50+",
      icon: <SafetyCertificateOutlined className="text-4xl text-green-500" />,
    },
    {
      title: "Coverage Areas",
      value: "100+",
      icon: <GlobalOutlined className="text-4xl text-purple-500" />,
    },
    {
      title: "Satisfied Clients",
      value: "5,000+",
      icon: <HeartOutlined className="text-4xl text-red-500" />,
    },
  ];

  const teamMembers = [
    {
      name: "Sidharth Dhakal",
      role: "CEO & Founder",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
    {
      name: "Kriti Shrestha",
      role: "Insurance Director",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
    {
      name: "Mahesh Joshi",
      role: "Customer Success",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className=" bg-[radial-gradient(ellipse_200%_100%_at_bottom_left,#9789e6,#fbfcff_100%)] text-white py-20">
        <div className="container mx-auto px-4">
          <Title level={1} className="text-center text-white mb-6">
            About Emsure
          </Title>
          <Paragraph className="text-center text-lg max-w-3xl mx-auto">
            Emsure is revolutionizing the insurance industry by providing
            comprehensive employee medical insurance solutions. We connect
            companies with the best insurance providers to ensure the health and
            well-being of their workforce.
          </Paragraph>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Row gutter={[32, 32]} justify="center">
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center">
                    {stat.icon}
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      className="mt-4"
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2}>Our Mission</Title>
              <Paragraph className="text-lg">
                At Emsure, our mission is to simplify and streamline the process
                of providing medical insurance to employees. We believe that
                every company, regardless of size, should have access to quality
                healthcare coverage for their workforce.
              </Paragraph>
              <Paragraph className="text-lg">
                Through our innovative platform, we connect businesses with
                trusted insurance providers, making it easier to manage and
                administer employee benefits.
              </Paragraph>
            </Col>
            <Col xs={24} md={12}>
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Mission"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">
            Our Leadership Team
          </Title>
          <Row gutter={[32, 32]} justify="center">
            {teamMembers.map((member, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <Avatar size={120} src={member.image} className="mb-4" />
                  <Title level={4}>{member.name}</Title>
                  <Paragraph className="text-gray-600">{member.role}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">
            Our Core Values
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <Title level={4} className="text-center">
                  Integrity
                </Title>
                <Paragraph className="text-center">
                  We operate with honesty and transparency in all our dealings.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <Title level={4} className="text-center">
                  Innovation
                </Title>
                <Paragraph className="text-center">
                  We continuously improve our platform to better serve our
                  clients.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <Title level={4} className="text-center">
                  Customer Focus
                </Title>
                <Paragraph className="text-center">
                  We prioritize our clients' needs and satisfaction above all
                  else.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <Title level={4} className="text-center">
                  Excellence
                </Title>
                <Paragraph className="text-center">
                  We strive for excellence in every aspect of our service.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
