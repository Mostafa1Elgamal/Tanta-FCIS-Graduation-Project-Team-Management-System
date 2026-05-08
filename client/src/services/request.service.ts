import api from './api';
import { TeamRequest } from '@/types';

export const requestService = {
  async getRequests(): Promise<TeamRequest[]> {
    const response = await api.get<{ status: string; data: { requests: TeamRequest[] } }>('/requests');
    return response.data.data.requests;
  },

  async applyToTeam(teamId: string, message?: string): Promise<TeamRequest> {
    const response = await api.post<{ status: string; data: { request: TeamRequest } }>('/requests/apply', { teamId, message });
    return response.data.data.request;
  },

  async inviteUser(userId: string, teamId: string, message?: string): Promise<TeamRequest> {
    const response = await api.post<{ status: string; data: { request: TeamRequest } }>('/requests/invite', { userId, teamId, message });
    return response.data.data.request;
  },

  async acceptRequest(requestId: string): Promise<void> {
    await api.put(`/requests/${requestId}/accept`);
  },

  async rejectRequest(requestId: string): Promise<void> {
    await api.put(`/requests/${requestId}/reject`);
  },
};
