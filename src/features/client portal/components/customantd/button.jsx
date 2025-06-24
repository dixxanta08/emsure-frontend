import React from "react";
import { Button as AntdButton } from "antd";

// Define a custom Button component with icon support
const Button = ({
  variant = "primary",
  className = "",
  icon,
  isLoading = false,
  ...props
}) => {
  // Define button style based on variant
  let buttonStyle = "";

  switch (variant) {
    case "primary":
      buttonStyle =
        "bg-purple-500 text-white border border-purple-500 hover:bg-purple-600 hover:border-purple-600";
      break;
    case "secondary":
      buttonStyle =
        "bg-gray-500 text-white border border-gray-500 hover:bg-gray-600 hover:border-gray-600";
      break;
    case "outline":
      buttonStyle =
        "bg-transparent text-purple-500 border border-purple-500 hover:bg-purple-100 hover:border-purple-600";
      break;
    case "secondary-outline":
      buttonStyle =
        "bg-transparent text-gray-500 border border-gray-500 hover:bg-gray-100 hover:border-gray-600";
      break;
    case "danger":
      buttonStyle =
        "bg-red-700 text-white border border-red-700 hover:bg-red-200 hover:border-red-200";
      break;
    case "empty":
      buttonStyle =
        "text-gray-800 bg-transparent border-none hover:bg-transparent hover:text-gray-900";
      break;
    default:
      buttonStyle =
        "bg-purple-500 text-white border border-purple-500 hover:bg-purple-600 hover:border-purple-600";
  }

  return (
    <AntdButton
      className={`${buttonStyle} !p-4 text-sm ${className}`} // Apply variant styles and custom class
      icon={icon}
      loading={isLoading}
      {...props}
    />
  );
};

export default Button;
