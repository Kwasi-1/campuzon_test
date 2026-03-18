import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderCardSkeleton from "@/components/orders/orderCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderCard } from "@/components/shared/OrderCard";
import { useMyOrders } from "@/hooks";
import { useAuthStore } from "@/stores";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types-new";
import {
  loadBuyerPreviewOrders,
  getBuyerCategory,
  getBuyerStatusMeta,
  USE_BUYER_PREVIEW_MOCK_DATA,
  type BuyerDisplayCategory,
} from "./orderWorkflow";

const getStatusBadge = (status: OrderStatus) => {
  const statusMeta = getBuyerStatusMeta(status);

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusMeta.label}
    </div>
  );
};

export function OrdersPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] =
    useState<BuyerDisplayCategory>("all");
  const [previewOrders] = useState<Order[]>(() => loadBuyerPreviewOrders());
  const { isAuthenticated } = useAuthStore();

  const { data: rawOrders, isLoading } = useMyOrders();

  // Select between preview and API data using useMemo for stability
  const displayOrders = useMemo(
    () => (USE_BUYER_PREVIEW_MOCK_DATA ? previewOrders : rawOrders || []),
    [previewOrders, rawOrders],
  );

  // Calculate counts
  const counts = useMemo(() => {
    return {
      all: displayOrders.length,
      active: displayOrders.filter(
        (o) => getBuyerCategory(o.status) === "active",
      ).length,
      completed: displayOrders.filter(
        (o) => getBuyerCategory(o.status) === "completed",
      ).length,
      issues: displayOrders.filter(
        (o) => getBuyerCategory(o.status) === "issues",
      ).length,
    };
  }, [displayOrders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (activeCategory === "all") return displayOrders;
    return displayOrders.filter(
      (o) => getBuyerCategory(o.status) === activeCategory,
    );
  }, [displayOrders, activeCategory]);

  if (!isAuthenticated) {
    navigate("/login?redirect=/orders");
    return null;
  }

  const handleViewDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const categories: {
    key: BuyerDisplayCategory;
    label: string;
    count: number;
  }[] = [
    { key: "all", label: "All Orders", count: counts.all },
    { key: "active", label: "Active", count: counts.active },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "issues", label: "Issues", count: counts.issues },
  ];

  return (
    <div className="mx-auto flex flex-col lg:flex-row gap-4 md:gap-8 pb-12">
      {/* Sidebar Filters */}
      <div className="lg:w-64 shrink-0">
        <div className="flex lg:flex-col  lg:sticky lg:top-36 gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
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
              <OrderCardSkeleton index={index} />
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
