import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Users,
  Calendar,
  Search,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/shared/Skeleton";
import { AddProductModal, WithdrawFundsModal } from "@/components/modals";
import { useAuthStore } from "@/stores";
import {
  useSellerMyStore,
  useSellerStoreOrders,
  useSellerStoreProducts,
  useSellerWallet,
} from "@/hooks/useSellerPortal";
import { useConversations } from "@/hooks/useChat";
import { formatPrice } from "@/lib/utils";
import { SellerPageTemplate } from "../../components/SellerPageTemplate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for dashboard
const mockStats = {
  salesChange: 0,
  ordersChange: 0,
  productsChange: 0,
  customersChange: 0,
};

const statusConfig = {
  pending: {
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

export function SellerDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: store, isLoading: storeLoading } = useSellerMyStore();
  const { data: orders, isLoading: ordersLoading } = useSellerStoreOrders(
    store?.id || "",
  );
  const { data: products, isLoading: productsLoading } = useSellerStoreProducts(
    store?.id || "",
  );
  const { data: wallet, isLoading: walletLoading } = useSellerWallet();
  const { data: conversations = [] } = useConversations(
    Boolean(isAuthenticated && user?.isOwner),
  );

  const activeModal = searchParams.get("modal");
  const isAddProductOpen = activeModal === "add-product";
  const isWithdrawOpen = activeModal === "withdraw-funds";

  const openModal = (modal: "add-product" | "withdraw-funds") => {
    const next = new URLSearchParams(searchParams);
    next.set("modal", modal);
    setSearchParams(next);
  };

  const closeModal = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("modal");
    setSearchParams(next);
  };

  const goToOrders = () => navigate("/seller/orders");
  const goToProducts = () => navigate("/seller/products");
  const goToMessages = () => navigate("/seller/messages");

  const openOrderDetails = (orderId: string) => {
    navigate(`/seller/orders/${orderId}`);
  };

  // Redirect if not authenticated or not a store owner
  if (!isAuthenticated || !user) {
    navigate("/login", { state: { from: "/seller/dashboard" } });
    return null;
  }

  if (!user.isOwner) {
    navigate("/");
    return null;
  }

  const stats = {
    totalSales: wallet?.balance || 0,
    pendingSales: wallet?.pendingBalance || 0,
    totalOrders: orders?.length || 0,
    totalProducts: products?.length || 0,
    totalCustomers: new Set(orders?.map((o) => o.userID)).size || 0,
  };

  const recentOrders = orders?.slice(0, 5) || [];
  const recentMessages = conversations.slice(0, 3);
  const topProducts = [...(products || [])]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      sales: product.soldCount || 0,
      revenue: (product.soldCount || 0) * product.price,
      stock: product.quantity,
    }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statCards = [
    {
      title: "Available Balance",
      value: formatPrice(stats.totalSales),
      change: mockStats.salesChange,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Pending (Escrow)",
      value: formatPrice(stats.pendingSales),
      change: 0,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Products",
      value: stats.totalProducts.toString(),
      change: mockStats.productsChange,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toString(),
      change: mockStats.customersChange,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  const cardClassName = "rounded-3xl border border-gray-100 bg-white shadow-sm";

  return (
    <SellerPageTemplate
      title={`Welcome back, ${user.firstName}!`}
      description="Here's what's happening with your store today."
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden rounded-full sm:flex"
            onClick={() => openModal("withdraw-funds")}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Withdraw Funds
          </Button>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => openModal("add-product")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* <div className="hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-3">
          <Button
            variant="outline"
            className="justify-between rounded-2xl border-gray-200 bg-white px-4 py-5"
            onClick={goToOrders}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Manage Orders
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="justify-between rounded-2xl border-gray-200 bg-white px-4 py-5"
            onClick={goToProducts}
          >
            <span className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Manage Products
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="justify-between rounded-2xl border-gray-200 bg-white px-4 py-5"
            onClick={goToMessages}
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Open Messages
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div> */}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cardClassName}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {stat.change > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-medium ${stat.change > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {Math.abs(stat.change)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          vs last month
                        </span>
                      </div>
                    </div>
                    <div
                      className={`h-12 w-12 rounded-full border bg-muted/60 flex items-center justify-center`}
                    >
                      <stat.icon className={`h-6 w-6`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className={`flex items-center gap-3 p-4 rounded-xl ${action.color} hover:opacity-90 transition-opacity`}
            >
              <action.icon className="h-5 w-5" />
              <span className="font-medium text-sm">{action.label}</span>
              {action.badge && (
                <Badge
                  variant="secondary"
                  className="ml-auto bg-primary text-white"
                >
                  {action.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div> */}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders - Takes 2 columns */}
          <Card className={`${cardClassName} lg:col-span-2`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest customer orders</CardDescription>
              </div>
              <Link to="/seller/orders">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 overflow-x-auto">
                {ordersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No orders yet
                    </p>
                  </div>
                ) : (
                  recentOrders.map((order) => {
                    const status =
                      statusConfig[order.status as keyof typeof statusConfig] ||
                      statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={order.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 min-w-0"
                        role="button"
                        tabIndex={0}
                        onClick={() => openOrderDetails(order.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openOrderDetails(order.id);
                          }
                        }}
                      >
                        <div
                          className={`h-10 w-10 rounded-lg ${status.color} flex items-center justify-center shrink-0`}
                        >
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="font-medium truncate">
                            {order.items?.[0]?.productName || "Order Item"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {order.orderNumber} •{" "}
                            {formatDate(order.dateCreated)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <Badge className={`${status.color} text-[10px]`}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Customer inquiries</CardDescription>
              </div>
              <Link to="/seller/messages">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                    role="button"
                    tabIndex={0}
                    onClick={goToMessages}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        goToMessages();
                      }
                    }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={msg.participant?.image} />
                      <AvatarFallback>
                        {(msg.participant?.name || "C").charAt(0)}
                      </AvatarFallback>
                    </Avatar>                   
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">
                          {msg.participant?.name || "Customer"}
                        </p>
                        {(msg.unreadCount || 0) > 0 && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {msg.lastMessage?.content || "No messages yet"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(
                          msg.lastMessageAt || new Date().toISOString(),
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card className={cardClassName}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Products</CardTitle>
              <CardDescription className="hidden md:flex items-center gap-1">
                Best performing products this month
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link to="/seller/products">
                <Button variant="outline" size="sm">
                  Manage Products
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Sales
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Revenue
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Stock
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            #{index + 1}
                          </span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{product.sales}</td>
                      <td className="text-right py-3 px-4 font-medium">
                        {formatCurrency(product.revenue)}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge
                          variant={
                            product.stock < 10 ? "destructive" : "secondary"
                          }
                        >
                          {product.stock}{" "}
                          <span className="hidden md:block ml-1">left</span>
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={goToProducts}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={goToProducts}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {topProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 px-4 text-center text-sm text-muted-foreground"
                      >
                        No product performance data yet
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Store Performance */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className={cardClassName}>
            <CardHeader>
              <CardTitle>Store Rating</CardTitle>
              <CardDescription>Based on customer reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold">4.8</div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-yellow-400 fill-yellow-400/50"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on 156 reviews
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percentage =
                    rating === 5
                      ? 72
                      : rating === 4
                        ? 18
                        : rating === 3
                          ? 6
                          : rating === 2
                            ? 3
                            : 1;
                  const widthClass =
                    rating === 5
                      ? "w-[72%]"
                      : rating === 4
                        ? "w-[18%]"
                        : rating === 3
                          ? "w-[6%]"
                          : rating === 2
                            ? "w-[3%]"
                            : "w-[1%]";
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-yellow-400 ${widthClass}`}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-10">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className={cardClassName}>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Conversion Rate</p>
                      <p className="text-sm text-muted-foreground">
                        Visitors who made a purchase
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-bold">3.2%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Average Order Value</p>
                      <p className="text-sm text-muted-foreground">
                        Per transaction
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-bold">
                    {formatCurrency(365)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Repeat Customers</p>
                      <p className="text-sm text-muted-foreground">
                        Returning buyers
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-bold">28%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <AddProductModal isOpen={isAddProductOpen} onClose={closeModal} />
      <WithdrawFundsModal isOpen={isWithdrawOpen} onClose={closeModal} />
    </SellerPageTemplate>
  );
}
