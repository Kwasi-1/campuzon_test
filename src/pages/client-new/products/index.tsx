import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/shared/Pagination";
import {
  ProductGrid,
  ProductFilters,
  ProductsToolbar,
  ProductAdvancedFiltersModal,
  type FilterState,
} from "./components";
import { useProducts } from "@/hooks/useProducts";
import type {
  Category,
  ProductFilters as ProductFiltersType,
} from "@/types-new";
import { useUIStore } from "@/stores";
import { Icon } from "@iconify/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = "grid" | "list";

const MOBILE_SORT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Recommended", value: "best_match" },
  { label: "Newest", value: "date_created:desc" },
  { label: "Price: Low to High", value: "price:asc" },
  { label: "Price: High to Low", value: "price:desc" },
  { label: "Top Rated", value: "rating:desc" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filtersOpen, setFiltersOpen } = useUIStore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: (searchParams.get("category") as Category) || undefined,
    minPrice: searchParams.get("min_price")
      ? Number(searchParams.get("min_price"))
      : undefined,
    maxPrice: searchParams.get("max_price")
      ? Number(searchParams.get("max_price"))
      : undefined,
    sortBy: searchParams.get("sort_by") || "date_created",
    sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
  });

  const [page, setPage] = useState(1);

  const productFilters: ProductFiltersType = {
    page,
    perPage: 24,
    category: filters.category,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy as ProductFiltersType["sortBy"],
    sortOrder: filters.sortOrder,
    search: searchParams.get("search") || undefined,
  };

  const { data, isLoading } = useProducts(productFilters);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    if (value === "best_match") {
      const params = new URLSearchParams(searchParams);
      params.delete("sort_by");
      params.delete("sort_order");
      setSearchParams(params);
      setFilters((prev) => ({
        ...prev,
        sortBy: undefined,
        sortOrder: undefined,
      }));
    } else {
      const [sortBy, sortOrder] = value.split(":");
      const params = new URLSearchParams(searchParams);
      params.set("sort_by", sortBy);
      params.set("sort_order", sortOrder);
      setSearchParams(params);
      setFilters((prev) => ({
        ...prev,
        sortBy,
        sortOrder: sortOrder as "asc" | "desc",
      }));
    }
    setPage(1);
  };

  const currentSearch = searchParams.get("search");
  const currentCategory = searchParams.get("category");
  const currentSortValue = filters.sortBy
    ? `${filters.sortBy}:${filters.sortOrder || "desc"}`
    : "best_match";
  const currentSortLabel =
    MOBILE_SORT_OPTIONS.find((option) => option.value === currentSortValue)
      ?.label || "Recommended";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 md:px-6 py-0 md:py-4">
        {/* Top Header Row: Breadcrumbs + Sort */}
        <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
          <nav className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 ">
            <Link
              to="/"
              className="hover:text-gray-900 hover:underline transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              to="/products"
              className="hover:text-gray-900 hover:underline transition-colors hidden md:block"
            >
              Products
            </Link>
            {currentCategory && (
              <>
                <ChevronRight className="h-3 w-3 hidden md:block" />
                <Link
                  to={`/products?category=${currentCategory}`}
                  className="hover:text-gray-900 transition-colors hover:underline capitalize"
                >
                  {currentCategory.replace(/_/g, " ")}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 truncate max-w-[240px]">
              {currentSearch}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-[13px] text-gray-800 font-medium">
              Sort by
            </span>
            <ProductsToolbar
              totalResults={data?.total || 0}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={`${filters.sortBy || "date_created"}:${filters.sortOrder || "desc"}`}
              onSortChange={handleSortChange}
              onFilterClick={() => setAdvancedFiltersOpen(true)}
            />
          </div>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className="hidden xl:block w-[265px] 2xl:w-72 shrink-0 sticky top-24 self-start max-h-[calc(100vh-[100px])] overflow-y-auto scrollbar-hide pb-10">
            <h3 className="text-[14px] font-bold text-gray-900 mb-3 py-2.5 px-3 rounded-[6px] border-b border-gray-200 uppercase tracking-wide">
              Shopping Options {data?.total ? `(${data.total} Results)` : ""}
            </h3>
            <ProductFilters
              onFilterChange={handleFilterChange}
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              onAdvancedFilterClick={() => setAdvancedFiltersOpen(true)}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Header Tabs (Hidden on Desktop) */}
            <div className="md:hidden sticky top-[66px] z-30 bg-white px2 flex items-center justify-between sm:justify-evenly border-b border-gray-100 h-10 mb-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-[14px] font-medium h-full px-2 relative transition-colors flex items-center gap-1 text-gray-900"
                    aria-label="Open sort options"
                  >
                    {currentSortLabel}
                    <ChevronDown className="h-3.5 w-3.5" />
                    {/* <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary rounded-t-full" /> */}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {MOBILE_SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={cn(
                        "text-sm",
                        currentSortValue === option.value && "font-semibold",
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={() => handleSortChange("sold_count:desc")}
                className={cn(
                  "text-[14px] font-medium h-full px-2 relative transition-colors",
                  filters.sortBy === "sold_count"
                    ? "text-gray-900"
                    : "text-gray-500",
                )}
              >
                Most Popular
                {/* {filters.sortBy === "sold_count" && (
                  <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary rounded-t-full" />
                )} */}
              </button>

              <button
                onClick={() => {
                  const isCurrentPrice = filters.sortBy === "price";
                  const nextOrder =
                    isCurrentPrice && filters.sortOrder === "asc"
                      ? "desc"
                      : "asc";
                  handleSortChange(`price:${nextOrder}`);
                }}
                className={cn(
                  "text-[14px] font-medium h-full px-2 relative flex items-center gap-1 transition-colors",
                  filters.sortBy === "price"
                    ? "text-gray-900"
                    : "text-gray-500",
                )}
              >
                Price
                <ArrowUpDown className="h-3 w-3" />
                {/* {filters.sortBy === "price" && (
                  <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary rounded-t-full" />
                )} */}
              </button>

              <div className="h-4 border-r border-gray-200 -mr-2"></div>

              <button
                onClick={() => setAdvancedFiltersOpen(true)}
                className="text-[14px] font-medium h-full px-2 relative flex items-center gap-1 text-gray-700"
                aria-label="Open product filters"
              >
                Filter
                <Icon icon="pixel:filter" className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Product Grid */}
            <ProductGrid
              products={data?.items || []}
              isLoading={isLoading}
              viewMode={viewMode}
              masonryMobile
              emptyMessage={
                currentSearch
                  ? `No products found for "${currentSearch}"`
                  : "No products found"
              }
            />

            {/* Clear Filters Button */}
            {!isLoading && data?.items?.length === 0 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setSearchParams(new URLSearchParams());
                    setFilters({});
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Clear search & filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={data.pages}
                  onPageChange={setPage}
                />
              </div>
            )}

            {/* Results summary */}
            {data && data.total > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-10 mb-4 md:my-14">
                Showing {(page - 1) * 24 + 1} -{" "}
                {Math.min(page * 24, data.total)} of{" "}
                {data.total.toLocaleString()} results
              </p>
            )}
          </div>
        </div>
      </div>
      <ProductAdvancedFiltersModal
        isOpen={advancedFiltersOpen}
        onClose={() => setAdvancedFiltersOpen(false)}
        initialFilters={filters}
        onApply={handleFilterChange}
      />
    </div>
  );
}
