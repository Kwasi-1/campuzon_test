import { Grid3X3, List, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type SortOption =
  | "date_created:desc"
  | "date_created:asc"
  | "price:asc"
  | "price:desc"
  | "rating:desc"
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
  { value: "date_created:desc", label: "Newest First" },
  { value: "date_created:asc", label: "Oldest First" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
  { value: "rating:desc", label: "Highest Rated" },
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
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg border border-border",
        className,
      )}
    >
      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {totalResults.toLocaleString()}
        </span>{" "}
        results
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Sort:
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sort products"
              className="appearance-none bg-white border border-border rounded-md px-3 py-1.5 pr-8 text-sm font-medium cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-border rounded-md overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-2 transition-colors",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "bg-white text-muted-foreground hover:bg-muted",
            )}
            aria-label="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-2 transition-colors",
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-white text-muted-foreground hover:bg-muted",
            )}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
