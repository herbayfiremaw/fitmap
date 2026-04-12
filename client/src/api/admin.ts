import api from './client';

export interface DashboardStats {
  totalUsers: number;
  totalVenues: number;
  totalReviews: number;
  verifiedVenues: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  avatar_url: string | null;
  created_at: string;
}

export const adminApi = {
  getStats: () =>
    api.get<DashboardStats>('/admin/stats').then((r) => r.data),

  getUsers: () =>
    api.get<AdminUser[]>('/admin/users').then((r) => r.data),

  changeRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),

  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`).then((r) => r.data),
};
