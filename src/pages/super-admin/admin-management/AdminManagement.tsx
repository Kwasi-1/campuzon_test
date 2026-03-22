import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShieldCheck, Plus, Search, MoreHorizontal, ToggleRight,
  ToggleLeft, KeyRound, Activity, Crown, Users, CheckCircle2,
  Clock, RefreshCw, Pencil, Eye, ShieldOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { api, extractData } from "@/lib/api";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

// ─── Types ────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  lastLogin?: string | null;
  dateCreated?: string;
  permissions?: string[] | null;
}

interface ActivityEntry {
  id: string;
  action: string;
  description: string;
  targetType?: string;
  ipAddress?: string;
  date: string;
}

// ─── Helpers ──────────────────────────────────────────────────

const initials = (a: AdminUser) =>
  `${a.firstName?.[0] ?? ""}${a.lastName?.[0] ?? ""}`.toUpperCase() || a.email[0].toUpperCase();

const roleBadge = (a: AdminUser) =>
  a.isSuperAdmin
    ? "bg-violet-100 text-violet-700 border-0"
    : "bg-blue-100 text-blue-700 border-0";

const roleLabel = (a: AdminUser) =>
  a.isSuperAdmin ? "Super Admin" : (a.role?.replace(/_/g, " ") ?? "Admin");

const statusBadge = (active: boolean) =>
  active ? "bg-emerald-100 text-emerald-700 border-0" : "bg-gray-100 text-gray-500 border-0";

const ROLES = ["admin", "moderator", "support", "super_admin"];

// ─── default create form ──────────────────────────────────────

const defaultForm = () => ({
  firstName: "", lastName: "", email: "", password: "", role: "admin",
});

// ─── KPI card ─────────────────────────────────────────────────

