import api from './api';
import { User } from '@/types';

export const userService = {
  async getAllUsers(params?: any): Promise<User[]> {
    const response = await api.get<{ status: string; data: { users: User[] } }>('/users', { params });
    return response.data.data.users;
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get<{ status: string; data: { user: User } }>(`/users/${id}`);
    return response.data.data.user;
  },

  async updateProfile(data: any): Promise<User> {
    const response = await api.put<{ status: string; data: { user: User } }>('/users/profile', data);
    return response.data.data.user;
  },
};
