import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, Clock, MapPin, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserActivity } from "@/types";
import superAdminService from "@/services/superAdminService";
import TableSkeleton from "@/components/ui/table-skeleton";

interface UserActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    userName: string;
    userEmail: string;
    userRole: string;
  } | null;
}

const UserActivityModal = ({
  isOpen,
  onClose,
  user,
}: UserActivityModalProps) => {
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      const fetchUserActivities = async () => {
        setLoading(true);
        try {
          const activities = await superAdminService.getUserActivities(user.id);
          setUserActivities(activities);
        } catch (error) {
          toast({
            title: "Failed to load user activities",
            description: (error as Error).message,
            variant: "destructive",
          });
          setUserActivities([]);
        } finally {
          setLoading(false);
        }
      };

      fetchUserActivities();
    }
  }, [isOpen, user, toast]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user?.userName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <span>Activity History - {user?.userName}</span>
              <p className="text-sm text-muted-foreground font-normal">
                {user?.userEmail}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <TableSkeleton rows={6} columns={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location & Device</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userActivities.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No activities found for this user
                    </TableCell>
                  </TableRow>
                ) : (
                  userActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-sm">
                            {activity.action.replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-gray-600">
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserActivityModal;
