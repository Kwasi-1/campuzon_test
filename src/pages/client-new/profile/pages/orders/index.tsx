import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Calendar,
  MapPin,
  Clock,
  Search,
  ShoppingBag,
  Truck,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMyOrders } from "@/hooks";
import { useAuthStore } from "@/stores";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types-new";

// We map our backend statuses to simpler display categories for the sidebar
type DisplayCategory = "on_shipping" | "arrived" | "canceled" | "all";

const CATEGORY_MAP: Record<DisplayCategory, OrderStatus[]> = {
  all: [],
  on_shipping: ["pending", "paid", "processing", "shipped"],
  arrived: ["delivered", "completed"],
  canceled: ["cancelled", "refunded", "disputed"],
};

const getCategory = (status: OrderStatus): DisplayCategory => {
  if (CATEGORY_MAP.on_shipping.includes(status)) return "on_shipping";
  if (CATEGORY_MAP.arrived.includes(status)) return "arrived";
  if (CATEGORY_MAP.canceled.includes(status)) return "canceled";
  return "all";
};

const getStatusBadge = (status: OrderStatus) => {
  const cat = getCategory(status);
  switch (cat) {
    case "on_shipping":
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
          On Deliver
        </div>
      );
    case "arrived":
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
          Arrived
        </div>
      );
    case "canceled":
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
          Canceled
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
          {status}
        </div>
      );
  }
};

export function OrdersPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<DisplayCategory>("all");
  const { isAuthenticated } = useAuthStore();

  const { data: rawOrders, isLoading } = useMyOrders();
  const displayOrders = useMemo(() => rawOrders || [], [rawOrders]);

  // Calculate counts
  const counts = useMemo(() => {
    return {
      all: displayOrders.length,
      on_shipping: displayOrders.filter((o) => getCategory(o.status) === "on_shipping").length,
      arrived: displayOrders.filter((o) => getCategory(o.status) === "arrived").length,
      canceled: displayOrders.filter((o) => getCategory(o.status) === "canceled").length,
    };
  }, [displayOrders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (activeCategory === "all") return displayOrders;
    return displayOrders.filter((o) => getCategory(o.status) === activeCategory);
  }, [displayOrders, activeCategory]);

  if (!isAuthenticated) {
    navigate("/login?redirect=/orders");
    return null;
  }

  const handleViewDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const categories: { key: DisplayCategory; label: string; count: number }[] = [
    { key: "all", label: "All Orders", count: counts.all },
    { key: "on_shipping", label: "On Shipping", count: counts.on_shipping },
    { key: "arrived", label: "Arrived", count: counts.arrived },
    { key: "canceled", label: "Canceled", count: counts.canceled },
  ];

  return (
    <div className="mx-auto flex flex-col lg:flex-row gap-8 pb-12">
      {/* Sidebar Filters */}
      <div className="lg:w-64 shrink-0">
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center justify-between pl-5 pr-1 py-1 rounded-full transition-all shrink-0 lg:shrink-auto whitespace-nowrap lg:whitespace-normal border shadowsm ${
                  isActive
                    ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
                    : "bg-white text-gray-700 bordergray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium text-[15px]">{cat.label}</span>
                <span
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-xs font-bold ${
                    isActive ? "bg-white text-black" : "bg-secondary text-gray-600"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-gray-100 rounded-[28px] p-6 bg-white overflow-hidden shadow-sm">
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
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="border border-gray-100 bg-white rounded-[28px] overflow-hidden shadow-sm">
            <div className="text-center py-16 flex flex-col justify-center h-full items-center">
              <EmptyState
                icon={<ShoppingBag className="h-16 w-16 text-gray-300" />}
                title="No orders found"
                description={`You don't have any orders in the "${
                  categories.find((c) => c.key === activeCategory)?.label
                }" category yet.`}
                action={
                  <Button onClick={() => navigate("/products")} className="mt-6 rounded-full px-8 h-12">
                    Start Shopping
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
              const deliveryLocation = order.deliveryAddress || "Not Provided";
              // If there's no store location in the data, we mock an origin for the UI effect
              const originLocation = order.store?.storeName ? `${order.store.storeName}, Campus` : "Warehouse, Campus";

              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-100 rounded-[28px] overflow-hidden shadow-sm flex flex-col"
                >
                  {/* Top Header */}
                  <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">
                          Order ID
                        </p>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-gray-800" />
                          <h3 className="text-xl font-bold text-gray-900">{order.orderNumber}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm border border-gray-100 px-3 py-1 rounded-full text-gray-400 font-medium shadow-sm">
                          Estimated arrival:{" "}
                          {new Date(
                            new Date(order.dateCreated).getTime() + 3 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Location Route */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-sm font-medium gap-4">
                      <div className="flex items-center gap-2 text-gray-800 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span>{originLocation}</span>
                      </div>
                      
                      {/* Dotted Line Graphic */}
                      <div className="hidden md:flex flex-1 items-center justify-center opacity-30">
                         <div className="w-full max-w-[120px] flex items-center justify-between gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
                           <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                           <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                           <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                           <div className="flex-[1] h-[1px] border-b border-dashed border-gray-400 mx-1"></div>
                           <ChevronRight className="w-3 h-3 text-gray-500" />
                         </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-800 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="line-clamp-1 max-w-[200px]">{deliveryLocation}</span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="grid grid-cols-1 gap-4 mt-2">
                      {order.items?.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/60"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-sm border border-gray-100">
                            <img
                              src={item.productImage || "/placeholder-product.jpg"}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-base mb-1 truncate">
                              {item.productName}
                            </h4>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-bold text-gray-900">
                                {formatPrice(item.unitPrice)}
                              </span>
                              <span className="text-gray-400 font-medium">
                                x{item.quantity}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mt-0.5 font-medium">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Summary Bar */}
                  <div className="bg-[#F3F3F3] p-6 md:px-8 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-auto">
                    <div className="flex items-baseline gap-2">
                      <p className="text-base font-bold text-gray-900">
                        Total: {formatPrice(order.totalAmount)}
                      </p>
                      <p className="text-sm font-medium text-gray-400">
                        ({itemCount} item{itemCount !== 1 && "s"})
                      </p>
                    </div>
                    <Button
                      onClick={() => handleViewDetails(order.id)}
                      className="rounded-full bg-[#1C1C1E] text-white hover:bg-black px-8 h-11 shadow-sm"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal internal component for the little right arrow
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
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
