import type { Product } from "@/types-new";
import { ProductCard } from "./ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SimilarProductsProps {
  products: Product[];
  title?: string;
}

export function SimilarProducts({
  products,
  title = "More from this store",
}: SimilarProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-4">
          {products.map((product, index) => (
            <CarouselItem
              key={product.id}
              className="pl-2 sm:pl-3 md:pl-4 basis-[calc(50%-4px)] sm:basis-[calc(50%-6px)] md:basis-[calc(33.333%-8px)] lg:basis-[calc(25%-8px)] xl:basis-[calc(20%-8px)]"
            >
              <ProductCard product={product} index={index} variant="grid" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-3 lg:-left-5" />
        <CarouselNext className="hidden md:flex -right-3 lg:-right-5" />
      </Carousel>
    </div>
  );
}
