import type { Product } from "@/types-new";
import { ProductCard } from "./ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SimilarProductsProps {
  products: Product[];
  title?: string;
  storeName?: string;
  storeSlug?: string;
}

export function SimilarProducts({
  products,
  title = "More from this store",
  storeName,
  storeSlug,
}: SimilarProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        dragFree: true,
      }}
      className="w-full mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-200"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl tracking-tight font-bold text-gray-900">{title}</h2>

        <div className="flex items-center gap-3">
          {storeSlug && (
            <Link
              to={`/stores/${storeSlug}`}
              className="text-xs underline text-gray-500 hover:text-gray-900 transition-colors hidden sm:block"
            >
              View all from {storeName || "this seller"}
            </Link>
          )}
          {/* Arrow buttons — desktop */}
          <div className="hidden md:flex items-center gap-1">
            <CarouselPrevious className="static translate-y-0 flex h-8 w-8 items-center justify-center border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 transition-colors" />
            <CarouselNext className="static translate-y-0 flex h-8 w-8 items-center justify-center border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 transition-colors" />
          </div>
        </div>
      </div>

      <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-4">
        {products.map((product, index) => (
          <CarouselItem
            key={product.id}
            className="pl-2 sm:pl-3 md:pl-4 basis-[calc(50%)] sm:basis-[calc(50%-6px)] md:basis-[calc(33.333%-8px)] lg:basis-[calc(25%-8px)] xl:basis-[calc(20%-8px)]"
          >
            <ProductCard product={product} index={index} variant="grid" />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
