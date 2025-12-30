import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Select, Badge } from '@/components/ui';
import { CATEGORY_OPTIONS } from '@/lib/utils';
import type { Category } from '@/types';

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface FilterState {
  category?: Category;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const sortOptions = [
  { value: 'date_created:desc', label: 'Newest First' },
  { value: 'date_created:asc', label: 'Oldest First' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'rating:desc', label: 'Highest Rated' },
  { value: 'sold_count:desc', label: 'Best Selling' },
];

// Extracted filter content to avoid creating during render
interface FilterContentProps {
  filters: FilterState;
  activeFilterCount: number;
  onClearFilters: () => void;
  onCategoryChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

function FilterContent({
  filters,
  activeFilterCount,
  onClearFilters,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Category */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Category</label>
        <Select
          options={[{ value: '', label: 'All Categories' }, ...CATEGORY_OPTIONS]}
          value={filters.category || ''}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="Select category"
        />
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Price Range</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Sort By</label>
        <Select
          options={sortOptions}
          value={`${filters.sortBy || 'date_created'}:${filters.sortOrder || 'desc'}`}
          onChange={(e) => onSortChange(e.target.value)}
        />
      </div>
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

  const handleFilterChange = useCallback((key: keyof FilterState, value: unknown) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value || undefined };
      
      // Update URL params
      const params = new URLSearchParams(searchParams);
      const paramKey = key === 'minPrice' ? 'min_price' : key === 'maxPrice' ? 'max_price' : key === 'sortBy' ? 'sort_by' : key === 'sortOrder' ? 'sort_order' : key;
      
      if (value) {
        params.set(paramKey, String(value));
      } else {
        params.delete(paramKey);
      }
      setSearchParams(params);
      onFilterChange(newFilters);
      
      return newFilters;
    });
  }, [searchParams, setSearchParams, onFilterChange]);

  const handleSortChange = useCallback((value: string) => {
    const [sortBy, sortOrder] = value.split(':');
    setFilters((prev) => {
      const newFilters = { ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' };
      
      const params = new URLSearchParams(searchParams);
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);
      setSearchParams(params);
      onFilterChange(newFilters);
      
      return newFilters;
    });
  }, [searchParams, setSearchParams, onFilterChange]);

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
    onCategoryChange: (value) => handleFilterChange('category', value as Category),
    onMinPriceChange: (value) => handleFilterChange('minPrice', value ? Number(value) : undefined),
    onMaxPriceChange: (value) => handleFilterChange('maxPrice', value ? Number(value) : undefined),
    onSortChange: handleSortChange,
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
          <FilterContent {...filterContentProps} />
        </div>
      </div>

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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-full bg-background z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <FilterContent {...filterContentProps} />
                <div className="mt-6 pt-6 border-t border-border">
                  <Button className="w-full" onClick={onClose}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
