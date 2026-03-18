import { useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SellerPageSelectOption {
  value: string;
  label: string;
}

interface SellerPageTemplateProps {
  title?: string;
  description?: ReactNode;
  headerActions?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  messagesPadding?: boolean; // New prop to control padding for messages page
}

export function SellerPageTemplate({
  title,
  description,
  headerActions,
  sidebar,
  children,
  messagesPadding = false,
}: SellerPageTemplateProps) {
  return (
    <div
      className={`relative container mx-auto ${messagesPadding ? "px-0 md:px-4 pt-0 md:pt-2 md:pb-2" : "px-4 py-8"} `}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-900">
            {title}
          </h1>
          {description ? (
            <p className="text-sm md:text-base text-gray-500 mt-1">
              {description}
            </p>
          ) : null}
        </div>
        {headerActions}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 pb-10">
        {sidebar ? <aside className="lg:w-64 xl:w-72 shrink-0">{sidebar}</aside> : null}
        <section className="flex-1 min-w-0">{children}</section>
      </div>
    </div>
  );
}

interface SellerPageSearchFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  selectValue: string;
  onSelectChange: (value: string) => void;
  selectOptions: SellerPageSelectOption[];
  selectPlaceholder?: string;
  className?: string;
}

export function SellerPageSearchFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  selectValue,
  onSelectChange,
  selectOptions,
  selectPlaceholder = "Filter",
  className,
}: SellerPageSearchFiltersProps) {
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <div
      className={`flex w-full items-center md:justify-end gap-2 md:w-auto ${className || ""}`}
    >
      <div
        className={`overflow-hidden transition-all duration-300 ${
          searchExpanded ? "w-full sm:w-72" : "w-10"
        }`}
      >
        {searchExpanded ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-10 rounded-full pl-9 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground"
            />
            <button
              type="button"
              onClick={() => {
                setSearchExpanded(false);
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setSearchExpanded(true)}
            className="h-10 w-10 rounded-full"
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Select value={selectValue} onValueChange={onSelectChange}>
        <SelectTrigger className="h-10 w-[180px] rounded-full">
          <SelectValue placeholder={selectPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {selectOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
