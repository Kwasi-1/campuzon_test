import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderCard } from "@/components/shared/OrderCard";
import { useMyOrders } from "@/hooks";
import { useAuthStore } from "@/stores";
import { formatPrice } from "@/lib/utils";
import { mockOrders, mockStores } from "@/lib/mockData";
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

// Mock data preview flag
const USE_PREVIEW_MOCK_DATA = true;

// Create varied preview orders with different statuses for design testing
function createPreviewOrders(): Order[] {
  if (mockOrders.length === 0) return [];

  const statuses: OrderStatus[] = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "completed",
    "cancelled",
    "refunded",
  ];

  return mockOrders.slice(0, 8).map((order, index) => {
    const status = statuses[index % statuses.length];
    const baseDate = new Date("2024-12-15");

    return {
      ...order,
      id: `preview-order-${index + 1}`,
      orderNumber: `ORD-PREVIEW-${String(index + 1).padStart(4, "0")}`,
      status,
      paidAt:
        status === "pending"
          ? null
          : new Date(baseDate.getTime() + index * 86400000).toISOString(),
      shippedAt:
        ["pending", "paid", "processing"].includes(status) || !order.shippedAt
          ? null
          : new Date(baseDate.getTime() + (index + 1) * 86400000).toISOString(),
      deliveredAt:
        [
          "pending",
          "paid",
          "processing",
          "shipped",
          "cancelled",
          "refunded",
        ].includes(status) || !order.deliveredAt
          ? null
          : new Date(baseDate.getTime() + (index + 2) * 86400000).toISOString(),
      completedAt:
        status === "completed"
          ? new Date(baseDate.getTime() + (index + 3) * 86400000).toISOString()
          : null,
      store: mockStores[index % mockStores.length],
      deliveryAddress: `${
        ["Room 301", "Room 302", "Room 303", "Room 304"][index % 4]
      }, Hall ${["A", "B", "C"][index % 3]}, University Campus`,
    };
  });
}

export function OrdersPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<DisplayCategory>("all");
  const { isAuthenticated } = useAuthStore();

  const { data: rawOrders, isLoading } = useMyOrders();

  // Create preview orders for mock data mode
  const previewOrders = useMemo(() => createPreviewOrders(), []);

  // Select between preview and API data using useMemo for stability
  const displayOrders = useMemo(
    () => (USE_PREVIEW_MOCK_DATA ? previewOrders : rawOrders || []),
    [previewOrders, rawOrders],
  );

  // Calculate counts
  const counts = useMemo(() => {
    return {
      all: displayOrders.length,
      on_shipping: displayOrders.filter(
        (o) => getCategory(o.status) === "on_shipping",
      ).length,
      arrived: displayOrders.filter((o) => getCategory(o.status) === "arrived")
        .length,
      canceled: displayOrders.filter(
        (o) => getCategory(o.status) === "canceled",
      ).length,
    };
  }, [displayOrders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (activeCategory === "all") return displayOrders;
    return displayOrders.filter(
      (o) => getCategory(o.status) === activeCategory,
    );
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
    <div className="mx-auto flex flex-col lg:flex-row gap-4 md:gap-8 pb-12">
      {/* Sidebar Filters */}
      <div className="lg:w-64 shrink-0">
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center justify-between pl-5 pr-[2px] py-[3px] md:py-1 md:pr-1 rounded-full transition-all shrink-0 lg:shrink-auto whitespace-nowrap lg:whitespace-normal border shadowsm ${
                  isActive
                    ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
                    : "bg-white text-gray-700 bordergray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium text-[15px]">{cat.label}</span>
                <span
                  className={`h-10 w-10 md:w-12 md:h-12 ml-3 flex items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-white text-black"
                      : "bg-secondary text-gray-600"
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
              <div
                key={index}
                className="border border-gray-100 rounded md:rounded-3xl p-6 bg-white overflow-hidden shadow-sm"
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
                  <Button
                    onClick={() => navigate("/products")}
                    className="mt-6 rounded-full px-8 h-12"
                  >
                    Start Shopping
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {filteredOrders.map((order) => {
              return (
                <OrderCard
                  key={order.id}
                  order={order}
                  statusBadge={getStatusBadge(order.status)}
                  formatAmount={formatPrice}
                  onViewDetails={handleViewDetails}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
