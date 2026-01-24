import { motion } from "framer-motion";
import {
  ShoppingBag,
  MessageCircle,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Store } from "@/types";

interface StoreHeaderProps {
  store: Store;
  onShare: () => void;
  onContact: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function StoreHeader({
  store,
  onShare,
  onContact,
  onSave,
  isSaved,
}: StoreHeaderProps) {
  // For stores with hero banners/promotions
  const hasHeroBanner = store.banner || store.description;

  return (
    <div className="bg-white">
      {/* Hero Banner Carousel */}
      {hasHeroBanner && (
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
          <div className="relative h-32 sm:h-40 md:h-48">
            {store.banner ? (
              <img
                src={store.banner}
                alt={`${store.storeName} banner`}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700" />
            )}

            {/* Banner Content Overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 md:px-8">
                <div className="max-w-2xl text-white">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
                    Welcome to {store.storeName}!{" "}
                    {store.description && store.description.length > 100
                      ? `${store.description.slice(0, 100)}...`
                      : store.description}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-900/80 border-gray-700 text-white hover:bg-gray-900 mt-3"
                  >
                    Learn more
                  </Button>
                </div>
              </div>
            </div>

            {/* Banner Navigation */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Pause slideshow"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Info Section */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Store Avatar */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-gray-200 bg-white overflow-hidden flex-shrink-0">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.storeName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Store Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  {/* Store Name */}
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {store.storeName}
                  </h1>

                  {/* Store Stats */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                    {store.rating && (
                      <span className="font-medium text-blue-700 hover:underline cursor-pointer">
                        {store.rating.toFixed(1)}% positive feedback
                      </span>
                    )}
                    {store.totalOrders !== undefined && (
                      <span>
                        <span className="font-medium">
                          {store.totalOrders >= 1000
                            ? `${(store.totalOrders / 1000).toFixed(0)}K`
                            : store.totalOrders.toLocaleString()}
                        </span>{" "}
                        items sold
                      </span>
                    )}
                    {store.totalSales !== undefined && (
                      <span>
                        <span className="font-medium">
                          {store.totalSales >= 1000
                            ? `${(store.totalSales / 1000).toFixed(0)}K`
                            : store.totalSales.toLocaleString()}
                        </span>{" "}
                        followers
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShare}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Share2 className="h-4 w-4 mr-1.5" />
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onContact}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    Contact
                  </Button>
                  {onSave && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onSave}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <Heart
                        className={`h-4 w-4 mr-1.5 ${
                          isSaved ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                      {isSaved ? "Saved" : "Save Seller"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
