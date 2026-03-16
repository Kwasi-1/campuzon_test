import api, { extractData } from "@/lib/api";
import type { Notification } from "@/types-new";

export interface ProfileNotificationsQuery {
  page?: number;
  perPage?: number;
  unreadOnly?: boolean;
}

class ProfileNotificationsService {
  async getNotifications(
    query: ProfileNotificationsQuery = {},
  ): Promise<Notification[]> {
    const response = await api.get("/notifications", {
      params: {
        page: query.page ?? 1,
        per_page: query.perPage ?? 200,
        unread: query.unreadOnly ? "true" : undefined,
      },
    });

    const data = extractData<{ notifications?: Notification[] } | Notification[]>(
      response,
    );
    return Array.isArray(data) ? data : data.notifications || [];
  }

  async markAsRead(notificationId: string): Promise<void> {
    await api.post(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.post("/notifications/read-all");
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  }

  async clearNotifications(clearAll: boolean = true): Promise<void> {
    await api.delete("/notifications/clear", {
      params: { all: clearAll ? "true" : "false" },
    });
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get("/notifications/count");
    const data = extractData<{ unreadCount?: number }>(response);
    return data.unreadCount ?? 0;
  }
}

export const profileNotificationsService = new ProfileNotificationsService();
export default profileNotificationsService;
