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
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem
              key={product.id}
              className="basis-[68%] sm:basis-[45%] md:basis-[34%] lg:basis-[25%] xl:basis-[20%]"
            >
              <ProductCard product={product} index={index} variant="grid" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4" />
        <CarouselNext className="hidden md:flex -right-4" />
      </Carousel>
    </div>
  );
}
