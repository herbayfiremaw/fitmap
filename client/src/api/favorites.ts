import api from './client';
import type { Venue } from './venues';

export interface Favorite {
  id: string;
  venue_id: string;
  venue: Venue;
  created_at: string;
}

export const favoritesApi = {
  getAll: () =>
    api.get<Favorite[]>('/favorites').then((r) => r.data),

  getIds: () =>
    api.get<string[]>('/favorites/ids').then((r) => r.data),

  toggle: (venueId: string) =>
    api.post<{ favorited: boolean }>(`/favorites/${venueId}`).then((r) => r.data),
};
