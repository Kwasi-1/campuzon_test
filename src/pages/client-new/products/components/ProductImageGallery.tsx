import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  onImageClick?: (index: number) => void;
}

export function ProductImageGallery({
  images,
  productName,
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
    <div className="flex gap-4 md:gap-[30px] max-h-[600px]">
      {/* Vertical Thumbnail Strip — desktop only */}
      {images.length > 1 && (
        <div className="hidden md:flex flex-col gap-2.5 w-[65px] lg:w-[75px] shrink-0 pt-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "relative aspect-[4/5] w-full overflow-hidden bg-white transition-all duration-150",
                i === selectedIndex
                  ? "border border-gray-300 opacity-100"
                  : "border border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <img
                src={img}
                alt={`${productName} view ${i + 1}`}
                className="h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative flex-1 min-w-0 bg-white group cursor-zoom-in max-h-[600px]">
        {/* Zoom Overlay (visible on hover) */}
        <button
          onClick={() => {
            openLightbox(selectedIndex);
            onImageClick?.(selectedIndex);
          }}
          aria-label="Zoom image"
          className="absolute top-4 right-4 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ZoomIn className="h-5 w-5 text-gray-700" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="aspect-square md:aspect-[4/5] lg:aspect-square w-full overflow-hidden flex items-center justify-center max-h-[600px]"
            onClick={() => {
              openLightbox(selectedIndex);
              onImageClick?.(selectedIndex);
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, { offset }) => {
              if (offset.x < -40) next();
              else if (offset.x > 40) prev();
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden flex gap-[5px] pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-[5px] rounded-full transition-all duration-200",
                  i === selectedIndex
                    ? "w-4 bg-gray-900"
                    : "w-[5px] bg-gray-300",
                )}
              />
            ))}
          </div>
        )}

        {/* Desktop arrow navigation (Optional if you prefer them over thumbnails. Usually Farfetch hides them if thumbnails exist, but let's keep them on hover) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-gray-800" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
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
            className="fixed inset-0 z-[100] bg-white flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 md:top-8 md:right-10 z-10 h-12 w-12 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-900 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6 lg:h-8 lg:w-8 font-light" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) =>
                      i === 0 ? images.length - 1 : i - 1,
                    );
                  }}
                  className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-10 h-14 w-14 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft
                    className="h-8 w-8 lg:h-10 lg:w-10 font-light"
                    strokeWidth={1}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) =>
                      i === images.length - 1 ? 0 : i + 1,
                    );
                  }}
                  className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-10 h-14 w-14 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight
                    className="h-8 w-8 lg:h-10 lg:w-10 font-light"
                    strokeWidth={1}
                  />
                </button>
              </>
            )}

            <div
              className="flex flex-col items-center gap-6 px-16 py-8 h-full w-full max-w-screen-xl mx-auto justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={images[lightboxIndex]}
                alt={productName}
                className="max-h-[75vh] max-w-full object-contain select-none"
              />
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 px-4 max-w-full">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className={cn(
                        "h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden bg-white transition-all duration-200 border",
                        i === lightboxIndex
                          ? "border-gray-900 opacity-100"
                          : "border-transparent opacity-50 hover:opacity-100",
                      )}
                    >
                      <img
                        src={img}
                        className="h-full w-full object-contain p-1"
                        alt=""
                      />
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
