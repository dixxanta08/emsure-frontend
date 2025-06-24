import React, { useState } from "react";
import { Form, Input, Button, Steps, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, BankOutlined } from "@ant-design/icons";
import apiService from "@/services/apiService";

const CompanyRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: "Personal Information",
      icon: <UserOutlined />,
    },
    {
      title: "Company Details",
      icon: <BankOutlined />,
    },
  ];
  const handleNext = async () => {
    try {
      const fieldsToValidate =
        currentStep === 0
          ? ["name", "email", "password"]
          : ["companyName", "companyEmail", "companyRegistrationNumber"];
  
      await form.validateFields(fieldsToValidate);
  
      const values = form.getFieldsValue();
      
      // Reset the form with previously entered values when changing steps
      form.setFieldsValue({
        name: values.name || "",
        email: values.email || "",
        password: values.password || "",
        companyName: values.companyName || "",
        companyEmail: values.companyEmail || "",
        companyRegistrationNumber: values.companyRegistrationNumber || "",
      });
  
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };
  

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const formData = {
        name: values.name,
        email: values.email,
        password: values.password,
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        companyRegistrationNumber: values.companyRegistrationNumber
      };

      const response = await apiService.signup(formData);
      message.success("Registration successful!");
      // Handle successful registration (e.g., redirect to login)
    } catch (error) {
      message.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Steps current={currentStep} items={steps} className="mb-8" />
      <Form
        form={form}
        layout="vertical"
        className="bg-white p-6 rounded-lg shadow-md"
      >
        {/* Personal Information Fields */}
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 8, message: "Password must be at least 8 characters" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>
        </div>

        {/* Company Details Fields */}
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[{ required: true, message: "Please enter company name" }]}
          >
            <Input prefix={<BankOutlined />} placeholder="Enter company name" />
          </Form.Item>
          <Form.Item
            name="companyEmail"
            label="Company Email"
            rules={[
              { required: true, message: "Please enter company email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter company email" />
          </Form.Item>
          <Form.Item
            name="companyRegistrationNumber"
            label="Company Registration Number"
            rules={[{ required: true, message: "Please enter registration number" }]}
          >
            <Input prefix={<BankOutlined />} placeholder="Enter registration number" />
          </Form.Item>
        </div>

        <div className="flex justify-between mt-6">
          {currentStep > 0 && (
            <Button onClick={handlePrevious}>Previous</Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
            >
              Submit
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default CompanyRegistrationForm; 