import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const AuthForm = ({
  title,
  description,
  saveButton,
  schema,
  defaultValues,
  fields,
  onSubmit,
  isSubmitting,
  saveButtonDisabled,
}) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);
  return (
    <>
      <div className="w-full ">
        <h2 className="text-2xl font-medium mb-4">{title}</h2>
        <p className="text-[#515158] ">{description}</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 space-y-2 w-full"
        >
          <div className="flex flex-col  py-4 gap-2 gap-x-8">
            {fields.map((field, index) => (
              <FormField
                key={index}
                control={form.control}
                name={field.name}
                render={({ field: formField, fieldState }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      {field.type === "other" ? (
                        field.render(field)
                      ) : field.type === "switch" ? (
                        <div className="flex items-center h-10">
                          <Switch
                            checked={formField.value}
                            onCheckedChange={formField.onChange}
                          />
                          <span className="ml-2">
                            {formField.value ? `Active` : `Inactive`}
                          </span>
                        </div>
                      ) : field.type === "textarea" ? (
                        <textarea
                          {...formField}
                          placeholder={field.placeholder}
                          rows={field.rows || 4} // Optional: add rows for textarea
                        />
                      ) : field.type === "select" ? (
                        <select {...formField} defaultValue={formField.value}>
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "date" ? (
                        <Input
                          type="date"
                          {...formField}
                          placeholder={field.placeholder}
                        />
                      ) : field.type === "number" ? (
                        <Input
                          type="number"
                          {...formField}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <Input
                          type={field.type || "text"}
                          placeholder={field.placeholder}
                          {...formField}
                          value={formField.value}
                          onChange={formField.onChange}
                        />
                      )}
                    </FormControl>

                    <FormMessage className="min-h-[1rem] leading-none">
                      <span
                        className={`text-red-500 text-xs  h-full  ${
                          fieldState.error ? "visible" : "invisible"
                        }`}
                      >
                        {fieldState.error?.message}
                      </span>
                    </FormMessage>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <Button
            disabled={isSubmitting || saveButtonDisabled}
            className=" w-full"
            type="submit"
          >
            {isSubmitting && <Loader2 className="animate-spin mr-2" />}
            {isSubmitting ? "Please wait" : saveButton}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default AuthForm;
