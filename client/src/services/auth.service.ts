import api from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
  async login(credentials: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(data: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<{ status: string; data: { user: User } }>('/auth/me');
    return response.data.data.user;
  },

  logout() {
    localStorage.removeItem('token');
  },
};
