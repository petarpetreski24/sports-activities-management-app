import api from './axios';

export interface ReportDto {
  id: number;
  reporterId: number;
  reporterName: string;
  reportedUserId?: number;
  reportedUserName?: string;
  reportedEventId?: number;
  reportedEventTitle?: string;
  reportedCommentId?: number;
  reason: string;
  description?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export const create = (data: {
  reportedUserId?: number;
  reportedEventId?: number;
  reportedCommentId?: number;
  reason: string;
  description?: string;
}) => api.post<ReportDto>('/api/reports', data);

export const getMy = () => api.get<ReportDto[]>('/api/reports/my');

export const getAll = (status?: string, page = 1, pageSize = 20) =>
  api.get<{ items: ReportDto[]; totalCount: number }>(`/api/reports?status=${status || ''}&page=${page}&pageSize=${pageSize}`);

export const resolve = (id: number, data: { status: string; adminNotes?: string }) =>
  api.put<ReportDto>(`/api/reports/${id}/resolve`, data);
