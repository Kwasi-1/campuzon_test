import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import SEO from "@/components/SEO";
import storeService, { StoreDashboardStats } from "@/services/storeService";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StorePortalDashboard = () => {
  const { user } = useStoreAuth();
  const [dashboardStats, setDashboardStats] =
    useState<StoreDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const stats = await storeService.getDashboardStats(selectedPeriod);
      setDashboardStats(stats);
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to fetch dashboard stats";
      toast.error(message);
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    void fetchDashboardStats();
  }, [fetchDashboardStats]);

  type StatCardProps = {
    title: string;
    value: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
    trend?: "up" | "down";
    trendValue?: string;
    className?: string;
  };
  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    className = "",
  }: StatCardProps) => (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div
                className={`flex items-center mt-1 text-sm ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                {trendValue}
              </div>
            )}
          </div>
          <div className="p-3 bg-gray-100 rounded-full">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Store Dashboard"
        description="Monitor your store performance, orders, and sales analytics."
        keywords="store dashboard, sales analytics, order management, store performance"
      />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.stallName || user?.name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              aria-label="Select period"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button onClick={fetchDashboardStats} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={dashboardStats?.totalProducts || 0}
            icon={Package}
          />
          <StatCard
            title="Total Orders"
            value={dashboardStats?.totalOrders || 0}
            icon={ShoppingCart}
          />
          <StatCard
            title="Total Revenue"
            value={`₵${dashboardStats?.totalRevenue?.toFixed(2) || "0.00"}`}
            icon={DollarSign}
          />
          <StatCard
            title="Total Customers"
            value={dashboardStats?.totalCustomers || 0}
            icon={Users}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-xl font-bold">
                  ₵{dashboardStats?.averageOrderValue?.toFixed(2) || "0.00"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-xl font-bold text-yellow-600">
                  {dashboardStats?.pendingOrders || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-xl font-bold text-red-600">
                  {dashboardStats?.lowStockProducts || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-xl font-bold">
                  {dashboardStats?.conversionRate?.toFixed(1) || "0.0"}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        {dashboardStats?.revenueChart &&
          dashboardStats.revenueChart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Daily revenue and orders for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardStats.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Revenue (₵)"
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Orders"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Top Selling Products
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats?.topSellingProducts
                  ?.slice(0, 5)
                  .map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.sales} sales
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₵{product.revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )) || (
                  <p className="text-gray-500 text-center py-4">
                    No sales data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Orders
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats?.recentOrders?.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">#{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {order.customerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₵{order.totalAmount.toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          order.status === "delivered" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">
                    No recent orders
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <Package className="w-6 h-6 mb-2" />
                Add Product
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <ShoppingCart className="w-6 h-6 mb-2" />
                View Orders
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <TrendingUp className="w-6 h-6 mb-2" />
                Analytics
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <AlertTriangle className="w-6 h-6 mb-2" />
                Low Stock
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default StorePortalDashboard;
