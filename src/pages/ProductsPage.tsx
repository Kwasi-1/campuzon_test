import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { Button, Pagination, Breadcrumb } from '@/components/ui';
import { ProductGrid, ProductFilters, type FilterState } from '@/components/products';
import { useProducts } from '@/hooks';
import type { Category, ProductFilters as ProductFiltersType } from '@/types';
import { useUIStore } from '@/stores';

export function ProductsPage() {
  const [searchParams] = useSearchParams();
  const { filtersOpen, setFiltersOpen } = useUIStore();

  const [filters, setFilters] = useState<FilterState>({
    category: (searchParams.get('category') as Category) || undefined,
    minPrice: searchParams.get('min_price')
      ? Number(searchParams.get('min_price'))
      : undefined,
    maxPrice: searchParams.get('max_price')
      ? Number(searchParams.get('max_price'))
      : undefined,
    sortBy: searchParams.get('sort_by') || undefined,
    sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || undefined,
  });

  const [page, setPage] = useState(1);

  const productFilters: ProductFiltersType = {
    page,
    perPage: 12,
    category: filters.category,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy as ProductFiltersType['sortBy'],
    sortOrder: filters.sortOrder,
    search: searchParams.get('search') || undefined,
  };

  const { data, isLoading } = useProducts(productFilters);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Products' }
        ]}
        className="mb-4"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            {data?.total || 0} products found
          </p>
        </div>
        <Button
          variant="outline"
          className="lg:hidden"
          onClick={() => setFiltersOpen(true)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Content */}
      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <ProductFilters
          onFilterChange={handleFilterChange}
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />

        {/* Products Grid */}
        <div className="flex-1 space-y-8">
          <ProductGrid
            products={data?.items || []}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {data && data.pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
