import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton, EmptyState } from '@/components/ui';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  isLoading,
  emptyMessage = 'No products found',
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title={emptyMessage}
        description="Try adjusting your filters or search query"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
