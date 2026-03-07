
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onProductClick?: (id: number) => void;
  onViewAllClick?: () => void;
  onCategoryClick?: (category: string) => void;
  viewAllText?: string;
  categories?: string[];
  className?: string;
  notWhite?: boolean;
  isLoading?: boolean;
}

const ProductSection = ({
  title,
  subtitle,
  products,
  onProductClick,
  onViewAllClick,
  onCategoryClick,
  viewAllText = "All Products",
  categories,
  className,
  notWhite,
  isLoading = false,
}: ProductSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    onCategoryClick?.(category); // Call external handler if provided
  };

  const filteredProducts =
    activeCategory && activeCategory !== "All"
      ? products.filter((p) => p.category === activeCategory)
      : products;

  return (
    <section className={`pt-16 md:pb-8 ${className || "bg-white"}`}>
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 uppercase">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-gray-600 mt-2">{subtitle}</p>
            )}
          </div>
          {categories ? (
            <div className="hidden md:flex rounded-full border p-2 bg-gray-50">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`text-sm font-medium transition-colors py-2 px-4 rounded-full cursor-pointer ${
                    activeCategory === category
                      ? "text-gray-900 border border-white bg-white"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          ) : (
            <Link
              to={"/products"}
              className="uppercase text-gray-500 text-sm underline flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              view all
              <Icon icon={'lucide:arrow-up-right'}/>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading || products.length === 0 ? (
            Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onClick={onProductClick}
                notWhite={notWhite}
              />
            ))
          )}
        </div>

        <div className="text-center hidden mt-6">
          <Button
            variant="outline"
            size="lg"
            className="group bg-primary hover:bg-primary/90 text-white border-primary hover:border-primary/90"
            onClick={onViewAllClick}
          >
            {viewAllText}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
