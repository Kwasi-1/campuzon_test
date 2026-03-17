import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Package,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Shield,
  Star,
  Store,
  Truck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PillSidebar,
  type PillSidebarOption,
} from "@/components/ui/pill-sidebar";
import { Skeleton } from "@/components/shared/Skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/shared/Modal";
import { useOrder, useCancelOrder, useDisputeOrder, usePayment } from "@/hooks";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores";
import { orderKeys } from "@/hooks/useOrders";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types-new";
import {
  applyBuyerPreviewOrderStatus,
  loadBuyerPreviewOrders,
  BUYER_ORDER_TIMELINE,
  getBuyerStatusMeta,
  getBuyerStatusStep,
  normalizeBuyerStatus,
  USE_BUYER_PREVIEW_MOCK_DATA,
} from "../../orderWorkflow";
import {
  downloadBuyerOrderReceipt,
  previewBuyerOrderReceipt,
} from "../../receipt";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: order, isLoading } = useOrder(id!);
  const [previewOrders, setPreviewOrders] = useState<Order[]>(() =>
    loadBuyerPreviewOrders(),
  );
  const previewOrder = useMemo(() => {
    if (!id) return null;
    return previewOrders.find((item) => item.id === id) || null;
  }, [id, previewOrders]);

  const displayOrder = USE_BUYER_PREVIEW_MOCK_DATA ? previewOrder : order;
  const pageLoading = USE_BUYER_PREVIEW_MOCK_DATA ? false : isLoading;
  const itemCountForSidebar =
    displayOrder?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ||
    0;
  const hasEscrowSection = Boolean(displayOrder?.escrow);

  const cancelOrder = useCancelOrder();
  const disputeOrder = useDisputeOrder();

  const [searchParams, setSearchParams] = useSearchParams();
  const { verifyPayment } = usePayment();
  const paymentRef =
    searchParams.get("reference") || searchParams.get("trxref");

  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState<string>("other");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const sectionIds = useMemo(
    () => ({
      overview: "buyer-order-overview",
      timeline: "buyer-order-timeline",
      items: "buyer-order-items",
      delivery: "buyer-order-delivery",
      payment: "buyer-order-payment",
      seller: "buyer-order-seller",
      protection: "buyer-order-protection",
      actions: "buyer-order-actions",
    }),
    [],
  );

  const sectionOptions = useMemo<PillSidebarOption[]>(() => {
    const base: PillSidebarOption[] = [
      { key: "overview", label: "Overview" },
      { key: "timeline", label: "Timeline" },
      { key: "items", label: "Items", count: itemCountForSidebar },
      { key: "delivery", label: "Delivery" },
      { key: "payment", label: "Payment" },
      { key: "seller", label: "Seller" },
      { key: "actions", label: "Actions" },
    ];

    if (hasEscrowSection) {
      base.splice(6, 0, { key: "protection", label: "Protection" });
    }

    return base;
  }, [hasEscrowSection, itemCountForSidebar]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          const matched = sectionOptions.find(
            (option) =>
              sectionIds[option.key as keyof typeof sectionIds] ===
              visible.target.id,
          );
          if (matched) {
            setActiveSection(matched.key);
          }
        }
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-72px 0px -35% 0px" },
    );

    sectionOptions.forEach((option) => {
      const id = sectionIds[option.key as keyof typeof sectionIds];
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds, sectionOptions]);

  // Verify payment if redirect from Paystack
  const queryClient = useQueryClient();

  // Verify payment if redirect from Paystack
  useEffect(() => {
    if (paymentRef) {
      const verify = async () => {
        try {
          await verifyPayment.mutateAsync(paymentRef);
          toast.success("Payment verified successfully!");
          // Remove query params
          setSearchParams({});
          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: orderKeys.all });
          queryClient.invalidateQueries({ queryKey: orderKeys.detail(id!) });
        } catch (error) {
          toast.error("Payment verification failed. Please contact support.");
          setSearchParams({});
        }
      };
      verify();
    }
  }, [paymentRef, verifyPayment, setSearchParams, queryClient, id]);

  // Use mock order ONLY if dev environment and no order found/loading?
  // Actually, let's stick to real data if id exists.
  // If isLoading, we return skeleton.
  // If !order, we should show "Order not found".

  if (pageLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!displayOrder) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The order you are looking for does not exist.
        </p>
        <Link to="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const normalizedStatus = normalizeBuyerStatus(displayOrder.status);
  const statusMeta = getBuyerStatusMeta(displayOrder.status);
  const currentStep = getBuyerStatusStep(displayOrder.status);
  const canCancel = normalizedStatus === "pending";
  const canDispute = normalizedStatus === "completed";
  const canReview = normalizedStatus === "completed";
  const isTerminalStatus =
    displayOrder.status === "cancelled" ||
    displayOrder.status === "refunded" ||
    displayOrder.status === "disputed";
  const itemCount =
    displayOrder.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ||
    0;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(displayOrder.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (sectionKey: string) => {
    const id = sectionIds[sectionKey as keyof typeof sectionIds];
    const node = document.getElementById(id);
    if (!node) return;

    setActiveSection(sectionKey);
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCancelOrder = async () => {
    if (USE_BUYER_PREVIEW_MOCK_DATA) {
      setPreviewOrders((prev) =>
        applyBuyerPreviewOrderStatus(prev, displayOrder.id, "cancelled"),
      );
      toast.success("Order cancelled.");
    } else {
      await cancelOrder.mutateAsync(displayOrder.id);
    }

    setShowCancelModal(false);
  };

  const handleDisputeOrder = async () => {
    if (USE_BUYER_PREVIEW_MOCK_DATA) {
      setPreviewOrders((prev) =>
        applyBuyerPreviewOrderStatus(prev, displayOrder.id, "disputed"),
      );
      toast.success("Dispute submitted.");
    } else {
      await disputeOrder.mutateAsync({
        orderId: displayOrder.id,
        reason: disputeReason,
        description: disputeDescription,
      });
    }

    setShowDisputeModal(false);
    setDisputeDescription("");
  };

  if (!isAuthenticated) {
    navigate("/login?redirect=/orders");
    return null;
  }

  return (
    <div className="min-h-screen md:px-5 md:py-6">
      <div className="mx-auto w-full max-w7xl space-y-4 md:space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/orders">
            <Button
              variant="outline"
              className="rounded-full border-gray-200 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={handleCopyOrderNumber}
            className="rounded-full border-gray-200 bg-white hover:bg-gray-50"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy Order Number"}
          </Button>

          <Badge
            className={`${statusMeta.className} rounded-full border px-4 py-2 text-sm font-semibold`}
          >
            {statusMeta.label}
          </Badge>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-36 lg:self-start overflow-y-auto">
            <PillSidebar
              options={sectionOptions}
              activeKey={activeSection}
              onChange={scrollToSection}
              className="lg:pr-2"
            />
          </aside>

          <div className="space-y-4 md:space-y-6">
            <section
              id={sectionIds.overview}
              className="scroll-mt-28 rounded-md md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                    Order Overview
                  </p>
                  <h1 className="mt-2 text-2xl font-bold text-gray-900">
                    {displayOrder.orderNumber}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Placed{" "}
                    {formatDate(displayOrder.dateCreated, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={`${statusMeta.className} rounded-full border px-4 py-2 text-sm font-semibold`}
                  >
                    {statusMeta.label}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg md:rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Total Amount
                  </p>
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {formatPrice(displayOrder.totalAmount || 0)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {itemCount} item(s)
                  </p>
                </div>
                <div className="rounded-lg md:rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Delivery Type
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900 capitalize">
                    {displayOrder.deliveryMethod === "pickup"
                      ? "Campus Pickup"
                      : "Delivery"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {displayOrder.deliveryMethod === "pickup"
                      ? "Coordinate directly with the seller"
                      : displayOrder.deliveryAddress ||
                        "No delivery address provided"}
                  </p>
                </div>
                <div className="rounded-lg md:rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Payment
                  </p>
                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {displayOrder.escrow
                      ? "Escrow Protected"
                      : "Direct Payment"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {displayOrder.escrow?.status
                      ? `Escrow status: ${displayOrder.escrow.status}`
                      : "No escrow details available"}
                  </p>
                </div>
              </div>
            </section>

            <section
              id={sectionIds.timeline}
              className="scroll-mt-28 rounded-md md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Timeline
                </h2>
              </div>

              {isTerminalStatus ? (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                  This order is in a terminal state. You can still review the
                  order details and receipt records.
                </div>
              ) : (
                <div className="space-y-4">
                  {BUYER_ORDER_TIMELINE.map((step, index) => {
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
                          {index < BUYER_ORDER_TIMELINE.length - 1 ? (
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

            <section
              id={sectionIds.items}
              className="scroll-mt-28 rounded-md md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              </div>
              <div className="space-y-4">
                {displayOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50/70 p-3"
                  >
                    <Link
                      to={item.productID ? `/products/${item.productID}` : "#"}
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-md border border-gray-100 bg-gray-100">
                        <img
                          src={item.productImage || "/placeholder-product.jpg"}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={
                          item.productID ? `/products/${item.productID}` : "#"
                        }
                        className="truncate text-sm font-semibold text-gray-900 hover:text-primary"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatPrice(item.unitPrice || 0)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.subtotal || 0)}
                      </p>
                      {canReview ? (
                        <Link
                          to={`/products/${item.productID}/review?orderId=${displayOrder.id}`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                          >
                            <Star className="mr-1 h-4 w-4" />
                            Review
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id={sectionIds.delivery}
              className="scroll-mt-28 rounded-md md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Delivery
                </h2>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                  <span>
                    {displayOrder.deliveryMethod === "pickup"
                      ? "Campus pickup (coordinate with seller)"
                      : displayOrder.deliveryAddress ||
                        "No delivery address provided"}
                  </span>
                </div>
                {displayOrder.deliveryNotes ? (
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Delivery Notes
                    </p>
                    <p>{displayOrder.deliveryNotes}</p>
                  </div>
                ) : null}
                {displayOrder.buyerNote ? (
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Your Note
                    </p>
                    <p>{displayOrder.buyerNote}</p>
                  </div>
                ) : null}
                {displayOrder.sellerNote ? (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary/80">
                      Seller Note
                    </p>
                    <p>{displayOrder.sellerNote}</p>
                  </div>
                ) : null}
              </div>
            </section>

            <section
              id={sectionIds.payment}
              className="scroll-mt-28 rounded-md md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Summary
              </h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(displayOrder.subtotal || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-900">
                    {displayOrder.deliveryFee > 0
                      ? formatPrice(displayOrder.deliveryFee)
                      : "Free"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Service Fee</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(displayOrder.serviceFee || 0)}
                  </span>
                </div>
                {displayOrder.discount > 0 ? (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(displayOrder.discount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(displayOrder.totalAmount || 0)}</span>
                </div>
              </div>
            </section>

            {displayOrder.store ? (
              <section
                id={sectionIds.seller}
                className="scroll-mt-28 rounded-md md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Seller
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {displayOrder.store.logo ? (
                      <img
                        src={displayOrder.store.logo}
                        alt={displayOrder.store.storeName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/stores/${displayOrder.store.storeSlug}`}
                        className="flex items-center gap-1 font-medium hover:text-primary"
                      >
                        {displayOrder.store.storeName}
                        {displayOrder.store.isVerified ? (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        ) : null}
                      </Link>
                      {displayOrder.store.rating ? (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{displayOrder.store.rating}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Link to={`/messages?store=${displayOrder.store.id}`}>
                      <Button
                        variant="outline"
                        className="w-full rounded-full bg-transparent"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message Seller
                      </Button>
                    </Link>
                    {displayOrder.store.phoneNumber ? (
                      <a href={`tel:${displayOrder.store.phoneNumber}`}>
                        <Button
                          variant="outline"
                          className="w-full rounded-full bg-transparent"
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Call Seller
                        </Button>
                      </a>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}

            {displayOrder.escrow ? (
              <section
                id={sectionIds.protection}
                className="scroll-mt-28 rounded-md md:rounded-3xl border border-green-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2 text-green-700">
                  <Shield className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Escrow Protection</h2>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Amount Held</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(displayOrder.escrow.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant="outline" className="text-green-600">
                      {displayOrder.escrow.status.charAt(0).toUpperCase() +
                        displayOrder.escrow.status.slice(1)}
                    </Badge>
                  </div>
                  {displayOrder.escrow.status === "holding" ? (
                    <p className="text-xs text-gray-500">
                      Funds release automatically on{" "}
                      {formatDate(displayOrder.escrow.holdUntil)} if no dispute
                      is raised.
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}

            <section
              id={sectionIds.actions}
              className="scroll-mt-28 rounded-md md:rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
              <div className="mt-4 flex flex-col gap-3">
                {canCancel ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setShowCancelModal(true)}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                ) : null}

                {normalizedStatus === "completed" ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() =>
                        previewBuyerOrderReceipt(displayOrder, formatPrice)
                      }
                    >
                      View Receipt
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() =>
                        downloadBuyerOrderReceipt(displayOrder, formatPrice)
                      }
                    >
                      Download Receipt
                    </Button>
                  </>
                ) : null}

                {canDispute ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => setShowDisputeModal(true)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Dispute Order
                  </Button>
                ) : null}

                {!canCancel &&
                normalizedStatus !== "completed" &&
                !canDispute ? (
                  <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    No additional actions are available for this order right
                    now.
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={!USE_BUYER_PREVIEW_MOCK_DATA && cancelOrder.isPending}
            >
              {!USE_BUYER_PREVIEW_MOCK_DATA && cancelOrder.isPending
                ? "Cancelling..."
                : "Cancel Order"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dispute Order Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="Dispute Order"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            If you have an issue with your order, please let us know. Our team
            will review your dispute and mediate if necessary.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <select
              className="w-full p-2 rounded-md border text-sm"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              aria-label="Dispute Reason"
            >
              <option value="not_received">Not Received</option>
              <option value="not_as_described">Not as Described</option>
              <option value="damaged">Damaged Item</option>
              <option value="wrong_item">Wrong Item Sent</option>
              <option value="quality_issue">Quality Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe the issue in detail..."
              value={disputeDescription}
              onChange={(e) => setDisputeDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDisputeModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDisputeOrder}
              disabled={
                !disputeDescription.trim() ||
                (!USE_BUYER_PREVIEW_MOCK_DATA && disputeOrder.isPending)
              }
            >
              {!USE_BUYER_PREVIEW_MOCK_DATA && disputeOrder.isPending
                ? "Submitting..."
                : "Submit Dispute"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
