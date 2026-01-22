import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { X, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "@/components/ui";
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

const shippingOptions = [
  { id: "fast_delivery", label: "Arrives in 2-4 days" },
  { id: "free_shipping", label: "Free International Shipping" },
  { id: "local_pickup", label: "Local Pickup" },
];

// Collapsible filter section
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
    <div className="border-b border-border pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left mb-2"
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
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Category link item (eBay style)
interface CategoryLinkProps {
  label: string;
  isActive?: boolean;
  isChild?: boolean;
  onClick: () => void;
}

function CategoryLink({
  label,
  isActive,
  isChild,
  onClick,
}: CategoryLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full text-left text-sm py-1 transition-colors",
        isChild && "pl-3",
        isActive
          ? "text-foreground font-semibold"
          : "text-primary hover:underline",
      )}
    >
      {label}
    </button>
  );
}

// Checkbox filter option
interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckboxOption({ label, checked, onChange }: CheckboxOptionProps) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
      />
      <span className="text-sm text-muted-foreground group-hover:text-foreground">
        {label}
      </span>
    </label>
  );
}

// Desktop sidebar content
interface FilterContentProps {
  filters: FilterState;
  onCategoryChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

function FilterContent({
  filters,
  onCategoryChange,
  onConditionChange,
  onMinPriceChange,
  onMaxPriceChange,
}: FilterContentProps) {
  return (
    <div>
      {/* Category Section */}
      <FilterSection title="Category">
        <div className="space-y-0.5">
          <CategoryLink
            label="All"
            isActive={!filters.category}
            onClick={() => onCategoryChange("")}
          />
          {CATEGORY_OPTIONS.map((category) => (
            <CategoryLink
              key={category.value}
              label={category.label}
              isActive={filters.category === category.value}
              onClick={() => onCategoryChange(category.value)}
            />
          ))}
          <button className="text-sm text-primary hover:underline mt-1">
            Show More +
          </button>
        </div>
      </FilterSection>

      {/* Update shipping location */}
      <div className="border-b border-border pb-4 mb-4">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <MapPin className="w-4 h-4" />
          <span>Update your shipping location</span>
        </button>
      </div>

      {/* Shipping and pickup */}
      <FilterSection title="Shipping and pickup">
        <div className="space-y-1">
          {shippingOptions.map((option) => (
            <CheckboxOption
              key={option.id}
              label={option.label}
              checked={false}
              onChange={() => {}}
            />
          ))}
        </div>
      </FilterSection>

      {/* Condition Section */}
      <FilterSection title="Condition" defaultOpen={false}>
        <div className="space-y-1">
          {conditionOptions.map((condition) => (
            <CheckboxOption
              key={condition.value}
              label={condition.label}
              checked={filters.condition === condition.value}
              onChange={(checked) =>
                onConditionChange(checked ? condition.value : "")
              }
            />
          ))}
        </div>
      </FilterSection>

      {/* Price Range Section */}
      <FilterSection title="Price" defaultOpen={false}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₵
            </span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ""}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="pl-6 h-8 text-sm"
            />
          </div>
          <span className="text-muted-foreground text-sm">to</span>
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₵
            </span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ""}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="pl-6 h-8 text-sm"
            />
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

  const filterContentProps: FilterContentProps = {
    filters,
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
      <aside className="hidden lg:block w-52 shrink-0">
        <div className="sticky top-20">
          <FilterContent {...filterContentProps} />
        </div>
      </aside>

      {/* Mobile Filter Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={onClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background z-50 lg:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-background z-10 flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4">
                <FilterContent {...filterContentProps} />
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-background p-4 border-t border-border">
                <Button className="w-full" onClick={onClose}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
