import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  MessageCircle,
  MoreHorizontal,
  Package,
  Phone,
  Truck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/EmptyState";
import { Modal } from "@/components/shared/Modal";
import { useAuthStore } from "@/stores";
import type { Order } from "@/types-new";
import { useCurrency } from "@/hooks";
import {
  useSellerMyStore,
  useSellerStoreOrders,
  useSellerUpdateOrderStatus,
} from "@/hooks/useSellerPortal";
import { Skeleton } from "@/components/shared/Skeleton";
import {
  SellerPageSearchFilters,
  SellerPageTemplate,
} from "@/pages/seller/components/SellerPageTemplate";
import { PillSidebar } from "@/components/ui/pill-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderCard } from "@/components/shared/OrderCard";
import {
  applyOrderStatus,
  getAvailableSellerOrderActions,
  getNextStatusForAction,
  getSellerWorkflowStatus,
  getSellerActionDescription,
  getSellerActionLabel,
  getStatusConfig,
  type SellerOrderAction,
} from "./orderWorkflow";
import { downloadOrderReceipt } from "./receipt";
import { SellerReceiptPreviewModal } from "./components/SellerReceiptPreviewModal";
import { OrderReceiptActions } from "./components/OrderReceiptActions";
import OrderCardSkeleton from "@/components/orders/orderCardSkeleton";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "all", label: "All Orders" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "issues", label: "Issues" },
];

const MAIN_FILTER_KEYS = ["all", "active", "completed", "issues"] as const;
type MainFilterKey = (typeof MAIN_FILTER_KEYS)[number];
type ExtraFilterKey =
  | "all"
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded"
  | "disputed";

const getStoreActionBlockReason = (storeStatus?: string) => {
  switch (storeStatus) {
    case "pending":
      return "Your store is not active. Please wait for approval.";
    case "suspended":
      return "Your store is suspended. Only admin can reactivate this store.";
    case "closed":
      return "Your store is closed. Contact support for next steps.";
    default:
      return null;
  }
};

