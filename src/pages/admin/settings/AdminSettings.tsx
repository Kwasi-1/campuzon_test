import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Settings, DollarSign, Image, Tag, Plus, Pencil, Trash2,
  RefreshCw, Save, ToggleRight, ToggleLeft, AlertTriangle,
  CheckCircle2, Percent, Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { api, extractData } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────

interface PlatformFee {
  id: string;
  name: string;
  type: string; // buyer_fee | seller_commission | subscription
  percentage: number;
  minAmount?: number | null;
  maxAmount?: number | null;
  isActive: boolean;
  description?: string | null;
  updatedAt?: string | null;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position: string; // home | products | stores | checkout
  sortOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

interface PromoCode {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number | null;
  maxUsage?: number | null;
  usageCount: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

interface SystemSetting {
  key: string;
  value: string;
  description?: string;
}

// ─── Helpers ──────────────────────────────────────────────────

const currency = (n: number) => `₵${Number(n).toFixed(2)}`;

const FEE_TYPE_LABEL: Record<string, string> = {
  buyer_fee: "Buyer Fee", seller_commission: "Seller Commission", subscription: "Subscription",
};

const POSITION_LABEL: Record<string, string> = {
  home: "Home", products: "Products", stores: "Stores", checkout: "Checkout",
};

// ─── Platform Fees Tab ────────────────────────────────────────

const PlatformFeesTab: React.FC = () => {
  const { toast } = useToast();
  const [fees, setFees] = useState<PlatformFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editFee, setEditFee] = useState<PlatformFee | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/settings/fees");
      const d = extractData<{ fees: PlatformFee[] }>(res);
      setFees(d.fees ?? []);
    } catch {
      // Fallback — show placeholder fees if settings endpoint not yet wired
      setFees([
        { id: "1", name: "Buyer Platform Fee", type: "buyer_fee", percentage: 5, isActive: true, description: "Fee charged to buyers on each order" },
        { id: "2", name: "Seller Commission", type: "seller_commission", percentage: 5, isActive: true, description: "Commission deducted from seller earnings" },
        { id: "3", name: "Store Subscription", type: "subscription", percentage: 0, minAmount: 20, isActive: true, description: "Monthly store subscription fee" },
      ]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleSave = async () => {
    if (!editFee) return;
    setSaving(true);
    try {
      await api.put(`admin/settings/fees/${editFee.id}`, {
        percentage: editFee.percentage,
        minAmount: editFee.minAmount,
        maxAmount: editFee.maxAmount,
        isActive: editFee.isActive,
      });
      setFees((prev) => prev.map((f) => f.id === editFee.id ? editFee : f));
      toast({ title: "Fee updated" });
      setEditFee(null);
    } catch (err) {
      toast({ title: "Save failed", description: (err as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-primary" /> Platform Fees
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Configure buyer fees, seller commissions, and subscription prices.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {fees.map((fee) => (
            <div key={fee.id} className={`rounded-xl border p-4 ${fee.isActive ? "border-gray-100 bg-white" : "border-gray-200 bg-gray-50/50 opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{fee.name}</span>
                    <Badge className="text-xs bg-primary/10 text-primary border-0">{FEE_TYPE_LABEL[fee.type] ?? fee.type}</Badge>
                    {!fee.isActive && <Badge className="text-xs bg-gray-100 text-gray-400">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-gray-400">{fee.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-gray-900">
                    {fee.percentage > 0 ? `${fee.percentage}%` : fee.minAmount ? currency(fee.minAmount) : "—"}
                  </p>
                  {fee.minAmount && fee.percentage > 0 && (
                    <p className="text-xs text-gray-400">Min: {currency(fee.minAmount)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditFee(fee)}>
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Fee Dialog ── */}
      <Dialog open={!!editFee} onOpenChange={(o) => !o && setEditFee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee — {editFee?.name}</DialogTitle>
            <DialogDescription>{editFee?.description}</DialogDescription>
          </DialogHeader>
          {editFee && (
            <div className="space-y-5 py-2">
              {editFee.percentage !== undefined && editFee.type !== "subscription" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Percentage</Label>
                    <span className="text-2xl font-bold text-primary">{editFee.percentage}%</span>
                  </div>
                  <Slider
                    value={[editFee.percentage]}
                    onValueChange={([v]) => setEditFee((f) => f ? { ...f, percentage: v } : f)}
                    min={0} max={20} step={0.5}
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span><span>10%</span><span>20%</span>
                  </div>
                </div>
              )}
              {editFee.type === "subscription" && (
                <div className="space-y-1.5">
                  <Label>Monthly Fee (₵)</Label>
                  <Input
                    type="number" min={0}
                    value={editFee.minAmount ?? ""}
                    onChange={(e) => setEditFee((f) => f ? { ...f, minAmount: parseFloat(e.target.value) || 0 } : f)}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Min Order Amount (₵)</Label>
                  <Input
                    type="number" min={0}
                    value={editFee.minAmount ?? ""}
                    onChange={(e) => setEditFee((f) => f ? { ...f, minAmount: parseFloat(e.target.value) || null } : f)}
                    placeholder="No minimum"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Max Fee Cap (₵)</Label>
                  <Input
                    type="number" min={0}
                    value={editFee.maxAmount ?? ""}
                    onChange={(e) => setEditFee((f) => f ? { ...f, maxAmount: parseFloat(e.target.value) || null } : f)}
                    placeholder="No cap"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <Label>Fee Active</Label>
                <Switch
                  checked={editFee.isActive}
                  onCheckedChange={(v) => setEditFee((f) => f ? { ...f, isActive: v } : f)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFee(null)}>Cancel</Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Banners Tab ──────────────────────────────────────────────

const defaultBannerForm = (): Partial<Banner> => ({
  title: "", subtitle: "", imageUrl: "", linkUrl: "",
  position: "home", sortOrder: 0, isActive: true,
  startDate: "", endDate: "",
});

const BannersTab: React.FC = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState<Partial<Banner>>(defaultBannerForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/settings/banners");
      const d = extractData<{ banners: Banner[] }>(res);
      setBanners(d.banners ?? []);
    } catch { setBanners([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => { setForm(defaultBannerForm()); setEditBanner(null); setFormOpen(true); };
  const openEdit = (b: Banner) => { setForm(b); setEditBanner(b); setFormOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editBanner) {
        await api.put(`admin/settings/banners/${editBanner.id}`, form);
        setBanners((prev) => prev.map((b) => b.id === editBanner.id ? { ...b, ...form } as Banner : b));
        toast({ title: "Banner updated" });
      } else {
        const res = await api.post("admin/settings/banners", form);
        const d = extractData<{ banner: Banner }>(res);
        setBanners((prev) => [...prev, d.banner]);
        toast({ title: "Banner created" });
      }
      setFormOpen(false);
    } catch (err) {
      toast({ title: "Save failed", description: (err as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (b: Banner) => {
    try {
      await api.delete(`admin/settings/banners/${b.id}`);
      setBanners((prev) => prev.filter((x) => x.id !== b.id));
      toast({ title: "Banner deleted" });
    } catch (err) {
      toast({ title: "Delete failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleToggle = async (b: Banner) => {
    try {
      await api.put(`admin/settings/banners/${b.id}`, { isActive: !b.isActive });
      setBanners((prev) => prev.map((x) => x.id === b.id ? { ...x, isActive: !x.isActive } : x));
    } catch (err) {
      toast({ title: "Toggle failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const setField = <K extends keyof Banner>(k: K, v: Banner[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
            <Image className="w-4 h-4 text-primary" /> Promotional Banners
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage homepage and page banners.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1.5" /> Add Banner</Button>
      </div>

      {loading ? <Skeleton className="h-32 w-full rounded-xl" /> : banners.length === 0 ? (
        <div className="text-center py-12 text-gray-400 rounded-xl border border-dashed border-gray-200">
          <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No banners yet. Add your first promotional banner.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead>Title</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b) => (
                <TableRow key={b.id} className={b.isActive ? "" : "opacity-50"}>
                  <TableCell>
                    <p className="font-medium text-sm">{b.title}</p>
                    {b.subtitle && <p className="text-xs text-gray-400">{b.subtitle}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{POSITION_LABEL[b.position] ?? b.position}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{b.sortOrder}</TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {b.startDate ? new Date(b.startDate).toLocaleDateString() : "—"} →{" "}
                    {b.endDate ? new Date(b.endDate).toLocaleDateString() : "∞"}
                  </TableCell>
                  <TableCell>
                    <Switch checked={b.isActive} onCheckedChange={() => void handleToggle(b)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => void handleDelete(b)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Banner Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editBanner ? "Edit Banner" : "New Banner"}</DialogTitle>
            <DialogDescription>Promotional banner shown on the storefront.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Title *</Label>
                <Input value={form.title ?? ""} onChange={(e) => setField("title", e.target.value)} placeholder="Shop New Arrivals" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Subtitle</Label>
                <Input value={form.subtitle ?? ""} onChange={(e) => setField("subtitle", e.target.value)} placeholder="Up to 30% off on selected items" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Image URL *</Label>
                <Input value={form.imageUrl ?? ""} onChange={(e) => setField("imageUrl", e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label>Link URL</Label>
                <Input value={form.linkUrl ?? ""} onChange={(e) => setField("linkUrl", e.target.value)} placeholder="/products?category=..." />
              </div>
              <div className="space-y-1.5">
                <Label>Position</Label>
                <Select value={form.position ?? "home"} onValueChange={(v) => setField("position", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(POSITION_LABEL).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate ?? ""} onChange={(e) => setField("startDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate ?? ""} onChange={(e) => setField("endDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" min={0} value={form.sortOrder ?? 0} onChange={(e) => setField("sortOrder", parseInt(e.target.value) || 0)} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <Label>Active</Label>
                <Switch checked={form.isActive ?? true} onCheckedChange={(v) => setField("isActive", v)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={() => void handleSave()} disabled={!form.title?.trim() || !form.imageUrl?.trim() || saving}>
              {saving ? "Saving…" : editBanner ? "Update Banner" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Promo Codes Tab ─────────────────────────────────────────

const defaultPromoForm = (): Partial<PromoCode> => ({
  code: "", discountType: "percentage", discountValue: 10,
  minOrderAmount: null, maxUsage: null, isActive: true,
  startDate: "", endDate: "", description: "",
});

const PromoCodesTab: React.FC = () => {
  const { toast } = useToast();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Partial<PromoCode>>(defaultPromoForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/settings/promo-codes");
      const d = extractData<{ promoCodes: PromoCode[] }>(res);
      setPromos(d.promoCodes ?? []);
    } catch { setPromos([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await api.post("admin/settings/promo-codes", form);
      const d = extractData<{ promoCode: PromoCode }>(res);
      setPromos((prev) => [d.promoCode, ...prev]);
      toast({ title: "Promo code created" });
      setFormOpen(false);
    } catch (err) { toast({ title: "Create failed", description: (err as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleToggle = async (p: PromoCode) => {
    try {
      await api.put(`admin/settings/promo-codes/${p.id}`, { isActive: !p.isActive });
      setPromos((prev) => prev.map((x) => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
    } catch (err) { toast({ title: "Toggle failed", description: (err as Error).message, variant: "destructive" }); }
  };

  const handleDelete = async (p: PromoCode) => {
    try {
      await api.delete(`admin/settings/promo-codes/${p.id}`);
      setPromos((prev) => prev.filter((x) => x.id !== p.id));
      toast({ title: "Promo code deleted" });
    } catch (err) { toast({ title: "Delete failed", description: (err as Error).message, variant: "destructive" }); }
  };

  const setField = <K extends keyof PromoCode>(k: K, v: PromoCode[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isExpired = (p: PromoCode) => p.endDate ? new Date(p.endDate) < new Date() : false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
            <Tag className="w-4 h-4 text-primary" /> Promo Codes
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Create discount codes for buyers.</p>
        </div>
        <Button size="sm" onClick={() => { setForm(defaultPromoForm()); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Code
        </Button>
      </div>

      {loading ? <Skeleton className="h-32 w-full rounded-xl" /> : promos.length === 0 ? (
        <div className="text-center py-12 text-gray-400 rounded-xl border border-dashed border-gray-200">
          <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No promo codes yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {promos.map((p) => {
            const expired = isExpired(p);
            return (
              <div key={p.id} className={`rounded-xl border p-4 ${p.isActive && !expired ? "border-gray-100 bg-white" : "border-gray-200 bg-gray-50/40 opacity-60"}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Code */}
                  <div className="font-mono font-bold text-primary text-lg bg-primary/10 px-3 py-1 rounded-lg">{p.code}</div>

                  {/* Discount */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                        <Percent className="w-2.5 h-2.5 mr-0.5" />
                        {p.discountType === "percentage" ? `${p.discountValue}% off` : `₵${p.discountValue} off`}
                      </Badge>
                      {p.minOrderAmount && (
                        <span className="text-xs text-gray-400">Min: {currency(p.minOrderAmount)}</span>
                      )}
                      {expired && <Badge className="bg-red-100 text-red-500 border-0 text-xs">Expired</Badge>}
                      {!p.isActive && <Badge className="bg-gray-100 text-gray-400 border-0 text-xs">Inactive</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span>Used {p.usageCount}{p.maxUsage ? `/${p.maxUsage}` : ""} times</span>
                      {p.endDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Expires {new Date(p.endDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={p.isActive} onCheckedChange={() => void handleToggle(p)} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => void handleDelete(p)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Promo Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Promo Code</DialogTitle>
            <DialogDescription>Create a discount code for buyers to use at checkout.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Code *</Label>
                <Input
                  className="font-mono uppercase"
                  value={form.code ?? ""}
                  onChange={(e) => setField("code", e.target.value.toUpperCase())}
                  placeholder="WELCOME20"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Discount Type</Label>
                <Select value={form.discountType ?? "percentage"} onValueChange={(v) => setField("discountType", v as "percentage" | "fixed")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₵)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{form.discountType === "percentage" ? "Discount %" : "Discount Amount (₵)"}</Label>
                <Input
                  type="number" min={0} max={form.discountType === "percentage" ? 100 : undefined}
                  value={form.discountValue ?? ""}
                  onChange={(e) => setField("discountValue", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Min Order Amount (₵)</Label>
                <Input
                  type="number" min={0}
                  value={form.minOrderAmount ?? ""}
                  onChange={(e) => setField("minOrderAmount", parseFloat(e.target.value) || null)}
                  placeholder="No minimum"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max Usage</Label>
                <Input
                  type="number" min={1}
                  value={form.maxUsage ?? ""}
                  onChange={(e) => setField("maxUsage", parseInt(e.target.value) || null)}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate ?? ""} onChange={(e) => setField("startDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate ?? ""} onChange={(e) => setField("endDate", e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description ?? ""} onChange={(e) => setField("description", e.target.value)} rows={2} placeholder="Internal notes…" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={() => void handleCreate()} disabled={!form.code?.trim() || saving}>
              {saving ? "Creating…" : "Create Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── System Settings Tab ──────────────────────────────────────

const SystemTab: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const BOOL_KEYS = ["maintenance_mode", "allow_registration", "require_store_approval", "enable_escrow"];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("admin/settings/system");
        const d = extractData<{ settings: SystemSetting[] }>(res);
        setSettings(d.settings ?? []);
      } catch {
        setSettings([
          { key: "maintenance_mode",       value: "false", description: "Put the platform in maintenance mode" },
          { key: "allow_registration",     value: "true",  description: "Allow new user registrations" },
          { key: "require_store_approval", value: "true",  description: "Require admin approval for new stores" },
          { key: "enable_escrow",          value: "true",  description: "Enable buyer-protection escrow" },
        ]);
      } finally { setLoading(false); }
    };
    void load();
  }, []);

  const handleToggle = async (key: string, currentVal: string) => {
    const newVal = currentVal === "true" ? "false" : "true";
    setSaving(key);
    try {
      await api.put(`admin/settings/system/${key}`, { value: newVal });
      setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value: newVal } : s));
    } catch (err) { toast({ title: "Save failed", description: (err as Error).message, variant: "destructive" }); }
    finally { setSaving(null); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
          <Settings className="w-4 h-4 text-primary" /> System Settings
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Feature flags and platform configuration.</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {settings.map((s) => {
            const isBool = BOOL_KEYS.includes(s.key);
            const isOn = s.value === "true";
            return (
              <div key={s.key} className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3 ${
                isBool && s.key === "maintenance_mode" && isOn ? "border-red-200 bg-red-50" : "border-gray-100 bg-white"
              }`}>
                <div>
                  <p className="font-medium text-sm text-gray-900 capitalize">{s.key.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-400">{s.description}</p>
                </div>
                {isBool ? (
                  <Switch
                    checked={isOn}
                    onCheckedChange={() => void handleToggle(s.key, s.value)}
                    disabled={saving === s.key}
                  />
                ) : (
                  <Input className="w-40 text-sm" value={s.value} readOnly />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Settings Page ────────────────────────────────────────

const AdminSettingsPage: React.FC = () => (
  <>
    <SEO
      title="Settings — Campuzon Admin"
      description="Configure platform fees, banners, promo codes, and system settings."
      keywords="admin settings, platform fees, banners, promo codes"
    />
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" /> Platform Settings
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage fees, banners, promo codes, and system configuration.</p>
      </div>

      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="fees"><DollarSign className="w-3.5 h-3.5 mr-1.5" />Fees</TabsTrigger>
          <TabsTrigger value="banners"><Image className="w-3.5 h-3.5 mr-1.5" />Banners</TabsTrigger>
          <TabsTrigger value="promos"><Tag className="w-3.5 h-3.5 mr-1.5" />Promo Codes</TabsTrigger>
          <TabsTrigger value="system"><Settings className="w-3.5 h-3.5 mr-1.5" />System</TabsTrigger>
        </TabsList>

        <TabsContent value="fees">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="pt-5"><PlatformFeesTab /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="pt-5"><BannersTab /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promos">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="pt-5"><PromoCodesTab /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="pt-5"><SystemTab /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </>
);

export default AdminSettingsPage;
