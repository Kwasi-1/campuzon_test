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
  className,
}: ProductsToolbarProps) {
  const currentSort =
    sortOptions.find((opt) => opt.value === sortBy) || sortOptions[0];

  return (
    <div className={cn("flex items-center justify-end gap-4", className)}>
      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort:</span>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort products"
            className="appearance-none bg-transparent pr-6 text-sm font-medium cursor-pointer focus:outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center border-l border-border pl-4">
        <button
          onClick={() => onViewModeChange("grid")}
          className={cn(
            "p-1.5 transition-colors",
            viewMode === "grid"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-label="Grid view"
          title="Grid view"
        >
          <Grid3X3 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={cn(
            "p-1.5 transition-colors",
            viewMode === "list"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-label="List view"
          title="List view"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
