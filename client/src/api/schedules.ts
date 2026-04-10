import api from './client';

export interface Schedule {
  id: string;
  venue_id: string;
  training_type_id: number;
  trainer_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  trainingType: { id: number; name_en: string; name_bg: string };
  trainer: { id: string; name: string } | null;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const dayName = (day: number) => DAYS[day];

export const schedulesApi = {
  getByVenue: (venueId: string) =>
    api.get<Schedule[]>('/schedules', { params: { venue_id: venueId } }).then((r) => r.data),
};
