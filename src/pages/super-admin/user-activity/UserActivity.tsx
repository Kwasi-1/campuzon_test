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
  Eye,
  Download,
  Activity,
  Clock,
  MapPin,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminTable from "@/components/admin/AdminTable";
import UserActivityModal from "@/components/super-admin/UserActivityModal";
import { UserActivity as UserActivityType } from "@/types";
import TableSkeleton from "@/components/ui/table-skeleton";
import EmptyDateState from "@/components/shared/EmptyDateState";
import { useDateFilter } from "@/contexts/DateFilterContext";
import { isWithinInterval, parseISO } from "date-fns";
import superAdminService from "@/services/superAdminService";

const UserActivity = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    userName: string;
    userEmail: string;
    userRole: string;
  } | null>(null);
  const [isUserActivityModalOpen, setIsUserActivityModalOpen] = useState(false);
  const { toast } = useToast();
  const {
    selectedPeriod,
    dateRange,
    isFiltered,
    isLoading: dateLoading,
  } = useDateFilter();

  const [activities, setActivities] = useState<UserActivityType[]>([]);
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    successfulActivities: 0,
    failedActivities: 0,
    uniqueUsers: 0,
    successRate: "0",
  });

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const [activitiesData, statsData] = await Promise.all([
          superAdminService.getAllUserActivities(),
          superAdminService.getActivityStatistics(),
        ]);

        setActivities(activitiesData);
        setActivityStats(statsData);
      } catch (error) {
        toast({
          title: "Failed to load user activities",
          description: (error as Error).message,
          variant: "destructive",
        });
        // Fallback to empty data
        setActivities([]);
        setActivityStats({
          totalActivities: 0,
          successfulActivities: 0,
          failedActivities: 0,
          uniqueUsers: 0,
          successRate: "0",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [toast]);

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      searchQuery === "" ||
      activity.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUser =
      userFilter === "all" ||
      activity.userRole.toLowerCase() === userFilter.toLowerCase();

    const matchesAction =
      actionFilter === "all" ||
      activity.action.toLowerCase() === actionFilter.toLowerCase();

    // Apply date filter
    let matchesDate = true;
    if (isFiltered && dateRange.from && dateRange.to) {
      const activityDate = parseISO(activity.timestamp);
      matchesDate = isWithinInterval(activityDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    }

    return matchesSearch && matchesUser && matchesAction && matchesDate;
  });

  // Calculate dashboard stats from live data
  const dashboardStats = [
    {
      label: "Total Activities",
      value: activityStats.totalActivities.toString(),
      subtext: "All time activities",
    },
    {
      label: "Successful Actions",
      value: activityStats.successfulActivities.toString(),
      subtext: `${activityStats.successRate}% success rate`,
    },
    {
      label: "Failed Actions",
      value: activityStats.failedActivities.toString(),
      subtext: "Requires attention",
    },
    {
      label: "Active Users",
      value: activityStats.uniqueUsers.toString(),
      subtext: "Unique users tracked",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "super-admin":
        return "bg-purple-100 text-purple-800";
      case "store":
        return "bg-blue-100 text-blue-800";
      case "client":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExportActivities = async () => {
    try {
      const csvData = await superAdminService.exportUserActivities();

      // Create and download CSV file
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `user_activities_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "User activity data has been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewUserActivity = (activity: UserActivityType) => {
    setSelectedUser({
      id: activity.userId,
      userName: activity.userName,
      userEmail: activity.userEmail,
      userRole: activity.userRole,
    });
    setIsUserActivityModalOpen(true);
  };

  const filters = [
    {
      key: "user",
      label: "User Role",
      options: [
        { value: "all", label: "All Roles" },
        { value: "client", label: "Clients" },
        { value: "store", label: "Store Owners" },
        { value: "admin", label: "Admins" },
        { value: "super-admin", label: "Super Admins" },
      ],
      value: userFilter,
      onChange: setUserFilter,
    },
    {
      key: "action",
      label: "Action Type",
      options: [
        { value: "all", label: "All Actions" },
        { value: "login", label: "Login" },
        { value: "logout", label: "Logout" },
        { value: "product_added", label: "Product Added" },
        { value: "user_suspended", label: "User Suspended" },
        { value: "role_changed", label: "Role Changed" },
        { value: "failed_login", label: "Failed Login" },
      ],
      value: actionFilter,
      onChange: setActionFilter,
    },
  ];

  return (
    <>
      <SEO
        title="User Activity - Super Admin"
        description="Monitor and track all user activities, login attempts, and system interactions across the platform."
        keywords="user activity, activity monitoring, system logs, user tracking"
      />

      <AdminPageLayout title="User Activity" dashboardStats={dashboardStats}>
        <AdminTable
          title="Activity Monitor"
          description="Track all user activities and system interactions in real-time"
          searchPlaceholder="Search by user name, email, or action..."
          onSearch={handleSearch}
          filters={filters}
          showDateFilter={true}
          actionButton={{
            label: "Export Activities",
            onClick: handleExportActivities,
            icon: <Download className="w-4 h-4 mr-2" />,
          }}
        >
          {loading || dateLoading ? (
            <TableSkeleton rows={10} columns={8} />
          ) : filteredActivities.length === 0 ? (
            <EmptyDateState message="No user activities found for the selected date range" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location & Device</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {activity.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {activity.userName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {activity.userEmail}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(activity.userRole)}>
                        {activity.userRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-sm">
                          {activity.action.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Smartphone className="w-3 h-3" />
                          <span>{activity.device}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {activity.ipAddress}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUserActivity(activity)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AdminTable>
      </AdminPageLayout>

      {/* User Activity Detail Modal */}
      <UserActivityModal
        isOpen={isUserActivityModalOpen}
        onClose={() => setIsUserActivityModalOpen(false)}
        user={selectedUser}
      />
    </>
  );
};

export default UserActivity;
