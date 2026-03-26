import api from './axios';
import { LeaderboardData, HeatmapData, UserBadges } from '../types';

export const getLeaderboard = (period: string = 'weekly') =>
  api.get<LeaderboardData>(`/api/stats/leaderboard?period=${period}`);

export const getHeatmap = () =>
  api.get<HeatmapData>('/api/stats/heatmap');

export const getUserBadges = (userId: number) =>
  api.get<UserBadges>(`/api/stats/badges/${userId}`);
