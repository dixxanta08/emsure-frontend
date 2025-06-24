import React from "react";

const Details = ({ fields, defaultValues }) => {
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  // const generateDynamicLink = (template, dynamicValue) => {
  //   // Replace the placeholder with the dynamic value
  //   return template.replace("{{companyId}}", dynamicValue);
  // };
  const generateDynamicLink = (template, defaultValues) => {
    // Replace placeholders with actual values from defaultValues
    return template.replace(/{{(.*?)}}/g, (_, key) =>
      getNestedValue(defaultValues, key)
    );
  };

  return (
    <div className="grid lg:grid-cols-3 grid-cols-2 gap-8 p-4 rounded-lg shadow-md gap-x-8 bg-[#9327ec17]">
      {fields.map((field) => {
        const fieldValue = getNestedValue(defaultValues, field.name);
        let href = fieldValue;

        // Handle dynamic href if the field is dynamic
        if (field.type === "dynamiclink" && field.hrefTemplate) {
          // Use `getNestedValue` to get the actual value for the dynamic field (e.g., planId)
          console.log("defaultValues: ", defaultValues);
          console.log("field.name: ", field.name);
          const dynamicValue = getNestedValue(defaultValues, field.name); // dynamicValue will be `planId`, `subscriptionId`, etc.
          href = generateDynamicLink(field.hrefTemplate, defaultValues);
        }

        return field.type === "description" ? (
          <div key={field.name} className="col-span-full flex flex-col">
            <p className="text-md font-semibold text-slate-700">
              {field.label}
            </p>
            <p className="text-sm font-normal">{fieldValue}</p>
          </div>
        ) : (
          <div key={field.name} className="flex flex-col">
            <p className="text-md font-semibold text-slate-700">
              {field.label}
            </p>

            {/* Check if field is a link */}
            {field.type === "link" ? (
              <a
                href={fieldValue ? href : undefined}
                download={fieldValue && !field.type != "dynamiclink"}
                target="_blank"
                className={`${
                  fieldValue
                    ? "text-blue-500 hover:underline cursor-pointer"
                    : "text-gray-500 cursor-not-allowed"
                }`}
              >
                {`Download ${field.label}`}
              </a>
            ) : field.type === "dynamiclink" ? (
              <a
                href={href}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                {fieldValue}
              </a>
            ) : (
              <p className="text-sm font-normal">{fieldValue}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Details;
