import api from './client';

export interface TrainingType {
  id: number;
  name_bg: string;
  name_en: string;
  slug: string;
  icon: string;
}

export const trainingTypesApi = {
  getAll: () => api.get<TrainingType[]>('/training-types').then((r) => r.data),
};
