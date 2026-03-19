import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, Heart, Play, X } from "lucide-react";
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const isVideoImage = Array(images.length).fill(false);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

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
        <div className="hidden md:flex flex-col gap-2 w-20 md:w-24 max-h-[585px] overflow-y-auto p-0.5">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-[#f2f2f2] flex-shrink-0",
                selectedImageIndex === index
                  ? "border-gray-900 ring-2 ring-gray-50"
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
        <div className="relative aspect-[4/3] rounded-md md:rounded-xl overflow-hidden bg-gray-50">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedImageIndex}
              src={images[selectedImageIndex]}
              alt={productName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full object-cover cursor-pointer touch-pan-y"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset }) => {
                if (offset.x < -50) {
                  handleNextImage();
                } else if (offset.x > 50) {
                  handlePrevImage();
                }
              }}
              onClick={() => {
                openLightbox(selectedImageIndex);
                onImageClick?.(selectedImageIndex);
              }}
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
              onClick={() => {
                openLightbox(selectedImageIndex);
                onImageClick?.(selectedImageIndex);
              }}
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

          {/* Navigation Arrows & Pagination Dots */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg items-center justify-center z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg items-center justify-center z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>

              {/* Mobile Pagination Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex md:hidden items-center gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1.5 rounded-full pointer-events-none">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      selectedImageIndex === index
                        ? "bg-white w-3"
                        : "bg-white/60 w-1.5"
                    )}
                  />
                ))}
              </div>
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </>
            )}

            {/* Main Image content */}
            <div 
              className="w-full h-full p-4 sm:p-12 md:p-24 flex flex-col items-center justify-center pt-16 sm:pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={images[lightboxIndex]}
                alt={`${productName} fullscreen`}
                className="max-w-full max-h-[70vh] sm:max-h-[95vh] h-full object-contain rounded-md select-none"
              />
              
              {/* Optional: Thumbnails below image */}
              {images.length > 1 && (
                <div className="mt-4 sm:mt-6 max-w-full overflow-x-auto mx-auto pb-2 flex gap-2 hide-scrollbar">
                  {images.map((img, i) => (
                     <button 
                        key={i}
                        onClick={() => setLightboxIndex(i)}
                        className={cn(
                          "w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all block",
                          lightboxIndex === i ? "border-white" : "border-transparent opacity-50 hover:opacity-100"
                        )}
                     >
                       <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${i + 1}`} />
                     </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
