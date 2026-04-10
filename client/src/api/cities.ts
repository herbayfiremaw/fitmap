import api from './client';

export interface City {
  id: number;
  name_bg: string;
  name_en: string;
  slug: string;
}

export const citiesApi = {
  getAll: () => api.get<City[]>('/cities').then((r) => r.data),
};
