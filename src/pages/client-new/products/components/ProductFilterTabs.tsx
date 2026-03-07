import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterTab {
  id: string;
  label: string;
  isActive?: boolean;
  hasDropdown?: boolean;
}

interface ProductFilterTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const filterTabs: FilterTab[] = [
  { id: "all", label: "All", isActive: true },
  { id: "buy_now", label: "Buy It Now" },
  { id: "condition", label: "Condition", hasDropdown: true },
  { id: "location", label: "Item Location", hasDropdown: true },
];

export function ProductFilterTabs({
  activeTab,
  onTabChange,
  className,
}: ProductFilterTabsProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {filterTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150",
            "border",
            activeTab === tab.id
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-foreground border-border hover:border-foreground",
          )}
        >
          {tab.label}
          {tab.hasDropdown && <ChevronDown className="w-4 h-4" />}
        </button>
      ))}
    </div>
  );
}
