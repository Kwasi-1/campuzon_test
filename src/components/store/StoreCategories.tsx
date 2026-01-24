import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface StoreCategoriesProps {
  categories: {
    name: string;
    image?: string;
    productCount?: number;
  }[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onSeeAll?: () => void;
}

export function StoreCategories({
  categories,
  selectedCategory,
  onCategorySelect,
  onSeeAll,
}: StoreCategoriesProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Featured categories</h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-sm text-gray-700 hover:text-gray-900 hover:underline font-medium flex items-center gap-0.5"
          >
            See all
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => onCategorySelect(category.name)}
            className={cn(
              "flex flex-col items-center flex-shrink-0 group transition-all",
              selectedCategory === category.name &&
                "ring-2 ring-gray-900 rounded-lg",
            )}
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 mb-2">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <span className="text-2xl text-gray-400">📦</span>
                </div>
              )}
            </div>
            <span className="text-xs sm:text-sm text-gray-700 font-medium text-center capitalize">
              {category.name.replace(/_/g, " ")}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

interface FeaturedItemsProps {
  products: Product[];
  title?: string;
}

export function FeaturedItems({
  products,
  title = "Featured Items",
}: FeaturedItemsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {products.slice(0, 4).map((product) => (
          <a
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex-shrink-0 w-48 group"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 mb-2">
              <img
                src={product.images?.[0] || "/placeholder-product.jpg"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-sm text-gray-900 font-medium line-clamp-2 group-hover:text-primary">
              {product.name}
            </p>
            <p className="text-sm font-bold text-gray-900 mt-1">
              ${product.price.toFixed(2)}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
