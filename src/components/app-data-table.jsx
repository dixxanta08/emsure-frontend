import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const AppDataTable = ({
  columns,
  rowIdKey,
  data,
  loading,
  error,
  onRowClick,
}) => {
  return (
    <Table>
      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
      <TableHeader>
        <TableRow>
          {columns.map((column) => {
            return (
              <TableHead
                className={`
                ${column.headerClassName ? column.headerClassName : ""}`}
                key={column.headerName}
              >
                {column.headerName}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && <span>Loading...</span>}
        {error && (
          <span className="bg-red-200 text-red-700 font-semibold w-full">
            Error: {error}
          </span>
        )}
        {data.map((row) => (
          <TableRow
            key={row[rowIdKey]}
            onClick={() => onRowClick(row)}
            className="cursor-pointer"
          >
            {columns.map((column) => (
              <TableCell
                className={`font-medium ${
                  column.cellClassName ? column.cellClassName : ""
                }`}
                key={row[column.name]}
              >
                {row[column.name]}
                {/* Render method  should be added here*/}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AppDataTable;
