import { motion } from "framer-motion";
import {
  ShoppingBag,
  MessageCircle,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Pause,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Store } from "@/types-new";

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
  const bannerSrc = store.banner || store.logo;
  const previewText = store.description
    ? store.description.length > 100
      ? `${store.description.slice(0, 100)}...`
      : store.description
    : "Discover what this campus store has in stock right now.";

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-1">
        <div className="relative overflow-hidden rounded-xl md:rounded-xl lg:rounded-[1.125rem] bg-gradient-to-r from-slate-900 to-slate-700">
          <div className="relative h-52 sm:h-56 md:h-56 lg:h-64">
            {bannerSrc ? (
              <img
                src={bannerSrc}
                alt={`${store.storeName} banner`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-secondary/60" />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/55 to-slate-900/20" />

            {store.isVerified && (
              <div className="absolute top-3 md:top-4 right-4 flex items-center gap-1 rounded-full border border-white/15 bg-white/90 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="hidden md:block">Verified</span>
              </div>
            )}

            {/* Banner Content Overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full px-5 py-6 sm:px-6 md:px-8">
                <div className="max-w-2xl text-white">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                    Welcome to {store.storeName}!
                  </h2>
                  <p className="mt-3 max-w-xl text-sm sm:text-base text-white/90 leading-relaxed">
                    {previewText}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-full border-white/30 bg-white text-primary hover:bg-white/90"
                  >
                    Learn more
                  </Button>
                </div>
              </div>
            </div>

            {/* Banner Navigation */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Pause slideshow"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info Section */}
      <div className="border-t border-border/80 px-4 pb-5 pt-0 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-4 flex-row sm:items-center">
            {/* Store Avatar */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="rounded-full border w-fit"
            >
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted ">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.storeName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                    <ShoppingBag className="h-8 w-8 text-primary/70" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Store Details */}
            <div className="min-w-0 flex-1 pt-2 sm:pt-0">
              <h1 className="truncate text-xl  sm:text-2xl font-bold text-foreground lg:text-2xl">
                {store.storeName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {typeof store.rating === "number" && (
                  <span className="font-medium text-primary hover:underline cursor-pointer">
                    {store.rating.toFixed(1)}% positive feedback
                  </span>
                )}
                {typeof store.totalOrders === "number" && (
                  <span>
                    <span className="font-medium text-foreground">
                      {store.totalOrders >= 1000
                        ? `${(store.totalOrders / 1000).toFixed(0)}K`
                        : store.totalOrders.toLocaleString()}
                    </span>{" "}
                    items sold
                  </span>
                )}
                {typeof store.totalSales === "number" && (
                  <span>
                    <span className="font-medium text-foreground">
                      {store.totalSales >= 1000
                        ? `${(store.totalSales / 1000).toFixed(0)}K`
                        : store.totalSales.toLocaleString()}
                    </span>{" "}
                    followers
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="rounded-full text-gray-700 hover:bg-muted hover:text-gray-900"
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onContact}
              className="rounded-full text-gray-700 hover:bg-muted hover:text-gray-900"
            >
              <MessageCircle className="mr-1.5 h-4 w-4" />
              Contact
            </Button>
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className="rounded-full text-gray-700 hover:bg-muted hover:text-gray-900"
              >
                <Heart
                  className={`mr-1.5 h-4 w-4 ${
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
  );
}
