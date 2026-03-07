import React from "react";
import { Star, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: string;
  image?: string;
  store: string;
  onClick?: (id: string | number) => void;
  notWhite?: boolean;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  discount,
  rating,
  reviews,
  image,
  store,
  onClick,
  notWhite,
}: ProductCardProps) => {
  return (
    <Card
      className="group cursor-pointer border-0 shadow-none  transition-all duration-300 overflow-hidden bg-transparent rounded"
      onClick={() => onClick?.(id)}
    >
      <div className="relative">
        <div
          className={`aspect-square p-5 md:p-6 flex items-center justify-center rounded-md md:rounded-lg ${
            notWhite ? "bg-gray-50/80" : "bg-gray-50/80"
          } border border-gray-100/50 overflow-hidden`}
        >
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-300"
          />
        </div>

        {/* Add to Cart Button */}
        <button className="absolute bottom-3 right-3 w-8 h-8 md:w-10 md:h-10 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 opacity-0 group-hover:opacity-100 shadow-lg">
          <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>

        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}
      </div>

      <CardContent className="pt-3 md:pt-4 px-1">
        {/* Store Name */}
        <div className="text-xs text-gray-500 mb-1">{store}</div>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">{rating}</span>
            <span className="text-sm text-gray-400">
              ({reviews || "0 reviews"})
            </span>
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-medium text-sm md:text-base text-gray-900 mb-2 md:mb-2 line-clamp-2 leading-tight">
          {name}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-semibold text-gray-900">
            GH₵ {price.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              GH₵ {originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
