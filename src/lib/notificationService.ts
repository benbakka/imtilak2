import { apiClient, PaginatedResponse } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'delay' | 'deadline' | 'completion' | 'payment' | 'general';
  isRead: boolean;
  createdAt: string;
  categoryTeamId?: string;
  projectId?: string;
  unitId?: string;
  categoryId?: string;
  teamId?: string;
}

export class NotificationService {
  static async getNotifications(
    userId: string,
    page = 0,
    size = 20,
    onlyUnread = false
  ): Promise<PaginatedResponse<Notification>> {
    const params = {
      page: page.toString(),
      size: size.toString(),
    };

    if (onlyUnread) {
      params.unread = true;
    }

    // Corrected endpoint path
    const url = `/notifications/user/${userId}`;

    return apiClient.get<PaginatedResponse<Notification>>(url, params);
  }

  static async getNotificationCount(userId: string): Promise<number> {
    return apiClient.get<number>('/notifications/count', { userId: userId });
  }

  static async markAsRead(notificationId: string): Promise<void> {
    return apiClient.post<void>(`/notifications/${notificationId}/read`, {});
  }

  static async markAllAsRead(userId: string): Promise<void> {
    return apiClient.post<void>('/notifications/read-all', { userId: userId });
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete<void>(`/notifications/${notificationId}`);
  }

  static async getDelayNotifications(
    companyId: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<Notification>> {
    return apiClient.get<PaginatedResponse<Notification>>('/notifications/delays', {
      companyId: companyId,
      page: page.toString(),
      size: size.toString()
    });
  }

  static async getPaymentNotifications(
    companyId: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<Notification>> {
    return apiClient.get<PaginatedResponse<Notification>>('/notifications/payments', {
      companyId: companyId,
      page: page.toString(),
      size: size.toString()
    });
  }
}