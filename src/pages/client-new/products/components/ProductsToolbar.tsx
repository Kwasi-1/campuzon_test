import { Grid3X3, Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type SortOption =
  | "best_match"
  | "date_created:desc"
  | "date_created:asc"
  | "price:asc"
  | "price:desc"
  | "sold_count:desc";

interface ProductsToolbarProps {
  totalResults: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: string;
  onSortChange: (value: SortOption) => void;
  onFilterClick?: () => void;
  className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "best_match", label: "Best Match" },
  { value: "date_created:desc", label: "Newest First" },
  { value: "date_created:asc", label: "Oldest First" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
  { value: "sold_count:desc", label: "Best Selling" },
];

export function ProductsToolbar({
  totalResults,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onFilterClick,
  className,
}: ProductsToolbarProps) {
  const currentSort =
    sortOptions.find((opt) => opt.value === sortBy) || sortOptions[0];

  return (
    <div className={cn("flex items-center justify-end gap-4", className)}>
      {/* Sort Dropdown */}
      <div className="relative border border-gray-200 rounded-sm text-gray-800 hover:border-gray-300 transition-colors">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          aria-label="Sort products"
          className="appearance-none bg-transparent pl-3 pr-8 py-1.5 text-sm font-medium cursor-pointer focus:outline-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>

      {/* View Mode Toggle (Desktop Only) */}
      <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-sm ml-2">
        <button
          onClick={() => onViewModeChange("grid")}
          className={cn(
            "p-1.5 rounded-[7px] transition-all duration-200",
            viewMode === "grid"
              ? "bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
              : "text-gray-500 hover:text-gray-900",
          )}
          aria-label="Grid view"
          title="Grid view"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={cn(
            "p-1.5 rounded-[7px] transition-all duration-200",
            viewMode === "list"
              ? "bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
              : "text-gray-500 hover:text-gray-900",
          )}
          aria-label="List view"
          title="List view"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Filter Button */}
      {onFilterClick && (
        <button
          onClick={onFilterClick}
          className="md:hidden flex items-center justify-center p-1.5 px-3 bg-gray-100 rounded-[5px] text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          aria-label="Open filters"
        >
          <span className="text-[13px] font-medium flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filter
          </span>
        </button>
      )}
    </div>
  );
}
