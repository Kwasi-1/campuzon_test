import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Store as StoreIcon,
  MapPin,
  Star,
  Eye,
  BarChart3,
  Package,
  Shield,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminTable from "@/components/admin/AdminTable";
import StoreModal from "@/components/admin/StoreModal";
import TableSkeleton from "@/components/ui/table-skeleton";
import adminDataService from "@/services/adminDataService";
import { Store as StoreType, StoreStatus } from "@/types-new";

export interface AdminStoreData extends StoreType {
  id: any;
  stallId?: string;
  name: string;
  owner: string;
  category: string;
  location: string;
  totalProducts: number;
  monthlyRevenue: number;
  joinDate: string;
  // redefine some missing or conflicting properties
  email: string;
  phone: string;
  status: StoreStatus;
  rating: number;
  logo: string;
}

const AdminStores = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<AdminStoreData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "suspend" | "reject">(
    "view"
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [stores, setStores] = useState<AdminStoreData[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const list = await adminDataService.getStalls();
        setStores(list as any);
      } catch (e) {
        toast({
          title: "Failed to load stores",
          description: (e as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchStores();
  }, [toast]);

  // Filter stores based on search and filters
  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      searchQuery === "" ||
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      store.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      store.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesLocation =
      locationFilter === "all" ||
      store.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
  });

  const activeStores = stores.filter((s) => s.status === "active").length;
  const totalRevenue = stores.reduce((sum, s) => sum + s.monthlyRevenue, 0);
  const pendingStores = stores.filter((s) => s.status === "pending").length;

  const dashboardStats = [
    {
      label: "Total Stores",
      value: stores.length.toString(),
      subtext: `${activeStores} active stores`,
    },
    {
      label: "Monthly Revenue",
      value: `₵${totalRevenue.toLocaleString()}`,
      subtext: "+15.3% from last month",
    },
    {
      label: "Pending Approval",
      value: pendingStores.toString(),
      subtext: "Awaiting review",
    },
    {
      label: "Active Rate",
      value: `${((activeStores / stores.length) * 100).toFixed(1)}%`,
      subtext: "Store activity rate",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Grocery":
        return "bg-blue-100 text-blue-800";
      case "Organic":
        return "bg-green-100 text-green-800";
      case "Convenience":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewStore = (store: AdminStoreData) => {
    setSelectedStore(store);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleSuspendStore = (store: AdminStoreData) => {
    setSelectedStore(store);
    setModalMode("suspend");
    setModalOpen(true);
  };

  const handleRejectStore = (store: AdminStoreData) => {
    setSelectedStore(store);
    setModalMode("reject");
    setModalOpen(true);
  };

  const handleSuspendStoreAction = async (
    storeId: number,
    reason: string,
    duration: string
  ) => {
    const store = stores.find((s) => s.id === storeId);
    const stallId = store?.stallId;
    if (!stallId) {
      toast({
        title: "Cannot suspend",
        description: "Missing stall_id for this store.",
        variant: "destructive",
      });
      return;
    }
    try {
      await adminDataService.suspendStall(stallId, reason, duration);
      setStores(
        stores.map((s) =>
          s.id === storeId ? { ...s, status: "suspended" } : s
        )
      );
      toast({
        title: "Store Suspended",
        description: `Store has been suspended for ${duration}.`,
      });
    } catch (e) {
      toast({
        title: "Failed to suspend",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleRejectStoreAction = async (storeId: number, reason: string) => {
    const store = stores.find((s) => s.id === storeId);
    const stallId = store?.stallId;
    if (!stallId) {
      toast({
        title: "Cannot reject",
        description: "Missing stall_id for this store.",
        variant: "destructive",
      });
      return;
    }
    try {
      await adminDataService.rejectStall(stallId, reason);
      setStores(
        stores.map((s) => (s.id === storeId ? { ...s, status: "closed" } : s))
      );
      toast({
        title: "Store Rejected",
        description: "Store application has been rejected.",
        variant: "destructive",
      });
    } catch (e) {
      toast({
        title: "Failed to reject",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleStoreAction = async (action: string, storeId: number) => {
    const store = stores.find((s) => s.id === storeId);
    if (!store) return;
    const stallId = store.stallId;

    switch (action) {
      case "view":
        handleViewStore(store);
        break;
      case "suspend":
        handleSuspendStore(store);
        break;
      case "reject":
        handleRejectStore(store);
        break;
      case "approve":
        if (!stallId) {
          toast({
            title: "Cannot approve",
            description: "Missing stall_id for this store.",
            variant: "destructive",
          });
          break;
        }
        try {
          await adminDataService.approveStall(stallId);
          setStores(
            stores.map((s) =>
              s.id === storeId ? { ...s, status: "active" } : s
            )
          );
          toast({
            title: "Store Approved",
            description: "Store has been approved and is now active.",
          });
        } catch (e) {
          toast({
            title: "Failed to approve",
            description: (e as Error).message,
            variant: "destructive",
          });
        }
        break;
      case "activate":
        if (!stallId) {
          toast({
            title: "Cannot activate",
            description: "Missing stall_id for this store.",
            variant: "destructive",
          });
          break;
        }
        try {
          await adminDataService.activateStall(stallId);
          setStores(
            stores.map((s) =>
              s.id === storeId ? { ...s, status: "active" } : s
            )
          );
          toast({
            title: "Store Activated",
            description: "Store has been activated successfully.",
          });
        } catch (e) {
          toast({
            title: "Failed to activate",
            description: (e as Error).message,
            variant: "destructive",
          });
        }
        break;
      default:
        console.log(`${action} store ${storeId}`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExportStores = async () => {
    try {
      const blob = await adminDataService.exportStalls("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stores-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Completed",
        description: "Store data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
        { value: "suspended", label: "Suspended" },
        { value: "rejected", label: "Rejected" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: "category",
      label: "Category",
      options: [
        { value: "all", label: "All Categories" },
        { value: "grocery", label: "Grocery" },
        { value: "organic", label: "Organic" },
        { value: "convenience", label: "Convenience" },
      ],
      value: categoryFilter,
      onChange: setCategoryFilter,
    },
    {
      key: "location",
      label: "Location",
      options: [
        { value: "all", label: "All Locations" },
        { value: "accra", label: "Accra" },
        { value: "kumasi", label: "Kumasi" },
        { value: "takoradi", label: "Takoradi" },
      ],
      value: locationFilter,
      onChange: setLocationFilter,
    },
  ];

  return (
    <>
      <SEO
        title="Store Management"
        description="Oversee registered stores, approvals, and store performance."
        keywords="store management, merchant oversight, business administration"
      />

      <AdminPageLayout title="Stores" dashboardStats={dashboardStats}>
        <AdminTable
          title="Store Management"
          description="Manage all registered stores and their performance"
          searchPlaceholder="Search stores by name, owner, or email..."
          onSearch={handleSearch}
          filters={filters}
          showDateFilter={true}
          secondaryActionButton={{
            label: "Export Stores",
            onClick: handleExportStores,
            icon: <Download className="w-4 h-4 mr-2" />,
          }}
        >
          {loading ? (
            <TableSkeleton rows={6} columns={7} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Owner & Contact</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={store.logo} alt={store.name} />
                          <AvatarFallback>
                            <StoreIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{store.name}</div>
                          <div className="text-sm text-gray-500">
                            {store.totalProducts} products
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{store.owner}</div>
                        <div className="text-sm text-gray-500">
                          {store.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {store.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(store.category)}>
                        {store.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                        {store.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                          {store.rating}
                        </div>
                        <div className="text-sm text-gray-600">
                          ₵{store.monthlyRevenue.toLocaleString()}/mo
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(store.status)}>
                        {store.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {store.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStoreAction("approve", store.id)
                              }
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStoreAction("reject", store.id)
                              }
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStoreAction("view", store.id)
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStoreAction("products", store.id)
                              }
                            >
                              <Package className="w-4 h-4 mr-2" />
                              View Products
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStoreAction("analytics", store.id)
                              }
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {store.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStoreAction("approve", store.id)
                                  }
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve Store
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStoreAction("reject", store.id)
                                  }
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject Store
                                </DropdownMenuItem>
                              </>
                            )}
                            {store.status !== "pending" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStoreAction(
                                    store.status === "suspended"
                                      ? "activate"
                                      : "suspend",
                                    store.id
                                  )
                                }
                                className="text-red-600"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                {store.status === "suspended"
                                  ? "Activate"
                                  : "Suspend"}{" "}
                                Store
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AdminTable>
      </AdminPageLayout>

      <StoreModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        store={selectedStore}
        mode={modalMode}
        onSuspend={handleSuspendStoreAction}
        onReject={handleRejectStoreAction}
      />
    </>
  );
};

export default AdminStores;
