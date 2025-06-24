import React from "react";

import { FormItem as AntdFormItem } from "react-hook-form-antd";

const FormItem = ({ label, children, ...props }) => {
  return (
    <AntdFormItem
      className={`!min-h-[62px] ${props.className}`}
      label={<span className="text-xs font-medium text-black">{label}</span>}
      {...props}
    >
      {children}
    </AntdFormItem>
  );
};

export default FormItem;
