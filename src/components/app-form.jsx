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
import SwitchWithLabel from "./extended-ui/switch-with-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import MultipleSelector from "./extended-ui/multiple-selector";
import { Loader2 } from "lucide-react";
import FileUploader from "./extended-ui/file-uploader";

const AppForm = ({
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
        <div className="grid lg:grid-cols-3 grid-cols-2 gap-4 py-4 gap-x-8">
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
                      <SwitchWithLabel
                        checked={formField.value}
                        onChange={(e) => {
                          formField.onChange(e);
                          field.onChange(e);
                        }}
                        disabled={field.disabled}
                        tooltip={field.tooltip}
                        activeText={field.activeText || "Active"}
                        inactiveText={field.inactiveText || "Inactive"}
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
                    ) : field.type === "multiple" ? (
                      <MultipleSelector
                        onSearch={field.onSearch}
                        onChange={(value) => {
                          // Transform the array of objects to an array of numbers.
                          const selectedValues =
                            value?.map((item) => item.value) || [];
                          formField.onChange(selectedValues);
                          field.onChange(selectedValues);
                        }}
                        defaultOptions={field.defaultOptions}
                        triggerSearchOnFocus
                        placeholder={field.placeholder}
                        loadingIndicator={
                          <Loader2 className="animate-spin m-auto" />
                        }
                        emptyIndicator={
                          <p className="w-full text-center text-md leading-10 text-muted-foreground">
                            No results found.
                          </p>
                        }
                      />
                    ) : field.type === "select" ? (
                      <Select
                        {...formField}
                        defaultValue={field.value}
                        disabled={field.disabled}
                        onValueChange={(value) => {
                          formField.onChange(value);
                          field.onChange(value);
                        }}
                        // onChange={(e) => {
                        //   formField.onChange(e);
                        //   field.onChange(e);
                        // }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
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
                          field.onChange(e);
                        }}
                      />
                    ) : field.type === "number" ? (
                      <Input
                        type="number"
                        {...formField}
                        placeholder={field.placeholder}
                        onChange={(e) => {
                          formField.onChange(e);
                          field.onChange(e);
                        }}
                      />
                    ) : field.type === "file" ? (
                      <FileUploader
                        {...formField}
                        placeholder={field.placeholder}
                        onChange={(e) => {
                          formField.onChange(e);
                          field.onChange(e);
                        }}
                        documentType={field.documentType}
                      />
                    ) : (
                      <Input
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        {...formField}
                        onChange={(e) => {
                          formField.onChange(e);
                          field.onChange(e);
                        }}
                        disabled={field.disabled}

                        // value={field.value ?? ""}
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
        <footer className="flex justify-end space-x-4">
          {cancelButton && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelButton}
            </Button>
          )}
          {saveButton && <Button type="submit">{saveButton}</Button>}
        </footer>
      </form>
    </Form>
  );
};

export default AppForm;
