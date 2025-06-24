import React from "react";

const Details = ({ fields, defaultValues }) => {
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const generateDynamicLink = (template, dynamicValue) => {
    // Replace the placeholder with the dynamic value
    return template.replace("{{companyId}}", dynamicValue);
  };

  return (
    <div className="grid lg:grid-cols-3 grid-cols-2 gap-8 p-4 rounded-lg shadow-md gap-x-8 bg-[#9327ec17]">
      {fields.map((field) => {
        const fieldValue = getNestedValue(defaultValues, field.name);
        let href = fieldValue;

        // Handle dynamic href if the field is dynamic
        if (field.isDynamicLink && field.hrefTemplate) {
          const dynamicValue = getNestedValue(defaultValues, "companyId"); // Replace with actual value
          href = generateDynamicLink(field.hrefTemplate, dynamicValue);
        }

        return (
          <div key={field.name} className="flex flex-col">
            <p className="text-md font-semibold text-slate-700">
              {field.label}
            </p>

            {/* Check if field is a link */}
            {field.isLink ? (
              <a
                href={href} // Dynamic href
                download={!field.isDynamicLink}
                target="_blank" // Open in new tab
                className="text-blue-500 hover:underline"
              >
                {`Download ${field.label}`}
              </a>
            ) : field.isDynamicLink ? (
              <a
                href={href} // Dynamic href
                download={!field.isDynamicLink}
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
