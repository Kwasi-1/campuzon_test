import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, X, ZoomIn } from "lucide-react";
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const prev = () =>
    setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () =>
    setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="flex gap-3 md:gap-4">
      {/* Vertical Thumbnail Strip — desktop only */}
      {images.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 w-[72px] shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "relative aspect-[3/4] w-full overflow-hidden bg-[#f2f2f2] border transition-all duration-150",
                i === selectedIndex
                  ? "border-gray-900"
                  : "border-transparent hover:border-gray-400",
              )}
            >
              <img
                src={img}
                alt={`${productName} view ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative flex-1 min-w-0">
        {/* Wishlist + zoom overlay (top right) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {onWishlistToggle && (
            <button
              onClick={onWishlistToggle}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow hover:bg-white transition-colors"
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  isInWishlist ? "fill-gray-900 text-gray-900" : "text-gray-700",
                )}
              />
            </button>
          )}
          <button
            onClick={() => {
              openLightbox(selectedIndex);
              onImageClick?.(selectedIndex);
            }}
            aria-label="Zoom image"
            className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow hover:bg-white transition-colors"
          >
            <ZoomIn className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        {/* In-cart badge */}
        {cartCount && cartCount > 0 ? (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm">
              In Cart ({cartCount})
            </span>
          </div>
        ) : null}

        {/* Watchers */}
        {watchersCount && watchersCount > 1 ? (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2.5 py-1 rounded-sm shadow">
              {watchersCount} people viewing
            </span>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="aspect-[3/4] md:aspect-[4/5] w-full overflow-hidden bg-[#f2f2f2] cursor-zoom-in"
            onClick={() => {
              openLightbox(selectedIndex);
              onImageClick?.(selectedIndex);
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, { offset }) => {
              if (offset.x < -50) next();
              else if (offset.x > 50) prev();
            }}
          >
            <img
              src={images[selectedIndex]}
              alt={productName}
              className="h-full w-full object-cover object-center select-none"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Mobile — swipe dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 md:hidden flex gap-1 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  i === selectedIndex ? "w-4 bg-gray-900" : "w-1.5 bg-gray-400",
                )}
              />
            ))}
          </div>
        )}

        {/* Desktop arrow navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow hover:bg-white transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-800" />
            </button>
            <button
              onClick={next}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow hover:bg-white transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div
              className="flex flex-col items-center gap-4 px-16 py-8 max-h-screen"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={images[lightboxIndex]}
                alt={productName}
                className="max-h-[80vh] max-w-full object-contain select-none"
              />
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className={cn(
                        "h-14 w-14 shrink-0 overflow-hidden border-2 transition-all",
                        i === lightboxIndex
                          ? "border-white opacity-100"
                          : "border-transparent opacity-50 hover:opacity-80",
                      )}
                    >
                      <img src={img} className="h-full w-full object-cover" alt="" />
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
