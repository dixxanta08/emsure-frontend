import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

const AppTableForm = ({ columns, data = [], loading, onChange }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleInputChange = (rowIndex, key, value) => {
    const updatedData = [...formData];
    updatedData[rowIndex][key] = value;
    setFormData(updatedData);
    if (onChange) onChange(updatedData, rowIndex);
  };

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.accessorKey}
                className="font-bold bg-slate-100"
                style={{ width: col.width || "auto" }}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              <Loader2 className="animate-spin m-auto" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
  formData.forEach((row) => {
    console.log(row);
  });
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.accessorKey}
              className="font-bold bg-slate-100"
              style={{ width: col.width || "auto" }} // Apply width conditionally
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {formData.length > 0 ? (
          formData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((col) => (
                <TableCell
                  key={col.accessorKey}
                  style={{ width: col.width || "auto" }}
                >
                  {" "}
                  {/* Apply width conditionally */}
                  {col.editable ? (
                    col.type === "select" ? (
                      <Select
                        defaultValue={row[col.accessorKey]}
                        value={row[col.accessorKey]}
                        onValueChange={(value) =>
                          handleInputChange(rowIndex, col.accessorKey, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {col.options.length > 0 &&
                          rowIndex < col.options.length ? (
                            col.options.map(
                              (option) =>
                                !(
                                  formData
                                    .map((d) => d[col.accessorKey])
                                    .includes(option.value) &&
                                  // col.selectedOptions.includes(option.value) &&
                                  option.value !== row[col.accessorKey]
                                ) && (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                )
                            )
                          ) : (
                            <SelectItem disabled>No records</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={col.type}
                        value={row[col.accessorKey]}
                        onChange={(e) =>
                          handleInputChange(
                            rowIndex,
                            col.accessorKey,
                            e.target.value
                          )
                        }
                      />
                    )
                  ) : (
                    row[col.accessorKey]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No data found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default AppTableForm;
