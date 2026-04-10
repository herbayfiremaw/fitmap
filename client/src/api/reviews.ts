import api from './client';

export interface Review {
  id: string;
  venue_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
}

export const reviewsApi = {
  getByVenue: (venueId: string) =>
    api.get<Review[]>('/reviews', { params: { venue_id: venueId } }).then((r) => r.data),

  create: (data: { venue_id: string; rating: number; comment: string }) =>
    api.post<Review>('/reviews', data).then((r) => r.data),

  remove: (id: string) => api.delete(`/reviews/${id}`),
};
