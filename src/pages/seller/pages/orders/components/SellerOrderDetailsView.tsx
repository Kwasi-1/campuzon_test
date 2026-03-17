import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Receipt,
  Store,
  Truck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Order } from "@/types-new";
import {
  ORDER_TIMELINE,
  getAvailableSellerOrderActions,
  getOrderStep,
  getSellerActionLabel,
  getSellerWorkflowStatus,
  getStatusConfig,
  type SellerOrderAction,
} from "../orderWorkflow";
import { OrderReceiptActions } from "./OrderReceiptActions";

interface SellerOrderDetailsViewProps {
  order: Order;
  formatAmount: (amount: number) => string;
  onRequestAction: (action: SellerOrderAction) => void;
  onOpenFullPage?: () => void;
  isCompact?: boolean;
  isActionPending?: boolean;
  sectionIdPrefix?: string;
  onViewReceipt?: () => void;
  onDownloadReceipt?: () => void;
}

export function SellerOrderDetailsView({
  order,
  formatAmount,
  onRequestAction,
  onOpenFullPage,
  isCompact = false,
  isActionPending = false,
  sectionIdPrefix = "seller-order-detail",
  onViewReceipt,
  onDownloadReceipt,
}: SellerOrderDetailsViewProps) {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const currentStep = getOrderStep(order.status);
  const availableActions = getAvailableSellerOrderActions(order);
  const itemCount =
    order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  const sectionIds = {
    overview: `${sectionIdPrefix}-overview`,
    items: `${sectionIdPrefix}-items`,
    workflow: `${sectionIdPrefix}-workflow`,
    buyerDelivery: `${sectionIdPrefix}-buyer-delivery`,
    payment: `${sectionIdPrefix}-payment`,
    actions: `${sectionIdPrefix}-actions`,
  };

  return (
    <div className="space-y-4 md:space-y-6 -mt-4 md:mt-auto">
      <div
        id={sectionIds.overview}
        className="rounded-md scroll-mt-28 md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
              Order Overview
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Created{" "}
              {formatDate(order.dateCreated, {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusConfig.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig.label}
            </Badge>
            {onOpenFullPage ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenFullPage}
                className="rounded-full"
              >
                Manage Order
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg md:rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Amount
            </p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {formatAmount(order.totalAmount || 0)}
            </p>
            <p className="mt-1 text-sm text-gray-500">{itemCount} item(s)</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Buyer
            </p>
            <p className="mt-2 text-base font-semibold text-gray-900">
              {order.shippingAddress?.fullName || "Customer"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {order.shippingAddress?.phone || "No phone provided"}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Delivery Method
            </p>
            <p className="mt-2 text-base font-semibold capitalize text-gray-900">
              {order.deliveryMethod}
            </p>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {order.deliveryAddress ||
                order.shippingAddress?.addressLine1 ||
                "No address provided"}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`grid gap-4 md:gap-6 ${isCompact ? "lg:grid-cols-1" : "lg:grid-cols-[1.5fr_1fr]"}`}
      >
        <div className="space-y-6">
          <section
            id={sectionIds.items}
            className="rounded-md scroll-mt-28 md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Items</h3>
            </div>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center flex-wrap gap-4 rounded-lg border border-gray-100 bg-gray-50/70 p-3"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-md border border-gray-100 bg-gray-100">
                    <img
                      src={item.productImage || "/placeholder-product.jpg"}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatAmount(item.unitPrice || 0)} x {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatAmount(item.subtotal || 0)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            id={sectionIds.workflow}
            className="rounded-md scroll-mt-28 md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Workflow</h3>
            </div>
            {order.status === "cancelled" ||
            order.status === "refunded" ||
            order.status === "disputed" ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                This order is in a terminal state. No fulfillment actions are
                available.
              </div>
            ) : (
              <div className="space-y-4">
                {ORDER_TIMELINE.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        {index < ORDER_TIMELINE.length - 1 ? (
                          <div
                            className={`mt-2 h-10 w-px ${
                              isCompleted ? "bg-green-400" : "bg-gray-200"
                            }`}
                          />
                        ) : null}
                      </div>
                      <div className="pb-4">
                        <p
                          className={`text-sm font-semibold ${
                            isCurrent ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section
            id={sectionIds.buyerDelivery}
            className="rounded-md scroll-mt-28 md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                Buyer & Delivery
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                <span>
                  {order.shippingAddress?.phone || "No contact number"}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                <span>
                  {order.deliveryAddress ||
                    order.shippingAddress?.addressLine1 ||
                    "No delivery address provided"}
                </span>
              </div>
              {order.buyerNote ? (
                <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Buyer Note
                  </p>
                  <p>{order.buyerNote}</p>
                </div>
              ) : null}
            </div>
          </section>

          <section
            id={sectionIds.payment}
            className="rounded-md scroll-mt-28 md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Summary
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatAmount(order.subtotal || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Fee</span>
                <span className="font-medium text-gray-900">
                  {formatAmount(order.deliveryFee || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service Fee</span>
                <span className="font-medium text-gray-900">
                  {formatAmount(order.serviceFee || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatAmount(order.totalAmount || 0)}</span>
              </div>
            </div>
          </section>

          <section
            id={sectionIds.actions}
            className="rounded-md scroll-mt-28 md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            <div className="mt-4 flex flex-col gap-3">
              <Link to={`/seller/messages?order=${order.id}`}>
                <Button
                  variant="outline"
                  className="w-full rounded-full bg-transparent"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Open Chat
                </Button>
              </Link>
              {order.shippingAddress?.phone ? (
                <a href={`tel:${order.shippingAddress.phone}`}>
                  <Button
                    variant="outline"
                    className="w-full rounded-full bg-transparent"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Buyer
                  </Button>
                </a>
              ) : null}
              {availableActions.map((action) => (
                <Button
                  key={action}
                  variant={action === "cancel" ? "outline" : "default"}
                  className={`w-full rounded-full ${
                    action === "cancel"
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : ""
                  }`}
                  onClick={() => onRequestAction(action)}
                  disabled={isActionPending}
                >
                  {action === "process" ? (
                    <Package className="mr-2 h-4 w-4" />
                  ) : null}
                  {action === "deliver" ? (
                    <Truck className="mr-2 h-4 w-4" />
                  ) : null}
                  {action === "cancel" ? (
                    <XCircle className="mr-2 h-4 w-4" />
                  ) : null}
                  {getSellerActionLabel(action)}
                </Button>
              ))}

              {getSellerWorkflowStatus(order.status) === "completed" &&
              onViewReceipt &&
              onDownloadReceipt ? (
                <OrderReceiptActions
                  compact
                  onViewReceipt={onViewReceipt}
                  onDownloadReceipt={onDownloadReceipt}
                />
              ) : null}

              {availableActions.length === 0 ? (
                <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                  No seller workflow actions are available for the current
                  status.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
