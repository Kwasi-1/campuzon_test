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
import { Eye, Edit, Shield, Plus, UserX, Crown, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminTable from "@/components/admin/AdminTable";
import { AdminManagement as AdminManagementType } from "@/types";
import AdminManagementModal from "@/components/super-admin/AdminManagementModal";
import TableSkeleton from "@/components/ui/table-skeleton";
import adminManagementService from "@/services/adminManagementService";

const AdminManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAdmin, setSelectedAdmin] =
    useState<AdminManagementType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "view" | "edit" | "add" | "promote" | "revoke"
  >("view");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [admins, setAdmins] = useState<AdminManagementType[]>([]);
  const [adminStats, setAdminStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    superAdmins: 0,
    recentLogins: 0,
    activeRate: "0",
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const [adminsData, statsData] = await Promise.all([
          adminManagementService.getAllAdmins(),
          adminManagementService.getAdminStatistics(),
        ]);

        setAdmins(adminsData);
        setAdminStats(statsData);
      } catch (error) {
        toast({
          title: "Failed to load admin data",
          description: (error as Error).message,
          variant: "destructive",
        });
        // Fallback to empty data
        setAdmins([]);
        setAdminStats({
          totalAdmins: 0,
          activeAdmins: 0,
          superAdmins: 0,
          recentLogins: 0,
          activeRate: "0",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [toast]);

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      searchQuery === "" ||
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      admin.role.toLowerCase() === roleFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      admin.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate dashboard stats from live data
  const dashboardStats = [
    {
      label: "Total Admins",
      value: adminStats.totalAdmins.toString(),
      subtext: `${adminStats.activeAdmins} active`,
    },
    {
      label: "Super Admins",
      value: adminStats.superAdmins.toString(),
      subtext: "Highest privilege level",
    },
    {
      label: "Recent Logins",
      value: adminStats.recentLogins.toString(),
      subtext: "Last 24 hours",
    },
    {
      label: "Active Rate",
      value: `${adminStats.activeRate}%`,
      subtext: "Admin activity rate",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewAdmin = (admin: AdminManagementType) => {
    setSelectedAdmin(admin);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEditAdmin = (admin: AdminManagementType) => {
    setSelectedAdmin(admin);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handlePromoteUser = () => {
    setSelectedAdmin(null);
    setModalMode("promote");
    setModalOpen(true);
  };

  const handleRevokeAdmin = (admin: AdminManagementType) => {
    setSelectedAdmin(admin);
    setModalMode("revoke");
    setModalOpen(true);
  };

  const handleAddAdmin = () => {
    setSelectedAdmin(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleSaveAdmin = async (updatedAdmin: AdminManagementType) => {
    try {
      const savedAdmin = await adminManagementService.updateAdmin(
        updatedAdmin.id,
        updatedAdmin
      );
      setAdmins(admins.map((a) => (a.id === updatedAdmin.id ? savedAdmin : a)));
      toast({
        title: "Admin Updated",
        description: "Admin information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update admin",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleAddNewAdmin = async (
    newAdminData: Omit<AdminManagementType, "id">
  ) => {
    try {
      const newAdmin = await adminManagementService.createAdmin({
        name: newAdminData.name,
        email: newAdminData.email,
        password: "TempPassword123!", // In real app, this should be generated or provided in modal
        role: newAdminData.role,
        permissions: newAdminData.permissions,
      });

      setAdmins([...admins, newAdmin]);
      toast({
        title: "Admin Added",
        description: "New admin has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add admin",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handlePromoteUserToAdmin = async (userData: {
    userId: string;
    name: string;
    email: string;
    permissions: string[];
  }) => {
    try {
      const newAdmin = await adminManagementService.promoteUserToAdmin(
        userData
      );
      setAdmins([...admins, newAdmin]);
      toast({
        title: "User Promoted",
        description: `${userData.name} has been promoted to Admin successfully.`,
      });
    } catch (error) {
      toast({
        title: "Failed to promote user",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleRevokeAdminRights = async (adminId: string, reason: string) => {
    try {
      await adminManagementService.demoteAdmin(adminId, reason);
      setAdmins(admins.filter((a) => a.id !== adminId));
      toast({
        title: "Admin Rights Revoked",
        description: "Admin privileges have been revoked successfully.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Failed to revoke admin rights",
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
      key: "role",
      label: "Role",
      options: [
        { value: "all", label: "All Roles" },
        { value: "admin", label: "Admin" },
        { value: "super-admin", label: "Super Admin" },
      ],
      value: roleFilter,
      onChange: setRoleFilter,
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ];

  return (
    <>
      <SEO
        title="Admin Management - Super Admin"
        description="Manage admin users, promote users to admin, and control administrative privileges across the platform."
        keywords="admin management, user promotion, administrative control, privilege management"
      />

      <AdminPageLayout title="Admin Management" dashboardStats={dashboardStats}>
        <AdminTable
          title="Administrative Users"
          description="Manage admin privileges and promote users to administrative roles"
          searchPlaceholder="Search admins by name or email..."
          onSearch={handleSearch}
          filters={filters}
          showDateFilter={true}
          actionButton={{
            label: "Promote User",
            onClick: handlePromoteUser,
            icon: <Crown className="w-4 h-4 mr-2" />,
          }}
          secondaryActionButton={{
            label: "Add Admin",
            onClick: handleAddAdmin,
            icon: <Plus className="w-4 h-4 mr-2" />,
          }}
        >
          {loading ? (
            <TableSkeleton rows={6} columns={7} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={admin.avatar} alt={admin.name} />
                          <AvatarFallback className="bg-red-100 text-red-600">
                            {admin.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{admin.name}</div>
                          <div className="text-sm text-gray-500">
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(admin.role)}>
                        {admin.role === "super-admin" ? "Super Admin" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {admin.permissions
                          .slice(0, 2)
                          .map((permission, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs mr-1"
                            >
                              {permission.replace("_", " ")}
                            </Badge>
                          ))}
                        {admin.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{admin.permissions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(admin.lastLogin).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {admin.createdBy}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(admin.status)}>
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAdmin(admin)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAdmin(admin)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {admin.role !== "super-admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeAdmin(admin)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AdminTable>
      </AdminPageLayout>

      <AdminManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        admin={selectedAdmin}
        mode={modalMode}
        onSave={handleSaveAdmin}
        onAdd={handleAddNewAdmin}
        onPromote={handlePromoteUserToAdmin}
        onRevoke={handleRevokeAdminRights}
      />
    </>
  );
};

export default AdminManagement;
