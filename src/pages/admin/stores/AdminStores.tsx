import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import {
  MoreHorizontal, CheckCircle, XCircle, ShieldBan, ShieldCheck,
  BadgeCheck, Eye, Download, Search, Store, Star, RefreshCw,
  AlertCircle, MapPin, Package,
} from "lucide-react";
import adminDataService, { AdminStoreItem } from "@/services/adminDataService";
import { useCurrency } from "@/hooks";

// ─── Helpers ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active:    { label: "Active",    className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pending:   { label: "Pending",   className: "bg-yellow-100  text-yellow-700  border-yellow-200"  },
  suspended: { label: "Suspended", className: "bg-red-100     text-red-700     border-red-200"     },
  rejected:  { label: "Rejected",  className: "bg-gray-100    text-gray-600    border-gray-200"    },
  closed:    { label: "Closed",    className: "bg-gray-100    text-gray-500    border-gray-200"    },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status.toLowerCase()] ?? STATUS_CONFIG.closed;
  return <Badge className={`${cfg.className} font-medium text-xs`}>{cfg.label}</Badge>;
};

// ─── Approve Dialog ────────────────────────────────────────────

const ConfirmDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass?: string;
  children?: React.ReactNode;
}> = ({ open, onClose, onConfirm, loading, title, description, confirmLabel, confirmClass = "", children }) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {children && <div className="py-2">{children}</div>}
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button className={confirmClass} onClick={onConfirm} disabled={loading}>
          {loading ? "Working…" : confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ─── Store Detail Dialog ───────────────────────────────────────

const StoreDetailDialog: React.FC<{ store: AdminStoreItem | null; open: boolean; onClose: () => void }> = ({
  store, open, onClose,
}) => {
  const { formatGHS } = useCurrency();
  if (!store) return null;
  const rows: [string, string][] = [
    ["Store Name",    store.storeName],
    ["Email",         store.email],
    ["Phone",         store.phoneNumber || "—"],
    ["Status",        store.status],
    ["Rating",        store.rating ? `${store.rating.toFixed(1)} / 5` : "No ratings"],
    ["Products",      String(store.productCount)],
    ["Total Orders",  String(store.totalOrders)],
    ["Revenue",       formatGHS(store.totalRevenue || 0)],
    ["Verified",      store.isVerified ? "Yes" : "No"],
    ["Subscription",  store.subscriptionPlan ?? "Free"],
    ["Institution",   store.institutionName ?? "—"],
    ["Hall",          store.hall ?? "—"],
    ["Owner",         store.owner ? (store.owner.name || `${store.owner.firstName} ${store.owner.lastName}`.trim()) : "—"],
    ["Owner Email",   store.owner?.email ?? "—"],
    ["Joined",        new Date(store.dateCreated).toLocaleDateString()],
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Store Details</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4 py-2 border-b">
          <Avatar className="h-14 w-14 rounded-xl">
            <AvatarImage src={store.logoUrl ?? undefined} />
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold">
              <Store className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900 flex items-center gap-2">
              {store.storeName}
              {store.isVerified && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
            </p>
            <p className="text-sm text-gray-400">{store.storeSlug}</p>
            <div className="mt-1"><StatusBadge status={store.status} /></div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm py-2 max-h-64 overflow-y-auto scrollbar-hide">
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-gray-400 font-medium">{k}</dt>
              <dd className="text-gray-800 truncate">{v}</dd>
            </React.Fragment>
          ))}
        </dl>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Skeleton rows ─────────────────────────────────────────────

const SkeletonRows = ({ count = 6 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 7 }).map((__, j) => (
          <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

// ─── Main Page ─────────────────────────────────────────────────

const AdminStores: React.FC = () => {
  const { toast } = useToast();
  const { formatGHS } = useCurrency();
  // const { dateRange, isFiltered } = useDateFilter(); // Assuming useDateFilter is a custom hook you intend to add
  const [stores, setStores] = useState<AdminStoreItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  // Dialog state
  const [viewStore, setViewStore] = useState<AdminStoreItem | null>(null);
  const [approveStore, setApproveStore] = useState<AdminStoreItem | null>(null);
  const [rejectStore, setRejectStore] = useState<AdminStoreItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendStore, setSuspendStore] = useState<AdminStoreItem | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDays, setSuspendDays] = useState("permanent");
  const [unsuspendStore, setUnsuspendStore] = useState<AdminStoreItem | null>(null);

  // ── Fetch ─────────────────────────────────
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { items, total: t } = await adminDataService.getStores({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        per_page: PER_PAGE,
      });
      setStores(items);
      setTotal(t);
    } catch (err) {
      toast({ title: "Failed to load stores", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, toast]);

  useEffect(() => { void fetchStores(); }, [fetchStores]);

  // ── Actions ───────────────────────────────
  const runAction = async (
    action: () => Promise<void>,
    successMsg: string,
    updater: (s: AdminStoreItem) => AdminStoreItem,
    targetId: string,
  ) => {
    setActionLoading(true);
    try {
      await action();
      setStores((prev) => prev.map((s) => s.id === targetId ? updater(s) : s));
      toast({ title: successMsg });
    } catch (err) {
      toast({ title: "Action failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approveStore) return;
    await runAction(
      () => adminDataService.approveStore(approveStore.id),
      `${approveStore.storeName} has been approved.`,
      (s) => ({ ...s, status: "active" }),
      approveStore.id,
    );
    setApproveStore(null);
  };

  const handleReject = async () => {
    if (!rejectStore || !rejectReason.trim()) return;
    await runAction(
      () => adminDataService.rejectStore(rejectStore.id, rejectReason),
      `${rejectStore.storeName} has been rejected.`,
      (s) => ({ ...s, status: "rejected" }),
      rejectStore.id,
    );
    setRejectStore(null);
    setRejectReason("");
  };

  const durationDays: Record<string, number | undefined> = {
    "1": 1, "7": 7, "30": 30, "90": 90, permanent: undefined,
  };

  const handleSuspend = async () => {
    if (!suspendStore || !suspendReason.trim()) return;
    await runAction(
      () => adminDataService.suspendStore(suspendStore.id, suspendReason, durationDays[suspendDays]),
      `${suspendStore.storeName} has been suspended.`,
      (s) => ({ ...s, status: "suspended" }),
      suspendStore.id,
    );
    setSuspendStore(null);
    setSuspendReason("");
    setSuspendDays("permanent");
  };

  const handleUnsuspend = async () => {
    if (!unsuspendStore) return;
    await runAction(
      () => adminDataService.unsuspendStore(unsuspendStore.id),
      `${unsuspendStore.storeName} is now active again.`,
      (s) => ({ ...s, status: "active" }),
      unsuspendStore.id,
    );
    setUnsuspendStore(null);
  };

  const handleVerify = async (store: AdminStoreItem) => {
    await runAction(
      () => adminDataService.verifyStore(store.id),
      `${store.storeName} is now verified.`,
      (s) => ({ ...s, isVerified: true }),
      store.id,
    );
  };

  const handleExport = () => {
    const headers = ["ID", "Store Name", "Owner", "Email", "Status", "Products", "Orders", "Revenue (GHS)", "Verified", "Joined"];
    const rows = stores.map((s) => [
      s.id, s.storeName,
      s.owner ? `${s.owner.firstName} ${s.owner.lastName}` : "—",
      s.email, s.status, s.productCount, s.totalOrders,
      s.totalRevenue.toFixed(2), s.isVerified ? "Yes" : "No",
      new Date(s.dateCreated).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url; a.download = `stores-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Quick stats ───────────────────────────
  const activeCount  = stores.filter((s) => s.status === "active").length;
  const pendingCount = stores.filter((s) => s.status === "pending").length;
  const verifiedCount = stores.filter((s) => s.isVerified).length;
  const totalPages   = Math.ceil(total / PER_PAGE);

  return (
    <>
      <SEO
        title="Store Management — Campuzon Admin"
        description="Approve, review, and manage campus stores."
        keywords="admin stores, store approval, campus marketplace"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" /> Store Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} total stores</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void fetchStores()}>
              <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",    value: total,        color: "text-primary",     bg: "bg-primary/5"   },
            { label: "Active",   value: activeCount,  color: "text-emerald-600", bg: "bg-emerald-50"  },
            { label: "Pending",  value: pendingCount, color: "text-yellow-600",  bg: "bg-yellow-50",
              highlight: pendingCount > 0 },
            { label: "Verified", value: verifiedCount, color: "text-blue-600",   bg: "bg-blue-50"     },
          ].map(({ label, value, color, bg, highlight }) => (
            <div
              key={label}
              className={`${bg} rounded-xl p-4 text-center relative ${highlight ? "ring-2 ring-yellow-300/60" : ""}`}
            >
              <p className={`text-2xl font-bold ${color}`}>{loading ? "—" : value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              {highlight && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search by store name, owner, or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows count={6} />
              ) : stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No stores found
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-xl">
                          <AvatarImage src={store.logoUrl ?? undefined} />
                          <AvatarFallback className="rounded-xl bg-primary/10">
                            <Store className="w-4 h-4 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{store.storeName}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Package className="w-3 h-3" /> {store.productCount} products
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {store.owner ? (store.owner.name || `${store.owner.firstName || ""} ${store.owner.lastName || ""}`.trim()) : "—"}
                      </div>
                      <div className="text-xs text-gray-400">{store.owner?.email ?? "—"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {store.institution || store.institutionName || "—"}
                      </div>
                      {store.hall && <div className="text-xs text-gray-400 ml-4">{store.hall}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {store.rating ? store.rating.toFixed(1) : "—"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatGHS(store.totalRevenue || 0)} · {store.totalOrders || 0} orders
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={store.status} /></TableCell>
                    <TableCell>
                      {store.isVerified ? (
                        <BadgeCheck className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Inline quick-action buttons for pending stores */}
                        {store.status === "pending" && (
                          <>
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs"
                              onClick={() => setApproveStore(store)}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-red-600 border-red-200 hover:bg-red-50 text-xs"
                              onClick={() => setRejectStore(store)}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setViewStore(store)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            {!store.isVerified && (
                              <DropdownMenuItem
                                onClick={() => void handleVerify(store)}
                                className="text-blue-600"
                              >
                                <BadgeCheck className="w-4 h-4 mr-2" /> Verify Store
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {store.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => setApproveStore(store)}
                                  className="text-emerald-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setRejectStore(store)}
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {store.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => setSuspendStore(store)}
                                className="text-red-600"
                              >
                                <ShieldBan className="w-4 h-4 mr-2" /> Suspend
                              </DropdownMenuItem>
                            )}
                            {store.status === "suspended" && (
                              <DropdownMenuItem
                                onClick={() => setUnsuspendStore(store)}
                                className="text-emerald-600"
                              >
                                <ShieldCheck className="w-4 h-4 mr-2" /> Unsuspend
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">Page {page} of {totalPages} · {total} stores</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}
      <StoreDetailDialog store={viewStore} open={!!viewStore} onClose={() => setViewStore(null)} />

      {/* Approve */}
      <ConfirmDialog
        open={!!approveStore}
        onClose={() => setApproveStore(null)}
        onConfirm={() => void handleApprove()}
        loading={actionLoading}
        title={`Approve "${approveStore?.storeName}"?`}
        description="This will make the store active and visible to buyers on the platform."
        confirmLabel="Approve Store"
        confirmClass="bg-emerald-600 hover:bg-emerald-700"
      />

      {/* Reject */}
      <ConfirmDialog
        open={!!rejectStore}
        onClose={() => { setRejectStore(null); setRejectReason(""); }}
        onConfirm={() => void handleReject()}
        loading={actionLoading}
        title={`Reject "${rejectStore?.storeName}"`}
        description="The store owner will be notified of the rejection with the reason provided."
        confirmLabel="Reject Store"
        confirmClass="bg-red-600 hover:bg-red-700"
      >
        <div className="space-y-1.5">
          <Label htmlFor="reject-reason">Reason <span className="text-red-500">*</span></Label>
          <Textarea
            id="reject-reason"
            placeholder="Explain why this store is being rejected…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
        </div>
      </ConfirmDialog>

      {/* Suspend */}
      <ConfirmDialog
        open={!!suspendStore}
        onClose={() => { setSuspendStore(null); setSuspendReason(""); }}
        onConfirm={() => void handleSuspend()}
        loading={actionLoading}
        title={`Suspend "${suspendStore?.storeName}"?`}
        description="The store will be hidden from buyers. All active listings will be paused."
        confirmLabel="Suspend Store"
        confirmClass="bg-red-600 hover:bg-red-700"
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="suspend-reason-store">Reason <span className="text-red-500">*</span></Label>
            <Textarea
              id="suspend-reason-store"
              placeholder="Describe why this store is being suspended…"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="suspend-duration-store">Duration</Label>
            <Select value={suspendDays} onValueChange={setSuspendDays}>
              <SelectTrigger id="suspend-duration-store"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ConfirmDialog>

      {/* Unsuspend */}
      <ConfirmDialog
        open={!!unsuspendStore}
        onClose={() => setUnsuspendStore(null)}
        onConfirm={() => void handleUnsuspend()}
        loading={actionLoading}
        title={`Unsuspend "${unsuspendStore?.storeName}"?`}
        description="The store will become active again and visible to buyers."
        confirmLabel="Unsuspend"
        confirmClass="bg-emerald-600 hover:bg-emerald-700"
      />
    </>
  );
};

export default AdminStores;
