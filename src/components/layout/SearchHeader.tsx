import React from "react";
import { Search, ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onBack?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchHeader = ({
  value,
  onChange,
  onSearch,
  onBack,
  placeholder = "Search...",
  autoFocus = false,
}: SearchHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="flex h-14 items-center gap-3 px-3 border-b border-gray-100 bg-white">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        title="Go back"
        aria-label="Go back"
        className="h-10 w-10 shrink-0 text-gray-700 hover:bg-gray-100 rounded-full"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      {/* Search Input Container */}
      <div className="flex-1 relative flex items-center h-10 bg-[#f4f7fb] rounded-full px-4 group">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder:text-gray-400"
          autoFocus={autoFocus}
        />
        {value && (
          <button
            onClick={handleClear}
            title="Clear search"
            aria-label="Clear search"
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Icon / Action */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onSearch}
        title="Search"
        aria-label="Search"
        className="h-10 w-10 shrink-0 text-gray-700 hover:bg-gray-100 rounded-full"
      >
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
};
