import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Store,
  MapPin,
  Star,
  Phone,
  Mail,
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AdminStoreData, Product, StoreData } from "@/types";

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreData | null;
  mode: "view" | "suspend" | "reject";
  onSuspend: (storeId: number, reason: string, duration: string) => void;
  onReject?: (storeId: number, reason: string) => void;
}

const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  store,
  mode,
  onSuspend,
  onReject,
}) => {
  const [suspendData, setSuspendData] = useState({
    reason: "",
    duration: "7-days",
  });

  const [rejectReason, setRejectReason] = useState("");

  // Mock data for store products and analytics
  const storeProducts = [
    {
      id: 1,
      name: "Fresh Bananas",
      sales: 89,
      revenue: 445.0,
      status: "Active",
    },
    {
      id: 2,
      name: "Organic Apples",
      sales: 76,
      revenue: 380.0,
      status: "Active",
    },
    { id: 3, name: "White Bread", sales: 65, revenue: 195.0, status: "Active" },
    { id: 4, name: "Milk 1L", sales: 54, revenue: 162.0, status: "Low Stock" },
    {
      id: 5,
      name: "Eggs (12 pack)",
      sales: 12,
      revenue: 48.0,
      status: "Active",
    },
  ];

  const bestSelling = storeProducts.slice(0, 3);
  const worstSelling = storeProducts.slice(-2);

  const handleSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (store) {
      onSuspend(store.id, suspendData.reason, suspendData.duration);
      onClose();
    }
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (store && onReject) {
      onReject(store.id, rejectReason);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProductStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-orange-100 text-orange-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!store) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col  overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            {mode === "suspend"
              ? "Suspend Store"
              : mode === "reject"
              ? "Reject Store"
              : "Store Details"}
          </DialogTitle>
        </DialogHeader>

        {mode === "suspend" ? (
          <form onSubmit={handleSuspend} className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  Suspend Store: {store.name}
                </p>
                <p className="text-sm text-red-600">
                  This will restrict the store's operations
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Suspension</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for suspension..."
                value={suspendData.reason}
                onChange={(e) =>
                  setSuspendData({ ...suspendData, reason: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={suspendData.duration}
                onValueChange={(value) =>
                  setSuspendData({ ...suspendData, duration: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7-days">7 Days</SelectItem>
                  <SelectItem value="30-days">30 Days</SelectItem>
                  <SelectItem value="90-days">90 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Suspend Store
              </Button>
            </div>
          </form>
        ) : mode === "reject" ? (
          <form onSubmit={handleReject} className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  Reject Store Application: {store.name}
                </p>
                <p className="text-sm text-red-600">
                  This will permanently reject the store application
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectReason">Reason for Rejection</Label>
              <Textarea
                id="rejectReason"
                placeholder="Enter reason for rejection (e.g., incomplete documentation, policy violations, etc.)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Reject Application
              </Button>
            </div>
          </form>
        ) : (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Store Details</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={store.logo} alt={store.name} />
                  <AvatarFallback>
                    <Store className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{store.name}</h3>
                  <p className="text-gray-600">{store.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(store.status)}>
                      {store.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{store.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Contact Information
                      </span>
                    </div>
                    <p className="font-medium">{store.email}</p>
                    <p className="text-gray-600">{store.phone}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Location</span>
                    </div>
                    <p className="font-medium">{store.location}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Owner</p>
                    <p className="font-medium">{store.owner}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Join Date</p>
                    <p className="font-medium">
                      {new Date(store.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {store.totalProducts}
                  </p>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ₵{store.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {store.rating}
                  </p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Best Selling Products
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bestSelling.map((product, index) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-green-600">
                              #{index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.sales} sold
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ₵{product.revenue.toFixed(2)}
                            </p>
                            <Badge
                              className={getProductStatusColor(product.status)}
                            >
                              {product.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Worst Selling Products
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {worstSelling.map((product, index) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-red-600">
                              #{index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.sales} sold
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ₵{product.revenue.toFixed(2)}
                            </p>
                            <Badge
                              className={getProductStatusColor(product.status)}
                            >
                              {product.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storeProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.sales}</TableCell>
                          <TableCell>₵{product.revenue.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              className={getProductStatusColor(product.status)}
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Monthly Revenue
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₵{store.monthlyRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +15.3% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Products
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {store.totalProducts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +5 new this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Rating
                    </CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{store.rating}</div>
                    <p className="text-xs text-muted-foreground">
                      Based on 124 reviews
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Orders
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">342</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Best Selling Category
                        </p>
                        <p className="font-medium">Fruits & Vegetables</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Average Order Value
                        </p>
                        <p className="font-medium">₵45.20</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Customer Retention
                        </p>
                        <p className="font-medium">78%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Delivery Success Rate
                        </p>
                        <p className="font-medium">94%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StoreModal;
