import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types-new";
import { getStatusConfig } from "../orderWorkflow";

interface SellerReceiptPreviewModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onDownload: () => void;
  formatAmount: (amount: number) => string;
  completionMessage?: string;
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SellerReceiptPreviewModal({
  isOpen,
  order,
  onClose,
  onDownload,
  formatAmount,
  completionMessage,
}: SellerReceiptPreviewModalProps) {
  if (!order) return null;

  const statusConfig = getStatusConfig(order.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Receipt"
      placement="fullscreen"
      showCloseButton
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 md:gap-6 pb-8">
        <div className="rounded-md md:rounded-xl border border-green-100 bg-green-50 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">
                Order completed successfully
              </p>
              <p className="mt-1 text-sm text-green-700">
                {completionMessage ||
                  "Delivery has been confirmed and this order is now complete."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-md md:rounded-3xl border border-gray-100 bg-white p-4 md:p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
                Receipt
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">
                {order.orderNumber}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Created {formatDate(order.dateCreated)}
              </p>
            </div>
            <div className="rounded-md md:rounded-xl bg-gray-50 px-4 py-2 text-sm text-gray-700">
              Status:{" "}
              <span className="font-semibold">{statusConfig.label}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-md md:rounded-xl bg-gray-50 p-3 md:p-4">
              <p className="text-xs text-gray-500">Buyer</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {order.shippingAddress?.fullName || "Customer"}
              </p>
            </div>
            <div className="rounded-md md:rounded-xl bg-gray-50 p-3 md:p-4">
              <p className="text-xs text-gray-500">Delivered At</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatDate(order.deliveredAt)}
              </p>
            </div>
            <div className="rounded-md md:rounded-xl bg-gray-50 p-3 md:p-4">
              <p className="text-xs text-gray-500">Completed At</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatDate(order.completedAt)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-md md:rounded-xl border border-gray-100 overflow-hidden">
            {(order.items || []).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-gray-100 p-3 last:border-b-0 md:p-4"
              >
                <div className="h-12 w-12 overflow-hidden rounded-md md:rounded-lg border border-gray-100 bg-gray-100">
                  <img
                    src={item.productImage || "/placeholder-product.jpg"}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatAmount(item.unitPrice || 0)} x {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatAmount(item.subtotal || 0)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 ml-auto w-full max-w-sm rounded-md md:rounded-xl bg-gray-50 p-3 md:p-4 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatAmount(order.subtotal || 0)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>{formatAmount(order.deliveryFee || 0)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-gray-600">
              <span>Service Fee</span>
              <span>{formatAmount(order.serviceFee || 0)}</span>
            </div>
            <div className="mt-3 border-t border-gray-200 pt-3 flex items-center justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatAmount(order.totalAmount || 0)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
          <Button variant="outline" className="rounded-full" onClick={onClose}>
            Close
          </Button>
          <Button className="rounded-full" onClick={onDownload}>
            Download Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
}
