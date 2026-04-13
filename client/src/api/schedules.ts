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
  trainer: { id: string; name_bg: string; name_en: string } | null;
}

const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_BG = ['Неделя', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота'];

export const dayName = (day: number, lang: 'en' | 'bg' = 'en') =>
  lang === 'bg' ? DAYS_BG[day] : DAYS_EN[day];

export interface CreateScheduleData {
  venue_id: string;
  training_type_id: number;
  trainer_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export const schedulesApi = {
  getByVenue: (venueId: string) =>
    api.get<Schedule[]>('/schedules', { params: { venue_id: venueId } }).then((r) => r.data),
  create: (data: CreateScheduleData) =>
    api.post<Schedule>('/schedules', data).then((r) => r.data),
  remove: (id: string) =>
    api.delete(`/schedules/${id}`).then(() => undefined),
};
