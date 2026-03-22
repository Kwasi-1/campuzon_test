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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminTable from "@/components/admin/AdminTable";
import SEO from "@/components/SEO";
import {
  Eye, MoreHorizontal, ShieldBan, ShieldCheck, BadgeCheck,
  UserCog, Download, Search, RefreshCw, Users,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import adminDataService, { AdminUserItem } from "@/services/adminDataService";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

// ─── Status badge helpers ──────────────────────────────────────

const statusBadge = (u: AdminUserItem) => {
  if (u.isSuspended)
    return <Badge className="bg-red-100 text-red-700 border-red-200">Suspended</Badge>;
  if (!u.isActive)
    return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inactive</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>;
};

const verifiedBadge = (u: AdminUserItem) =>
  u.isVerified ? (
    <span title="Verified" className="inline-flex items-center text-emerald-500">
      <BadgeCheck className="w-4 h-4" />
    </span>
  ) : (
    <span title="Unverified" className="inline-flex items-center text-gray-300">
      <BadgeCheck className="w-4 h-4" />
    </span>
  );

// ─── Suspend Dialog ────────────────────────────────────────────

interface SuspendDialogProps {
  user: AdminUserItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, days: number | undefined) => void;
  loading: boolean;
}

const SuspendDialog: React.FC<SuspendDialogProps> = ({ user, open, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("permanent");

  const durationDays: Record<string, number | undefined> = {
    "1":        1,
    "7":        7,
    "30":       30,
    "90":       90,
    "permanent": undefined,
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <ShieldBan className="w-5 h-5" />
            Suspend {user?.firstName} {user?.lastName}
          </DialogTitle>
          <DialogDescription>
            This will prevent the user from accessing the platform. All their active sessions will be
            revoked.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="suspend-reason">Reason <span className="text-red-500">*</span></Label>
            <Textarea
              id="suspend-reason"
              placeholder="Describe why this user is being suspended..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="suspend-duration">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="suspend-duration">
                <SelectValue />
              </SelectTrigger>
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(reason, durationDays[duration])}
            disabled={!reason.trim() || loading}
          >
            {loading ? "Suspending…" : "Suspend User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Role Dialog ───────────────────────────────────────────────

interface RoleDialogProps {
  user: AdminUserItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (role: string) => void;
  loading: boolean;
}

const RoleDialog: React.FC<RoleDialogProps> = ({ user, open, onClose, onConfirm, loading }) => {
  const [role, setRole] = useState(user?.role ?? "buyer");
  useEffect(() => { if (user) setRole(user.role); }, [user]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Change Role — {user?.firstName} {user?.lastName}
          </DialogTitle>
          <DialogDescription>
            Changing the role will immediately update the user's permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-1.5">
          <Label htmlFor="new-role">New Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="new-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buyer">Buyer</SelectItem>
              <SelectItem value="seller">Seller</SelectItem>
              <SelectItem value="buyer_seller">Buyer &amp; Seller</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={() => onConfirm(role)} disabled={loading}>
            {loading ? "Saving…" : "Change Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── User Detail Drawer ────────────────────────────────────────

interface UserDetailDialogProps {
  user: AdminUserItem | null;
  open: boolean;
  onClose: () => void;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({ user, open, onClose }) => {
  if (!user) return null;
  const rows: [string, string][] = [
    ["Email",       user.email],
    ["Phone",       user.phoneNumber || "—"],
    ["Role",        user.role],
    ["Institution", user.institution || "—"],
    ["Hall",        user.hall || "—"],
    ["Joined",      new Date(user.dateCreated).toLocaleDateString()],
    ["Last Login",  user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"],
    ["Verified",    user.isVerified ? "Yes" : "No"],
    ["Suspended",   user.isSuspended ? "Yes" : "No"],
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4 py-2 border-b">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.profileImage ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-1 flex gap-1.5">
              {statusBadge(user)}
              {verifiedBadge(user)}
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm py-2">
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-gray-500 font-medium">{k}</dt>
              <dd className="text-gray-900 truncate">{v}</dd>
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

// ─── Skeleton row ──────────────────────────────────────────────

const SkeletonRows = ({ count = 8 }: { count?: number }) => (
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

// ─── Main component ────────────────────────────────────────────

const AdminUsers: React.FC = () => {
  const { isSuperAdmin } = useAdminAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  // Dialogs
  const [viewUser, setViewUser] = useState<AdminUserItem | null>(null);
  const [suspendUser, setSuspendUser] = useState<AdminUserItem | null>(null);
  const [roleUser, setRoleUser] = useState<AdminUserItem | null>(null);

  // ── Fetch ─────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam =
        statusFilter === "suspended" ? "suspended"
        : statusFilter === "inactive" ? "inactive"
        : statusFilter === "active" ? "active"
        : undefined;

      const { items, total: t } = await adminDataService.getUsers({
        search: search || undefined,
        status: statusParam,
        role: roleFilter !== "all" ? roleFilter : undefined,
        page,
        per_page: PER_PAGE,
      });
      setUsers(items);
      setTotal(t);
    } catch (err) {
      toast({ title: "Failed to load users", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, roleFilter, page, toast]);

  useEffect(() => { void fetchUsers(); }, [fetchUsers]);

  // ── Actions ───────────────────────────────

  const handleSuspend = async (reason: string, days: number | undefined) => {
    if (!suspendUser) return;
    setActionLoading(true);
    try {
      await adminDataService.suspendUser(suspendUser.id, reason, days);
      setUsers((prev) =>
        prev.map((u) => u.id === suspendUser.id ? { ...u, isSuspended: true, isActive: false } : u)
      );
      toast({ title: "User suspended", description: `${suspendUser.firstName} has been suspended.` });
      setSuspendUser(null);
    } catch (err) {
      toast({ title: "Suspend failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (user: AdminUserItem) => {
    setActionLoading(true);
    try {
      await adminDataService.unsuspendUser(user.id);
      setUsers((prev) =>
        prev.map((u) => u.id === user.id ? { ...u, isSuspended: false, isActive: true } : u)
      );
      toast({ title: "User unsuspended", description: `${user.firstName} can now access the platform.` });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (user: AdminUserItem) => {
    setActionLoading(true);
    try {
      await adminDataService.verifyUser(user.id);
      setUsers((prev) =>
        prev.map((u) => u.id === user.id ? { ...u, isVerified: true } : u)
      );
      toast({ title: "User verified", description: `${user.firstName} is now verified.` });
    } catch (err) {
      toast({ title: "Verify failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (role: string) => {
    if (!roleUser) return;
    setActionLoading(true);
    try {
      await adminDataService.changeUserRole(roleUser.id, role);
      setUsers((prev) =>
        prev.map((u) => u.id === roleUser.id ? { ...u, role } : u)
      );
      toast({ title: "Role updated", description: `${roleUser.firstName}'s role changed to ${role}.` });
      setRoleUser(null);
    } catch (err) {
      toast({ title: "Role change failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Role", "Status", "Verified", "Joined"];
    const rows = users.map((u) => [
      u.id, u.firstName, u.lastName, u.email, u.phoneNumber || "",
      u.role, u.isSuspended ? "Suspended" : u.isActive ? "Active" : "Inactive",
      u.isVerified ? "Yes" : "No",
      new Date(u.dateCreated).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `users-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Stats ─────────────────────────────────
  const activeCount    = users.filter((u) => u.isActive && !u.isSuspended).length;
  const suspendedCount = users.filter((u) => u.isSuspended).length;
  const verifiedCount  = users.filter((u) => u.isVerified).length;

  const totalPages = Math.ceil(total / PER_PAGE);

  const dashboardStats = [
    { label: "Total", value: total },
    { label: "Active", value: activeCount },
    { label: "Suspended", value: suspendedCount },
    { label: "Verified", value: verifiedCount },
  ];

  return (
    <>
      <SEO
        title="User Management — Campuzon Admin"
        description="Manage campus marketplace users."
        keywords="admin users, user management, campus"
      />

      <AdminPageLayout 
        title="User Management" 
        dashboardStats={dashboardStats}
        isLoading={loading}
        headerActions={
          <>
            <Button variant="outline" size="sm" onClick={() => void fetchUsers()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> 
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </Button>
          </>
        }
      >
        <AdminTable
          title="Users List"
          description={`${total.toLocaleString()} total users`}
          searchPlaceholder="Search by name, email, or phone…"
          onSearch={(v) => { setSearch(v); setPage(1); }}
          filters={[
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: (v) => { setStatusFilter(v); setPage(1); },
              options: [
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "suspended", label: "Suspended" },
              ]
            },
            {
              key: "role",
              label: "Role",
              value: roleFilter,
              onChange: (v) => { setRoleFilter(v); setPage(1); },
              options: [
                { value: "all", label: "All Roles" },
                { value: "buyer", label: "Buyer" },
                { value: "seller", label: "Seller" },
                { value: "buyer_seller", label: "Buyer & Seller" },
              ]
            }
          ]}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows count={8} />
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.profileImage ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm flex items-center gap-1.5">
                            {user.firstName} {user.lastName}
                            {verifiedBadge(user)}
                          </div>
                          <div className="text-xs text-gray-400">{user.id.slice(0, 8)}…</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.phoneNumber || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-xs capitalize">
                        {user.role?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.institution || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(user.dateCreated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{statusBadge(user)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!user.isVerified && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                            title="Verify user"
                            onClick={() => void handleVerify(user)}
                            disabled={actionLoading}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setViewUser(user)}>
                              <Eye className="w-4 h-4 mr-2" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRoleUser(user)}>
                              <UserCog className="w-4 h-4 mr-2" /> Change Role
                            </DropdownMenuItem>
                            {!user.isVerified && (
                              <DropdownMenuItem
                                onClick={() => void handleVerify(user)}
                                className="text-emerald-600"
                              >
                                <ShieldCheck className="w-4 h-4 mr-2" /> Verify User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {user.isSuspended ? (
                              <DropdownMenuItem
                                onClick={() => void handleUnsuspend(user)}
                                className="text-emerald-600"
                              >
                                <ShieldCheck className="w-4 h-4 mr-2" /> Unsuspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setSuspendUser(user)}
                                className="text-red-600"
                              >
                                <ShieldBan className="w-4 h-4 mr-2" /> Suspend
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} · {total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >Previous</Button>
                <Button
                  variant="outline" size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >Next</Button>
              </div>
            </div>
          )}
        </AdminTable>
      </AdminPageLayout>

      {/* Dialogs */}
      <UserDetailDialog user={viewUser} open={!!viewUser} onClose={() => setViewUser(null)} />
      <SuspendDialog
        user={suspendUser} open={!!suspendUser}
        onClose={() => setSuspendUser(null)}
        onConfirm={(reason, days) => void handleSuspend(reason, days)}
        loading={actionLoading}
      />
      <RoleDialog
        user={roleUser} open={!!roleUser}
        onClose={() => setRoleUser(null)}
        onConfirm={(role) => void handleChangeRole(role)}
        loading={actionLoading}
      />
    </>
  );
};

export default AdminUsers;
