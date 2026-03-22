import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import {
  AlertTriangle, Eye, MessageSquare, CheckCircle2, XCircle,
  RefreshCw, Search, Scale, Clock, ShieldAlert, User, Store,
  ChevronRight, Pencil, FileText, ArrowUpRight,
} from "lucide-react";
import adminDisputesService, {
  Dispute, DisputeStatus, ResolutionType, ChatMessage, DisputeStats,
} from "@/services/adminDisputesService";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useCurrency } from "@/hooks";

// ─── Helpers ──────────────────────────────────────────────────

const DISPUTE_STATUS: Record<string, { label: string; cls: string }> = {
  open:             { label: "Open",            cls: "bg-red-100    text-red-700    border-red-200"    },
  under_review:     { label: "Under Review",    cls: "bg-orange-100 text-orange-700 border-orange-200" },
  resolved_buyer:   { label: "Buyer Favor",     cls: "bg-blue-100   text-blue-700   border-blue-200"   },
  resolved_seller:  { label: "Seller Favor",    cls: "bg-purple-100 text-purple-700 border-purple-200" },
  cancelled:        { label: "Cancelled",       cls: "bg-gray-100   text-gray-500   border-gray-200"   },
  closed:           { label: "Closed",          cls: "bg-gray-100   text-gray-400   border-gray-200"   },
};

const isResolved = (s: DisputeStatus) =>
  ["resolved_buyer", "resolved_seller", "cancelled", "closed"].includes(s);

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = DISPUTE_STATUS[status] ?? { label: status, cls: "bg-gray-100 text-gray-500" };
  return <Badge className={`${cfg.cls} font-medium text-xs`}>{cfg.label}</Badge>;
};

