import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { Pagination, Breadcrumb } from "@/components/ui";
import {
  ProductGrid,
  ProductFilters,
  ProductsToolbar,
  ProductFilterTabs,
  type FilterState,
} from "@/components/products";
import { useProducts } from "@/hooks";
import type { Category, ProductFilters as ProductFiltersType } from "@/types";
import { useUIStore } from "@/stores";

type ViewMode = "grid" | "list";

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filtersOpen, setFiltersOpen } = useUIStore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState("all");

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            ...(currentCategory
              ? [
                  {
                    label:
                      currentCategory.charAt(0).toUpperCase() +
                      currentCategory.slice(1),
                  },
                ]
              : []),
            ...(currentSearch
              ? [{ label: `"${currentSearch}"` }]
              : [{ label: "Products" }]),
          ]}
          className="mb-4"
        />

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <ProductFilters
            onFilterChange={handleFilterChange}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Results header with save search */}
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-base text-foreground">
                <span className="font-semibold">
                  {data?.total?.toLocaleString() || "0"}+
                </span>{" "}
                results
                {currentSearch && (
                  <>
                    {" "}
                    for <span className="font-semibold">{currentSearch}</span>
                  </>
                )}
              </h1>
              <button className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Heart className="w-4 h-4" />
                Save this search
              </button>
            </div>

            {/* Filter Tabs + Sort/View Toggle Row */}
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 borderb border-border">
              {/* Left: Filter Tabs */}
              <ProductFilterTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Right: Sort and View Toggle */}
              <ProductsToolbar
                totalResults={data?.total || 0}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={`${filters.sortBy || "date_created"}:${filters.sortOrder || "desc"}`}
                onSortChange={handleSortChange}
              />
            </div>

            {/* Product Grid */}
            <ProductGrid
              products={data?.items || []}
              isLoading={isLoading}
              viewMode={viewMode}
              emptyMessage={
                currentSearch
                  ? `No products found for "${currentSearch}"`
                  : "No products found"
              }
            />

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
              <p className="text-center text-sm text-muted-foreground mt-4">
                Showing {(page - 1) * 24 + 1} -{" "}
                {Math.min(page * 24, data.total)} of{" "}
                {data.total.toLocaleString()} results
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
