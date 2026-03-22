import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Flag, Search, RefreshCw, CheckCircle2, XCircle, Eye,
  Package, Store, Users, MoreHorizontal, Clock, ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { api, extractData } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────

interface FlaggedProduct {
  id: string;
  name: string;
  category?: string;
  price: number;
  status: string;
  storeName?: string;
  storeId?: string;
  dateCreated?: string;
  imageUrl?: string;
  reportReason?: string;
}

interface FlaggedStore {
  id: string;
  storeName: string;
  email?: string;
  status: string;
  ownerName?: string;
  dateCreated?: string;
  reportReason?: string;
  isVerified?: boolean;
}

interface FlaggedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  isSuspended: boolean;
  isActive: boolean;
  dateCreated?: string;
  suspendReason?: string;
}

type ActionType = "approve" | "reject" | "suspend" | "unsuspend" | "remove";

interface ActionTarget {
  type: "product" | "store" | "user";
  id: string;
  name: string;
  action: ActionType;
}

// ─── Helpers ──────────────────────────────────────────────────

const currency = (n: number) => `₵${Number(n).toFixed(2)}`;

const PRODUCT_STATUS_COLOR: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700 border-0",
  active:   "bg-emerald-100 text-emerald-700 border-0",
  flagged:  "bg-red-100 text-red-600 border-0",
  inactive: "bg-gray-100 text-gray-500 border-0",
  removed:  "bg-gray-200 text-gray-400 border-0",
};

const STORE_STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700 border-0",
  active:    "bg-emerald-100 text-emerald-700 border-0",
  suspended: "bg-red-100 text-red-600 border-0",
  inactive:  "bg-gray-100 text-gray-500 border-0",
};

// ─── Stat Card ────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string; iconColor: string;
  label: string; value: number; loading: boolean;
}> = ({ icon: Icon, iconBg, iconColor, label, value, loading }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
    <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      {loading ? <Skeleton className="h-6 w-10 mt-0.5" /> : (
        <p className="text-xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  </div>
);

// ─── Action Confirm Dialog ────────────────────────────────────

const ActionDialog: React.FC<{
  target: ActionTarget | null;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
}> = ({ target, onClose, onConfirm }) => {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!target) return null;

  const isDestructive = ["reject", "suspend", "remove"].includes(target.action);

  const ACTION_LABELS: Record<ActionType, string> = {
    approve: "Approve", reject: "Reject", suspend: "Suspend",
    unsuspend: "Unsuspend", remove: "Remove",
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isDestructive ? "text-red-600" : "text-emerald-700"}`}>
            {isDestructive ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {ACTION_LABELS[target.action]} {target.type}
          </DialogTitle>
          <DialogDescription className="font-medium">{target.name}</DialogDescription>
        </DialogHeader>
        <div className="py-3 space-y-3">
          <p className="text-sm text-gray-600">
            {isDestructive
              ? `This will ${target.action} this ${target.type}. You can add a reason below (optional).`
              : `Confirm approval. You can add a note for the audit log.`
            }
          </p>
          <Textarea
            rows={3}
            placeholder="Admin note / reason (optional)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={async () => {
              setBusy(true);
              await onConfirm(note);
              setBusy(false);
              setNote("");
            }}
            disabled={busy}
          >
            {busy ? "Processing…" : ACTION_LABELS[target.action]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Products Queue ───────────────────────────────────────────

const ProductsQueue: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<FlaggedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionTarget, setActionTarget] = useState<ActionTarget | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Pull pending + flagged products from the admin products endpoint
      const [pendingRes, flaggedRes] = await Promise.all([
        api.get("admin/products?status=pending&per_page=50"),
        api.get("admin/products?status=flagged&per_page=50"),
      ]);
      const pending = extractData<{ products: FlaggedProduct[] }>(pendingRes).products ?? [];
      const flagged = extractData<{ products: FlaggedProduct[] }>(flaggedRes).products ?? [];
      const merged = [...pending, ...flagged].filter(
        (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
      );
      setItems(merged);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = items.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.storeName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (target: ActionTarget, note: string) => {
    try {
      if (target.action === "approve") {
        await api.post(`admin/products/${target.id}/approve`, { note });
        setItems((prev) => prev.filter((p) => p.id !== target.id));
        toast({ title: "Product approved" });
      } else if (target.action === "reject" || target.action === "remove") {
        await api.post(`admin/products/${target.id}/reject`, { reason: note });
        setItems((prev) => prev.filter((p) => p.id !== target.id));
        toast({ title: "Product rejected" });
      }
    } catch (err) {
      toast({ title: "Action failed", description: (err as Error).message, variant: "destructive" });
    } finally { setActionTarget(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9 h-9 text-sm"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead>Product</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Listed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  <Package className="w-7 h-7 mx-auto mb-2 opacity-25" />
                  No flagged or pending products.
                </TableCell>
              </TableRow>
            ) : filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{p.storeName ?? "—"}</TableCell>
                <TableCell className="text-sm font-semibold">{currency(p.price)}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${PRODUCT_STATUS_COLOR[p.status] ?? "bg-gray-100 text-gray-500 border-0"}`}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-gray-400">
                  {p.dateCreated ? new Date(p.dateCreated).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => setActionTarget({ type: "product", id: p.id, name: p.name, action: "approve" })}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                        <span className="text-emerald-700">Approve</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setActionTarget({ type: "product", id: p.id, name: p.name, action: "reject" })}>
                        <XCircle className="w-3.5 h-3.5 mr-2 text-red-500" />
                        <span className="text-red-600">Reject</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ActionDialog
        target={actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={(note) => handleAction(actionTarget!, note)}
      />
    </div>
  );
};

