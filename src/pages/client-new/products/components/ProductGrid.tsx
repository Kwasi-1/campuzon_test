import type { Product } from "@/types-new";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
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
  masonryMobile?: boolean;
}

export function ProductGrid({
  products,
  isLoading,
  emptyMessage = "No products found",
  viewMode = "grid",
  className,
  masonryMobile = false,
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
          ? masonryMobile
            ? `columns-2 gap-2 md:columns-1 md:grid md:grid-cols-3 ${isStorePage ? "lg:grid-cols-5" : "lg:grid-cols-4"} md:gap-x-4 md:gap-y-6`
            : `grid grid-cols-2 gap-3 md:grid-cols-3 ${isStorePage ? "lg:grid-cols-5" : "lg:grid-cols-4"} md:gap-x-4 md:gap-y-6`
          : "flex flex-col",
        className,
      )}
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className={cn(
            viewMode === "grid" && masonryMobile
              ? "inline-block w-full mb-2 align-top break-inside-avoid md:mb-0"
              : "",
          )}
        >
          <ProductCard
            product={product}
            index={index}
            variant={viewMode}
            masonryMobile={masonryMobile}
          />
        </div>
      ))}
    </div>
  );
}
