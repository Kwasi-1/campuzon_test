import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import {
  Download,
  Eye,
  Search,
  RefreshCw,
  TrendingUp,
  Lock,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { useDateFilter } from "@/contexts/DateFilterContext";
import DateFilter from "@/components/shared/DateFilter";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminTable from "@/components/admin/AdminTable";
import { isWithinInterval, parseISO } from "date-fns";
import adminTransactionsService, {
  AdminOrder,
  EscrowItem,
  TransactionSummary,
} from "@/services/adminTransactionsService";

import { useCurrency } from "@/hooks";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const ORDER_STATUS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100   text-blue-700",
  processing: "bg-blue-100   text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-100   text-gray-600",
  disputed: "bg-red-100    text-red-700",
  refunded: "bg-orange-100 text-orange-700",
};

const ESCROW_STATUS: Record<string, string> = {
  holding: "bg-orange-100 text-orange-700",
  released: "bg-emerald-100 text-emerald-700",
  refunded: "bg-blue-100   text-blue-700",
  disputed: "bg-red-100    text-red-700",
};

const StatusBadge = ({
  status,
  map,
}: {
  status: string;
  map: Record<string, string>;
}) => {
  const cls = map[status.toLowerCase()] ?? "bg-gray-100 text-gray-600";
  return (
    <Badge className={`${cls} font-medium text-xs capitalize`}>{status}</Badge>
  );
};

// ─── Order Detail Dialog ───────────────────────────────────────

