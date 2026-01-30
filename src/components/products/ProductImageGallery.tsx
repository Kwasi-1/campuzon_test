import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, Heart, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  cartCount?: number;
  isInWishlist?: boolean;
  watchersCount?: number;
  onWishlistToggle?: () => void;
  onImageClick?: (index: number) => void;
}

export function ProductImageGallery({
  images,
  productName,
  cartCount,
  isInWishlist,
  watchersCount,
  onWishlistToggle,
  onImageClick,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const isVideoImage = Array(images.length).fill(false);

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="flex gap-4">
      {/* Vertical Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-20 md:w-24 max-h-[585px] overflow-y-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-[#f2f2f2] flex-shrink-0",
                selectedImageIndex === index
                  ? "border-gray-900 ring-2 ring-gray-900"
                  : "border-gray-300",
              )}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {isVideoImage[index] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-900 fill-current" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/5 rounded-2xl" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Container */}
      <div className="flex-1">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#f2f2f2] border border-gray-200">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedImageIndex}
              src={images[selectedImageIndex]}
              alt={productName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>

          {/* Cart Badge */}
          {cartCount && cartCount > 0 && (
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-red-600 text-white px-3 py-1 rounded-2xl text-xs font-bold uppercase tracking-wide shadow-sm">
                In {cartCount} cart{cartCount > 1 ? "s" : ""}
              </div>
            </div>
          )}

          {/* Top Right Actions */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {/* Zoom/Expand Icon */}
            <button
              onClick={() => onImageClick?.(selectedImageIndex)}
              className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              aria-label="Open image gallery"
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>

            {/* Wishlist Heart with Watchers Count */}
            {onWishlistToggle && (
              <button
                onClick={onWishlistToggle}
                className="bg-white/95 backdrop-blur-sm rounded-full flex items-center gap-1 px-3 h-12 shadow-lg hover:bg-white transition-colors"
                aria-label={
                  isInWishlist ? "Remove from watchlist" : "Add to watchlist"
                }
              >
                {watchersCount && watchersCount > 0 && (
                  <span className="text-sm font-medium text-gray-900">
                    {watchersCount >= 1000
                      ? `${(watchersCount / 1000).toFixed(1)}K`
                      : watchersCount}
                  </span>
                )}
                <Heart
                  className={cn(
                    "w-5 h-5",
                    isInWishlist
                      ? "text-red-500 fill-current"
                      : "text-gray-700",
                  )}
                />
              </button>
            )}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg flex items-center justify-center z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg flex items-center justify-center z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Video Play Button Overlay (if current image is video) */}
          {isVideoImage[selectedImageIndex] && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-900 fill-current ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Share Button Below Image */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: productName,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-gray-400 rounded-full hover:border-gray-500 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-900"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
