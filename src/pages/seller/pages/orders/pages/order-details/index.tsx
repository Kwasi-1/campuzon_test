import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/shared/Modal";
import { Skeleton } from "@/components/shared/Skeleton";
import { PillSidebar } from "@/components/ui/pill-sidebar";
import { useAuthStore } from "@/stores";
import { useCurrency, useOrder, useUpdateOrderStatus } from "@/hooks";
import { SellerPageTemplate } from "@/pages/seller/components/SellerPageTemplate";
import type { Order } from "@/types-new";
import { SellerOrderDetailsView } from "../../components/SellerOrderDetailsView";
import {
  USE_PREVIEW_MOCK_DATA,
  applyOrderStatus,
  applyPreviewOrderAction,
  findPreviewOrder,
  getNextStatusForAction,
  getSellerActionDescription,
  getSellerActionLabel,
  loadPreviewOrders,
  type SellerOrderAction,
} from "../../orderWorkflow";
import { SellerReceiptPreviewModal } from "../../components/SellerReceiptPreviewModal";
import { downloadOrderReceipt } from "../../receipt";

type DetailSectionKey =
  | "overview"
  | "items"
  | "workflow"
  | "buyer-delivery"
  | "payment"
  | "actions";

const DETAIL_SECTION_PREFIX = "seller-order-detail";

const DETAIL_SECTION_OPTIONS: Array<{ key: DetailSectionKey; label: string }> =
  [
    { key: "overview", label: "Overview" },
    { key: "items", label: "Items" },
    { key: "workflow", label: "Workflow" },
    { key: "buyer-delivery", label: "Buyer & Delivery" },
    { key: "payment", label: "Payment" },
    { key: "actions", label: "Actions" },
  ];

function useOrderSectionSidebar() {
  const [activeSection, setActiveSection] =
    useState<DetailSectionKey>("overview");

  const handleSectionChange = (key: string) => {
    const sectionKey = key as DetailSectionKey;
    setActiveSection(sectionKey);

    const target = document.getElementById(
      `${DETAIL_SECTION_PREFIX}-${sectionKey}`,
    );
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sidebar = (
    <div className="hidden md:block space-y-4 md:space-y-6 xl:sticky xl:top-48">
      <PillSidebar
        options={DETAIL_SECTION_OPTIONS.map((section) => ({
          key: section.key,
          label: section.label,
        }))}
        activeKey={activeSection}
        onChange={handleSectionChange}
      />
    </div>
  );

  return { sidebar };
}

function PreviewSellerOrderDetailContent({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { formatGHS } = useCurrency();
  const [previewOrders, setPreviewOrders] = useState(loadPreviewOrders());
  const [pendingAction, setPendingAction] = useState<SellerOrderAction | null>(
    null,
  );
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const { sidebar } = useOrderSectionSidebar();

  const order = useMemo(
    () =>
      previewOrders.find((item) => item.id === orderId) ||
      findPreviewOrder(orderId),
    [orderId, previewOrders],
  );

  if (!isAuthenticated || !user?.isOwner) {
    navigate("/login");
    return null;
  }

  if (!order) {
    return (
      <SellerPageTemplate
        title="Order Not Found"
        description="The order you are looking for does not exist."
        headerActions={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => navigate("/seller/orders")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        }
      >
        <div className="rounded-sm md:rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-600">
            This preview order could not be found.
          </p>
        </div>
      </SellerPageTemplate>
    );
  }

  const confirmAction = () => {
    if (!pendingAction) return;

    const shouldOpenReceipt = pendingAction === "deliver";

    setPreviewOrders((prev) => {
      const updated = applyPreviewOrderAction(prev, order.id, pendingAction);
      if (shouldOpenReceipt) {
        const matched = updated.find((item) => item.id === order.id) || null;
        setReceiptOrder(matched);
        setIsReceiptModalOpen(true);
      }
      return updated;
    });

    setPendingAction(null);
  };

  return (
    <SellerPageTemplate
      title={`Order ${order.orderNumber}`}
      description="Review and manage this order end to end."
      sidebar={sidebar}
      headerActions={
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => navigate("/seller/orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      }
    >
      <SellerOrderDetailsView
        order={order}
        formatAmount={formatGHS}
        onRequestAction={setPendingAction}
        sectionIdPrefix={DETAIL_SECTION_PREFIX}
        onViewReceipt={() => {
          setReceiptOrder(order);
          setIsReceiptModalOpen(true);
        }}
        onDownloadReceipt={() => downloadOrderReceipt(order, formatGHS)}
      />

      <Modal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        title={
          pendingAction ? getSellerActionLabel(pendingAction) : "Order Action"
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {pendingAction
              ? getSellerActionDescription(
                  pendingAction,
                  order.orderNumber,
                  order.status,
                )
              : ""}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              Cancel
            </Button>
            <Button
              variant={pendingAction === "cancel" ? "destructive" : "default"}
              onClick={confirmAction}
            >
              {pendingAction ? getSellerActionLabel(pendingAction) : "Confirm"}
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
        completionMessage="Delivery confirmed. This order is now complete and the receipt has been generated."
      />
    </SellerPageTemplate>
  );
}

function LiveSellerOrderDetailContent({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { formatGHS } = useCurrency();
  const { data: order, isLoading } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const [pendingAction, setPendingAction] = useState<SellerOrderAction | null>(
    null,
  );
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const { sidebar } = useOrderSectionSidebar();

  if (!isAuthenticated || !user?.isOwner) {
    navigate("/login");
    return null;
  }

  const confirmAction = async () => {
    if (!order || !pendingAction) return;

    const nextStatus = getNextStatusForAction(pendingAction, order.status);

    await updateStatus.mutateAsync({
      id: order.id,
      status: nextStatus,
    });

    if (pendingAction === "deliver") {
      setReceiptOrder(applyOrderStatus(order, nextStatus));
      setIsReceiptModalOpen(true);
    }

    setPendingAction(null);
  };

  return (
    <SellerPageTemplate
      title={order ? `Order ${order.orderNumber}` : "Order Management"}
      description="Review and manage this order end to end."
      sidebar={sidebar}
      headerActions={
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => navigate("/seller/orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-[520px] w-full rounded-3xl" />
        </div>
      ) : order ? (
        <SellerOrderDetailsView
          order={order}
          formatAmount={formatGHS}
          onRequestAction={setPendingAction}
          isActionPending={updateStatus.isPending}
          sectionIdPrefix={DETAIL_SECTION_PREFIX}
          onViewReceipt={() => {
            setReceiptOrder(order);
            setIsReceiptModalOpen(true);
          }}
          onDownloadReceipt={() => downloadOrderReceipt(order, formatGHS)}
        />
      ) : (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-600">This order could not be found.</p>
        </div>
      )}

      <Modal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        title={
          pendingAction ? getSellerActionLabel(pendingAction) : "Order Action"
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {pendingAction && order
              ? getSellerActionDescription(
                  pendingAction,
                  order.orderNumber,
                  order.status,
                )
              : ""}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              Cancel
            </Button>
            <Button
              variant={pendingAction === "cancel" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={updateStatus.isPending}
            >
              {pendingAction ? getSellerActionLabel(pendingAction) : "Confirm"}
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
        completionMessage="Delivery confirmed. This order is now complete and the receipt has been generated."
      />
    </SellerPageTemplate>
  );
}

export function SellerOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();

  if (!orderId) {
    return null;
  }

  return USE_PREVIEW_MOCK_DATA ? (
    <PreviewSellerOrderDetailContent orderId={orderId} />
  ) : (
    <LiveSellerOrderDetailContent orderId={orderId} />
  );
}
