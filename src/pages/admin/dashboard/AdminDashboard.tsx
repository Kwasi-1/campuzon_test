import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Users, Store, Package, TrendingUp, Activity,
  AlertTriangle, Lock, GraduationCap, ShoppingBag,
  ArrowUpRight, Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import DateFilter from "@/components/shared/DateFilter";
import { useDateFilter } from "@/contexts/DateFilterContext";
import adminDashboardService, {
  DashboardOverview, RevenueDataPoint, TopStore, CategoryDataPoint, EscrowSummary, PlatformRevenueSummary,
} from "@/services/adminDashboardService";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const currency = (n: number) =>
  `₵${Number(n).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`;

const num = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}K`
    : String(n);

// ──────────────────────────────────────────────
// Reusable stat card
// ──────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon: Icon, iconBg, iconColor, badge, badgeVariant = "secondary",
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              {subtitle}
            </p>
          )}
        </div>
        <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      {badge && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <Badge variant={badgeVariant} className="text-[11px]">{badge}</Badge>
        </div>
      )}
    </CardContent>
  </Card>
);

const StatSkeleton = () => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
    </CardContent>
  </Card>
);

// ──────────────────────────────────────────────
// Custom tooltip for the line chart
// ──────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-gray-600">
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-medium ml-auto pl-3">
            {p.name === "orders" ? p.value : currency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────
const AdminDashboard = () => {
  const { admin } = useAdminAuth();
  const { selectedPeriod } = useDateFilter();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [escrow, setEscrow] = useState<EscrowSummary | null>(null);
  const [platformRevenue, setPlatformRevenue] = useState<PlatformRevenueSummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueDataPoint[]>([]);
  const [topStores, setTopStores] = useState<TopStore[]>([]);
  const [categories, setCategories] = useState<CategoryDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const period = (selectedPeriod?.toLowerCase() ?? "month") as "week" | "month" | "year";
        const [dash, analytics, trend, stores, cats] = await Promise.all([
          adminDashboardService.getDashboard(),
          adminDashboardService.getAnalyticsOverview(),
          adminDashboardService.getRevenueTrend(period),
          adminDashboardService.getTopStores(5),
          adminDashboardService.getCategoryBreakdown(),
        ]);
        setOverview(dash);
        setEscrow(analytics.escrow);
        setPlatformRevenue(analytics.platformRevenue);
        setRevenueTrend(trend);
        setTopStores(stores);
        setCategories(cats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [selectedPeriod]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <SEO
        title="Admin Dashboard — Campuzon"
        description="Campuzon admin dashboard — platform analytics and oversight."
        keywords="campuzon admin, dashboard, analytics"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {greeting()}{admin ? `, ${admin.firstName}` : ""} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
          <DateFilter />
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)
          ) : overview ? (
            <>
              <StatCard
                title="Total Users"
                value={num(overview.totalUsers)}
                subtitle={`+${overview.newUsersWeek} this week`}
                icon={Users}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                badge={`${overview.activeUsers} active`}
              />
              <StatCard
                title="Active Stores"
                value={num(overview.activeStores)}
                subtitle={`+${overview.newStoresMonth} this month`}
                icon={Store}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                badge={
                  overview.pendingStores > 0
                    ? `${overview.pendingStores} pending approval`
                    : undefined
                }
                badgeVariant={overview.pendingStores > 0 ? "destructive" : "secondary"}
              />
              <StatCard
                title="Total Products"
                value={num(overview.totalProducts)}
                icon={Package}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
              />
              <StatCard
                title="GMV (All time)"
                value={currency(overview.totalRevenue)}
                subtitle={`${currency(overview.monthRevenue)} this month`}
                icon={ShoppingBag}
                iconBg="bg-yellow-50"
                iconColor="text-yellow-600"
              />
              <StatCard
                title="Platform Revenue"
                value={currency(platformRevenue?.total ?? 0)}
                subtitle={`${currency(platformRevenue?.last30Days ?? 0)} last 30d`}
                icon={TrendingUp}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
              />
              <StatCard
                title="Escrow Held"
                value={currency(escrow?.totalHeld ?? 0)}
                subtitle="Buyer-protection funds"
                icon={Lock}
                iconBg="bg-orange-50"
                iconColor="text-orange-600"
              />
              <StatCard
                title="Open Disputes"
                value={String(overview.openDisputes)}
                icon={AlertTriangle}
                iconBg="bg-red-50"
                iconColor="text-red-600"
                badge={overview.openDisputes > 0 ? "Needs attention" : "All clear"}
                badgeVariant={overview.openDisputes > 0 ? "destructive" : "secondary"}
              />
              <StatCard
                title="Orders Today"
                value={num(overview.ordersToday)}
                subtitle={`${overview.ordersWeek} this week`}
                icon={Activity}
                iconBg="bg-teal-50"
                iconColor="text-teal-600"
              />
            </>
          ) : null}
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue & Orders trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Revenue & Orders Trend</CardTitle>
              <CardDescription>GMV and order volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full rounded-lg" />
              ) : revenueTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueTrend} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<RevenueTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  No trend data available yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Categories</CardTitle>
              <CardDescription>Distribution by campus category</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center">
                  <Skeleton className="h-48 w-48 rounded-full" />
                </div>
              ) : categories.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      dataKey="value"
                    >
                      {categories.map((c, i) => (
                        <Cell key={i} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No category data yet.
                </div>
              )}
              {/* Legend */}
              <div className="grid grid-cols-2 gap-1 mt-2">
                {categories.slice(0, 6).map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                    {/* eslint-disable-next-line react/forbid-dom-props */}
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                    {c.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Escrow summary + Top stores ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Escrow summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-500" />
                Escrow Holdings
              </CardTitle>
              <CardDescription>Buyer-protection funds status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                </div>
              ) : escrow ? (
                <div className="space-y-3">
                  {[
                    { label: "Currently Held", value: escrow.totalHeld, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Pending Payout", value: escrow.pendingSellerPayouts, color: "text-yellow-600", bg: "bg-yellow-50" },
                    { label: "Released to Sellers", value: escrow.releasedToSellers, color: "text-emerald-600", bg: "bg-emerald-50" },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-lg px-4 py-3 flex justify-between items-center`}>
                      <span className="text-xs font-medium text-gray-600">{label}</span>
                      <span className={`text-sm font-bold ${color}`}>{currency(value)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Top stores */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                Top Campus Stores
              </CardTitle>
              <CardDescription>Highest revenue generating stores this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))
                  : topStores.length > 0
                  ? topStores.map((store, idx) => (
                      <div
                        key={store.id}
                        className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{store.name}</p>
                          {store.institution && (
                            <p className="text-xs text-gray-400 truncate">{store.institution}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-sm text-gray-900">{store.revenue}</p>
                          <p className="text-xs text-gray-400">{store.orders} orders</p>
                        </div>
                      </div>
                    ))
                  : (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      No store data available yet.
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
