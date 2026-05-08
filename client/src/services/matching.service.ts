import api from './api';
import { Team, User } from '@/types';

export interface MatchResult<T> {
  item: T;
  score: number;
}

export const matchingService = {
  async recommendTeams(): Promise<MatchResult<Team>[]> {
    const response = await api.get<{ status: string; data: { recommendations: MatchResult<Team>[] } }>('/matching/teams');
    return response.data.data.recommendations;
  },

  async recommendTeammates(): Promise<MatchResult<User>[]> {
    const response = await api.get<{ status: string; data: { recommendations: MatchResult<User>[] } }>('/matching/users');
    return response.data.data.recommendations;
  },
};
