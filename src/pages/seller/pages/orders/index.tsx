import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  MessageCircle,
  Package,
  Phone,
  Truck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Modal } from "@/components/shared/Modal";
import { useAuthStore } from "@/stores";
import type { Order } from "@/types-new";
import {
  useCurrency,
  useMyStore,
  useStoreOrders,
  useUpdateOrderStatus,
} from "@/hooks";
import { Skeleton } from "@/components/shared/Skeleton";
import {
  SellerPageSearchFilters,
  SellerPageTemplate,
} from "@/pages/seller/components/SellerPageTemplate";
import { PillSidebar } from "@/components/ui/pill-sidebar";
import { OrderCard } from "@/components/shared/OrderCard";
import {
  USE_PREVIEW_MOCK_DATA,
  applyOrderStatus,
  applyPreviewOrderAction,
  getAvailableSellerOrderActions,
  getNextStatusForAction,
  getSellerWorkflowStatus,
  getSellerActionDescription,
  getSellerActionLabel,
  getStatusConfig,
  loadPreviewOrders,
  type SellerOrderAction,
} from "./orderWorkflow";
import { downloadOrderReceipt } from "./receipt";
import { SellerReceiptPreviewModal } from "./components/SellerReceiptPreviewModal";
import { OrderReceiptActions } from "./components/OrderReceiptActions";

const STATUS_OPTIONS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
  { value: "disputed", label: "Disputed" },
];

const MAIN_FILTER_KEYS = ["all", "pending", "cancelled", "completed"] as const;
type MainFilterKey = (typeof MAIN_FILTER_KEYS)[number];
type ExtraFilterKey = "all" | "cancelled" | "refunded" | "disputed";

export function SellerOrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { formatGHS } = useCurrency();
  const [previewOrders, setPreviewOrders] = useState<Order[]>(() =>
    loadPreviewOrders(),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [mainFilter, setMainFilter] = useState<MainFilterKey>("all");
  const [extraFilter, setExtraFilter] = useState<ExtraFilterKey>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<SellerOrderAction | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const { data: store } = useMyStore();
  const { data: apiOrders, isLoading: ordersLoading } = useStoreOrders(
    store?.id || "",
  );
  const updateStatus = useUpdateOrderStatus();
  const storeOrders = useMemo(
    () => (USE_PREVIEW_MOCK_DATA ? previewOrders : apiOrders || []),
    [previewOrders, apiOrders],
  );
  const isLoading = USE_PREVIEW_MOCK_DATA ? false : ordersLoading;

  const effectiveFilter = extraFilter !== "all" ? extraFilter : mainFilter;

  const filteredOrders = useMemo(() => {
    let orders = [...storeOrders];

    if (effectiveFilter !== "all") {
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
  }, [effectiveFilter, searchQuery, storeOrders]);

  const handleOrderAction = (order: Order, action: SellerOrderAction) => {
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
    if (!selectedOrder || !actionType) return;

    const newStatus = getNextStatusForAction(actionType, selectedOrder.status);
    const shouldOpenReceipt = actionType === "deliver";
    let updatedForReceipt: Order | null = null;

    if (USE_PREVIEW_MOCK_DATA) {
      const updatedOrders = applyPreviewOrderAction(
        previewOrders,
        selectedOrder.id,
        actionType,
      );

      setPreviewOrders(updatedOrders);
      updatedForReceipt =
        updatedOrders.find((order) => order.id === selectedOrder.id) || null;
    } else {
      await updateStatus.mutateAsync({
        id: selectedOrder.id,
        status: newStatus,
      });
      updatedForReceipt = applyOrderStatus(selectedOrder, newStatus);
    }

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
      pending: orders.filter(
        (o) => getSellerWorkflowStatus(o.status) === "pending",
      ).length,
      processing: orders.filter(
        (o) => getSellerWorkflowStatus(o.status) === "processing",
      ).length,
      completed: orders.filter(
        (o) => getSellerWorkflowStatus(o.status) === "completed",
      ).length,
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
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[340px] w-full rounded-[28px]" />
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
                    <div className="flex flex-wrap justify-end gap-2 w-full flex-1">
                      <div className="flex flex-row justify-end gap-2 w-full md:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full bg-transparent w-full md:w-auto"
                          onClick={() => navigate(`/seller/orders/${order.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Link
                          to={`/seller/messages?order=${order.id}`}
                          className=" w-full md:w-auto"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full w-full md:w-auto"
                          >
                            <MessageCircle className="mr-1 h-4 w-4" />
                            Chat
                          </Button>
                        </Link>
                        <a
                          href={`tel:${order.shippingAddress?.phone || ""}`}
                          className=" w-full md:w-auto"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full w-full md:w-auto"
                          >
                            <Phone className="mr-1 h-4 w-4" />
                            Call
                          </Button>
                        </a>
                      </div>

                      {getAvailableSellerOrderActions(order).map((action) => (
                        <Button
                          key={action}
                          // size="sm"
                          variant={
                            action === "cancel" || action === "process"
                              ? "outline"
                              : "default"
                          }
                          onClick={() => handleOrderAction(order, action)}
                          className={`rounded-full w-full md:w-auto ${
                            action === "cancel"
                              ? "text-red-600 bg-transparent"
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
                              ? "Delivered"
                              : "Cancel"}
                        </Button>
                      ))}

                      {getSellerWorkflowStatus(order.status) === "completed" ? (
                        <OrderReceiptActions
                          onViewReceipt={() => {
                            setReceiptOrder(order);
                            setIsReceiptModalOpen(true);
                          }}
                          onDownloadReceipt={() =>
                            downloadOrderReceipt(order, formatGHS)
                          }
                        />
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
              disabled={updateStatus.isPending}
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
