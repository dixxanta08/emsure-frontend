"use client";
import { useState } from "react";
import { Modal, Form, message, Avatar } from "antd";
import { UploadOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "@/auth/AuthContext";
import userSerivce from "../services/userService"; // Import userService
import FormItem from "../../client portal/components/customantd/formitem";

import Input from "../../client portal/components/customantd/input";
import Button from "../../client portal/components/customantd/button";

import FileUploader from "@/components/extended-ui/file-uploader";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PasswordResetButton from "../components/send-password-mail-button";
import usePasswordResetCountdown from "../hooks/usePasswordResetCountdown";
const formSchema = z.object({
  name: z
    .string()
    .nonempty("Please enter your name")
    .max(64, "Name cannot be more than 64 characters")
    .min(1, "Name cannot be empty")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  phoneNumber: z
    .string()
    .nonempty("Please enter your phone number")
    .max(15, "Phone number cannot be more than 15 characters")
    .min(1, "Phone number cannot be empty")
    .regex(/^[0-9\s]+$/, "Phone number can only contain numbers and spaces"),
  imageUrl: z.string().optional(),
});

export default function ProfilePage() {
  const { loggedInUser: user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);

  const { control, handleSubmit, setValue, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
      imageUrl: user?.imageUrl || "",
    },
  });

  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (userData) => {
      return userSerivce.updateUser(userData);
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Profile updated successfully",
        description: "User has been updated successfully.",
      });
      refreshUser();
      if (user?.roleName === "EMPLOYEE" || user?.roleName === "EMPLOYER") {
        navigate(`/user-profile`);
      } else {
        navigate(`/profile`);
      }
      setModalVisible(false);
      reset();
    },
    onError: (error) => {
      console.error("Failed to update user:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while updating user.",
      });
    },
  });

  const onSubmit = async (values) => {
    const formData = { ...values, userId: user.userId };
    mutation.mutate(formData);
  };
  const { timeLeft, startCountdown, handleSuccess, handleError } =
    usePasswordResetCountdown();

  return (
    <div className="p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-black">Profile</h1>
        <div className="flex items-center space-x-4">
          {" "}
          <PasswordResetButton
            userId={user?.userId}
            timeLeft={timeLeft}
            disabled={timeLeft > 0} // Check isActive state
            onSuccess={handleSuccess}
            onError={handleError}
            buttonTitle={`Send Reset Link `}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setModalVisible(true);
              setValue("name", user.name);
              setValue("phoneNumber", user.phoneNumber);
              setValue("imageUrl", user.imageUrl);
            }}
          >
            Edit Profile
          </Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:justify-start items-center space-x-6 p-4 border rounded-lg shadow-lg bg-white">
        <Avatar
          size={144}
          src={user.profileImageURL}
          className="border-4 border-indigo-500 rounded-full"
        />
        <div className="space-y-2 mt-8 md:mt-0">
          <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-gray-600">📞 {user.phoneNumber}</p>
          <p className="text-gray-600">✉️ {user.email}</p>
          <p className="text-gray-600">🔑 {user.roleName}</p>
        </div>
      </div>

      <Modal
        title="Edit Profile"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <FormItem
            name="name"
            control={control}
            label="Name"
            help={null}
            // validateStatus={fieldState.error ? "error" : ""}
          >
            <Input />
          </FormItem>

          {/* Phone */}
          <FormItem name="phoneNumber" control={control} label="Phone">
            <Input />
          </FormItem>

          <FormItem
            label="Upload Image"
            name="imageUrl"
            control={control}
            className="!h-auto"
          >
            <FileUploader />
          </FormItem>

          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