export function SellerOrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { formatGHS } = useCurrency();

  const [searchQuery, setSearchQuery] = useState("");
  const [mainFilter, setMainFilter] = useState<MainFilterKey>("all");
  const [extraFilter, setExtraFilter] = useState<ExtraFilterKey>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<SellerOrderAction | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const { data: store } = useSellerMyStore();
  const storeActionBlockReason = getStoreActionBlockReason(store?.status);
  const areOrderActionsDisabled = Boolean(storeActionBlockReason);
  const { data: apiOrders, isLoading: ordersLoading } = useSellerStoreOrders(
    store?.id || "",
  );
  const updateStatus = useSellerUpdateOrderStatus();
  const storeOrders = useMemo(() => apiOrders || [], [apiOrders]);
  const isLoading = ordersLoading;

  const effectiveFilter = extraFilter !== "all" ? extraFilter : mainFilter;

  const filteredOrders = useMemo(() => {
    let orders = [...storeOrders];

    if (extraFilter !== "all") {
      orders = orders.filter(
        (order) => getSellerWorkflowStatus(order.status) === extraFilter,
      );
    } else if (mainFilter === "active") {
      orders = orders.filter((order) => {
        const status = getSellerWorkflowStatus(order.status);
        return status === "pending" || status === "processing";
      });
    } else if (mainFilter === "issues") {
      orders = orders.filter((order) => {
        const status = getSellerWorkflowStatus(order.status);
        return (
          status === "cancelled" ||
          status === "refunded" ||
          status === "disputed"
        );
      });
    } else if (effectiveFilter !== "all") {
      orders = orders.filter(
        (order) => getSellerWorkflowStatus(order.status) === effectiveFilter,
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      orders = orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.shippingAddress?.fullName?.toLowerCase().includes(query) ||
          order.items?.some((item) =>
            item.productName.toLowerCase().includes(query),
          ),
      );
    }

    return orders;
  }, [effectiveFilter, extraFilter, mainFilter, searchQuery, storeOrders]);

  const handleOrderAction = (order: Order, action: SellerOrderAction) => {
    if (storeActionBlockReason) {
      toast.error(storeActionBlockReason);
      return;
    }
    setSelectedOrder(order);
    setActionType(action);
    setActionModalOpen(true);
  };

  const closeActionModal = () => {
    setActionModalOpen(false);
    setSelectedOrder(null);
    setActionType(null);
  };

  const confirmAction = async () => {
    if (storeActionBlockReason) {
      toast.error(storeActionBlockReason);
      return;
    }

    if (!selectedOrder || !actionType) return;

    const newStatus = getNextStatusForAction(actionType, selectedOrder.status);
    const shouldOpenReceipt = actionType === "deliver";
    let updatedForReceipt: Order | null = null;

    await updateStatus.mutateAsync({
      id: selectedOrder.id,
      status: newStatus,
    });
    updatedForReceipt = applyOrderStatus(selectedOrder, newStatus);

    if (shouldOpenReceipt && updatedForReceipt) {
      setReceiptOrder(updatedForReceipt);
      setIsReceiptModalOpen(true);
    }

    closeActionModal();
  };

  const stats = useMemo(() => {
    const orders = storeOrders;
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { totalRevenue };
  }, [storeOrders]);

  const statusCounts = useMemo(() => {
    const orders = storeOrders;
    return {
      all: orders.length,
      active: orders.filter((o) => {
        const status = getSellerWorkflowStatus(o.status);
        return status === "pending" || status === "processing";
      }).length,
      pending: orders.filter(
        (o) => getSellerWorkflowStatus(o.status) === "pending",
      ).length,
      processing: orders.filter(
        (o) => getSellerWorkflowStatus(o.status) === "processing",
      ).length,
      completed: orders.filter(
        (o) => getSellerWorkflowStatus(o.status) === "completed",
      ).length,
      issues: orders.filter((o) => {
        const status = getSellerWorkflowStatus(o.status);
        return (
          status === "cancelled" ||
          status === "refunded" ||
          status === "disputed"
        );
      }).length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      refunded: orders.filter((o) => o.status === "refunded").length,
      disputed: orders.filter((o) => o.status === "disputed").length,
    };
  }, [storeOrders]);

  if (!isAuthenticated || !user?.isOwner) {
    navigate("/login");
    return null;
  }

  const sidebar = (
    <div className="space-y-4 md:space-y-6 xl:sticky xl:top-48">
      <PillSidebar
        options={STATUS_OPTIONS.filter((option) =>
          MAIN_FILTER_KEYS.includes(option.value as MainFilterKey),
        ).map((option) => ({
          key: option.value,
          label: option.label,
          count: statusCounts[option.value as keyof typeof statusCounts] ?? 0,
        }))}
        activeKey={mainFilter}
        onChange={(key) => {
          setMainFilter(key as MainFilterKey);
          setExtraFilter("all");
        }}
      />

      <div className="grid grid-cols-1 gap-2">
        <div className="rounded-md md:rounded-2xl bg-gray-50 p-3 pl-6 text-center md:text-left">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="truncate text-lg font-semibold text-gray-900">
            {formatGHS(stats.totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );

  const headerActions = (
    <SellerPageSearchFilters
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search orders..."
      selectValue={extraFilter}
      onSelectChange={(value) => setExtraFilter(value as ExtraFilterKey)}
      selectPlaceholder="More filters"
      selectOptions={[
        { value: "all", label: "More Filters" },
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
        { value: "refunded", label: "Refunded" },
        { value: "disputed", label: "Disputed" },
      ]}
    />
  );

  return (
    <SellerPageTemplate
      title="Orders"
      description={`Manage customer orders (${storeOrders.length} total)`}
      headerActions={headerActions}
      sidebar={sidebar}
    >
      <Alert
        className={`mb-4 ${
          store?.status === "active"
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            {store?.status === "active"
              ? "Store status: Active. Order actions are enabled."
              : storeActionBlockReason || "Store status unavailable."}
          </span>
          {store?.status === "suspended" || store?.status === "pending" ? (
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a
                href={`mailto:support@campuzon.me?subject=Store Reactivation Request - ${encodeURIComponent(
                  store?.storeName || "Seller Store",
                )}`}
              >
                Request Reactivation
              </a>
            </Button>
          ) : null}
        </div>
      </Alert>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <OrderCardSkeleton index={i} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <EmptyState
              icon={<Package className="h-16 w-16" />}
              title={
                searchQuery || effectiveFilter !== "all"
                  ? "No matching orders"
                  : "No orders yet"
              }
              description={
                searchQuery || effectiveFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Orders from customers will appear here"
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {filteredOrders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const availableActions = getAvailableSellerOrderActions(order);
            const desktopPrimaryAction = availableActions.includes("deliver")
              ? "deliver"
              : availableActions.includes("process")
                ? "process"
                : availableActions[0];
            const desktopSecondaryActions = availableActions.filter(
              (action) => action !== desktopPrimaryAction,
            );

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <OrderCard
                  order={order}
                  formatAmount={formatGHS}
                  statusBadge={
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  }
                  footerActions={
                    <div className="flex w-full flex-1 flex-wrap justify-end gap-2">
                      <div className="flex w-full flex-row justify-end gap-2 md:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-full bg-transparent md:w-auto"
                          onClick={() => navigate(`/seller/orders/${order.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Link
                          to={`/seller/messages?order=${order.id}`}
                          className="w-full md:w-auto"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full rounded-full md:w-auto"
                          >
                            <MessageCircle className="mr-1 h-4 w-4" />
                            Chat
                          </Button>
                        </Link>
                        <a
                          href={`tel:${order.shippingAddress?.phone || ""}`}
                          className="w-full md:w-auto"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full rounded-full md:w-auto"
                          >
                            <Phone className="mr-1 h-4 w-4" />
                            Call
                          </Button>
                        </a>
                      </div>

                      <div className="flex w-full flex-col gap-2 md:hidden">
                        {availableActions.map((action) => (
                          <Button
                            key={action}
                            variant={
                              action === "cancel" || action === "process"
                                ? "outline"
                                : "default"
                            }
                            onClick={() => handleOrderAction(order, action)}
                            disabled={areOrderActionsDisabled}
                            title={
                              storeActionBlockReason ||
                              "Perform order action"
                            }
                            className={`w-full rounded-full ${
                              action === "cancel"
                                ? "bg-transparent text-red-600"
                                : ""
                            }`}
                          >
                            {action === "process" ? (
                              <Package className="mr-1 h-4 w-4" />
                            ) : null}
                            {action === "deliver" ? (
                              <Truck className="mr-1 h-4 w-4" />
                            ) : null}
                            {action === "cancel" ? (
                              <XCircle className="mr-1 h-4 w-4" />
                            ) : null}
                            {action === "process"
                              ? "Process"
                              : action === "deliver"
                                ? "Deliver"
                                : "Cancel"}
                          </Button>
                        ))}
                      </div>

                      <div className="hidden md:flex md:items-center md:gap-2">
                        {desktopPrimaryAction ? (
                          <Button
                            size="sm"
                            variant={
                              desktopPrimaryAction === "cancel" ||
                              desktopPrimaryAction === "process"
                                ? "outline"
                                : "default"
                            }
                            onClick={() =>
                              handleOrderAction(order, desktopPrimaryAction)
                            }
                            disabled={areOrderActionsDisabled}
                            title={
                              storeActionBlockReason ||
                              "Perform order action"
                            }
                            className={`rounded-full ${
                              desktopPrimaryAction === "cancel"
                                ? "bg-transparent text-red-600"
                                : ""
                            }`}
                          >
                            {desktopPrimaryAction === "process" ? (
                              <Package className="mr-1 h-4 w-4" />
                            ) : null}
                            {desktopPrimaryAction === "deliver" ? (
                              <Truck className="mr-1 h-4 w-4" />
                            ) : null}
                            {desktopPrimaryAction === "cancel" ? (
                              <XCircle className="mr-1 h-4 w-4" />
                            ) : null}
                            {desktopPrimaryAction === "process"
                              ? "Process"
                              : desktopPrimaryAction === "deliver"
                                ? "Deliver"
                                : "Cancel"}
                          </Button>
                        ) : null}

                        {desktopSecondaryActions.length > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                disabled={areOrderActionsDisabled}
                                title={
                                  storeActionBlockReason ||
                                  "More order actions"
                                }
                              >
                                <MoreHorizontal className="mr-1 h-4 w-4" />
                                More
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {desktopSecondaryActions.map((action) => (
                                <DropdownMenuItem
                                  key={action}
                                  onClick={() =>
                                    handleOrderAction(order, action)
                                  }
                                  disabled={areOrderActionsDisabled}
                                  className={
                                    action === "cancel"
                                      ? "text-red-600 focus:text-red-600"
                                      : ""
                                  }
                                >
                                  {action === "process"
                                    ? "Mark as Processing"
                                    : null}
                                  {action === "deliver"
                                    ? "Confirm Delivery"
                                    : null}
                                  {action === "cancel" ? "Cancel Order" : null}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </div>

                      {getSellerWorkflowStatus(order.status) === "completed" ? (
                        <>
                          <div className="w-full md:hidden">
                            <OrderReceiptActions
                              onViewReceipt={() => {
                                setReceiptOrder(order);
                                setIsReceiptModalOpen(true);
                              }}
                              onDownloadReceipt={() =>
                                downloadOrderReceipt(order, formatGHS)
                              }
                            />
                          </div>

                          <div className="hidden md:flex md:items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full"
                                >
                                  <MoreHorizontal className="mr-1 h-4 w-4" />
                                  More
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setReceiptOrder(order);
                                    setIsReceiptModalOpen(true);
                                  }}
                                >
                                  View Receipt
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    downloadOrderReceipt(order, formatGHS)
                                  }
                                >
                                  Download Receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      ) : null}
                    </div>
                  }
                />
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={actionModalOpen}
        onClose={closeActionModal}
        title={actionType ? getSellerActionLabel(actionType) : "Order Action"}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {actionType
              ? getSellerActionDescription(
                  actionType,
                  selectedOrder?.orderNumber,
                  selectedOrder?.status,
                )
              : ""}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeActionModal}>
              Cancel
            </Button>
            <Button
              variant={actionType === "cancel" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={updateStatus.isPending || areOrderActionsDisabled}
              title={storeActionBlockReason || "Confirm action"}
            >
              {actionType ? getSellerActionLabel(actionType) : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>

      <SellerReceiptPreviewModal
        isOpen={isReceiptModalOpen}
        order={receiptOrder}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setReceiptOrder(null);
        }}
        onDownload={() => {
          if (!receiptOrder) return;
          downloadOrderReceipt(receiptOrder, formatGHS);
        }}
        formatAmount={formatGHS}
        completionMessage="Delivery confirmed. The transaction has been completed and the receipt is ready."
      />
    </SellerPageTemplate>
  );
}