// ─── Stores Queue ─────────────────────────────────────────────

const StoresQueue: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<FlaggedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionTarget, setActionTarget] = useState<ActionTarget | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, suspendedRes] = await Promise.all([
        api.get("admin/stores?status=pending&per_page=50"),
        api.get("admin/stores?status=suspended&per_page=50"),
      ]);
      const pending = extractData<{ stores: FlaggedStore[] }>(pendingRes).stores ?? [];
      const suspended = extractData<{ stores: FlaggedStore[] }>(suspendedRes).stores ?? [];
      const merged = [...pending, ...suspended].filter(
        (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
      );
      setItems(merged);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleAction = async (target: ActionTarget, note: string) => {
    try {
      const endpoint =
        target.action === "approve"    ? `admin/stores/${target.id}/approve` :
        target.action === "reject"     ? `admin/stores/${target.id}/reject`  :
        target.action === "suspend"    ? `admin/stores/${target.id}/suspend`  :
        target.action === "unsuspend"  ? `admin/stores/${target.id}/unsuspend`:
        null;
      if (!endpoint) return;
      await api.post(endpoint, { reason: note });
      setItems((prev) => prev.filter((s) => s.id !== target.id));
      toast({ title: `Store ${target.action}d` });
    } catch (err) {
      toast({ title: "Action failed", description: (err as Error).message, variant: "destructive" });
    } finally { setActionTarget(null); }
  };

  const filtered = items.filter((s) =>
    !search || s.storeName.toLowerCase().includes(search.toLowerCase()) ||
    (s.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9 h-9 text-sm" placeholder="Search stores…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead>Store</TableHead>
              <TableHead className="hidden sm:table-cell">Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  <Store className="w-7 h-7 mx-auto mb-2 opacity-25" />
                  No pending or suspended stores.
                </TableCell>
              </TableRow>
            ) : filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{s.storeName}</p>
                    {s.email && <p className="text-xs text-gray-400">{s.email}</p>}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-gray-600">{s.ownerName ?? "—"}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${STORE_STATUS_COLOR[s.status] ?? "bg-gray-100 text-gray-500 border-0"}`}>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-gray-400">
                  {s.dateCreated ? new Date(s.dateCreated).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {s.status === "pending" && (
                        <>
                          <DropdownMenuItem onClick={() => setActionTarget({ type: "store", id: s.id, name: s.storeName, action: "approve" })}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                            <span className="text-emerald-700">Approve</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setActionTarget({ type: "store", id: s.id, name: s.storeName, action: "reject" })}>
                            <XCircle className="w-3.5 h-3.5 mr-2 text-red-500" />
                            <span className="text-red-600">Reject</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      {s.status === "active" && (
                        <DropdownMenuItem onClick={() => setActionTarget({ type: "store", id: s.id, name: s.storeName, action: "suspend" })}>
                          <AlertTriangle className="w-3.5 h-3.5 mr-2 text-orange-500" />
                          <span className="text-orange-600">Suspend</span>
                        </DropdownMenuItem>
                      )}
                      {s.status === "suspended" && (
                        <DropdownMenuItem onClick={() => setActionTarget({ type: "store", id: s.id, name: s.storeName, action: "unsuspend" })}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                          <span className="text-emerald-700">Unsuspend</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ActionDialog
        target={actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={(note) => handleAction(actionTarget!, note)}
      />
    </div>
  );
};

// ─── Users Queue ──────────────────────────────────────────────

const UsersQueue: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<FlaggedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionTarget, setActionTarget] = useState<ActionTarget | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/users?status=suspended&per_page=50");
      const d = extractData<{ users: FlaggedUser[] }>(res);
      setItems(d.users ?? []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleAction = async (target: ActionTarget, note: string) => {
    try {
      if (target.action === "unsuspend") {
        await api.post(`admin/users/${target.id}/unsuspend`, { reason: note });
        setItems((prev) => prev.filter((u) => u.id !== target.id));
        toast({ title: "User unsuspended" });
      } else if (target.action === "suspend") {
        await api.post(`admin/users/${target.id}/suspend`, { reason: note });
        // refresh mark as suspended
        setItems((prev) => prev.map((u) => u.id === target.id ? { ...u, isSuspended: true } : u));
        toast({ title: `User suspended` });
      }
    } catch (err) {
      toast({ title: "Action failed", description: (err as Error).message, variant: "destructive" });
    } finally { setActionTarget(null); }
  };

  const filtered = items.filter((u) =>
    !search ||
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9 h-9 text-sm" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Reason</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  <Users className="w-7 h-7 mx-auto mb-2 opacity-25" />
                  No suspended users at this time.
                </TableCell>
              </TableRow>
            ) : filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-red-100 text-red-600 text-xs font-bold">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="text-xs capitalize">{u.role ?? "user"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${u.isSuspended ? "bg-red-100 text-red-600 border-0" : "bg-gray-100 text-gray-500 border-0"}`}>
                    {u.isSuspended ? "Suspended" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-gray-500 max-w-xs truncate">
                  {u.suspendReason ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {u.isSuspended && (
                        <DropdownMenuItem onClick={() => setActionTarget({ type: "user", id: u.id, name: `${u.firstName} ${u.lastName}`, action: "unsuspend" })}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                          <span className="text-emerald-700">Unsuspend</span>
                        </DropdownMenuItem>
                      )}
                      {!u.isSuspended && (
                        <DropdownMenuItem onClick={() => setActionTarget({ type: "user", id: u.id, name: `${u.firstName} ${u.lastName}`, action: "suspend" })}>
                          <AlertTriangle className="w-3.5 h-3.5 mr-2 text-orange-500" />
                          <span className="text-orange-600">Suspend</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ActionDialog
        target={actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={(note) => handleAction(actionTarget!, note)}
      />
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────

const AdminModerationQueue: React.FC = () => {
  const [pendingProducts, setPendingProducts] = useState(0);
  const [pendingStores, setPendingStores] = useState(0);
  const [suspendedUsers, setSuspendedUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // Quick stats
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pr, sr, ur] = await Promise.all([
          api.get("admin/products?status=pending&per_page=1"),
          api.get("admin/stores?status=pending&per_page=1"),
          api.get("admin/users?status=suspended&per_page=1"),
        ]);
        setPendingProducts(extractData<{ pagination: { totalItems: number } }>(pr).pagination?.totalItems ?? 0);
        setPendingStores(extractData<{ pagination: { totalItems: number } }>(sr).pagination?.totalItems ?? 0);
        setSuspendedUsers(extractData<{ pagination: { totalItems: number } }>(ur).pagination?.totalItems ?? 0);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  const total = pendingProducts + pendingStores + suspendedUsers;

  return (
    <>
      <SEO
        title="Moderation Queue — Campuzon Admin"
        description="Review and moderate flagged products, stores, and suspended users."
        keywords="moderation, flagged, products, stores, suspended users"
      />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" /> Moderation Queue
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Review flagged products, pending stores, and suspended users.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Flag}        iconBg="bg-red-50"     iconColor="text-red-500"     label="Total Queued"       value={total}            loading={loading} />
          <StatCard icon={Package}     iconBg="bg-yellow-50"  iconColor="text-yellow-600"  label="Pending Products"   value={pendingProducts}  loading={loading} />
          <StatCard icon={Store}       iconBg="bg-blue-50"    iconColor="text-blue-600"     label="Pending Stores"     value={pendingStores}   loading={loading} />
          <StatCard icon={Users}       iconBg="bg-orange-50"  iconColor="text-orange-600"  label="Suspended Users"    value={suspendedUsers}  loading={loading} />
        </div>

        {total === 0 && !loading && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Queue is clear!</p>
              <p className="text-xs text-emerald-600">All products and stores have been reviewed. No suspended users.</p>
            </div>
          </div>
        )}

        {/* Tabbed queues */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="products" className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Products
              {pendingProducts > 0 && (
                <span className="ml-1 bg-yellow-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {pendingProducts}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              Stores
              {pendingStores > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {pendingStores}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Users
              {suspendedUsers > 0 && (
                <span className="ml-1 bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {suspendedUsers}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products"><ProductsQueue /></TabsContent>
          <TabsContent value="stores"><StoresQueue /></TabsContent>
          <TabsContent value="users"><UsersQueue /></TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminModerationQueue;
