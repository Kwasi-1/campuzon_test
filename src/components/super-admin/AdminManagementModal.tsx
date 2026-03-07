import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminManagement } from "@/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Crown,
  Shield,
  UserX,
  AlertTriangle,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import adminManagementService from "@/services/adminManagementService";

interface RegularUser {
  id: string;
  name: string;
  email: string;
  status: string;
  joinDate: string;
  role?: string;
}

interface AdminManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin?: AdminManagement | null;
  mode: "view" | "edit" | "add" | "promote" | "revoke";
  onSave?: (admin: AdminManagement) => void;
  onAdd?: (adminData: Omit<AdminManagement, "id">) => void;
  onPromote?: (userData: {
    userId: string;
    name: string;
    email: string;
    permissions: string[];
  }) => void;
  onRevoke?: (adminId: string, reason: string) => void;
}

const AdminManagementModal: React.FC<AdminManagementModalProps> = ({
  isOpen,
  onClose,
  admin,
  mode,
  onSave,
  onAdd,
  onPromote,
  onRevoke,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "admin" as "admin" | "super-admin",
    status: "active" as "active" | "inactive",
    permissions: [] as string[],
    reason: "",
  });

  const [selectedUser, setSelectedUser] = useState<RegularUser | null>(null);
  const [regularUsers, setRegularUsers] = useState<RegularUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const availablePermissions = [
    "user_management",
    "store_management",
    "product_management",
    "transaction_monitoring",
    "rider_management",
    "system_settings",
    "notification_management",
    "report_generation",
  ];

  // Load regular users when in promote mode
  useEffect(() => {
    if (isOpen && mode === "promote") {
      const loadRegularUsers = async () => {
        setLoadingUsers(true);
        try {
          const users = await adminManagementService.getRegularUsers();
          setRegularUsers(users);
        } catch (error) {
          console.error("Failed to load regular users:", error);
          setRegularUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      };

      loadRegularUsers();
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (admin && (mode === "view" || mode === "edit" || mode === "revoke")) {
      setFormData({
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        permissions: admin.permissions,
        reason: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "admin",
        status: "active",
        permissions: ["user_management"],
        reason: "",
      });
    }
  }, [admin, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "edit" && admin && onSave) {
      onSave({
        ...admin,
        ...formData,
      });
    } else if (mode === "add" && onAdd) {
      onAdd({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        permissions: formData.permissions,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: "Super Admin",
      });
    } else if (mode === "promote" && selectedUser && onPromote) {
      onPromote({
        userId: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        permissions: formData.permissions,
      });
    } else if (mode === "revoke" && admin && onRevoke) {
      onRevoke(admin.id, formData.reason);
    }

    onClose();
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, permission],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => p !== permission),
      }));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "view":
        return "Admin Details";
      case "edit":
        return "Edit Admin";
      case "add":
        return "Add New Admin";
      case "promote":
        return "Promote User to Admin";
      case "revoke":
        return "Revoke Admin Rights";
      default:
        return "Admin Management";
    }
  };

  const getIcon = () => {
    switch (mode) {
      case "promote":
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case "revoke":
        return <UserX className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-blue-600" />;
    }
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>{getTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            {mode === "view" && "View admin details and permissions"}
            {mode === "edit" && "Modify admin information and permissions"}
            {mode === "add" &&
              "Create a new admin account with specified permissions"}
            {mode === "promote" && "Promote an existing user to admin role"}
            {mode === "revoke" && "Remove admin privileges from this user"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "revoke" && admin && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-800">Warning</h4>
              </div>
              <p className="text-sm text-red-700 mb-3">
                You are about to revoke admin rights from{" "}
                <strong>{admin.name}</strong>. This action will remove all
                administrative privileges.
              </p>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for revocation</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for revoking admin rights..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
          )}

          {mode === "promote" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select User to Promote</Label>
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchOpen}
                      className="w-full justify-between"
                    >
                      {selectedUser ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {selectedUser.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <div className="font-medium text-sm">
                              {selectedUser.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {selectedUser.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        "Select user..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search users..." />
                      <CommandList>
                        <CommandEmpty>
                          {loadingUsers ? "Loading users..." : "No user found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {regularUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.name} ${user.email}`}
                              onSelect={() => {
                                setSelectedUser(user);
                                setSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUser?.id === user.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {selectedUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{selectedUser.name}</h4>
                      <p className="text-sm text-gray-600">
                        {selectedUser.email}
                      </p>
                      <Badge className="mt-1">
                        {selectedUser.role || selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(mode === "add" || mode === "edit") && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    disabled={isReadOnly}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={isReadOnly}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "super-admin") =>
                      setFormData((prev) => ({ ...prev, role: value }))
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {["add", "edit", "promote", "view"].includes(mode) && (
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {availablePermissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(permission, checked as boolean)
                      }
                      disabled={isReadOnly}
                    />
                    <Label htmlFor={permission} className="text-sm">
                      {permission
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === "view" && admin && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-500">Last Login</Label>
                  <div>{new Date(admin.lastLogin).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <div>{new Date(admin.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Created By</Label>
                  <div>{admin.createdBy}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button
                type="submit"
                className={
                  mode === "revoke" ? "bg-red-600 hover:bg-red-700" : ""
                }
                disabled={mode === "promote" && !selectedUser}
              >
                {mode === "edit" && "Save Changes"}
                {mode === "add" && "Create Admin"}
                {mode === "promote" && "Promote to Admin"}
                {mode === "revoke" && "Revoke Rights"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminManagementModal;
