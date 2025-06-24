import { Select as AntdSelect } from "antd";
import React from "react";

const Select = ({ className = "", ...props }) => {
  const customClassName = "!min-h-[33.6px] disabled:bg-gray-100 disabled:text-gray-600 ";
  return (
    <AntdSelect
      className={` ${customClassName} ${className}`} // Add custom and passed classes
      {...props}
    />
  );
};

Select.Option = AntdSelect.Option;

export default Select;
