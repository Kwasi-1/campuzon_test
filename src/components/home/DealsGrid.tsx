import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface DealsGridProps {
  products: Product[];
  className?: string;
}

export function DealsGrid({ products, className }: DealsGridProps) {
  if (products.length === 0) return null;

  const [featured, ...rest] = products;
  const gridProducts = rest.slice(0, 8);

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-4", className)}>
      {/* Featured Deal */}
      {featured && (
        <FeaturedDealCard product={featured} className="lg:row-span-2" />
      )}

      {/* Grid of Smaller Deals */}
      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        {gridProducts.map((product) => (
          <DealCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function FeaturedDealCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn(
        "group relative bg-white rounded-xl overflow-hidden border border-border hover:border-primary transition-colors",
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-square">
        <img
          src={product.images[0] || product.thumbnail || ""}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Timer Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
          <Clock className="w-3 h-3" />
          <span>Ends in 12h 30m</span>
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function DealCard({ product }: { product: Product }) {
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice!) * 100)
    : 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={product.images[0] || product.thumbnail || ""}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-1">
        <h3 className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
