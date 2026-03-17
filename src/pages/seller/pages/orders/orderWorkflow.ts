import {
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { mockOrders } from "@/lib/mockData";
import type { Order, OrderStatus } from "@/types-new";

export const USE_PREVIEW_MOCK_DATA = false;
const PREVIEW_STORAGE_KEY = "seller-orders-preview-v1";

export type SellerOrderAction =
  | "process"
  | "deliver"
  | "cancel";

export const ORDER_TIMELINE: Array<{
  status: OrderStatus;
  label: string;
  description: string;
}> = [
  {
    status: "pending",
    label: "Pending",
    description: "Payment is confirmed and the order is waiting for seller fulfillment",
  },
  {
    status: "processing",
    label: "Processing",
    description: "Seller is preparing the order (optional step)",
  },
  {
    status: "completed",
    label: "Completed",
    description: "Delivery is confirmed, the transaction closes, and the receipt is ready",
  },
];

export function getSellerWorkflowStatus(status: OrderStatus): OrderStatus {
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

export function getOrderStep(status: OrderStatus): number {
  const normalizedStatus = getSellerWorkflowStatus(status);
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

  return steps[normalizedStatus] ?? 0;
}

export function getStatusConfig(status: OrderStatus): {
  label: string;
  color: string;
  icon: LucideIcon;
} {
  const normalizedStatus = getSellerWorkflowStatus(status);

  switch (normalizedStatus) {
    case "pending":
      return {
        label: "Pending",
        color:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Clock,
      };
    case "processing":
      return {
        label: "Processing",
        color:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        icon: Package,
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
  if (!USE_PREVIEW_MOCK_DATA) {
    switch (getSellerWorkflowStatus(order.status)) {
      case "pending":
        return ["process", "deliver"];
      case "processing":
        return ["deliver"];
      default:
        return [];
    }
  }

  switch (getSellerWorkflowStatus(order.status)) {
    case "pending":
      return ["process", "deliver", "cancel"];
    case "processing":
      return ["deliver", "cancel"];
    default:
      return [];
  }
}

export function getSellerActionLabel(action: SellerOrderAction): string {
  switch (action) {
    case "process":
      return "Mark as Processing";
    case "deliver":
      return "Confirm Delivery";
    case "cancel":
      return "Cancel Order";
  }
}

export function getSellerActionDescription(
  action: SellerOrderAction,
  orderNumber?: string,
  currentStatus?: OrderStatus,
): string {
  switch (action) {
    case "process":
      return `Mark order ${orderNumber || ""} as processing? Use this if you are preparing the item before handoff.`;
    case "deliver":
      return `Confirm in-person delivery for order ${orderNumber || ""}? This will complete the transaction and show the receipt.`;
    case "cancel":
      return getSellerWorkflowStatus(currentStatus || "pending") === "pending" ||
        getSellerWorkflowStatus(currentStatus || "pending") === "processing"
        ? `Cancel order ${orderNumber || ""}? This will trigger an automatic refund to the buyer.`
        : `Cancel order ${orderNumber || ""}? This will close the order and trigger the appropriate refund flow.`;
  }
}

export function getNextStatusForAction(
  action: SellerOrderAction,
  currentStatus?: OrderStatus,
): OrderStatus {
  const normalizedStatus = getSellerWorkflowStatus(currentStatus || "pending");

  switch (action) {
    case "process":
      return "processing";
    case "deliver":
      return "completed";
    case "cancel":
      return normalizedStatus === "pending" || normalizedStatus === "processing"
        ? "refunded"
        : "cancelled";
  }
}

export function createPreviewOrders(): Order[] {
  const previewStatuses: OrderStatus[] = [
    "pending",
    "processing",
    "completed",
    "cancelled",
    "refunded",
    "disputed",
    "pending",
    "processing",
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
        status === "cancelled"
          ? null
          : new Date(createdAt.getTime() + 60 * 60 * 1000).toISOString(),
      deliveredAt: status === "completed"
        ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString()
        : null,
      completedAt:
        status === "completed"
          ? new Date(createdAt.getTime() + 26 * 60 * 60 * 1000).toISOString()
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
    shippedAt: null,
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
  const targetOrder = orders.find((order) => order.id === orderId);
  if (!targetOrder) return orders;

  const nextStatus = getNextStatusForAction(action, targetOrder.status);
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