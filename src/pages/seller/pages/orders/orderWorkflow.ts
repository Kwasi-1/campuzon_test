import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { mockOrders } from "@/lib/mockData";
import type { Order, OrderStatus } from "@/types-new";

export const USE_PREVIEW_MOCK_DATA = true;
const PREVIEW_STORAGE_KEY = "seller-orders-preview-v1";

export type SellerOrderAction = "ship" | "complete" | "cancel";

export const ORDER_TIMELINE: Array<{
  status: OrderStatus;
  label: string;
  description: string;
}> = [
  {
    status: "pending",
    label: "Order Placed",
    description: "Waiting for payment confirmation",
  },
  {
    status: "paid",
    label: "Paid",
    description: "Payment confirmed and ready for preparation",
  },
  {
    status: "processing",
    label: "Processing",
    description: "Seller is preparing the order",
  },
  {
    status: "shipped",
    label: "Shipped",
    description: "Order is in transit to the buyer",
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Order has reached the buyer",
  },
  {
    status: "completed",
    label: "Completed",
    description: "Order closed successfully",
  },
];

export function getOrderStep(status: OrderStatus): number {
  const steps: Record<OrderStatus, number> = {
    pending: 0,
    paid: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    completed: 5,
    cancelled: -1,
    refunded: -1,
    disputed: -1,
  };

  return steps[status] ?? 0;
}

export function getStatusConfig(status: OrderStatus): {
  label: string;
  color: string;
  icon: LucideIcon;
} {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        color:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Clock,
      };
    case "paid":
      return {
        label: "Paid",
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        icon: DollarSign,
      };
    case "processing":
      return {
        label: "Processing",
        color:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        icon: Package,
      };
    case "shipped":
      return {
        label: "Shipped",
        color:
          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        icon: Truck,
      };
    case "delivered":
      return {
        label: "Delivered",
        color:
          "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
        icon: CheckCircle,
      };
    case "completed":
      return {
        label: "Completed",
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: XCircle,
      };
    case "refunded":
      return {
        label: "Refunded",
        color:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        icon: AlertCircle,
      };
    case "disputed":
      return {
        label: "Disputed",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: AlertCircle,
      };
    default:
      return { label: status, color: "bg-gray-100 text-gray-700", icon: Clock };
  }
}

export function getAvailableSellerOrderActions(
  order: Order,
): SellerOrderAction[] {
  switch (order.status) {
    case "paid":
    case "processing":
      return ["ship"];
    case "delivered":
      return ["complete"];
    case "pending":
      return ["cancel"];
    default:
      return [];
  }
}

export function getSellerActionLabel(action: SellerOrderAction): string {
  switch (action) {
    case "ship":
      return "Mark as Shipped";
    case "complete":
      return "Mark as Completed";
    case "cancel":
      return "Cancel Order";
  }
}

export function getSellerActionDescription(
  action: SellerOrderAction,
  orderNumber?: string,
): string {
  switch (action) {
    case "ship":
      return `Confirm shipping for order ${orderNumber || ""}? The buyer will see it as in transit.`;
    case "complete":
      return `Confirm completion for order ${orderNumber || ""}? This closes the order workflow.`;
    case "cancel":
      return `Are you sure you want to cancel order ${orderNumber || ""}? This should only be done before fulfillment proceeds.`;
  }
}

export function getNextStatusForAction(action: SellerOrderAction): OrderStatus {
  switch (action) {
    case "ship":
      return "shipped";
    case "complete":
      return "completed";
    case "cancel":
      return "cancelled";
  }
}

export function createPreviewOrders(): Order[] {
  const previewStatuses: OrderStatus[] = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "completed",
    "cancelled",
    "refunded",
  ];

  return Array.from({ length: 8 }, (_, index) => {
    const source = mockOrders[index % mockOrders.length];
    const status = previewStatuses[index % previewStatuses.length];
    const createdAt = new Date(Date.now() - index * 18 * 60 * 60 * 1000);

    return {
      ...source,
      id: `preview-order-${index + 1}`,
      orderNumber: `ORD-2026-${String(index + 1).padStart(4, "0")}`,
      status,
      totalAmount: source.totalAmount + index * 22.5,
      subtotal: source.subtotal + index * 18,
      dateCreated: createdAt.toISOString(),
      paidAt:
        status === "pending" || status === "cancelled"
          ? null
          : new Date(createdAt.getTime() + 60 * 60 * 1000).toISOString(),
      shippedAt: ["shipped", "delivered", "completed"].includes(status)
        ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString()
        : null,
      deliveredAt: ["delivered", "completed"].includes(status)
        ? new Date(createdAt.getTime() + 48 * 60 * 60 * 1000).toISOString()
        : null,
      completedAt:
        status === "completed"
          ? new Date(createdAt.getTime() + 52 * 60 * 60 * 1000).toISOString()
          : null,
      deliveryAddress:
        source.deliveryAddress ||
        `Block ${String.fromCharCode(65 + index)}, Campus Hostel`,
      shippingAddress: {
        fullName: `Student Buyer ${index + 1}`,
        phone: `+233 24 ${String(100000 + index).slice(-6)}`,
        addressLine1: `Room ${100 + index}, Block ${String.fromCharCode(
          65 + index,
        )}`,
        city: "Accra",
        region: "Greater Accra",
      },
      buyerNote:
        index % 3 === 0 ? "Please call on arrival" : source.buyerNote,
    };
  });
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadPreviewOrders(): Order[] {
  if (!canUseStorage()) {
    return createPreviewOrders();
  }

  const stored = window.localStorage.getItem(PREVIEW_STORAGE_KEY);
  if (!stored) {
    const initial = createPreviewOrders();
    savePreviewOrders(initial);
    return initial;
  }

  try {
    const parsed = JSON.parse(stored) as Order[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : createPreviewOrders();
  } catch {
    const initial = createPreviewOrders();
    savePreviewOrders(initial);
    return initial;
  }
}

export function savePreviewOrders(orders: Order[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(orders));
}

export function findPreviewOrder(orderId: string): Order | null {
  return loadPreviewOrders().find((order) => order.id === orderId) || null;
}

export function applyOrderStatus(order: Order, nextStatus: OrderStatus): Order {
  const timestamp = new Date().toISOString();

  return {
    ...order,
    status: nextStatus,
    paidAt:
      order.paidAt ||
      (nextStatus !== "pending" && nextStatus !== "cancelled" ? timestamp : null),
    shippedAt:
      nextStatus === "shipped" || nextStatus === "delivered" || nextStatus === "completed"
        ? order.shippedAt || timestamp
        : null,
    deliveredAt:
      nextStatus === "delivered" || nextStatus === "completed"
        ? order.deliveredAt || timestamp
        : null,
    completedAt: nextStatus === "completed" ? order.completedAt || timestamp : null,
  };
}

export function applyPreviewOrderAction(
  orders: Order[],
  orderId: string,
  action: SellerOrderAction,
): Order[] {
  const nextStatus = getNextStatusForAction(action);
  const updated = orders.map((order) =>
    order.id === orderId ? applyOrderStatus(order, nextStatus) : order,
  );
  savePreviewOrders(updated);
  return updated;
}

export function replacePreviewOrder(updatedOrder: Order): Order[] {
  const orders = loadPreviewOrders().map((order) =>
    order.id === updatedOrder.id ? updatedOrder : order,
  );
  savePreviewOrders(orders);
  return orders;
}