const Stat: React.FC<{ icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string; label: string; value: string; sub?: string; loading: boolean }> = (
  { icon: Icon, iconBg, iconColor, label, value, sub, loading }
) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
    <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      {loading ? <Skeleton className="h-6 w-16 mt-0.5" /> : (
        <p className="text-xl font-bold text-gray-900">{value}</p>
      )}
      {sub && !loading && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

// ─── Activity Sheet ───────────────────────────────────────────

const ActivitySheet: React.FC<{
  admin: AdminUser | null;
  open: boolean;
  onClose: () => void;
}> = ({ admin, open, onClose }) => {
  const [log, setLog] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!admin || !open) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`admin/admins/${admin.id}/activity?per_page=30`);
        const d = extractData<{ activities: ActivityEntry[] }>(res);
        setLog(d.activities ?? []);
      } catch { setLog([]); }
      finally { setLoading(false); }
    };
    void load();
  }, [admin, open]);

  const ACTION_COLORS: Record<string, string> = {
    LOGIN: "bg-emerald-100 text-emerald-700",
    ADMIN_CREATED: "bg-blue-100 text-blue-700",
    ADMIN_UPDATED: "bg-yellow-100 text-yellow-700",
    ADMIN_DEACTIVATED: "bg-red-100 text-red-600",
    ADMIN_ACTIVATED: "bg-emerald-100 text-emerald-700",
    ADMIN_PASSWORD_RESET: "bg-orange-100 text-orange-600",
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[420px] sm:w-[520px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Activity Log
          </SheetTitle>
          <SheetDescription>
            {admin ? `${admin.firstName} ${admin.lastName} — ${admin.email}` : ""}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : log.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Activity className="w-7 h-7 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {log.map((e) => (
              <div key={e.id} className="flex gap-3 p-3 rounded-xl bg-gray-50/80">
                <div className="w-1.5 shrink-0 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge className={`text-[10px] px-1.5 py-0.5 ${ACTION_COLORS[e.action] ?? "bg-gray-100 text-gray-600"}`}>
                      {e.action.replace(/_/g, " ")}
                    </Badge>
                    {e.ipAddress && (
                      <span className="text-[10px] text-gray-400 font-mono">{e.ipAddress}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 truncate">{e.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {e.date ? new Date(e.date).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

// ─── Main Page ────────────────────────────────────────────────

const AdminManagement: React.FC = () => {
  const { toast } = useToast();
  const { admin: currentAdmin } = useAdminAuth();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals / sheets
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [activityTarget, setActivityTarget] = useState<AdminUser | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState(defaultForm());
  const [creating, setCreating] = useState(false);
  const [editForm, setEditForm] = useState<{ firstName: string; lastName: string; role: string; isActive: boolean }>({
    firstName: "", lastName: "", role: "admin", isActive: true,
  });
  const [editing, setEditing] = useState(false);

  // ── Load ─────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/admins?per_page=100");
      const d = extractData<{ admins: AdminUser[] }>(res);
      setAdmins(d.admins ?? []);
    } catch (err) {
      toast({ title: "Failed to load admins", description: (err as Error).message, variant: "destructive" });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  // ── Filter ───────────────────────────────────

  const filtered = admins.filter((a) => {
    const name = `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || (roleFilter === "super_admin" ? a.isSuperAdmin : (!a.isSuperAdmin && a.role === roleFilter));
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? a.isActive : !a.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  // ── Stats ────────────────────────────────────

  const totalAdmins = admins.length;
  const activeAdmins = admins.filter((a) => a.isActive).length;
  const superAdmins = admins.filter((a) => a.isSuperAdmin).length;
  const recentLogins = admins.filter((a) => {
    if (!a.lastLogin) return false;
    return new Date(a.lastLogin) > new Date(Date.now() - 24 * 3600 * 1000);
  }).length;

  // ── Create ───────────────────────────────────

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await api.post("admin/admins", {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
      });
      const d = extractData<AdminUser>(res);
      setAdmins((prev) => [d, ...prev]);
      toast({ title: "Admin created", description: `${d.firstName} ${d.lastName} added.` });
      setCreateOpen(false);
      setCreateForm(defaultForm());
    } catch (err) {
      toast({ title: "Create failed", description: (err as Error).message, variant: "destructive" });
    } finally { setCreating(false); }
  };

  // ── Edit ─────────────────────────────────────

  const openEdit = (a: AdminUser) => {
    setEditTarget(a);
    setEditForm({ firstName: a.firstName, lastName: a.lastName, role: a.role, isActive: a.isActive });
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditing(true);
    try {
      await api.patch(`admin/admins/${editTarget.id}`, editForm);
      setAdmins((prev) => prev.map((a) =>
        a.id === editTarget.id ? { ...a, ...editForm, isSuperAdmin: editForm.role === "super_admin" } : a
      ));
      toast({ title: "Admin updated" });
      setEditTarget(null);
    } catch (err) {
      toast({ title: "Update failed", description: (err as Error).message, variant: "destructive" });
    } finally { setEditing(false); }
  };

  // ── Activate / Deactivate ─────────────────────

  const handleToggleActive = async (a: AdminUser) => {
    const action = a.isActive ? "deactivate" : "activate";
    try {
      await api.post(`admin/admins/${a.id}/${action}`, {});
      setAdmins((prev) => prev.map((x) => x.id === a.id ? { ...x, isActive: !a.isActive } : x));
      toast({ title: a.isActive ? "Admin deactivated" : "Admin activated" });
    } catch (err) {
      toast({ title: "Action failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  // ── Password Reset ────────────────────────────

  const handlePasswordReset = async (a: AdminUser) => {
    try {
      const res = await api.post(`admin/admins/${a.id}/reset-password`, {});
      const d = extractData<{ temporaryPassword: string }>(res);
      setTempPassword(d.temporaryPassword);
      toast({ title: "Password reset", description: "Temporary password ready." });
    } catch (err) {
      toast({ title: "Reset failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const isSelf = (a: AdminUser) => currentAdmin && a.email === (currentAdmin as unknown as { email?: string }).email;

  return (
    <>
      <SEO
        title="Admin Management — Campuzon Super Admin"
        description="Manage admin accounts, roles, and activity logs."
        keywords="admin management, super admin, roles"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Admin Management
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Super admin — manage admin accounts, roles &amp; activity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Admin
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat icon={Users}         iconBg="bg-blue-50"    iconColor="text-blue-600"    label="Total Admins"   value={totalAdmins.toString()}  loading={loading} />
          <Stat icon={CheckCircle2}  iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Active"         value={activeAdmins.toString()} sub={`${totalAdmins > 0 ? ((activeAdmins/totalAdmins)*100).toFixed(0) : 0}% rate`} loading={loading} />
          <Stat icon={Crown}         iconBg="bg-violet-50"  iconColor="text-violet-600"  label="Super Admins"   value={superAdmins.toString()}  loading={loading} />
          <Stat icon={Clock}         iconBg="bg-orange-50"  iconColor="text-orange-600"  label="Logins (24h)"   value={recentLogins.toString()} loading={loading} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9 h-9 text-sm"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Last Login</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    No admins found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((a) => (
                <TableRow key={a.id} className={!a.isActive ? "opacity-50" : ""}>
                  {/* Admin */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={`text-xs font-bold ${a.isSuperAdmin ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                          {initials(a)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {a.firstName} {a.lastName}
                          {isSelf(a) && <span className="ml-1 text-[10px] text-gray-400">(you)</span>}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{a.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Badge className={`text-xs ${roleBadge(a)}`}>
                      {a.isSuperAdmin && <Crown className="w-3 h-3 mr-1 inline" />}
                      {roleLabel(a)}
                    </Badge>
                  </TableCell>

                  {/* Last Login */}
                  <TableCell className="hidden md:table-cell text-xs text-gray-500">
                    {a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : "Never"}
                  </TableCell>

                  {/* Created */}
                  <TableCell className="hidden lg:table-cell text-xs text-gray-500">
                    {a.dateCreated ? new Date(a.dateCreated).toLocaleDateString() : "—"}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge className={`text-xs ${statusBadge(a.isActive)}`}>
                      {a.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openEdit(a)}>
                          <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActivityTarget(a)}>
                          <Activity className="w-3.5 h-3.5 mr-2" /> Activity Log
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!isSelf(a) && (
                          <>
                            <DropdownMenuItem onClick={() => void handleToggleActive(a)}>
                              {a.isActive
                                ? <><ShieldOff className="w-3.5 h-3.5 mr-2 text-red-500" /><span className="text-red-600">Deactivate</span></>
                                : <><ToggleRight className="w-3.5 h-3.5 mr-2 text-emerald-600" /><span className="text-emerald-600">Activate</span></>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void handlePasswordReset(a)}>
                              <KeyRound className="w-3.5 h-3.5 mr-2 text-orange-500" />
                              <span className="text-orange-600">Reset Password</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Create Admin Dialog ── */}
      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Admin Account
            </DialogTitle>
            <DialogDescription>New admin will receive an email to set their password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input value={createForm.firstName} onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name *</Label>
                <Input value={createForm.lastName} onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Temporary Password *</Label>
              <Input type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 8 chars, upper + number + symbol" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => void handleCreate()}
              disabled={!createForm.firstName || !createForm.email || !createForm.password || creating}
            >
              {creating ? "Creating…" : "Create Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Admin Dialog ── */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Edit Admin
            </DialogTitle>
            <DialogDescription>{editTarget?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={() => void handleEdit()} disabled={editing}>
              {editing ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Temp Password Dialog ── */}
      <Dialog open={!!tempPassword} onOpenChange={(o) => !o && setTempPassword(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <KeyRound className="w-4 h-4" /> Password Reset
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">Share this temporary password securely. The admin must change it immediately after logging in.</p>
            <div className="font-mono bg-gray-100 rounded-lg px-4 py-3 text-center text-lg font-bold tracking-wider select-all">
              {tempPassword}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              void navigator.clipboard.writeText(tempPassword ?? "");
              toast({ title: "Copied to clipboard" });
            }} variant="outline">Copy</Button>
            <Button onClick={() => setTempPassword(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Activity Log Sheet ── */}
      <ActivitySheet
        admin={activityTarget}
        open={!!activityTarget}
        onClose={() => setActivityTarget(null)}
      />
    </>
  );
};

export default AdminManagement;
