import api from './client';
import type { Schedule } from './schedules';

export interface Trainer {
  id: string;
  venue_id: string;
  name: string;
  bio_bg: string | null;
  bio_en: string | null;
  photo_url: string | null;
  specialties: string[];
  venue?: { id: string; name: string };
  schedules?: Schedule[];
}

export const trainersApi = {
  getAll: () =>
    api.get<Trainer[]>('/trainers').then((r) => r.data),

  getByVenue: (venueId: string) =>
    api.get<Trainer[]>('/trainers', { params: { venue_id: venueId } }).then((r) => r.data),

  getOne: (id: string) =>
    api.get<Trainer>(`/trainers/${id}`).then((r) => r.data),
};
