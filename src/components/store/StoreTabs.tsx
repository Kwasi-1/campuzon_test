import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type StoreTabType = "shop" | "about" | "feedback" | "sale";

interface StoreTabsProps {
  activeTab: StoreTabType;
  onTabChange: (tab: StoreTabType) => void;
  productCount?: number;
  hasSaleItems?: boolean;
}

export function StoreTabs({
  activeTab,
  onTabChange,
  productCount,
  hasSaleItems,
}: StoreTabsProps) {
  const tabs: { id: StoreTabType; label: string; show?: boolean }[] = [
    { id: "shop", label: "Shop" },
    { id: "sale", label: "Sale", show: hasSaleItems },
    { id: "about", label: "About" },
    { id: "feedback", label: "Feedback" },
  ];

  return (
    <div className="bg-white border-gray-200 sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Categories Button + Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {/* Categories Button */}
            <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium bg-gray-900 text-white rounded-full my-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              Categories
            </button>

            {/* Tab Buttons */}
            {tabs
              .filter((tab) => tab.show !== false)
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
                    activeTab === tab.id
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
              ))}
          </div>

          {/* Search Input */}
          <div className="hidden md:flex items-center flex-1 max-w-sm ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search all ${productCount || ""} items`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
