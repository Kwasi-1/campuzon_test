import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Star,
  ShoppingBag,
  CheckCircle,
  Store as StoreIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/shared/Skeleton";
import { useStores } from "@/hooks";
import type { Store } from "@/types-new";

function StoreCard({ store }: { store: Store }) {
  const destination = `/stores/${store.storeSlug || store.id}`;
  const bannerSrc = store.logo || store.banner;

  return (
    <Link
      to={destination}
      className="group block bg-card rounded-md border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Banner */}
      <div className="relative h-48 overflow-hidden p-1 pb-0">
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt={`${store.storeName} banner`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-md border"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-secondary/70 flex items-center justify-center rounded-md border">
            <StoreIcon className="h-10 w-10 text-muted-foreground/60" />
          </div>
        )}

        {/* Verified Badge */}
        {store.isVerified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-primary">
            <CheckCircle className="h-3 w-3" />
            Verified
          </div>
        )}
      </div>

      {/* Logo & Info */}
      <div className="relative px-4 pb-4">

        {/* Store Details */}
        <div className="py-4">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {store.storeName}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[2.5rem]">
            {store.description || "No description available"}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            {/* Rating */}
            {typeof store.rating === "number" && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {store.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Total Orders */}
            {typeof store.totalOrders === "number" && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ShoppingBag className="h-4 w-4" />
                <span>{store.totalOrders.toLocaleString()} orders</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function StoreCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Skeleton className="h-48 rounded-md m-1" />
      <div className="relative px-4 pb-4">
        
        <div className="pt-10 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-4 mt-3 pt-3 border-t border-border">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoresPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: storesData, isLoading } = useStores({
    search: searchQuery || undefined,
    sort: "popular",
    page: 1,
    perPage: 100,
  });
  const stores = storesData?.items || [];

  // Filter stores based on search
  const filteredStores = stores.filter(
    (store) =>
      store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Campus Stores</h1>
          <p className="text-muted-foreground mt-1">
            {filteredStores.length}{" "}
            {filteredStores.length === 1 ? "store" : "stores"} on campus
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full rounded-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
      </div>

      {/* Stores Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredStores.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No stores found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? `No stores match "${searchQuery}"`
              : "No stores available at the moment"}
          </p>
        </div>
      )}
    </div>
  );
}
