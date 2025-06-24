// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "./ui/table";
// import {
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { Loader2 } from "lucide-react";

// const AppDataTable = ({
//   columns,
//   rowIdKey,
//   data = [],
//   loading,
//   error,
//   onRowClick,
// }) => {
//   const [initialized, setInitialized] = useState(false);

//   useEffect(() => {
//     if (data && data.length > 0) {
//       setInitialized(true);
//     }
//   }, [data]);

//   const table = useReactTable({
//     columns,
//     data,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   if (!initialized || loading) {
//     return (
//       <Table>
//         <TableHeader>
//           {table.getHeaderGroups().map((headerGroup) => (
//             <TableRow key={headerGroup.id}>
//               {headerGroup.headers.map((header) => (
//                 <TableHead key={header.id} className="font-bold bg-slate-100">
//                   {header.isPlaceholder
//                     ? null
//                     : flexRender(
//                         header.column.columnDef.header,
//                         header.getContext()
//                       )}
//                 </TableHead>
//               ))}
//             </TableRow>
//           ))}
//         </TableHeader>
//         <TableBody>
//           <TableRow>
//             <TableCell colSpan={columns.length} className="h-24 text-center">
//               {loading ? (
//                 <Loader2 className="animate-spin m-auto" />
//               ) : (
//                 "No data found"
//               )}
//             </TableCell>
//           </TableRow>
//         </TableBody>
//       </Table>
//     );
//   }

//   return (
//     <Table className="table-fixed ">
//       <TableHeader>
//         {table.getHeaderGroups().map((headerGroup) => (
//           <TableRow key={headerGroup.id}>
//             {headerGroup.headers.map((header) => (
//               <TableHead
//                 key={header.id}
//                 className="px-8 text-xs font-semibold uppercase bg-slate-100"
//                 style={{ width: header.column.columnDef.width }} // Apply width here
//               >
//                 {header.isPlaceholder
//                   ? null
//                   : flexRender(
//                       header.column.columnDef.header,
//                       header.getContext()
//                     )}
//               </TableHead>
//             ))}
//           </TableRow>
//         ))}
//       </TableHeader>
//       <TableBody>
//         {table.getRowModel().rows.length > 0 ? (
//           table.getRowModel().rows.map((row) => (
//             <TableRow
//               key={row.original[rowIdKey]}
//               data-state={row.getIsSelected() && "selected"}
//               onClick={() => onRowClick(row.original)}
//               className="cursor-pointer"
//             >
//               {row.getVisibleCells().map((cell) => (
//                 <TableCell
//                   key={cell.id}
//                   style={{ width: cell.column.columnDef.width }} // Apply width here
//                   className="px-8 truncate overflow-hidden whitespace-nowrap text-ellipsis"
//                 >
//                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                 </TableCell>
//               ))}
//             </TableRow>
//           ))
//         ) : (
//           <TableRow>
//             <TableCell
//               key={"no-data-found"}
//               colSpan={columns.length}
//               className="h-24 text-center"
//               style={{ width: "100%" }} // Apply a default width
//             >
//               No data found
//             </TableCell>
//           </TableRow>
//         )}
//       </TableBody>
//     </Table>
//   );
// };

// export default AppDataTable;
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

const AppDataTable = ({
  columns,
  rowIdKey,
  data = [],
  loading,
  error,
  onRowClick,
}) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      setInitialized(true);
    }
  }, [data]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!initialized || loading) {
    return (
      <Table className="table-fixed w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-bold bg-slate-100"
                  style={{ width: header.column.columnDef.width }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {loading ? (
                <Loader2 className="animate-spin m-auto" />
              ) : (
                "No data found"
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table className="table-fixed w-full">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className="px-8 text-xs font-semibold uppercase bg-slate-100"
                style={{ width: header.column.columnDef.width }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.original[rowIdKey]}
              data-state={row.getIsSelected() && "selected"}
              onClick={() => onRowClick(row.original)}
              className="cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={{ width: cell.column.columnDef.width }}
                  className="px-8 truncate overflow-hidden whitespace-nowrap text-ellipsis"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

export default AppDataTable;
