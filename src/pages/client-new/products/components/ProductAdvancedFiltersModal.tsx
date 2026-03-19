import { useState, useEffect } from "react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_OPTIONS, cn } from "@/lib/utils";
import { FilterState } from "./ProductFilters";
import { X, Check } from "lucide-react";

export interface ProductAdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: FilterState;
  onApply: (filters: FilterState) => void;
}

const CONDITION_OPTIONS = [
  { value: "new", label: "Brand New" },
  { value: "used_like_new", label: "Like New" },
  { value: "used_good", label: "Pre-Owned" },
  { value: "used_fair", label: "Used - Fair" },
];

export function ProductAdvancedFiltersModal({
  isOpen,
  onClose,
  initialFilters,
  onApply,
}: ProductAdvancedFiltersModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      // Initialize state from existing filters if they exist
      setSelectedCategories(
        initialFilters.category ? String(initialFilters.category).split(",") : []
      );
      setSelectedConditions(
        initialFilters.condition ? initialFilters.condition.split(",") : []
      );
      setMinPrice(initialFilters.minPrice ? String(initialFilters.minPrice) : "");
      setMaxPrice(initialFilters.maxPrice ? String(initialFilters.maxPrice) : "");
    }
  }, [isOpen, initialFilters]);

  const handleApply = () => {
    onApply({
      ...initialFilters,
      category: selectedCategories.length > 0 ? (selectedCategories.join(",") as any) : undefined,
      condition: selectedConditions.length > 0 ? selectedConditions.join(",") : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedCategories([]);
    setSelectedConditions([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const toggleCategory = (val: string) => {
    setSelectedCategories((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const toggleCondition = (val: string) => {
    setSelectedConditions((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const footer = (
    <div className="flex w-full gap-3">
      <Button variant="outline" className="flex-1" onClick={handleClear}>
        Clear all
      </Button>
      <Button className="flex-1" onClick={handleApply}>
        Apply filters {selectedCategories.length + selectedConditions.length > 0 && `(${selectedCategories.length + selectedConditions.length})`}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size="md"
      title="All Filters"
      footer={footer}
    >
      <div className="space-y-8 pb-4">
        {/* Category Multi-select */}
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3 block">Categories</h3>
          <div className="flex flex-col gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <label
                key={cat.value}
                className="flex items-center gap-3 py-1 cursor-pointer group"
              >
                <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", selectedCategories.includes(cat.value) ? "bg-primary border-primary" : "border-gray-300 group-hover:border-primary")}>
                    {selectedCategories.includes(cat.value) && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedCategories.includes(cat.value)}
                  onChange={() => toggleCategory(cat.value)}
                />
                <span className={cn("text-sm transition-colors", selectedCategories.includes(cat.value) ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900")}>
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Condition Multi-select */}
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3 block">Condition</h3>
          <div className="flex flex-col gap-2">
            {CONDITION_OPTIONS.map((cond) => (
              <label
                key={cond.value}
                className="flex items-center gap-3 py-1 cursor-pointer group"
              >
                <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", selectedConditions.includes(cond.value) ? "bg-primary border-primary" : "border-gray-300 group-hover:border-primary")}>
                    {selectedConditions.includes(cond.value) && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedConditions.includes(cond.value)}
                  onChange={() => toggleCondition(cond.value)}
                />
                <span className={cn("text-sm transition-colors", selectedConditions.includes(cond.value) ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900")}>
                  {cond.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3 block">Price Range (GH₵)</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 border border-gray-200 rounded-md focus-within:border-primary transition-colors overflow-hidden">
                <span className="text-gray-400 pl-3 text-sm">Min</span>
                <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm h-10"
                />
            </div>
            <span className="text-gray-400">-</span>
            <div className="flex-1 border border-gray-200 rounded-md focus-within:border-primary transition-colors overflow-hidden">
                <span className="text-gray-400 pl-3 text-sm">Max</span>
                <Input
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm h-10"
                />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
