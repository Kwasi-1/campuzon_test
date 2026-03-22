import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import {
  Building2, Plus, MoreHorizontal, Pencil, Trash2,
  RefreshCw, Search, Users, Store, ChevronRight,
  ChevronDown, BookOpen,
} from "lucide-react";
import adminInstitutionsService, {
  Institution, InstitutionDetail, Hall,
} from "@/services/adminInstitutionsService";

// ─── Helpers ──────────────────────────────────────────────────

const HALL_TYPE_LABEL: Record<string, string> = {
  male: "Male", female: "Female", mixed: "Mixed",
};

const HALL_TYPE_COLOR: Record<string, string> = {
  male:   "bg-blue-100   text-blue-700",
  female: "bg-pink-100   text-pink-700",
  mixed:  "bg-purple-100 text-purple-700",
};

// ─── Institution Form Dialog ───────────────────────────────────

interface InstitutionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string; shortName: string; region: string; city: string; campus: string;
  }) => void;
  initial?: Partial<Institution>;
  loading: boolean;
  mode: "create" | "edit";
}

const InstitutionFormDialog: React.FC<InstitutionFormDialogProps> = ({
  open, onClose, onSave, initial, loading, mode,
}) => {
  const [form, setForm] = useState({
    name: "", shortName: "", region: "", city: "", campus: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        name:      initial?.name      ?? "",
        shortName: initial?.shortName ?? "",
        region:    initial?.region    ?? "",
        city:      initial?.city      ?? "",
        campus:    (initial as InstitutionDetail | undefined)?.campus ?? "",
      });
    }
  }, [open, initial]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Institution" : "Edit Institution"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new campus institution. Users and stores will be linked to it."
              : "Update institution details."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="inst-name">
                Institution Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="inst-name"
                placeholder="e.g. University of Ghana"
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inst-short">Short Name / Acronym</Label>
              <Input
                id="inst-short"
                placeholder="e.g. UG"
                value={form.shortName}
                onChange={set("shortName")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inst-campus">Campus</Label>
              <Input
                id="inst-campus"
                placeholder="e.g. Legon"
                value={form.campus}
                onChange={set("campus")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inst-city">City</Label>
              <Input
                id="inst-city"
                placeholder="e.g. Accra"
                value={form.city}
                onChange={set("city")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inst-region">Region</Label>
              <Input
                id="inst-region"
                placeholder="e.g. Greater Accra"
                value={form.region}
                onChange={set("region")}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.name.trim() || loading}>
            {loading ? "Saving…" : mode === "create" ? "Create Institution" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Hall Form Dialog ──────────────────────────────────────────

interface HallFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; type: string }) => void;
  initial?: Partial<Hall>;
  loading: boolean;
  mode: "create" | "edit";
  institutionName: string;
}

