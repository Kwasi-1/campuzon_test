import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton, EmptyState } from "@/components/ui";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

type ViewMode = "grid" | "list";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  viewMode?: ViewMode;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading,
  emptyMessage = "No products found",
  viewMode = "grid",
  className,
}: ProductGridProps) {
  const location = useLocation();
  const isStorePage = location.pathname.startsWith("/stores/");

  if (isLoading) {
    return <ProductGridSkeleton count={12} viewMode={viewMode} />;
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
          ? `grid grid-cols-2 sm:grid-cols-3 ${isStorePage ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-x-4 gap-y-6`
          : "flex flex-col",
        className,
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
