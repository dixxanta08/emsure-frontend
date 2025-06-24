import React, { forwardRef } from "react";
import { Input as AntdInput, InputNumber, DatePicker } from "antd";
import { toDateObject } from "@/utils/dateUtils";

const { TextArea } = AntdInput;

const Input = forwardRef(
  ({ aType = "text", className = "", ...props }, ref) => {
    const customClassName =
      "!py-1.5 !px-2.5 border border-gray-500 !w-full !rounded-md disabled:bg-gray-100 disabled:text-gray-600";

    switch (aType) {
      case "number":
        return (
          <InputNumber
            ref={ref}
            className={`${customClassName}  ${className}`}
            {...props}
            size="small"
          />
        );

      case "date":
        return (
          <Input
            ref={ref}
            type="date"
            className={`${customClassName} ${className}`}
            {...props}
          />
        );

      case "textarea":
        return (
          <TextArea
            ref={ref}
            className={`${"!h-32 !resize-none !py-1.5 !px-2.5 border border-gray-500 !w-full !rounded-md"} ${className}`}
            {...props}
          />
        );

      default:
        return (
          <AntdInput
            ref={ref}
            className={`${customClassName} ${className}`}
            {...props}
          />
        );
    }
  }
);

export default Input;
