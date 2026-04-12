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

export interface CreateVenueData {
  name: string;
  description_bg: string;
  description_en: string;
  address: string;
  city_id: number;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  price_range: '$' | '$$' | '$$$';
  amenities?: string[];
  training_type_ids?: number[];
}

export type UpdateVenueData = Partial<CreateVenueData>;

export const venuesApi = {
  getAll: () => api.get<Venue[]>('/venues').then((r) => r.data),
  getOne: (id: string) => api.get<Venue>(`/venues/${id}`).then((r) => r.data),
  create: (data: CreateVenueData) =>
    api.post<Venue>('/venues', data).then((r) => r.data),
  update: (id: string, data: UpdateVenueData) =>
    api.patch<Venue>(`/venues/${id}`, data).then((r) => r.data),
  uploadPhoto: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<Venue>(`/venues/${id}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  removePhoto: (id: string, photoUrl: string) =>
    api.delete<Venue>(`/venues/${id}/photos`, { data: { photoUrl } }).then((r) => r.data),
  verify: (id: string, verified: boolean) =>
    api.patch<Venue>(`/venues/${id}/verify`, { verified }).then((r) => r.data),
  feature: (id: string, featured: boolean) =>
    api.patch<Venue>(`/venues/${id}/feature`, { featured }).then((r) => r.data),
  remove: (id: string) =>
    api.delete(`/venues/${id}`).then((r) => r.data),
};
