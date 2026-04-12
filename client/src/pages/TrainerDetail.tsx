import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trainersApi, type Trainer } from '../api/trainers';
import { dayName } from '../api/schedules';
import { useLang } from '../context/LangContext';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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

  return (
    <div className="trainer-detail">
      <Link to="/trainers" className="back-link">
        {lang === 'bg' ? 'Назад към Треньорите' : 'Back to Trainers'}
      </Link>

      <div className="trainer-profile">
        <div className="trainer-profile-avatar">
          {trainer.photo_url ? (
            <img
              src={trainer.photo_url.startsWith('/') ? `${baseUrl}${trainer.photo_url}` : trainer.photo_url}
              alt={trainer.name}
            />
          ) : (
            <span>{trainer.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="trainer-profile-info">
          <h1>{trainer.name}</h1>
          {trainer.venue && (
            <p className="trainer-venue-link">
              <Link to={`/venues/${trainer.venue.id}`}>{trainer.venue.name}</Link>
            </p>
          )}
          {trainer.specialties.length > 0 && (
            <div className="venue-tags">
              {trainer.specialties.map((s) => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {bio && (
        <section className="section">
          <h2>{lang === 'bg' ? 'Биография' : 'About'}</h2>
          <p>{bio}</p>
        </section>
      )}

      {trainer.schedules && trainer.schedules.length > 0 && (
        <section className="section">
          <h2>{lang === 'bg' ? 'Програма' : 'Schedule'}</h2>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>{lang === 'bg' ? 'Ден' : 'Day'}</th>
                <th>{lang === 'bg' ? 'Час' : 'Time'}</th>
                <th>{lang === 'bg' ? 'Тренировка' : 'Training'}</th>
                <th>{lang === 'bg' ? 'Зала' : 'Venue'}</th>
              </tr>
            </thead>
            <tbody>
              {trainer.schedules.map((s) => (
                <tr key={s.id}>
                  <td>{dayName(s.day_of_week)}</td>
                  <td>{s.start_time} - {s.end_time}</td>
                  <td>{s.trainingType ? t(s.trainingType) : ''}</td>
                  <td>
                    <Link to={`/venues/${s.venue_id}`}>
                      {trainer.venue?.name || (lang === 'bg' ? 'Виж зала' : 'View venue')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