const HallFormDialog: React.FC<HallFormDialogProps> = ({
  open, onClose, onSave, initial, loading, mode, institutionName,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("mixed");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setType(initial?.type ?? "mixed");
    }
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Hall" : "Edit Hall"}</DialogTitle>
          <DialogDescription>{institutionName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="hall-name">
              Hall Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="hall-name"
              placeholder="e.g. Commonwealth Hall"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hall-type">Hall Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="hall-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={() => onSave({ name, type })} disabled={!name.trim() || loading}>
            {loading ? "Saving…" : mode === "create" ? "Add Hall" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Halls Sub-panel ───────────────────────────────────────────

const HallsPanel: React.FC<{ institution: Institution }> = ({ institution }) => {
  const { toast } = useToast();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editHall, setEditHall] = useState<Hall | null>(null);

  const loadHalls = useCallback(async () => {
    setLoading(true);
    try {
      const { halls: h } = await adminInstitutionsService.getHalls(institution.id);
      setHalls(h);
    } catch (err) {
      toast({ title: "Failed to load halls", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [institution.id, toast]);

  useEffect(() => { void loadHalls(); }, [loadHalls]);

  const handleCreate = async (data: { name: string; type: string }) => {
    setActionLoading(true);
    try {
      const hall = await adminInstitutionsService.createHall(institution.id, {
        name: data.name,
        type: data.type as "male" | "female" | "mixed",
      });
      setHalls((prev) => [...prev, hall]);
      toast({ title: "Hall created" });
      setFormOpen(false);
    } catch (err) {
      toast({ title: "Create failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: { name: string; type: string }) => {
    if (!editHall) return;
    setActionLoading(true);
    try {
      await adminInstitutionsService.updateHall(editHall.id, { name: data.name, type: data.type });
      setHalls((prev) => prev.map((h) => h.id === editHall.id ? { ...h, ...data } : h));
      toast({ title: "Hall updated" });
      setEditHall(null);
    } catch (err) {
      toast({ title: "Update failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (hall: Hall) => {
    setActionLoading(true);
    try {
      await adminInstitutionsService.toggleHallActive(hall.id, !hall.isActive);
      setHalls((prev) => prev.map((h) => h.id === hall.id ? { ...h, isActive: !h.isActive } : h));
    } catch (err) {
      toast({ title: "Toggle failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (hall: Hall) => {
    setActionLoading(true);
    try {
      await adminInstitutionsService.deleteHall(hall.id);
      setHalls((prev) => prev.filter((h) => h.id !== hall.id));
      toast({ title: "Hall removed" });
    } catch (err) {
      toast({ title: "Delete failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/40">
      <div className="px-5 py-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">
          Halls <span className="text-gray-400">({halls.length})</span>
        </p>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setFormOpen(true)}>
          <Plus className="w-3 h-3 mr-1" /> Add Hall
        </Button>
      </div>

      {loading ? (
        <div className="px-5 pb-4 space-y-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : halls.length === 0 ? (
        <p className="px-5 pb-4 text-xs text-gray-400 text-center py-4">
          No halls yet. Add the first one.
        </p>
      ) : (
        <div className="px-5 pb-4 space-y-1.5">
          {halls.map((hall) => (
            <div
              key={hall.id}
              className={`flex items-center gap-3 bg-white rounded-lg px-3 py-2 border ${
                hall.isActive ? "border-gray-100" : "border-gray-200 opacity-60"
              }`}
            >
              <div className="flex-1 flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{hall.name}</span>
                {hall.type && (
                  <Badge className={`${HALL_TYPE_COLOR[hall.type] ?? "bg-gray-100 text-gray-500"} text-xs font-normal`}>
                    {HALL_TYPE_LABEL[hall.type] ?? hall.type}
                  </Badge>
                )}
                {!hall.isActive && (
                  <Badge className="bg-gray-100 text-gray-400 border-gray-200 text-xs">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Switch
                  checked={hall.isActive}
                  onCheckedChange={() => void handleToggle(hall)}
                  disabled={actionLoading}
                  aria-label={`Toggle ${hall.name}`}
                  className="scale-75"
                />
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => setEditHall(hall)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => void handleDelete(hall)}
                  disabled={actionLoading}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <HallFormDialog
        open={formOpen || !!editHall}
        onClose={() => { setFormOpen(false); setEditHall(null); }}
        onSave={editHall ? (d) => void handleUpdate(d) : (d) => void handleCreate(d)}
        initial={editHall ?? undefined}
        loading={actionLoading}
        mode={editHall ? "edit" : "create"}
        institutionName={institution.name}
      />
    </div>
  );
};

// ─── Institution Row ───────────────────────────────────────────

const InstitutionRow: React.FC<{
  institution: Institution;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  actionLoading: boolean;
}> = ({ institution, onEdit, onDelete, onToggle, actionLoading }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden mb-3 transition-all ${
      institution.isActive ? "border-gray-100 bg-white" : "border-gray-200 bg-gray-50/50 opacity-75"
    }`}>
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Icon */}
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{institution.name}</p>
            {institution.shortName && (
              <Badge variant="outline" className="text-xs font-normal">{institution.shortName}</Badge>
            )}
            {!institution.isActive && (
              <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs">Inactive</Badge>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {[institution.city, institution.region].filter(Boolean).join(", ") || "Location not set"}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-5 text-sm">
          <div className="text-center">
            <div className="flex items-center gap-1 text-gray-700 font-semibold">
              <Users className="w-3.5 h-3.5 text-primary" />{institution.userCount}
            </div>
            <p className="text-xs text-gray-400">Users</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-gray-700 font-semibold">
              <Store className="w-3.5 h-3.5 text-emerald-600" />{institution.storeCount}
            </div>
            <p className="text-xs text-gray-400">Stores</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-gray-700 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />{institution.hallCount}
            </div>
            <p className="text-xs text-gray-400">Halls</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={institution.isActive}
            onCheckedChange={onToggle}
            disabled={actionLoading}
            aria-label={`Toggle ${institution.name}`}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => setExpanded((e) => !e)}
            aria-label="Expand halls"
          >
            {expanded
              ? <ChevronDown className="w-4 h-4" />
              : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Halls sub-panel */}
      {expanded && <HallsPanel institution={institution} />}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────

const AdminInstitutions: React.FC = () => {
  const { toast } = useToast();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editInst, setEditInst] = useState<Institution | null>(null);

  // ── Load ──────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items, total: t } = await adminInstitutionsService.getInstitutions({
        search: search || undefined,
        page,
        per_page: PER_PAGE,
      });
      setInstitutions(items);
      setTotal(t);
    } catch (err) {
      toast({ title: "Failed to load institutions", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, page, toast]);

  useEffect(() => { void load(); }, [load]);

  // ── Actions ───────────────────────────────

  const handleCreate = async (data: {
    name: string; shortName: string; region: string; city: string; campus: string;
  }) => {
    setActionLoading(true);
    try {
      const inst = await adminInstitutionsService.createInstitution(data);
      setInstitutions((prev) => [inst, ...prev]);
      setTotal((t) => t + 1);
      toast({ title: "Institution created", description: inst.name });
      setCreateOpen(false);
    } catch (err) {
      toast({ title: "Create failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: {
    name: string; shortName: string; region: string; city: string; campus: string;
  }) => {
    if (!editInst) return;
    setActionLoading(true);
    try {
      await adminInstitutionsService.updateInstitution(editInst.id, data);
      setInstitutions((prev) =>
        prev.map((i) => i.id === editInst.id ? { ...i, ...data } : i)
      );
      toast({ title: "Institution updated" });
      setEditInst(null);
    } catch (err) {
      toast({ title: "Update failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (inst: Institution) => {
    setActionLoading(true);
    try {
      await adminInstitutionsService.deleteInstitution(inst.id);
      setInstitutions((prev) => prev.filter((i) => i.id !== inst.id));
      setTotal((t) => t - 1);
      toast({ title: "Institution removed", description: `${inst.name} deactivated/deleted.` });
    } catch (err) {
      toast({ title: "Delete failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (inst: Institution) => {
    setActionLoading(true);
    try {
      await adminInstitutionsService.toggleInstitutionActive(inst.id, !inst.isActive);
      setInstitutions((prev) =>
        prev.map((i) => i.id === inst.id ? { ...i, isActive: !i.isActive } : i)
      );
    } catch (err) {
      toast({ title: "Toggle failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PER_PAGE);
  const activeCount = institutions.filter((i) => i.isActive).length;
  const totalUsers  = institutions.reduce((s, i) => s + i.userCount, 0);
  const totalStores = institutions.reduce((s, i) => s + i.storeCount, 0);

  return (
    <>
      <SEO
        title="Institutions — Campuzon Admin"
        description="Manage campus institutions and halls."
        keywords="admin institutions, campus halls, Campuzon"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Institutions &amp; Halls
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} campus institutions onboarded</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Institution
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",   value: total,        color: "text-primary",    bg: "bg-primary/5"    },
            { label: "Active",  value: activeCount,  color: "text-emerald-600", bg: "bg-emerald-50"  },
            { label: "Users",   value: totalUsers,   color: "text-blue-600",   bg: "bg-blue-50"      },
            { label: "Stores",  value: totalStores,  color: "text-orange-600", bg: "bg-orange-50"    },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${color}`}>{loading ? "—" : value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search institutions…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Institution cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : institutions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No institutions yet</p>
            <p className="text-sm mt-1">Add your first campus institution to get started.</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Institution
            </Button>
          </div>
        ) : (
          <>
            {institutions.map((inst) => (
              <InstitutionRow
                key={inst.id}
                institution={inst}
                onEdit={() => setEditInst(inst)}
                onDelete={() => void handleDelete(inst)}
                onToggle={() => void handleToggle(inst)}
                actionLoading={actionLoading}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-500">Page {page} of {totalPages} · {total} institutions</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Institution Form Dialogs */}
      <InstitutionFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={(d) => void handleCreate(d)}
        loading={actionLoading}
        mode="create"
      />
      <InstitutionFormDialog
        open={!!editInst}
        onClose={() => setEditInst(null)}
        onSave={(d) => void handleUpdate(d)}
        initial={editInst ?? undefined}
        loading={actionLoading}
        mode="edit"
      />
    </>
  );
};

export default AdminInstitutions;
