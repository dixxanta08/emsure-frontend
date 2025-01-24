import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const DialogForm = ({
  open,
  onOpenChange,
  title,
  description,
  saveButton,
  schema,
  defaultValues,
  fields,
  onSubmit,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:min-w-[600px]">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4 gap-x-8">
              {fields.map((field, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={field.name}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        {field.type === "switch" ? (
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
                          <input
                            type="date"
                            {...formField}
                            placeholder={field.placeholder}
                          />
                        ) : field.type === "number" ? (
                          <input
                            type="number"
                            {...formField}
                            placeholder={field.placeholder}
                          />
                        ) : (
                          <Input
                            type={field.type || "text"}
                            placeholder={field.placeholder}
                            {...formField}
                          />
                        )}
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <DialogFooter>
              <Button type="submit">{saveButton}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;
