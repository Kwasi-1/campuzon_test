import { Skeleton } from "../shared/Skeleton"

function OrderCardSkeleton({ index }: { index: number }) {
  return (
    <div
      key={index}
      className="border border-gray-100 rounded-md md:rounded-3xl p-6 bg-white overflow-hidden shadow-sm"
    >
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-6 w-32 rounded" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export default OrderCardSkeleton