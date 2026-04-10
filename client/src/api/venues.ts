import api from './client';
import type { City } from './cities';
import type { TrainingType } from './training-types';

export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  description_bg: string;
  description_en: string;
  address: string;
  city_id: number;
  city: City;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string | null;
  price_range: '$' | '$$' | '$$$';
  amenities: string[];
  photos: string[];
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  trainingTypes: TrainingType[];
}

export const venuesApi = {
  getAll: () => api.get<Venue[]>('/venues').then((r) => r.data),
  getOne: (id: string) => api.get<Venue>(`/venues/${id}`).then((r) => r.data),
};
