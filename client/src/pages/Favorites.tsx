import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { favoritesApi, type Favorite } from '../api/favorites';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Favorites() {
  const { user } = useAuth();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    favoritesApi.getAll().then((data) => {
      setFavorites(data);
      setLoading(false);
    });
  }, [user, navigate]);

  const handleRemove = async (venueId: string) => {
    try {
      await favoritesApi.toggle(venueId);
      setFavorites((prev) => prev.filter((f) => f.venue_id !== venueId));
    } catch { /* silently fail */ }
  };

  if (loading) return <p>{lang === 'bg' ? 'Зареждане...' : 'Loading...'}</p>;

  return (
    <div className="favorites-page">
      <h1>{lang === 'bg' ? 'Любими Зали' : 'Favorite Venues'}</h1>

      {favorites.length === 0 ? (
        <div className="no-results">
          <p>{lang === 'bg' ? 'Все още нямате любими зали.' : 'You haven\'t saved any favorites yet.'}</p>
          <Link to="/venues" className="btn btn-primary">
            {lang === 'bg' ? 'Разгледай Зали' : 'Browse Venues'}
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {favorites.map((fav) => (
            <div key={fav.id} className="venue-card favorite-card">
              <Link to={`/venues/${fav.venue.id}`} className="favorite-card-link">
                <div className="venue-card-header">
                  <h3>{fav.venue.name}</h3>
                  <span className="venue-price">{fav.venue.price_range}</span>
                </div>
                <p className="venue-city">{fav.venue.city ? t(fav.venue.city) : ''}</p>
                <p className="venue-address">{fav.venue.address}</p>
                <div className="venue-tags">
                  {fav.venue.trainingTypes?.map((tt) => (
                    <span key={tt.id} className="tag-small">{t(tt)}</span>
                  ))}
                </div>
              </Link>
              <button
                className="favorite-remove"
                onClick={() => handleRemove(fav.venue_id)}
                title={lang === 'bg' ? 'Премахни от любими' : 'Remove from favorites'}
              >
                &#x2665;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
