import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { X, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input, Badge } from "@/components/ui";
import { CATEGORY_OPTIONS, cn } from "@/lib/utils";
import type { Category } from "@/types";

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface FilterState {
  category?: Category;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const conditionOptions = [
  { value: "new", label: "Brand New" },
  { value: "used_like_new", label: "Like New" },
  { value: "used_good", label: "Pre-Owned" },
  { value: "used_fair", label: "Used - Fair" },
];

// Collapsible filter section component
interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Checkbox filter item
interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
}

function FilterCheckbox({
  label,
  checked,
  onChange,
  count,
}: FilterCheckboxProps) {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
      />
      <span
        className={cn(
          "text-sm flex-1 group-hover:text-primary transition-colors",
          checked ? "text-foreground font-medium" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </label>
  );
}

// Extracted filter content
interface FilterContentProps {
  filters: FilterState;
  activeFilterCount: number;
  onClearFilters: () => void;
  onCategoryChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

function FilterContent({
  filters,
  activeFilterCount,
  onClearFilters,
  onCategoryChange,
  onConditionChange,
  onMinPriceChange,
  onMaxPriceChange,
}: FilterContentProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category Section */}
      <FilterSection title="Category">
        <div className="space-y-1">
          <FilterCheckbox
            label="All Categories"
            checked={!filters.category}
            onChange={() => onCategoryChange("")}
          />
          {CATEGORY_OPTIONS.map((category) => (
            <FilterCheckbox
              key={category.value}
              label={category.label}
              checked={filters.category === category.value}
              onChange={() =>
                onCategoryChange(
                  filters.category === category.value ? "" : category.value,
                )
              }
            />
          ))}
        </div>
      </FilterSection>

      {/* Condition Section */}
      <FilterSection title="Condition">
        <div className="space-y-1">
          <FilterCheckbox
            label="Any Condition"
            checked={!filters.condition}
            onChange={() => onConditionChange("")}
          />
          {conditionOptions.map((condition) => (
            <FilterCheckbox
              key={condition.value}
              label={condition.label}
              checked={filters.condition === condition.value}
              onChange={() =>
                onConditionChange(
                  filters.condition === condition.value ? "" : condition.value,
                )
              }
            />
          ))}
        </div>
      </FilterSection>

      {/* Price Range Section */}
      <FilterSection title="Price">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                GH₵
              </span>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
            <span className="text-muted-foreground">to</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                GH₵
              </span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
          </div>
          {/* Quick price ranges */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Under GH₵50", min: 0, max: 50 },
              { label: "GH₵50-100", min: 50, max: 100 },
              { label: "GH₵100-500", min: 100, max: 500 },
              { label: "Over GH₵500", min: 500, max: undefined },
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  onMinPriceChange(range.min.toString());
                  onMaxPriceChange(range.max?.toString() || "");
                }}
                className={cn(
                  "px-3 py-1 text-xs rounded-full border transition-colors",
                  filters.minPrice === range.min &&
                    filters.maxPrice === range.max
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary",
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>
    </div>
  );
}

export function ProductFilters({
  onFilterChange,
  isOpen,
  onClose,
}: ProductFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    category: (searchParams.get("category") as Category) || undefined,
    condition: searchParams.get("condition") || undefined,
    minPrice: searchParams.get("min_price")
      ? Number(searchParams.get("min_price"))
      : undefined,
    maxPrice: searchParams.get("max_price")
      ? Number(searchParams.get("max_price"))
      : undefined,
    sortBy: searchParams.get("sort_by") || undefined,
    sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || undefined,
  });

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: unknown) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value || undefined };

        // Update URL params
        const params = new URLSearchParams(searchParams);
        const paramKey =
          key === "minPrice"
            ? "min_price"
            : key === "maxPrice"
              ? "max_price"
              : key === "sortBy"
                ? "sort_by"
                : key === "sortOrder"
                  ? "sort_order"
                  : key;

        if (value) {
          params.set(paramKey, String(value));
        } else {
          params.delete(paramKey);
        }
        setSearchParams(params);
        onFilterChange(newFilters);

        return newFilters;
      });
    },
    [searchParams, setSearchParams, onFilterChange],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchParams({});
    onFilterChange({});
  }, [setSearchParams, onFilterChange]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filterContentProps: FilterContentProps = {
    filters,
    activeFilterCount,
    onClearFilters: clearFilters,
    onCategoryChange: (value) =>
      handleFilterChange("category", value as Category),
    onConditionChange: (value) => handleFilterChange("condition", value),
    onMinPriceChange: (value) =>
      handleFilterChange("minPrice", value ? Number(value) : undefined),
    onMaxPriceChange: (value) =>
      handleFilterChange("maxPrice", value ? Number(value) : undefined),
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-24 bg-white dark:bg-card border border-border rounded-xl overflow-hidden">
          <FilterContent {...filterContentProps} />
        </div>
      </aside>

      {/* Mobile Filter Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-background z-50 lg:hidden overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-background z-10 flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4">
                <FilterContent {...filterContentProps} />
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-background p-4 border-t border-border">
                <Button className="w-full" onClick={onClose}>
                  Show Results
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
