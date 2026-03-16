import type { ReactNode, SVGProps } from "react";
import { MapPin, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types-new";

interface OrderCardProps {
  order: Order;
  statusBadge: ReactNode;
  formatAmount: (amount: number) => string;
  onViewDetails?: (orderId: string) => void;
  footerActions?: ReactNode;
  detailsLabel?: string;
}

export function OrderCard({
  order,
  statusBadge,
  formatAmount,
  onViewDetails,
  footerActions,
  detailsLabel = "Details",
}: OrderCardProps) {
  const itemCount =
    order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const deliveryLocation =
    order.deliveryAddress ||
    order.shippingAddress?.addressLine1 ||
    order.shippingAddress?.city ||
    "Not Provided";
  const originLocation = order.store?.storeName
    ? `${order.store.storeName}, Campus`
    : "Warehouse, Campus";

  const estimatedArrival = new Date(
    new Date(order.dateCreated).getTime() + 3 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
              Order ID
            </p>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-800" />
              <h3 className="text-xl font-bold text-gray-900">
                {order.orderNumber}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-gray-100 px-3 py-1 text-sm font-medium text-gray-400 shadow-sm">
              Estimated arrival: {estimatedArrival}
            </span>
            {statusBadge}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 text-sm font-medium md:flex-row md:items-center">
          <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-gray-800">
            <Truck className="h-4 w-4 text-gray-500" />
            <span>{originLocation}</span>
          </div>

          <div className="hidden flex-1 items-center justify-center opacity-30 md:flex">
            <div className="flex w-full max-w-[120px] items-center justify-between gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
              <div className="h-1 w-1 rounded-full bg-gray-500" />
              <div className="h-1 w-1 rounded-full bg-gray-400" />
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <div className="mx-1 h-[1px] flex-1 border-b border-dashed border-gray-400" />
              <ChevronRight className="h-3 w-3 text-gray-500" />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-gray-800">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="line-clamp-1 max-w-[200px]">
              {deliveryLocation}
            </span>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-4">
          {order.items?.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center gap-4 rounded-2xl border border-gray-100/60 bg-gray-50/50 p-3"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100 shadow-sm">
                <img
                  src={item.productImage || "/placeholder-product.jpg"}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="mb-1 truncate text-base font-semibold text-gray-900">
                  {item.productName}
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-gray-900">
                    {formatAmount(item.unitPrice || 0)}
                  </span>
                  <span className="font-medium text-gray-400">
                    x{item.quantity}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-medium text-gray-400">
                  Qty: {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col justify-between gap-4 bg-[#F3F3F3] p-6 md:flex-row md:items-center md:px-8 md:py-5">
        <div className="flex items-baseline gap-2">
          <p className="text-base font-bold text-gray-900">
            Total: {formatAmount(order.totalAmount || 0)}
          </p>
          <p className="text-sm font-medium text-gray-400">
            ({itemCount} item{itemCount !== 1 ? "s" : ""})
          </p>
        </div>

        {footerActions ||
          (onViewDetails ? (
            <Button
              onClick={() => onViewDetails(order.id)}
              className="h-11 rounded-full bg-[#1C1C1E] px-8 text-white shadow-sm hover:bg-black"
            >
              {detailsLabel}
            </Button>
          ) : null)}
      </div>
    </div>
  );
}

function ChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
