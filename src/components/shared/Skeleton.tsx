import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

// eBay-style product card skeleton for grid view
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Image placeholder */}
      <div className="aspect-square rounded-lg border border-border bg-muted animate-pulse" />

      {/* Content */}
      <div className="pt-3 space-y-2">
        {/* Title */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        {/* Specs */}
        <Skeleton className="h-3 w-1/2" />

        {/* Price */}
        <Skeleton className="h-6 w-20 mt-2" />

        {/* Buy It Now */}
        <Skeleton className="h-3 w-16" />

        {/* Delivery */}
        <Skeleton className="h-3 w-24" />

        {/* Location */}
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

// eBay-style product card skeleton for list view
export function ProductCardListSkeleton() {
  return (
    <div className="flex gap-4 py-4 border-b border-border">
      {/* Wishlist placeholder */}
      <Skeleton className="w-7 h-7 rounded-full shrink-0" />

      {/* Image placeholder */}
      <Skeleton className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] shrink-0 rounded-lg" />

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />

        {/* Specs */}
        <Skeleton className="h-3 w-1/3" />

        {/* Price */}
        <Skeleton className="h-6 w-24 mt-2" />

        {/* Buy It Now */}
        <Skeleton className="h-3 w-16" />

        {/* Delivery */}
        <Skeleton className="h-3 w-32" />

        {/* Location */}
        <Skeleton className="h-3 w-40" />

        {/* Returns & Sold */}
        <div className="flex gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  viewMode?: "grid" | "list";
}

export function ProductGridSkeleton({
  count = 8,
  viewMode = "grid",
}: ProductGridSkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="flex flex-col">
        {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
          <ProductCardListSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="rounded-xl bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

export function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl p-4",
          isOwn ? "bg-primary/20" : "bg-muted",
        )}
      >
        <Skeleton className={cn("h-4", isOwn ? "w-32" : "w-48")} />
      </div>
    </div>
  );
}

export function ChatMessagesSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <MessageSkeleton />
      <MessageSkeleton isOwn />
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton isOwn />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Skeleton sub-components ────────────────────────────────────────────────

export function StatCardsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="rounded-3xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-32 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function RecentOrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-3">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg p-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
  
export function TopProductsSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {["Product", "Sales", "Revenue", "Stock", "Actions"].map((h) => (
              <th
                key={h}
                className="text-left py-3 px-4 font-medium text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
              </td>
              <td className="py-3 px-4">
                <Skeleton className="h-4 w-8 rounded ml-auto" />
              </td>
              <td className="py-3 px-4">
                <Skeleton className="h-4 w-20 rounded ml-auto" />
              </td>
              <td className="py-3 px-4">
                <Skeleton className="h-6 w-14 rounded-full ml-auto" />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StoreRatingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-3 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-2 flex-1 rounded-full" />
            <Skeleton className="h-4 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickStatsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-44 rounded" />
            </div>
          </div>
          <Skeleton className="h-7 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}

