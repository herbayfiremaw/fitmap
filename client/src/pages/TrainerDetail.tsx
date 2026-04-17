import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trainersApi, type Trainer } from '../api/trainers';
import { dayName } from '../api/schedules';
import { useLang } from '../context/LangContext';

export default function TrainerDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLang();
  const [trainer, setTrainer] = useState<Trainer | null>(null);

  useEffect(() => {
    if (id) trainersApi.getOne(id).then(setTrainer);
  }, [id]);

  if (!trainer) return <p>{lang === 'bg' ? 'Зареждане...' : 'Loading...'}</p>;

  const bio = lang === 'bg' ? trainer.bio_bg : trainer.bio_en;
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  // Group schedules by day
  const schedulesByDay = (trainer.schedules || []).reduce<Record<number, typeof trainer.schedules>>((acc, s) => {
    (acc[s.day_of_week] ??= []).push(s);
    return acc;
  }, {});
  const sortedDays = Object.keys(schedulesByDay).map(Number).sort((a, b) => a - b);

  return (
    <div className="trainer-detail">
      <Link to="/trainers" className="back-link">
        &larr; {lang === 'bg' ? 'Всички Треньори' : 'All Trainers'}
      </Link>

      {/* Hero section */}
      <div className="trainer-hero">
        <div className="trainer-profile-avatar large">
          {trainer.photo_url ? (
            <img
              src={trainer.photo_url.startsWith('/') ? `${baseUrl}${trainer.photo_url}` : trainer.photo_url}
              alt={t(trainer)}
            />
          ) : (
            <span>{t(trainer).charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="trainer-profile-info">
          <h1>{t(trainer)}</h1>
          {trainer.venue && (
            <p className="trainer-venue-link">
              {lang === 'bg' ? 'Треньор в ' : 'Trainer at '}
              <Link to={`/venues/${trainer.venue.id}`}>{trainer.venue.name}</Link>
            </p>
          )}
          {trainer.specialties.length > 0 && (
            <div className="trainer-specialties">
              {trainer.specialties.map((s) => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="trainer-content">
        {/* Bio */}
        <div className="trainer-section">
          <h2>{lang === 'bg' ? 'За мен' : 'About'}</h2>
          {bio ? (
            <p className="trainer-bio-text">{bio}</p>
          ) : (
            <p className="trainer-bio-empty">
              {lang === 'bg' ? 'Няма добавена биография.' : 'No bio added yet.'}
            </p>
          )}
        </div>

        {/* Quick stats */}
        <div className="trainer-stats">
          <div className="trainer-stat">
            <span className="trainer-stat-number">{trainer.specialties.length}</span>
            <span className="trainer-stat-label">{lang === 'bg' ? 'Специалности' : 'Specialties'}</span>
          </div>
          <div className="trainer-stat">
            <span className="trainer-stat-number">{(trainer.schedules || []).length}</span>
            <span className="trainer-stat-label">{lang === 'bg' ? 'Тренировки/седмица' : 'Sessions/week'}</span>
          </div>
          <div className="trainer-stat">
            <span className="trainer-stat-number">{sortedDays.length}</span>
            <span className="trainer-stat-label">{lang === 'bg' ? 'Дни/седмица' : 'Days/week'}</span>
          </div>
        </div>

        {/* Schedule */}
        {sortedDays.length > 0 && (
          <div className="trainer-section">
            <h2>{lang === 'bg' ? 'Седмична Програма' : 'Weekly Schedule'}</h2>
            <div className="trainer-schedule-grid">
              {sortedDays.map((day) => (
                <div key={day} className="trainer-day-card">
                  <h3 className="trainer-day-name">{dayName(day, lang)}</h3>
                  {schedulesByDay[day]!.map((s) => (
                    <div key={s.id} className="trainer-session">
                      <span className="trainer-session-time">{s.start_time} - {s.end_time}</span>
                      <span className="trainer-session-type">{s.trainingType ? t(s.trainingType) : ''}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Venue card */}
        {trainer.venue && (
          <div className="trainer-section">
            <h2>{lang === 'bg' ? 'Зала' : 'Venue'}</h2>
            <Link to={`/venues/${trainer.venue.id}`} className="trainer-venue-card">
              <span className="trainer-venue-card-name">{trainer.venue.name}</span>
              <span className="trainer-venue-card-arrow">&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
