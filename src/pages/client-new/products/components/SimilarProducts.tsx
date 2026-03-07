import type { Product } from "@/types-new";
import { ProductCard } from "./ProductCard";

interface SimilarProductsProps {
  products: Product[];
  wishlistProductIds: Set<any>;
  onWishlistToggle: (productId: any) => void; // Added this to make sure it build successfully on vercel
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Similar Items</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            variant="grid"
          />
        ))}
      </div>
    </div>
  );
}
