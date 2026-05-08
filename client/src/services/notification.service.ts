import api from './api';
import { Notification } from '@/types';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<{ status: string; data: { notifications: Notification[] } }>('/notifications');
    return response.data.data.notifications;
  },

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },
};
