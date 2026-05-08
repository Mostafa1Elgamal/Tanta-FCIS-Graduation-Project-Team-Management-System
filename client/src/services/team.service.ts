import api from './api';
import { Team } from '@/types';

export const teamService = {
  async getAllTeams(params?: any): Promise<Team[]> {
    const response = await api.get<{ status: string; data: { teams: Team[] } }>('/teams', { params });
    return response.data.data.teams;
  },

  async getTeam(id: string): Promise<Team> {
    const response = await api.get<{ status: string; data: { team: Team } }>(`/teams/${id}`);
    return response.data.data.team;
  },

  async createTeam(data: any): Promise<Team> {
    const response = await api.post<{ status: string; data: { team: Team } }>('/teams', data);
    return response.data.data.team;
  },

  async updateTeam(id: string, data: any): Promise<Team> {
    const response = await api.put<{ status: string; data: { team: Team } }>(`/teams/${id}`, data);
    return response.data.data.team;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  async addMember(teamId: string, data: { phoneNumber: string; role?: string }): Promise<any> {
    const response = await api.post(`/teams/${teamId}/members`, data);
    return response.data;
  },

  async respondToSwitch(notificationId: string, decision: 'JOIN' | 'STAY'): Promise<any> {
    const response = await api.post('/teams/respond-switch', { notificationId, decision });
    return response.data;
  },
};
