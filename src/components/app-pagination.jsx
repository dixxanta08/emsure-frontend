import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DataTablePagination({
  totalRows,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const pageCount = Math.ceil(totalRows / pageSize); // Total pages
  const canGoBack = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between px-2 space-y-4 md:space-y-0">
      {/* Range Display */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span className="hidden md:inline">
          Showing rows {pageIndex * pageSize + 1}–
          {Math.min(totalRows, (pageIndex + 1) * pageSize)} of {totalRows}
        </span>
        <div className="flex items-center space-x-2">
          <span className="hidden md:inline">Rows:</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(0)}
          disabled={!canGoBack}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canGoBack}
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm hidden md:inline">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canGoNext}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(pageCount - 1)}
          disabled={!canGoNext}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
