import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Store,
  Package,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";
import DateFilter from "@/components/shared/DateFilter";
import { useDateFilter } from "@/contexts/DateFilterContext";
import adminDashboardService from "@/services/adminDashboardService";

type StatItem = {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change: string;
  color: string;
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const {
    selectedPeriod,
    isFiltered,
    isLoading: dateLoading,
  } = useDateFilter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const basic = await adminDashboardService.getStats();

        const statsData: StatItem[] = [
          {
            title: "Total Users",
            value: String(basic.totalUsers),
            icon: Users,
            change: "",
            color: "text-blue-600",
          },
          {
            title: "Active Stores",
            value: String(basic.totalStalls),
            icon: Store,
            change: "",
            color: "text-green-600",
          },
          {
            title: "Total Products",
            value: String(basic.totalProducts),
            icon: Package,
            change: "",
            color: "text-purple-600",
          },
          {
            title: "Revenue",
            value:
              basic.totalRevenue != null
                ? `₵${Number(basic.totalRevenue).toLocaleString()}`
                : "—",
            icon: DollarSign,
            change: "",
            color: "text-yellow-600",
          },
          {
            title: "Pending Approvals",
            value: String(basic.pendingApprovals),
            icon: TrendingUp,
            change: "",
            color: "text-red-600",
          },
          {
            title: "Active Orders",
            value: String(basic.activeOrders),
            icon: Activity,
            change: "",
            color: "text-indigo-600",
          },
        ];

        // Fetch analytics data
        const [revenueChartData, categoryChartData, topStoresData] =
          await Promise.all([
            adminDashboardService.getRevenueAnalytics(
              selectedPeriod?.toLowerCase() as "week" | "month" | "year"
            ),
            adminDashboardService.getCategoryAnalytics(),
            adminDashboardService.getTopStores(5),
          ]);

        setStats(statsData);
        setRevenueData(revenueChartData);
        setCategoryData(categoryChartData);
        setTopStores(topStoresData);
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboardData();
  }, [selectedPeriod]); // Refetch when date filter changes

  return (
    <>
      <SEO
        title="Admin Dashboard"
        description="Administrative dashboard for Tobra platform management, analytics, and oversight."
        keywords="admin dashboard, platform analytics, business management, Tobra admin"
      />

      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-display tracking-wider font-bold">
              Admin Dashboard
            </h1>
            <div className="text-sm mt-2 text-gray-600">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
          <DateFilter />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading || dateLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="w-8 h-8 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm text-green-600">
                            {stat.change}
                          </p>
                        </div>
                        <Icon className={`w-8 h-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue & Orders Trend</CardTitle>
              <CardDescription>Monthly performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || dateLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || dateLoading ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Skeleton className="h-40 w-40 rounded-full" />
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Stores */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Stores</CardTitle>
            <CardDescription>
              Highest revenue generating stores this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading || dateLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))
                : topStores.map((store, index) => (
                    <div
                      key={store.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-gray-600">
                            {store.orders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{store.revenue}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;
