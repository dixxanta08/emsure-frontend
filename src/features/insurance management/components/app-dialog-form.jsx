import React, { useEffect } from "react";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import SwitchWithLabel from "@/components/extended-ui/switch-with-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const AppDialogForm = ({
  title,
  description,
  saveButton,
  cancelButton,
  schema,
  defaultValues,
  fields,
  onSubmit,
  onCancel,
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
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 py-4 gap-x-8">
          {fields.map((field, index) => (
            <FormField
              key={index}
              control={form.control}
              name={field.name}
              render={({ field: formField, fieldState }) => (
                // <FormItem>
                <FormItem
                  className={
                    field.type === "textarea"
                      ? "col-span-full flex flex-col gap-2"
                      : ""
                  }
                >
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.type === "other" ? (
                      field.render(field)
                    ) : field.type === "switch" ? (
                      <SwitchWithLabel
                        checked={formField.value}
                        onChange={(e) => {
                          formField.onChange(e);
                        }}
                        disabled={field.disabled}
                        tooltip={field.tooltip}
                        activeText={field.activeText || "Active"}
                        inactiveText={field.inactiveText || "Inactive"}
                      />
                    ) : field.type === "select" ? (
                      <Select
                        value={
                          formField.value !== undefined
                            ? formField.value.toString()
                            : ""
                        }
                        disabled={field.disabled}
                        onValueChange={(value) => {
                          // Convert the selected string value back to a number before updating the form state.
                          formField.onChange(Number(value));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "date" ? (
                      <Input
                        type="date"
                        {...formField}
                        placeholder={field.placeholder}
                        onChange={(e) => {
                          formField.onChange(e);
                          // field.onChange(e);
                        }}
                      />
                    ) : field.type === "number" ? (
                      <Input
                        type="number"
                        {...formField}
                        placeholder={field.placeholder}
                        onChange={(e) => {
                          formField.onChange(e);
                          // field.onChange(e);
                        }}
                      />
                    ) : field.type === "textarea" ? (
                      <Textarea
                        {...formField}
                        placeholder={field.placeholder}
                        onChange={(e) => {
                          formField.onChange(e);
                          // field.onChange(e);
                        }}
                        className="h-32 resize-none"
                      />
                    ) : (
                      <Input
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        {...formField}
                        onChange={(e) => {
                          formField.onChange(e);
                          // field.onChange(e);
                        }}
                        disabled={field.disabled}
                      />
                    )}
                  </FormControl>

                  <FormMessage className="min-h-[1rem] mt-0">
                    <span
                      className={`text-red-500 text-xs mt-0 h-full leading-none ${
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

        <DialogFooter className="flex justify-end space-x-4">
          {cancelButton && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelButton}
            </Button>
          )}
          <Button type="submit">{saveButton}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AppDialogForm;
