import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { trainersApi, type Trainer } from '../api/trainers';
import { useLang } from '../context/LangContext';

const ITEMS_PER_PAGE = 12;
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function Trainers() {
  const { lang } = useLang();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    trainersApi.getAll().then(setTrainers);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return trainers;
    const q = search.toLowerCase();
    return trainers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.specialties.some((s) => s.toLowerCase().includes(q)),
    );
  }, [trainers, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => setPage(1), [search]);

  return (
    <div className="trainers-page">
      <h1>{lang === 'bg' ? 'Треньори' : 'Trainers'}</h1>

      <input
        type="text"
        placeholder={lang === 'bg' ? 'Търси треньор...' : 'Search trainers...'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {paginated.length === 0 ? (
        <p className="no-results">{lang === 'bg' ? 'Няма намерени треньори' : 'No trainers found'}</p>
      ) : (
        <div className="card-grid">
          {paginated.map((trainer) => (
            <Link key={trainer.id} to={`/trainers/${trainer.id}`} className="trainer-card">
              <div className="trainer-card-avatar">
                {trainer.photo_url ? (
                  <img
                    src={trainer.photo_url.startsWith('/') ? `${apiUrl}${trainer.photo_url}` : trainer.photo_url}
                    alt={trainer.name}
                  />
                ) : (
                  <span>{trainer.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3>{trainer.name}</h3>
              {trainer.venue && (
                <p className="trainer-venue">{trainer.venue.name}</p>
              )}
              {trainer.specialties.length > 0 && (
                <div className="venue-tags">
                  {trainer.specialties.slice(0, 3).map((s) => (
                    <span key={s} className="tag-small">{s}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-sm btn-outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            {lang === 'bg' ? 'Назад' : 'Prev'}
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`btn-sm ${page === i + 1 ? 'btn-active' : 'btn-outline'}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn-sm btn-outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            {lang === 'bg' ? 'Напред' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
