import React, { useEffect, useState } from "react";
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
import {
  Eye,
  Edit,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MoreHorizontal,
  Plus,
  UserCheck,
  UserX,
  FileDown,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RiderModal from "@/components/admin/RiderModal";
import TableSkeleton from "@/components/ui/table-skeleton";
import { Rider } from "@/types";
import adminRiderService from "@/services/adminRiderService";

const AdminRiders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "view" | "edit" | "suspend" | "remove"
  >("view");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [allRiders, setAllRiders] = useState<Rider[]>([]);

  useEffect(() => {
    const fetchRiders = async () => {
      setLoading(true);
      try {
        // Prefer performance API to get deliveries/earnings and status
        const perf = await adminRiderService.getPerformance(30);
        if (perf.success) {
          const mapped: Rider[] = perf.riders.map((r) => ({
            id: r.rider_id,
            name: r.rider_info?.name || r.rider_info?.username || "Rider",
            email: "",
            phone: "",
            avatar: "",
            status: (r.rider_info?.status ||
              (r.status?.is_online ? "Active" : "Inactive")) as string,
            location: r.status?.last_seen || "",
            rating: r.performance?.rating ?? 0,
            totalDeliveries: r.performance.total_deliveries,
            completedDeliveries: r.performance.recent_deliveries,
            cancelledDeliveries: 0,
            earnings: r.performance.estimated_total_earnings,
            joinDate: r.rider_info?.registered_at || "",
            vehicleType: r.rider_info?.vehicle_type || "",
            licenseNumber: "",
            lastDelivery: r.status?.last_seen || new Date().toISOString(),
            currentOrders: r.status?.active_orders ?? 0,
            reviews: [],
          }));
          setAllRiders(mapped);
        } else {
          setAllRiders([]);
        }
      } catch (e) {
        toast({
          title: "Failed to load riders",
          description: (e as Error).message,
          variant: "destructive",
        });
        setAllRiders([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchRiders();
  }, [toast]);

  // Filter riders based on search and filters
  const filteredRiders = allRiders.filter((rider) => {
    const matchesSearch =
      searchQuery === "" ||
      rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rider.phone.includes(searchQuery) ||
      rider.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      rider.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesLocation =
      locationFilter === "all" ||
      rider.location.toLowerCase() === locationFilter.toLowerCase();

    const matchesVehicle =
      vehicleFilter === "all" ||
      rider.vehicleType.toLowerCase() === vehicleFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesLocation && matchesVehicle;
  });

  // Calculate comprehensive dashboard stats
  const activeRiders = allRiders.filter((r) => r.status === "Active").length;
  const totalEarnings = allRiders.reduce((sum, r) => sum + r.earnings, 0);
  const totalDeliveries = allRiders.reduce(
    (sum, r) => sum + r.totalDeliveries,
    0
  );
  const avgRating =
    allRiders.reduce((sum, r) => sum + r.rating, 0) / allRiders.length;
  const ridersOnline = allRiders.filter((r) => r.currentOrders > 0).length;

  const dashboardStats = [
    {
      label: "Total Riders",
      value: allRiders.length.toString(),
      subtext: `${activeRiders} active riders`,
    },
    {
      label: "Riders Online",
      value: ridersOnline.toString(),
      subtext: "Currently delivering",
    },
    {
      label: "Total Deliveries",
      value: totalDeliveries.toString(),
      subtext: "Completed deliveries",
    },
    {
      label: "Average Rating",
      value: avgRating.toFixed(1),
      subtext: "Overall rider rating",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewRider = (rider: Rider) => {
    setSelectedRider(rider);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEditRider = (rider: Rider) => {
    setSelectedRider(rider);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSuspendRider = (rider: Rider) => {
    setSelectedRider(rider);
    setModalMode("suspend");
    setModalOpen(true);
  };

  const handleRemoveRider = (rider: Rider) => {
    setSelectedRider(rider);
    setModalMode("remove");
    setModalOpen(true);
  };

  const handleAddRider = () => {
    setSelectedRider(null);
    setModalMode("edit"); // Use edit mode for adding new rider
    setModalOpen(true);
  };

  const handleApproveRider = async (riderId: string) => {
    try {
      await adminRiderService.reactivateRider(riderId, "Approved by admin");
      setAllRiders(
        allRiders.map((r) =>
          r.id === riderId ? { ...r, status: "Active" } : r
        )
      );
      toast({
        title: "Rider Approved",
        description: "Rider has been approved and activated successfully.",
      });
    } catch (e) {
      toast({
        title: "Failed to approve rider",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSaveRider = async (updatedRider: Rider) => {
    try {
      if (selectedRider) {
        // Update existing rider
        const riderUpdate = {
          name: updatedRider.name,
          email: updatedRider.email,
          phone: updatedRider.phone,
          vehicleType: updatedRider.vehicleType,
          licenseNumber: updatedRider.licenseNumber,
          status: updatedRider.status.toLowerCase() as
            | "active"
            | "inactive"
            | "suspended",
        };

        await adminRiderService.updateRider(updatedRider.id, riderUpdate);

        setAllRiders(
          allRiders.map((r) => (r.id === updatedRider.id ? updatedRider : r))
        );
        toast({
          title: "Rider Updated",
          description: "Rider information has been updated successfully.",
        });
      } else {
        // Add new rider functionality would need a create endpoint
        toast({
          title: "Feature Not Available",
          description: "Adding new riders requires backend implementation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update rider",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSuspendRiderAction = async (
    riderId: string,
    reason: string,
    duration: string
  ) => {
    try {
      await adminRiderService.suspendRider(riderId, reason);
      setAllRiders(
        allRiders.map((r) =>
          r.id === riderId ? { ...r, status: "Suspended" } : r
        )
      );
      toast({
        title: "Rider Suspended",
        description: `Rider has been suspended for ${duration}.`,
      });
    } catch (e) {
      toast({
        title: "Failed to suspend rider",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveRiderAction = async (riderId: string, reason: string) => {
    try {
      await adminRiderService.removeRider(riderId, reason);
      setAllRiders(allRiders.filter((r) => r.id !== riderId));
      toast({
        title: "Rider Removed",
        description: "Rider has been removed from the platform.",
      });
    } catch (e) {
      toast({
        title: "Failed to remove rider",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExportRiders = async () => {
    try {
      const blob = await adminRiderService.exportRiders("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `riders-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Completed",
        description: "Rider data has been exported successfully.",
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
        { value: "inactive", label: "Inactive" },
        { value: "suspended", label: "Suspended" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
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
    {
      key: "vehicle",
      label: "Vehicle Type",
      options: [
        { value: "all", label: "All Vehicles" },
        { value: "motorbike", label: "Motorbike" },
        { value: "bicycle", label: "Bicycle" },
        { value: "car", label: "Car" },
      ],
      value: vehicleFilter,
      onChange: setVehicleFilter,
    },
  ];

  return (
    <>
      <SEO
        title="Delivery Riders Management"
        description="Manage delivery riders, track performance, and monitor rider activities."
        keywords="delivery riders, rider management, delivery tracking, rider performance"
      />

      <AdminPageLayout title="Delivery Riders" dashboardStats={dashboardStats}>
        <AdminTable
          title="Rider Management"
          description="Manage delivery riders and track their performance"
          searchPlaceholder="Search riders by name, email, phone, or ID..."
          onSearch={handleSearch}
          filters={filters}
          showDateFilter={false}
          actionButton={{
            label: "Add Rider",
            onClick: handleAddRider,
            icon: <Plus className="w-4 h-4 mr-2" />,
          }}
          secondaryActionButton={{
            label: "Export Riders",
            onClick: handleExportRiders,
            icon: <FileDown className="w-4 h-4 mr-2" />,
          }}
        >
          {loading ? (
            <TableSkeleton rows={6} columns={9} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rider Info</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Current Orders</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRiders.map((rider) => (
                  <TableRow key={rider.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={rider.avatar} alt={rider.name} />
                          <AvatarFallback>
                            {rider.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{rider.name}</p>
                          <p className="text-sm text-gray-500">{rider.id}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs font-medium">
                              {rider.rating}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({rider.reviews.length} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{rider.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{rider.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(rider.status)}>
                        {rider.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{rider.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {rider.totalDeliveries} deliveries
                        </div>
                        <div className="text-xs text-gray-500">
                          {rider.completedDeliveries} completed,{" "}
                          {rider.cancelledDeliveries} cancelled
                        </div>
                        <div className="text-xs font-medium text-green-600">
                          ₵{rider.earnings.toFixed(2)} earned
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {rider.vehicleType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rider.licenseNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rider.currentOrders > 0
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {rider.currentOrders} orders
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">
                          {new Date(rider.lastDelivery).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewRider(rider)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditRider(rider)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Rider
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {(rider.status === "Inactive" ||
                            rider.status === "Suspended") && (
                            <DropdownMenuItem
                              onClick={() => handleApproveRider(rider.id)}
                              className="text-green-600"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Approve Rider
                            </DropdownMenuItem>
                          )}
                          {rider.status === "Active" && (
                            <DropdownMenuItem
                              onClick={() => handleSuspendRider(rider)}
                              className="text-yellow-600"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend Rider
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleRemoveRider(rider)}
                            className="text-red-600"
                          >
                            Remove Rider
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AdminTable>
      </AdminPageLayout>

      <RiderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        rider={selectedRider}
        mode={modalMode}
        onSave={handleSaveRider}
        onSuspend={handleSuspendRiderAction}
        onRemove={handleRemoveRiderAction}
      />
    </>
  );
};

export default AdminRiders;