const OrderDetailDialog: React.FC<{
  order: AdminOrder | null;
  open: boolean;
  onClose: () => void;
}> = ({ order, open, onClose }) => {
  const { formatGHS } = useCurrency();
  if (!order) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Order #{order.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              ["Status", order.status],
              ["Payment Status", order.paymentStatus],
              ["Payment Method", order.paymentMethod],
              ["Total Amount", formatGHS(order.totalAmount)],
              ["Service Fee", formatGHS(order.serviceFee)],
              ["Buyer Fee", formatGHS(order.buyerFee)],
              ["Seller Comm.", formatGHS(order.sellerCommission)],
              ["Store", order.store?.storeName ?? "—"],
              [
                "Buyer",
                order.buyer
                  ? `${order.buyer.firstName} ${order.buyer.lastName}`
                  : "—",
              ],
              ["Buyer Email", order.buyer?.email ?? "—"],
              ["Created", new Date(order.dateCreated).toLocaleString()],
              [
                "Completed",
                order.completedAt
                  ? new Date(order.completedAt).toLocaleString()
                  : "—",
              ],
            ].map(([k, v]) => (
              <React.Fragment key={k}>
                <div className="text-gray-400 font-medium">{k}</div>
                <div className="text-gray-800 truncate">{v}</div>
              </React.Fragment>
            ))}
          </div>
          {order.items?.length > 0 && (
            <div className="border-t pt-3">
              <p className="font-medium text-gray-700 mb-2">Items</p>
              <div className="space-y-1">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs text-gray-600"
                  >
                    <span className="truncate max-w-[60%]">
                      {item.productName}
                    </span>
                    <span className="text-gray-400">×{item.quantity}</span>
                    <span className="font-medium">
                      {formatGHS(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {order.escrow && (
            <div className="border-t pt-3">
              <p className="font-medium text-gray-700 mb-2">Escrow</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {[
                  ["Amount", formatGHS(order.escrow.amount)],
                  ["Seller Gets", formatGHS(order.escrow.sellerAmount)],
                  ["Platform Fee", formatGHS(order.escrow.platformFee)],
                  ["Status", order.escrow.status],
                  ["Held", new Date(order.escrow.dateCreated).toLocaleDateString()],
                  [
                    "Released",
                    order.escrow.releasedAt
                      ? new Date(order.escrow.releasedAt).toLocaleDateString()
                      : "—",
                  ],
                ].map(([k, v]) => (
                  <React.Fragment key={k}>
                    <div className="text-gray-400">{k}</div>
                    <div className="text-gray-800">{v}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────

const SkeletonRows = ({
  cols = 8,
  rows = 8,
}: {
  cols?: number;
  rows?: number;
}) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: cols }).map((__, j) => (
          <TableCell key={j}>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

// ─── Summary Card ─────────────────────────────────────────────

const SummaryCard = ({
  icon: Icon,
  title,
  value,
  sub,
  iconBg,
  iconColor,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  sub?: string;
  iconBg: string;
  iconColor: string;
  loading: boolean;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          {loading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 tabular-nums truncate">
              {value}
            </p>
          )}
          {sub && !loading && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              {sub}
            </p>
          )}
        </div>
        <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Main Page ─────────────────────────────────────────────────

const AdminTransactions: React.FC = () => {
  const { toast } = useToast();
  const { dateRange, isFiltered } = useDateFilter();
  const { formatGHS } = useCurrency();

  const [tab, setTab] = useState<"orders" | "escrow">("orders");

  // Orders state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersStatus, setOrdersStatus] = useState("all");
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Escrow state
  const [escrows, setEscrows] = useState<EscrowItem[]>([]);
  const [escrowTotal, setEscrowTotal] = useState(0);
  const [escrowPage, setEscrowPage] = useState(1);
  const [escrowStatus, setEscrowStatus] = useState("all");
  const [escrowLoading, setEscrowLoading] = useState(true);

  // Summary state
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Detail dialog
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null);

  const PER_PAGE = 20;

  // ── Load summary ──────────────────────────
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const s = await adminTransactionsService.getSummary();
      setSummary(s);
    } catch (err) {
      toast({
        title: "Failed to load summary",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSummaryLoading(false);
    }
  }, [toast]);

  // ── Load orders ───────────────────────────
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const { items, total } = await adminTransactionsService.getOrders({
        status: ordersStatus !== "all" ? ordersStatus : undefined,
        search: ordersSearch || undefined,
        page: ordersPage,
        per_page: PER_PAGE,
      });
      setOrders(items);
      setOrdersTotal(total);
    } catch (err) {
      toast({
        title: "Failed to load orders",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setOrdersLoading(false);
    }
  }, [ordersStatus, ordersSearch, ordersPage, toast]);

  // ── Load escrow ───────────────────────────
  const loadEscrow = useCallback(async () => {
    setEscrowLoading(true);
    try {
      const { items, total } = await adminTransactionsService.getEscrows({
        status: escrowStatus !== "all" ? escrowStatus : undefined,
        page: escrowPage,
        per_page: PER_PAGE,
      });
      setEscrows(items);
      setEscrowTotal(total);
    } catch (err) {
      toast({
        title: "Failed to load escrow",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setEscrowLoading(false);
    }
  }, [escrowStatus, escrowPage, toast]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);
  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);
  useEffect(() => {
    void loadEscrow();
  }, [loadEscrow]);

  // ── Date filtering (client-side) ──────────
  const filterByDate = <T extends { dateCreated?: string; heldAt?: string }>(
    items: T[],
    dateKey: keyof T,
  ): T[] => {
    if (!isFiltered || !dateRange.from || !dateRange.to) return items;
    return items.filter((item) => {
      const raw = item[dateKey] as string | undefined;
      if (!raw) return false;
      try {
        return isWithinInterval(parseISO(raw), {
          start: dateRange.from!,
          end: dateRange.to!,
        });
      } catch {
        return false;
      }
    });
  };

  const filteredOrders = filterByDate(orders, "dateCreated");
  const filteredEscrows = filterByDate(escrows, "dateCreated");

  const orderPages = Math.ceil(ordersTotal / PER_PAGE);
  const escrowPages = Math.ceil(escrowTotal / PER_PAGE);

  const handleExportOrders = async () => {
    try {
      const blob = await adminTransactionsService.exportOrders();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export complete" });
    } catch (err) {
      toast({
        title: "Export failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleExportEscrow = async () => {
    try {
      const blob = await adminTransactionsService.exportEscrows();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `escrow-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export complete" });
    } catch (err) {
      toast({
        title: "Export failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const dashboardStats = [
    {
      label: "Gross Revenue",
      value: summary ? formatGHS(summary.totalRevenue) : "₵0.00",
      subtext: "Total completed order value",
    },
    {
      label: "Platform Fees",
      value: summary ? formatGHS(summary.platformFees) : "₵0.00",
      subtext: "Transaction + subscription fees",
    },
    {
      label: "Escrow Held",
      value: summary ? formatGHS(summary.escrowHeld) : "₵0.00",
      subtext: "Pending buyer protection release",
    },
    {
      label: "Released to Sellers",
      value: summary ? formatGHS(summary.escrowReleased) : "₵0.00",
      subtext: "Total seller payouts",
    },
  ];

  return (
    <>
      <SEO
        title="Transactions — Campuzon Admin"
        description="Monitor platform orders, escrow, and financial flows."
        keywords="admin transactions, escrow, orders, campus marketplace"
      />

      <AdminPageLayout
        title="Transactions"
        dashboardStats={dashboardStats}
        isLoading={summaryLoading}
        headerActions={
          <>
            <DateFilter />
            
          </>
        }
      >
        {/* Tabs */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "orders" | "escrow")}
        >
          <div className="flex justify-between">
            <TabsList className="bg-gray-100 mb-4">
              <TabsTrigger value="orders">
                Orders
                {ordersTotal > 0 && (
                  <span className="ml-1.5 bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5">
                    {ordersTotal}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="escrow">
                Escrow
                {escrowTotal > 0 && (
                  <span className="ml-1.5 bg-orange-100 text-orange-600 text-xs rounded-full px-1.5 py-0.5">
                    {escrowTotal}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                tab === "orders" ? void loadOrders() : void loadEscrow()
              }
              disabled={tab === "orders" ? ordersLoading : escrowLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-1.5 ${
                  (tab === "orders" && ordersLoading) ||
                  (tab === "escrow" && escrowLoading)
                    ? "animate-spin"
                    : ""
                }`}
              />
              {(tab === "orders" && ordersLoading) ||
              (tab === "escrow" && escrowLoading)
                ? "Refreshing..."
                : "Refresh"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                tab === "orders" ? handleExportOrders() : handleExportEscrow()
              }
            >
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            </div>
          </div>

          {/* ── Orders Tab ── */}
          <TabsContent value="orders" className="space-y-4">
            <AdminTable
              title="Orders"
              description={`${ordersTotal} records`}
              searchPlaceholder="Search orders by ID, buyer, or store…"
              onSearch={(v) => {
                setOrdersSearch(v);
                setOrdersPage(1);
              }}
              filters={[
                {
                  key: "status",
                  label: "Status",
                  value: ordersStatus,
                  onChange: (v) => {
                    setOrdersStatus(v);
                    setOrdersPage(1);
                  },
                  options: [
                    { value: "all", label: "All Status" },
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "delivered", label: "Delivered" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                    { value: "disputed", label: "Disputed" },
                    { value: "refunded", label: "Refunded" },
                  ],
                },
              ]}
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead>Order #</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    <SkeletonRows cols={9} rows={8} />
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-16 text-gray-400"
                      >
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-mono text-xs font-medium">
                          #{order.orderNumber}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.buyer
                            ? `${order.buyer.firstName} ${order.buyer.lastName}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.store?.storeName ?? "—"}
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {formatGHS(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatGHS(order.serviceFee)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize font-normal"
                          >
                            {order.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={order.status}
                            map={ORDER_STATUS}
                          />
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {new Date(order.dateCreated).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {orderPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    Page {ordersPage} of {orderPages} · {ordersTotal} orders
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                      disabled={ordersPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setOrdersPage((p) => Math.min(orderPages, p + 1))
                      }
                      disabled={ordersPage >= orderPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </AdminTable>
          </TabsContent>

          {/* ── Escrow Tab ── */}
          <TabsContent value="escrow" className="space-y-4">
            <AdminTable
              title="Escrow"
              description={`${escrowTotal} records`}
              filters={[
                {
                  key: "status",
                  label: "Status",
                  value: escrowStatus,
                  onChange: (v) => {
                    setEscrowStatus(v);
                    setEscrowPage(1);
                  },
                  options: [
                    { value: "all", label: "All Status" },
                    { value: "holding", label: "Holding" },
                    { value: "released", label: "Released" },
                    { value: "refunded", label: "Refunded" },
                    { value: "disputed", label: "Disputed" },
                  ],
                },
              ]}
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead>Escrow ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Seller Gets</TableHead>
                    <TableHead>Platform Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Held</TableHead>
                    <TableHead>Released</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escrowLoading ? (
                    <SkeletonRows cols={10} rows={6} />
                  ) : filteredEscrows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-16 text-gray-400"
                      >
                        <Lock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No escrow records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEscrows.map((e) => (
                      <TableRow key={e.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-mono text-xs">
                          {e.id.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {e.orderId?.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="text-sm">
                          {e.buyerName ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {e.storeName ?? "—"}
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {formatGHS(e.amount)}
                        </TableCell>
                        <TableCell className="text-sm text-emerald-600">
                          {formatGHS(e.sellerAmount)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatGHS(e.platformFee)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={e.status} map={ESCROW_STATUS} />
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(e.heldAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {e.releasedAt ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" />
                              {new Date(e.releasedAt).toLocaleDateString()}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {escrowPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    Page {escrowPage} of {escrowPages} · {escrowTotal} records
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEscrowPage((p) => Math.max(1, p - 1))}
                      disabled={escrowPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEscrowPage((p) => Math.min(escrowPages, p + 1))
                      }
                      disabled={escrowPage >= escrowPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </AdminTable>
          </TabsContent>
        </Tabs>
      </AdminPageLayout>

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        order={viewOrder}
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
      />
    </>
  );
};

export default AdminTransactions;
