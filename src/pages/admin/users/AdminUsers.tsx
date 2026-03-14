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
import { Eye, Edit, Shield, Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminTable from "@/components/admin/AdminTable";
import UserModal from "@/components/admin/UserModal";
import TableSkeleton from "@/components/ui/table-skeleton";
import adminDataService from "@/services/adminDataService";
import { User } from "@/types-new";

// Extended interface for Admin UI since it needs aggregating fields
export interface AdminUser extends User {
  orders: number;
  totalSpent: number;
  location: string;
}

const AdminUsers = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "view" | "edit" | "add" | "suspend"
  >("view");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const list = await adminDataService.getUsers();
        setUsers(list);
      } catch (e) {
        toast({
          title: "Failed to load users",
          description: (e as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, [toast]);

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const userStatus = user.isActive ? "active" : "inactive";
    
    const matchesSearch =
      searchQuery === "" ||
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" ||
      userStatus === statusFilter.toLowerCase();

    const matchesLocation =
      locationFilter === "all" ||
      user.location.toLowerCase() === locationFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const activeUsers = users.filter((u) => u.isActive).length;
  const totalRevenue = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);
  const totalOrders = users.reduce((sum, u) => sum + (u.orders || 0), 0);

  const dashboardStats = [
    {
      label: "Total Users",
      value: users.length.toString(),
      subtext: `${activeUsers} active users`,
    },
    {
      label: "Total Revenue",
      value: `₵${totalRevenue.toFixed(2)}`,
      subtext: "+12.3% from last month",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      subtext: "All-time orders",
    },
    {
      label: "Active Rate",
      value: `${((activeUsers / users.length) * 100).toFixed(1)}%`,
      subtext: "User activity rate",
    },
  ];

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSuspendUser = (user: AdminUser) => {
    setSelectedUser(user);
    setModalMode("suspend");
    setModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleSaveUser = async (updatedUser: AdminUser) => {
    try {
      await adminDataService.updateUser(updatedUser.id, updatedUser);
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update user",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleAddNewUser = async (newUserData: Omit<AdminUser, "id">) => {
    try {
      const newUser = await adminDataService.createUser(newUserData);
      setUsers([...users, newUser]);
      toast({
        title: "User Added",
        description: "New user has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add user",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSuspendUserAction = async (
    userId: string | number,
    reason: string,
    duration: string
  ) => {
    try {
      await adminDataService.suspendUser(userId, reason, duration);
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, isActive: false } : u))
      );
      toast({
        title: "User Suspended",
        description: `User has been suspended for ${duration}.`,
      });
    } catch (error) {
      toast({
        title: "Failed to suspend user",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleExportUsers = async () => {
    try {
      const blob = await adminDataService.exportUsers("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Completed",
        description: "User data has been exported successfully.",
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
  ];

  return (
    <>
      <SEO
        title="User Management"
        description="Manage platform users, view user analytics, and monitor user activities."
        keywords="user management, customer analytics, user administration"
      />

      <AdminPageLayout title="Users" dashboardStats={dashboardStats}>
        <AdminTable
          title="User Management"
          description="Manage all platform users and their activities"
          searchPlaceholder="Search users by name, email, or phone..."
          onSearch={handleSearch}
          filters={filters}
          showDateFilter={true}
          actionButton={{
            label: "Add User",
            onClick: handleAddUser,
            icon: <Plus className="w-4 h-4 mr-2" />,
          }}
          secondaryActionButton={{
            label: "Export Users",
            onClick: handleExportUsers,
            icon: <Download className="w-4 h-4 mr-2" />,
          }}
        >
          {loading ? (
            <TableSkeleton rows={8} columns={8} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profileImage || undefined} alt={`${user.firstName} ${user.lastName}`} />
                          <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.email}</div>
                        <div className="text-gray-500">{user.phoneNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell>
                      {new Date(user.dateCreated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{user.orders}</TableCell>
                    <TableCell className="font-medium">
                      ₵{user.totalSpent.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.isActive)}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSuspendUser(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AdminTable>
      </AdminPageLayout>

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        mode={modalMode}
        onSave={handleSaveUser}
        onAdd={handleAddNewUser}
        onSuspend={handleSuspendUserAction}
      />
    </>
  );
};

export default AdminUsers;
