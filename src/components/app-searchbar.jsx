import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";

export default function SearchBar({ onSearchClick }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchClick = () => {
    onSearchClick(searchTerm);
  };
  const handleClearClick = () => {
    setSearchTerm("");
    onSearchClick("");
  };
  return (
    <div className="flex items-center w-full max-w-md rounded-md border border-input bg-transparent   shadow-sm focus-within:border-primary">
      <Button
        variant="outline"
        size="icon"
        className="shadow-none border-0 "
        onClick={handleSearchClick}
      >
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
      </Button>
      <Input
        placeholder="Search"
        className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleSearchClick();
          }
        }}
      />
      {searchTerm && (
        <Button
          variant="outline"
          size="icon"
          className="shadow-none border-0 "
          onClick={handleClearClick}
        >
          <XIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
