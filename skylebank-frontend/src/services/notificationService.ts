import { apiClient } from './apiClient';

export interface NotificationInfo {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  async getNotifications(): Promise<NotificationInfo[]> {
    const response = await apiClient.get<NotificationInfo[]>('/api/v1/notifications');
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/api/v1/notifications/unread-count');
    return response.data.count;
  }

  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(`/api/v1/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/api/v1/notifications/read-all');
  }
}

export const notificationService = new NotificationService();
