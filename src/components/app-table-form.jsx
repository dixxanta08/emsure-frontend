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

const AppTableForm = ({ columns, data = [], loading, onChange }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleInputChange = (rowIndex, key, value) => {
    console.log("rowIndex", rowIndex, key, value, formData, data);

    const updatedData = [...data];
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
                style={{ width: col.width || "auto" }}
                className="font-bold bg-slate-100"
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

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.accessorKey}
              style={{ width: col.width || "auto" }}
              className="font-bold bg-slate-100"
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
                  {col.cell
                    ? col.cell({
                        cellValue: row[col.accessorKey],
                        row,
                        rowIndex,
                        handleInputChange,
                        formData,
                      })
                    : row[col.accessorKey]}
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