const AgePill = ({ days }: { days: number }) => {
  const cls =
    days >= 7 ? "bg-red-50 text-red-600" :
    days >= 3 ? "bg-orange-50 text-orange-600" :
    "bg-gray-50 text-gray-500";
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${cls}`}>
      <Clock className="w-3 h-3" /> {days}d
    </span>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────

const SkeletonRows = ({ cols = 7, rows = 6 }: { cols?: number; rows?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: cols }).map((__, j) => (
          <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

// ─── Chat Transcript ───────────────────────────────────────────

const ChatTranscript: React.FC<{
  disputeId: string;
  buyerName: string;
  sellerName: string;
}> = ({ disputeId, buyerName, sellerName }) => {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string>();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { messages, totalMessages, note: n } = await adminDisputesService.getConversation(disputeId);
        setMsgs(messages);
        setNote(n);
      } catch {
        toast({ title: "Could not load chat transcript", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [disputeId, toast]);

  if (loading) return (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
    </div>
  );

  if (msgs.length === 0) return (
    <div className="text-center py-10 text-gray-400">
      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{note ?? "No messages found between buyer and seller."}</p>
    </div>
  );

  return (
    <ScrollArea className="h-72">
      <div className="p-4 space-y-3">
        {msgs.map((m) => {
          const isBuyer = m.senderType === "buyer";
          return (
            <div key={m.id} className={`flex gap-2 ${isBuyer ? "" : "flex-row-reverse"}`}>
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className={`text-xs font-bold ${isBuyer ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {isBuyer ? buyerName[0] : sellerName[0]}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-[75%] ${isBuyer ? "" : "items-end"} flex flex-col`}>
                <span className={`text-[10px] text-gray-400 mb-0.5 ${isBuyer ? "" : "text-right"}`}>
                  {isBuyer ? buyerName : sellerName}
                  {m.createdAt && ` · ${new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                </span>
                <div className={`rounded-xl px-3 py-2 text-sm ${isBuyer ? "bg-blue-50 text-blue-900" : "bg-emerald-50 text-emerald-900"}`}>
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

// ─── Dispute Detail Dialog ──────────────────────────────────────

interface DetailDialogProps {
  dispute: Dispute | null;
  open: boolean;
  onClose: () => void;
  onResolved: (id: string, status: string) => void;
}

const DetailDialog: React.FC<DetailDialogProps> = ({ dispute, open, onClose, onResolved }) => {
  const { admin } = useAdminAuth();
  const { toast } = useToast();
  const { formatGHS } = useCurrency();

  const [tab, setTab] = useState("overview");
  const [resolution, setResolution] = useState<ResolutionType>("buyer_favor");
  const [refundPct, setRefundPct] = useState(50);
  const [notes, setNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [noteInput, setNoteInput] = useState("");

  if (!dispute) return null;

  const resolved = isResolved(dispute.status);

  const handleResolve = async () => {
    setResolving(true);
    try {
      const result = await adminDisputesService.resolveDispute(
        dispute.id,
        resolution,
        notes || undefined,
        resolution === "partial_refund" ? refundPct : undefined,
      );
      toast({
        title: "Dispute resolved",
        description: `Outcome: ${DISPUTE_STATUS[result.disputeStatus]?.label ?? result.disputeStatus}`,
      });
      onResolved(dispute.id, result.disputeStatus);
      onClose();
    } catch (err) {
      toast({ title: "Resolve failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setResolving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setAddingNote(true);
    try {
      await adminDisputesService.addNote(dispute.id, noteInput.trim());
      toast({ title: "Note saved" });
      setNoteInput("");
    } catch (err) {
      toast({ title: "Failed to save note", description: (err as Error).message, variant: "destructive" });
    } finally {
      setAddingNote(false);
    }
  };

  const escrowAmt = dispute.escrow?.amount ?? dispute.escrowAmount ?? dispute.amount;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Dispute #{dispute.orderNumber ?? dispute.id.slice(0, 8)}
            <StatusBadge status={dispute.status} />
          </DialogTitle>
          <DialogDescription>
            Reason: <span className="font-medium text-gray-700">{dispute.reason}</span> ·{" "}
            <AgePill days={dispute.age} /> old · Escrow: <strong>{formatGHS(escrowAmt)}</strong>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="bg-gray-100 w-full grid grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="resolve" disabled={resolved}>Resolve</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Parties */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Buyer</span>
                </div>
                <p className="font-semibold text-gray-900">{dispute.buyer.name}</p>
                <p className="text-xs text-gray-500">{dispute.buyer.email ?? "—"}</p>
                {dispute.buyer.phone && <p className="text-xs text-gray-400">{dispute.buyer.phone}</p>}
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Seller</span>
                </div>
                <p className="font-semibold text-gray-900">{dispute.seller.name}</p>
                <p className="text-xs text-gray-500">{dispute.seller.email ?? "—"}</p>
              </div>
            </div>

            {/* Description & Evidence */}
            {dispute.description && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                <p className="font-medium text-gray-500 mb-1 text-xs uppercase tracking-wide">Dispute Description</p>
                {dispute.description}
              </div>
            )}

            {/* Order items */}
            {dispute.order && dispute.order.items.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">Order Items</p>
                <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                  {dispute.order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="truncate flex-1">{item.productName}</span>
                      <span className="text-gray-400 mx-3">×{item.quantity}</span>
                      <span className="font-medium">{formatGHS(item.total)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatGHS(dispute.order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Escrow */}
            {dispute.escrow && (
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-2">Escrow</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Amount</p>
                    <p className="font-bold text-gray-900">{formatGHS(dispute.escrow.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <p className="font-medium capitalize">{dispute.escrow.status}</p>
                  </div>
                  {dispute.escrow.holdUntil && (
                    <div>
                      <p className="text-gray-500 text-xs">Hold Until</p>
                      <p className="font-medium">{new Date(dispute.escrow.holdUntil).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Existing resolution/notes */}
            {dispute.resolution && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Admin Notes</p>
                <pre className="whitespace-pre-wrap text-gray-700 text-xs font-sans">{dispute.resolution}</pre>
              </div>
            )}
          </TabsContent>

          {/* ── Chat ── */}
          <TabsContent value="chat" className="mt-4">
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 font-medium border-b border-gray-100">
                Buyer ↔ Seller conversation for this order
              </div>
              <ChatTranscript
                disputeId={dispute.id}
                buyerName={dispute.buyer.name}
                sellerName={dispute.seller.name}
              />
            </div>
          </TabsContent>

          {/* ── Resolve ── */}
          <TabsContent value="resolve" className="mt-4 space-y-5">
            {resolved ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm">This dispute has already been resolved.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Resolution Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: "buyer_favor",   label: "Buyer Favor",    desc: "Full refund to buyer",            icon: User,  cls: "border-blue-300   bg-blue-50/50"    },
                        { value: "seller_favor",  label: "Seller Favor",   desc: "Release escrow to seller",        icon: Store, cls: "border-emerald-300 bg-emerald-50/50" },
                        { value: "partial_refund",label: "Partial Refund", desc: "Split escrow by percentage",      icon: Scale, cls: "border-orange-300  bg-orange-50/50"  },
                        { value: "cancelled",     label: "Close Dispute",  desc: "No action, close the case",       icon: XCircle, cls: "border-gray-300  bg-gray-50"      },
                      ] as const
                    ).map(({ value, label, desc, icon: Icon, cls }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setResolution(value)}
                        className={`text-left rounded-xl p-3 border-2 transition-all ${
                          resolution === value ? cls + " ring-2 ring-offset-1 ring-primary/40" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <Icon className="w-4 h-4" />
                          <span className="font-semibold text-sm">{label}</span>
                        </div>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {resolution === "partial_refund" && (
                  <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Refund Percentage</Label>
                      <span className="text-xl font-bold text-orange-600">{refundPct}%</span>
                    </div>
                    <Slider
                      value={[refundPct]}
                      onValueChange={([v]) => setRefundPct(v)}
                      min={5} max={95} step={5}
                      className="w-full"
                    />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-gray-400 text-xs">Buyer refund</p>
                        <p className="font-bold text-blue-600">{formatGHS(escrowAmt * (refundPct / 100))}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-gray-400 text-xs">Seller gets</p>
                        <p className="font-bold text-emerald-600">{formatGHS(escrowAmt * ((100 - refundPct) / 100))}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="resolve-notes">Admin Notes (optional)</Label>
                  <Textarea
                    id="resolve-notes"
                    placeholder="Document your reasoning for this resolution…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => void handleResolve()}
                  disabled={resolving}
                >
                  {resolving ? "Resolving…" : "Confirm Resolution"}
                </Button>
              </>
            )}
          </TabsContent>

          {/* ── Notes ── */}
          <TabsContent value="notes" className="mt-4 space-y-4">
            {dispute.resolution && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Existing Notes
                </p>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{dispute.resolution}</pre>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-note">Add Internal Note</Label>
              <Textarea
                id="new-note"
                placeholder="Add a note visible only to admin team…"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => void handleAddNote()}
              disabled={!noteInput.trim() || addingNote}
            >
              <Pencil className="w-4 h-4 mr-2" /> {addingNote ? "Saving…" : "Save Note"}
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────

const StatCard = ({
  icon: Icon, title, value, iconBg, iconColor, loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; value: string | number;
  iconBg: string; iconColor: string; loading: boolean;
}) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          {loading ? <Skeleton className="h-7 w-16 mt-1" /> : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`${iconBg} p-2.5 rounded-xl`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Main Page ─────────────────────────────────────────────────

const AdminDisputes: React.FC = () => {
  const { toast } = useToast();
  const { formatGHS } = useCurrency();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats]   = useState<DisputeStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const [selected, setSelected] = useState<Dispute | null>(null);

  // ── Load disputes ─────────────────────────
  const loadDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const { items, total: t } = await adminDisputesService.getDisputes({
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        per_page: PER_PAGE,
      });
      setDisputes(items);
      setTotal(t);
    } catch (err) {
      toast({ title: "Failed to load disputes", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, toast]);

  // ── Load stats ────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await adminDisputesService.getStats();
      setStats(s);
    } catch {
      // stats are non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { void loadDisputes(); }, [loadDisputes]);
  useEffect(() => { void loadStats(); }, [loadStats]);

  const handleResolved = (id: string, status: string) => {
    setDisputes((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: status as DisputeStatus } : d)
    );
  };

  // Client-side search (server search not available from list endpoint)
  const filtered = disputes.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.orderNumber?.toLowerCase().includes(q) ||
      d.buyer.name.toLowerCase().includes(q) ||
      d.seller.name.toLowerCase().includes(q) ||
      d.reason.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(total / PER_PAGE);
  const openCount = stats?.byStatus?.["open"] ?? 0;
  const underReviewCount = stats?.byStatus?.["under_review"] ?? 0;

  return (
    <>
      <SEO
        title="Dispute Management — Campuzon Admin"
        description="Review and resolve buyer-seller disputes on Campuzon."
        keywords="admin disputes, escrow resolution, campus marketplace"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" /> Dispute Resolution
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} total · escrow held until resolved
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { void loadDisputes(); void loadStats(); }}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={ShieldAlert}     title="Open"              value={statsLoading ? "—" : openCount}                                    iconBg="bg-red-50"     iconColor="text-red-600"     loading={statsLoading} />
          <StatCard icon={AlertTriangle}   title="Under Review"      value={statsLoading ? "—" : underReviewCount}                             iconBg="bg-orange-50"  iconColor="text-orange-600"  loading={statsLoading} />
          <StatCard icon={CheckCircle2}    title="Avg Resolution"    value={statsLoading || !stats ? "—" : `${stats.averageResolutionDays}d`}  iconBg="bg-emerald-50" iconColor="text-emerald-600" loading={statsLoading} />
          <StatCard icon={Scale}           title="Total Disputes"    value={statsLoading ? "—" : total}                                        iconBg="bg-blue-50"    iconColor="text-blue-600"    loading={statsLoading} />
        </div>

        {/* Alert for open disputes */}
        {!statsLoading && openCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-700 text-sm">
                {openCount} open dispute{openCount !== 1 ? "s" : ""} need attention
              </p>
              <p className="text-red-500 text-xs mt-0.5">
                Escrow is locked until these are resolved. Oldest first.
              </p>
            </div>
            <Button
              size="sm" variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-100 shrink-0"
              onClick={() => { setStatusFilter("open"); setPage(1); }}
            >
              View Open <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search by order #, buyer, seller, or reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="resolved_buyer">Resolved – Buyer</SelectItem>
              <SelectItem value="resolved_seller">Resolved – Seller</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead>Order</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Age</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-gray-400">
                    <Scale className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No disputes found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((d) => (
                  <TableRow
                    key={d.id}
                    className={`hover:bg-gray-50/50 cursor-pointer ${
                      d.status === "open" ? "border-l-4 border-l-red-400" :
                      d.status === "under_review" ? "border-l-4 border-l-orange-400" : ""
                    }`}
                    onClick={() => setSelected(d)}
                  >
                    <TableCell className="font-mono text-xs font-medium">
                      #{d.orderNumber ?? d.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-sm max-w-[140px] truncate">{d.reason}</TableCell>
                    <TableCell className="text-sm">{d.buyer.name}</TableCell>
                    <TableCell className="text-sm">{d.seller.name}</TableCell>
                    <TableCell className="font-semibold text-sm">{formatGHS(d.amount)}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell><AgePill days={d.age} /></TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost" size="sm"
                        onClick={(e) => { e.stopPropagation(); setSelected(d); }}
                        className="h-8"
                      >
                        {isResolved(d.status) ? (
                          <><Eye className="w-4 h-4 mr-1" /> View</>
                        ) : (
                          <><Scale className="w-4 h-4 mr-1" /> Resolve</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">Page {page} of {totalPages} · {total} disputes</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>
          )}
        </div>

        {/* Top dispute stores */}
        {stats && stats.topStoresByDisputes.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-red-500" /> Top Stores by Disputes
            </h2>
            <div className="space-y-2">
              {stats.topStoresByDisputes.slice(0, 5).map((s, i) => (
                <div key={s.storeId} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-gray-400 font-semibold text-center">{i + 1}</span>
                  <span className="flex-1 text-gray-800">{s.storeName}</span>
                  <Badge className="bg-red-100 text-red-600 border-red-200">{s.disputeCount} dispute{s.disputeCount !== 1 ? "s" : ""}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DetailDialog
        dispute={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onResolved={handleResolved}
      />
    </>
  );
};

export default AdminDisputes;
