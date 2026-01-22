import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton, EmptyState } from "@/components/ui";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  viewMode?: ViewMode;
}

export function ProductGrid({
  products,
  isLoading,
  emptyMessage = "No products found",
  viewMode = "grid",
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={12} />;
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
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
          : "flex flex-col gap-4",
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          variant={viewMode}
        />
      ))}
    </div>
  );
}
