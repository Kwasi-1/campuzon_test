import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Store, Package,
  ShoppingCart, DollarSign, RefreshCw, Shield,
  BarChart3, Star, Award, AlertCircle, Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import adminAnalyticsService, {
  Period, OverviewData, RevenueData, PlatformRevenueData,
  UserAnalyticsData, OrderAnalyticsData, ProductAnalyticsData,
  StoreAnalyticsData, EscrowHoldingsData,
} from "@/services/adminAnalyticsService";

// ─── Helpers ──────────────────────────────────────────────────

const currency = (n: number) =>
  `₵${Number(n).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const pct = (n: number) => `${Number(n).toFixed(1)}%`;

const PIE_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#14b8a6","#f97316"];

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Last 7 Days", "30d": "Last 30 Days", "90d": "Last 90 Days", "1y": "Last Year",
};

// ─── Period Selector ──────────────────────────────────────────

const PeriodSelector: React.FC<{ value: Period; onChange: (p: Period) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
    {(["7d", "30d", "90d", "1y"] as Period[]).map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          value === p ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {p === "1y" ? "1Y" : p.toUpperCase()}
      </button>
    ))}
  </div>
);

// ─── KPI Card ────────────────────────────────────────────────

const KpiCard: React.FC<{
  title: string;
  value: string;
  sub?: string;
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  loading: boolean;
}> = ({ title, value, sub, trend, icon: Icon, iconBg, iconColor, loading }) => (
  <Card className="border-gray-100 shadow-sm">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          {loading ? <Skeleton className="h-7 w-24 mb-1" /> : (
            <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
          )}
          {sub && !loading && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          {typeof trend === "number" && !loading && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {pct(Math.abs(trend))} vs prev
            </div>
          )}
        </div>
        <div className={`${iconBg} p-2.5 rounded-xl shrink-0 ml-3`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Section header ───────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string; sub?: string;
  right?: React.ReactNode;
}> = ({ icon: Icon, title, sub, right }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary" />
      <div>
        <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
    {right}
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          {/* recharts color is a runtime value — cannot be a static CSS class */}
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-semibold">{
            (typeof p.value === "number" &&
              (p.name.toLowerCase().includes("revenue") ||
               p.name.toLowerCase().includes("fee") ||
               p.name.toLowerCase().includes("amount")))
              ? currency(p.value) : p.value
          }</span>
        </div>
      ))}
    </div>
  );
};

// ─── Top Items List ───────────────────────────────────────────

const TopList: React.FC<{
  items: Array<{ label: string; value: string; sub?: string }>;
  emptyMsg?: string;
}> = ({ items, emptyMsg = "No data" }) => {
  if (!items.length) return (
    <div className="text-center py-8 text-gray-400 text-sm">{emptyMsg}</div>
  );
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-5 text-xs text-gray-400 font-bold text-center shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
            {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
          </div>
          <span className="text-sm font-semibold text-gray-700 shrink-0">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────

const AdminAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("30d");
  const [tab, setTab] = useState("revenue");

  // Data states
  const [overview,       setOverview]        = useState<OverviewData | null>(null);
  const [revenue,        setRevenue]         = useState<RevenueData | null>(null);
  const [platformRev,    setPlatformRev]     = useState<PlatformRevenueData | null>(null);
  const [userAnalytics,  setUserAnalytics]   = useState<UserAnalyticsData | null>(null);
  const [orderAnalytics, setOrderAnalytics]  = useState<OrderAnalyticsData | null>(null);
  const [productData,    setProductData]     = useState<ProductAnalyticsData | null>(null);
  const [storeData,      setStoreData]       = useState<StoreAnalyticsData | null>(null);
  const [escrow,         setEscrow]          = useState<EscrowHoldingsData | null>(null);

  // Loading states
  const [loadingOverview, setLoadingOverview]       = useState(true);
  const [loadingRevenue,  setLoadingRevenue]         = useState(true);
  const [loadingPlatform, setLoadingPlatform]        = useState(false);
  const [loadingUsers,    setLoadingUsers]            = useState(false);
  const [loadingOrders,   setLoadingOrders]           = useState(false);
  const [loadingProducts, setLoadingProducts]         = useState(false);
  const [loadingStores,   setLoadingStores]           = useState(false);
  const [loadingEscrow,   setLoadingEscrow]           = useState(false);

  // ── Overview always loads ─────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingOverview(true);
      try {
        setOverview(await adminAnalyticsService.getOverview());
      } catch (err) {
        toast({ title: "Overview load failed", description: (err as Error).message, variant: "destructive" });
      } finally { setLoadingOverview(false); }
    };
    void load();
  }, [toast]);

  // ── Tab-specific loads, re-fetch when period changes ─────────
  const loadTabData = useCallback(async (t: string, p: Period) => {
    try {
      switch (t) {
        case "revenue": {
          setLoadingRevenue(true);
          const [r, pr] = await Promise.all([
            adminAnalyticsService.getRevenue(p),
            adminAnalyticsService.getPlatformRevenue(p),
          ]);
          setRevenue(r); setPlatformRev(pr);
          setLoadingRevenue(false);
          break;
        }
        case "users": {
          setLoadingUsers(true);
          setUserAnalytics(await adminAnalyticsService.getUserAnalytics(p));
          setLoadingUsers(false);
          break;
        }
        case "orders": {
          setLoadingOrders(true);
          setOrderAnalytics(await adminAnalyticsService.getOrderAnalytics(p));
          setLoadingOrders(false);
          break;
        }
        case "products": {
          setLoadingProducts(true);
          setProductData(await adminAnalyticsService.getProductAnalytics());
          setLoadingProducts(false);
          break;
        }
        case "stores": {
          setLoadingStores(true);
          setStoreData(await adminAnalyticsService.getStoreAnalytics());
          setLoadingStores(false);
          break;
        }
        case "escrow": {
          setLoadingEscrow(true);
          setEscrow(await adminAnalyticsService.getEscrowHoldings(p));
          setLoadingEscrow(false);
          break;
        }
      }
    } catch (err) {
      toast({ title: "Load failed", description: (err as Error).message, variant: "destructive" });
      setLoadingRevenue(false); setLoadingUsers(false); setLoadingOrders(false);
      setLoadingProducts(false); setLoadingStores(false); setLoadingEscrow(false);
    }
  }, [toast]);

  useEffect(() => { void loadTabData(tab, period); }, [tab, period, loadTabData]);

  const handleRefresh = () => {
    void (async () => {
      setLoadingOverview(true);
      try { setOverview(await adminAnalyticsService.getOverview()); }
      catch { /* silent */ } finally { setLoadingOverview(false); }
    })();
    void loadTabData(tab, period);
  };

  // ── Overview KPIs ──────────────────────────
  const ov = overview;
  const kpis = [
    { title: "Total Users",      value: ov ? ov.totals.users.toLocaleString() : "—",            sub: `${ov?.last30Days.newUsers ?? "—"} new (30d)`, icon: Users,       iconBg: "bg-blue-50",    iconColor: "text-blue-600",    trend: undefined },
    { title: "Gross Revenue",    value: ov ? currency(ov.orderRevenue.total) : "—",              sub: `${ov ? currency(ov.orderRevenue.last30Days) : "—"} (30d)`,    icon: DollarSign,  iconBg: "bg-emerald-50", iconColor: "text-emerald-600", trend: undefined },
    { title: "Platform Revenue", value: ov ? currency(ov.platformRevenue.total) : "—",          sub: `${ov ? currency(ov.platformRevenue.last30Days) : "—"} (30d)`,icon: TrendingUp,  iconBg: "bg-violet-50",  iconColor: "text-violet-600",  trend: undefined },
    { title: "Escrow Held",      value: ov ? currency(ov.escrowHoldings.totalHeld) : "—",       sub: `${ov ? currency(ov.escrowHoldings.releasedToSellers) : "—"} released`,icon: Shield, iconBg: "bg-orange-50",  iconColor: "text-orange-600",  trend: undefined },
    { title: "Active Stores",    value: ov ? ov.totals.stores.toLocaleString() : "—",           sub: undefined,       icon: Store,       iconBg: "bg-pink-50",    iconColor: "text-pink-600",    trend: undefined },
    { title: "Total Orders",     value: ov ? ov.totals.orders.toLocaleString() : "—",           sub: `${ov?.last30Days.newOrders ?? "—"} (30d)`,       icon: ShoppingCart,iconBg: "bg-cyan-50",    iconColor: "text-cyan-600",    trend: undefined },
    { title: "Active Products",  value: ov ? ov.totals.products.toLocaleString() : "—",         sub: undefined,       icon: Package,     iconBg: "bg-amber-50",   iconColor: "text-amber-600",   trend: undefined },
  ];

  // ── Status donut data builder ──────────────
  const donutData = (map: Record<string, number>) =>
    Object.entries(map).map(([name, value]) => ({ name, value }));

  return (
    <>
      <SEO
        title="Analytics — Campuzon Admin"
        description="Platform-wide analytics for Campuzon."
        keywords="admin analytics, revenue, orders, campus marketplace"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Analytics
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Platform-wide insights &amp; reporting</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <KpiCard key={k.title} {...k} loading={loadingOverview} />
          ))}
        </div>

        {/* Tabbed deep-dives */}
        <Tabs value={tab} onValueChange={(t) => { setTab(t); }} className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="stores">Stores</TabsTrigger>
              <TabsTrigger value="escrow">Escrow</TabsTrigger>
            </TabsList>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>

          {/* ── REVENUE TAB ── */}
          <TabsContent value="revenue" className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Gross Revenue",     val: revenue ? currency(revenue.summary.totalRevenue)     : "—", color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Service Fees",       val: revenue ? currency(revenue.summary.totalServiceFees) : "—", color: "text-violet-600",  bg: "bg-violet-50"  },
                { label: "Orders",             val: revenue ? revenue.summary.totalOrders.toLocaleString() : "—", color: "text-blue-600",  bg: "bg-blue-50"   },
                { label: "Avg Order Value",    val: revenue ? currency(revenue.summary.averageOrderValue) : "—", color: "text-orange-600", bg: "bg-orange-50" },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  {loadingRevenue ? <Skeleton className="h-6 w-20" /> : (
                    <p className={`text-xl font-bold ${color}`}>{val}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Order Revenue Chart */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-2">
                <SectionHeader icon={TrendingUp} title="Order Revenue" sub={PERIOD_LABELS[period]} />
              </CardHeader>
              <CardContent>
                {loadingRevenue ? <Skeleton className="h-56 w-full" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={revenue?.chart ?? []}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₵${v.toLocaleString()}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="serviceFees" name="Service Fees" stroke="#22c55e" fill="url(#feeGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Platform Revenue breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                  <SectionHeader icon={DollarSign} title="Platform Revenue" sub="Fees the platform keeps" />
                </CardHeader>
                <CardContent>
                  {loadingRevenue || !platformRev ? <Skeleton className="h-44 w-full" /> : (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-violet-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-400">Transaction Fees</p>
                          <p className="text-lg font-bold text-violet-700">{currency(platformRev.summary.transactionFees.total)}</p>
                          <p className="text-xs text-gray-400">{platformRev.summary.transactionFees.transactionCount} txns</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-400">Subscriptions</p>
                          <p className="text-lg font-bold text-emerald-700">{currency(platformRev.summary.subscriptions.total)}</p>
                          <p className="text-xs text-gray-400">{platformRev.summary.subscriptions.subscriptionCount} stores</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={platformRev.chart.slice(-14)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₵${v}`} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="transactionFees" name="Transaction Fees" fill="#8b5cf6" radius={[3,3,0,0]} />
                          <Bar dataKey="subscriptions" name="Subscriptions" fill="#22c55e" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                  <SectionHeader icon={Award} title="Top Stores by Revenue" sub={PERIOD_LABELS[period]} />
                </CardHeader>
                <CardContent>
                  {loadingRevenue || !platformRev ? <Skeleton className="h-44 w-full" /> : (
                    <TopList
                      items={platformRev.topStores.map((s) => ({ label: s.storeName, value: currency(s.revenue) }))}
                      emptyMsg="No store revenue data"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── USERS TAB ── */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(loadingUsers || !userAnalytics) ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : [
                { label: "Total Users",        val: userAnalytics.stats.total.toLocaleString(), color: "text-blue-600",    bg: "bg-blue-50"    },
                { label: "Verified",           val: `${pct(userAnalytics.stats.verificationRate)} (${userAnalytics.stats.verified.toLocaleString()})`, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Active (30d)",       val: userAnalytics.stats.activeUsers.toLocaleString(), color: "text-violet-600", bg: "bg-violet-50" },
                { label: "With Stores",        val: userAnalytics.stats.usersWithStores.toLocaleString(), color: "text-orange-600", bg: "bg-orange-50" },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{val}</p>
                </div>
              ))}
            </div>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-2">
                <SectionHeader icon={Users} title="User Growth" sub={PERIOD_LABELS[period]} />
              </CardHeader>
              <CardContent>
                {loadingUsers ? <Skeleton className="h-56 w-full" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={userAnalytics?.growth ?? []}>
                      <defs>
                        <linearGradient id="usrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="count" name="New Users" stroke="#6366f1" fill="url(#usrGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ORDERS TAB ── */}
          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(loadingOrders || !orderAnalytics) ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : [
                { label: "Total Orders",     val: orderAnalytics.metrics.total.toLocaleString(),          color: "text-blue-600",    bg: "bg-blue-50"    },
                { label: "Completion Rate",  val: pct(orderAnalytics.metrics.completionRate),              color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Cancellation",     val: pct(orderAnalytics.metrics.cancellationRate),            color: "text-red-600",     bg: "bg-red-50"     },
                { label: "Avg Fulfillment",  val: `${orderAnalytics.metrics.avgFulfillmentDays}d`,         color: "text-orange-600",  bg: "bg-orange-50"  },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card className="border-gray-100 shadow-sm h-full">
                  <CardHeader className="pb-2">
                    <SectionHeader icon={ShoppingCart} title="Order Trend" sub={PERIOD_LABELS[period]} />
                  </CardHeader>
                  <CardContent>
                    {loadingOrders ? <Skeleton className="h-52 w-full" /> : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={orderAnalytics?.trend ?? []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="count" name="Orders" fill="#6366f1" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                  <SectionHeader icon={BarChart3} title="By Status" />
                </CardHeader>
                <CardContent>
                  {loadingOrders || !orderAnalytics ? <Skeleton className="h-44 w-full" /> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={donutData(orderAnalytics.byStatus)} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" nameKey="name">
                          {donutData(orderAnalytics.byStatus).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [v, ""]} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── PRODUCTS TAB ── */}
          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(loadingProducts || !productData) ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : [
                { label: "Avg Price",     val: currency(productData.metrics.avgPrice),    color: "text-blue-600",    bg: "bg-blue-50"    },
                { label: "Avg Rating",    val: `${productData.metrics.avgRating}★`,        color: "text-amber-600",   bg: "bg-amber-50"   },
                { label: "Low Stock",     val: productData.metrics.lowStockCount.toString(), color: "text-red-600",   bg: "bg-red-50"     },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2"><SectionHeader icon={Award} title="Top Selling Products" /></CardHeader>
                <CardContent>
                  {loadingProducts || !productData ? <Skeleton className="h-44" /> : (
                    <TopList items={productData.topProducts.map((p) => ({
                      label: p.name, value: p.totalSold.toLocaleString() + " sold", sub: currency(p.revenue),
                    }))} />
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2"><SectionHeader icon={BarChart3} title="By Category" /></CardHeader>
                <CardContent>
                  {loadingProducts || !productData ? <Skeleton className="h-44" /> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={productData.byCategory} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={70} />
                        <Tooltip />
                        <Bar dataKey="count" name="Products" fill="#6366f1" radius={[0,3,3,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── STORES TAB ── */}
          <TabsContent value="stores" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(loadingStores || !storeData) ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : [
                { label: "Active Stores",      val: storeData.metrics.totalActive.toLocaleString(), color: "text-blue-600",    bg: "bg-blue-50"    },
                { label: "Verified",           val: `${pct(storeData.metrics.verificationRate)} (${storeData.metrics.verified})`, color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2"><SectionHeader icon={TrendingUp} title="Top Stores by Revenue" /></CardHeader>
                <CardContent>
                  {loadingStores || !storeData ? <Skeleton className="h-52" /> : (
                    <TopList items={storeData.topByRevenue.map((s) => ({
                      label: s.name, value: currency(s.revenue), sub: `${s.orderCount} orders`,
                    }))} />
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2"><SectionHeader icon={Star} title="Top Rated Stores" /></CardHeader>
                <CardContent>
                  {loadingStores || !storeData ? <Skeleton className="h-52" /> : (
                    <TopList items={storeData.topByRating.map((s) => ({
                      label: s.name, value: `${s.rating.toFixed(1)} ★`, sub: `${s.reviewCount} reviews`,
                    }))} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── ESCROW TAB ── */}
          <TabsContent value="escrow" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(loadingEscrow || !escrow) ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : [
                { label: "Currently Held",    val: currency(escrow.summary.currentlyHeld.totalAmount),    color: "text-orange-600", bg: "bg-orange-50" },
                { label: "For Sellers",       val: currency(escrow.summary.currentlyHeld.forSellers),     color: "text-blue-600",   bg: "bg-blue-50"   },
                { label: "Released",          val: currency(escrow.summary.released.totalAmount),          color: "text-emerald-600",bg: "bg-emerald-50"},
                { label: "Refunded",          val: currency(escrow.summary.refunded.totalAmount),          color: "text-red-600",    bg: "bg-red-50"   },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{val}</p>
                </div>
              ))}
            </div>

            {escrow && escrow.summary.upcomingReleases.count > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>{escrow.summary.upcomingReleases.count}</strong> escrow release{escrow.summary.upcomingReleases.count !== 1 ? "s" : ""} due within 6 hours —{" "}
                  <strong>{currency(escrow.summary.upcomingReleases.amount)}</strong> to be released to sellers.
                </p>
              </div>
            )}

            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-2">
                <SectionHeader icon={Shield} title="Recent Releases to Sellers" sub={PERIOD_LABELS[period]} />
              </CardHeader>
              <CardContent>
                {loadingEscrow ? <Skeleton className="h-52 w-full" /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={escrow?.recentReleases ?? []}>
                      <defs>
                        <linearGradient id="escGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₵${v.toLocaleString()}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="releasedToSellers" name="Released Amount" stroke="#22c55e" fill="url(#escGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminAnalytics;
