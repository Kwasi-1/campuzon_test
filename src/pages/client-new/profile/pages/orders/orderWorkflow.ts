import { mockOrders, mockStores } from "@/lib/mockData";
import type { Order, OrderStatus } from "@/types-new";

export const USE_BUYER_PREVIEW_MOCK_DATA = true;

export type BuyerDisplayCategory = "active" | "completed" | "issues" | "all";

export const BUYER_CATEGORY_MAP: Record<BuyerDisplayCategory, OrderStatus[]> = {
  all: [],
  active: ["pending", "paid", "processing"],
  completed: ["shipped", "delivered", "completed"],
  issues: ["cancelled", "refunded", "disputed"],
};

export function normalizeBuyerStatus(status: OrderStatus): OrderStatus {
  switch (status) {
    case "paid":
      return "pending";
    case "shipped":
    case "delivered":
      return "completed";
    default:
      return status;
  }
}

export function getBuyerCategory(status: OrderStatus): BuyerDisplayCategory {
  const normalized = normalizeBuyerStatus(status);
  if (BUYER_CATEGORY_MAP.active.includes(normalized)) return "active";
  if (BUYER_CATEGORY_MAP.completed.includes(normalized)) return "completed";
  if (BUYER_CATEGORY_MAP.issues.includes(normalized)) return "issues";
  return "all";
}

export function getBuyerStatusMeta(status: OrderStatus): {
  label: string;
  className: string;
} {
  const normalized = normalizeBuyerStatus(status);

  switch (normalized) {
    case "pending":
      return {
        label: "Pending Delivery",
        className: "bg-yellow-50 text-yellow-700",
      };
    case "processing":
      return {
        label: "Processing",
        className: "bg-indigo-50 text-indigo-700",
      };
    case "completed":
      return {
        label: "Completed",
        className: "bg-green-50 text-green-700",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-gray-100 text-gray-700",
      };
    case "refunded":
      return {
        label: "Refunded",
        className: "bg-orange-50 text-orange-700",
      };
    case "disputed":
      return {
        label: "Disputed",
        className: "bg-red-50 text-red-700",
      };
    default:
      return {
        label: normalized,
        className: "bg-gray-100 text-gray-700",
      };
  }
}

export const BUYER_ORDER_TIMELINE: Array<{
  status: OrderStatus;
  label: string;
  description: string;
}> = [
  {
    status: "pending",
    label: "Pending",
    description: "Order is paid and waiting for seller fulfillment",
  },
  {
    status: "processing",
    label: "Processing",
    description: "Seller is preparing your order",
  },
  {
    status: "completed",
    label: "Completed",
    description: "Order was delivered and transaction is completed",
  },
];

export function getBuyerStatusStep(status: OrderStatus): number {
  const normalized = normalizeBuyerStatus(status);
  const steps: Record<OrderStatus, number> = {
    pending: 0,
    paid: 0,
    processing: 1,
    shipped: 2,
    delivered: 2,
    completed: 2,
    cancelled: -1,
    refunded: -1,
    disputed: -1,
  };

  return steps[normalized] ?? 0;
}

export function createBuyerPreviewOrders(): Order[] {
  if (mockOrders.length === 0) return [];

  const statuses: OrderStatus[] = [
    "pending",
    "processing",
    "completed",
    "cancelled",
    "refunded",
    "disputed",
    "pending",
    "processing",
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
        status === "cancelled"
          ? null
          : new Date(baseDate.getTime() + index * 86400000).toISOString(),
      shippedAt:
        ["pending", "processing"].includes(status) || !order.shippedAt
          ? null
          : new Date(baseDate.getTime() + (index + 1) * 86400000).toISOString(),
      deliveredAt:
        ["pending", "processing", "cancelled", "refunded", "disputed"].includes(
          status,
        ) || !order.deliveredAt
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

export function loadBuyerPreviewOrders(): Order[] {
  return createBuyerPreviewOrders();
}

export function findBuyerPreviewOrder(orderId: string): Order | null {
  return loadBuyerPreviewOrders().find((order) => order.id === orderId) || null;
}
