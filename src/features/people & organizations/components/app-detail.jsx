import { Button } from "@/components/ui/button";
import React from "react";

const Details = ({ fields, defaultValues }) => {
  return (
    <div className="grid lg:grid-cols-3 grid-cols-2 gap-8 p-4 rounded-lg shadow-md gap-x-8 bg-[#9327ec17]">
      {fields.map((field, index) => (
        <div key={field.name} className="flex flex-col">
          <p className="text-md font-semibold text-slate-700">{field.label}</p>
          <p className="text-sm font-normal">{defaultValues[field.name]}</p>
        </div>
      ))}
    </div>
  );
};

export default Details;
