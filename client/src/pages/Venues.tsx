import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { venuesApi, type Venue } from '../api/venues';
import { citiesApi, type City } from '../api/cities';
import { trainingTypesApi, type TrainingType } from '../api/training-types';
import { VenuesMap, type MapMarker } from '../components/Map';
import { StarsDisplay } from '../components/Stars';
import { favoritesApi } from '../api/favorites';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const ITEMS_PER_PAGE = 12;

export default function Venues() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [search, setSearch] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [priceFilter, setPriceFilter] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('');

  const selectedCity = searchParams.get('city');
  const selectedType = searchParams.get('type');

  useEffect(() => {
    venuesApi.getAll().then(setVenues);
    citiesApi.getAll().then(setCities);
    trainingTypesApi.getAll().then(setTrainingTypes);
  }, []);

  useEffect(() => {
    if (user) favoritesApi.getIds().then((ids) => setFavIds(new Set(ids)));
  }, [user]);

  const toggleFav = async (e: React.MouseEvent, venueId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      const { favorited } = await favoritesApi.toggle(venueId);
      setFavIds((prev) => {
        const next = new Set(prev);
        if (favorited) next.add(venueId); else next.delete(venueId);
        return next;
      });
    } catch { /* silently fail */ }
  };

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      if (selectedCity && v.city_id !== Number(selectedCity)) return false;
      if (
        selectedType &&
        !v.trainingTypes?.some((tt) => tt.id === Number(selectedType))
      )
        return false;
      if (
        search &&
        !v.name.toLowerCase().includes(search.toLowerCase()) &&
        !v.address.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (priceFilter && v.price_range !== priceFilter) return false;
      if (ratingFilter && (v.avg_rating || 0) < Number(ratingFilter)) return false;
      return true;
    });
  }, [venues, selectedCity, selectedType, search, priceFilter, ratingFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => setPage(1), [search, selectedCity, selectedType, priceFilter, ratingFilter]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const markers: MapMarker[] = useMemo(
    () =>
      filtered
        .filter((v) => v.latitude && v.longitude)
        .map((v) => ({
          id: v.id,
          lat: Number(v.latitude),
          lng: Number(v.longitude),
          name: v.name,
          label: v.city ? t(v.city) : undefined,
        })),
    [filtered, t],
  );

  return (
    <div className="venues-page">
      <div className="venues-header">
        <h1>{lang === 'bg' ? 'Зали' : 'Venues'}</h1>
        <button
          className={`btn ${showMap ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setShowMap(!showMap)}
        >
          {showMap
            ? (lang === 'bg' ? 'Списък' : 'List View')
            : (lang === 'bg' ? 'Карта' : 'Map View')}
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder={lang === 'bg' ? 'Търси по име или адрес...' : 'Search by name or address...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="filter-row">
          <select
            value={selectedCity ?? ''}
            onChange={(e) => updateFilter('city', e.target.value || null)}
          >
            <option value="">{lang === 'bg' ? 'Всички Градове' : 'All Cities'}</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c)}
              </option>
            ))}
          </select>

          <select
            value={selectedType ?? ''}
            onChange={(e) => updateFilter('type', e.target.value || null)}
          >
            <option value="">{lang === 'bg' ? 'Всички Видове' : 'All Training Types'}</option>
            {trainingTypes.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {t(tt)}
              </option>
            ))}
          </select>

          <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
            <option value="">{lang === 'bg' ? 'Всички Цени' : 'All Prices'}</option>
            <option value="€">€ — {lang === 'bg' ? 'Бюджетно' : 'Budget'}</option>
            <option value="€€">€€ — {lang === 'bg' ? 'Средно' : 'Mid-range'}</option>
            <option value="€€€">€€€ — {lang === 'bg' ? 'Премиум' : 'Premium'}</option>
          </select>

          <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
            <option value="">{lang === 'bg' ? 'Всички Оценки' : 'All Ratings'}</option>
            <option value="4">4+ ★</option>
            <option value="3">3+ ★</option>
            <option value="2">2+ ★</option>
            <option value="1">1+ ★</option>
          </select>
        </div>
      </div>

      {showMap && markers.length > 0 && (
        <div className="venues-map-wrapper">
          <VenuesMap
            markers={markers}
            onMarkerClick={(id) => navigate(`/venues/${id}`)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="no-results">{lang === 'bg' ? 'Няма намерени зали' : 'No venues found'}</p>
      ) : !showMap ? (
        <>
          <div className="card-grid">
            {paginated.map((venue) => (
              <div key={venue.id} className="venue-card-wrapper">
                <Link
                  to={`/venues/${venue.id}`}
                  className="venue-card"
                >
                  <div className="venue-card-header">
                    <h3>{venue.name}</h3>
                    <span className="venue-price">{venue.price_range}</span>
                  </div>
                  <p className="venue-city">{venue.city ? t(venue.city) : ''}</p>
                  <p className="venue-address">{venue.address}</p>
                  <div className="venue-tags">
                    {venue.trainingTypes?.map((tt) => (
                      <span key={tt.id} className="tag-small">
                        {t(tt)}
                      </span>
                    ))}
                  </div>
                  <div className="venue-card-footer">
                    <div className="venue-badges">
                      {venue.is_verified && <span className="badge verified">{lang === 'bg' ? 'Верифицирана' : 'Verified'}</span>}
                      {venue.is_featured && <span className="badge featured">{lang === 'bg' ? 'Препоръчана' : 'Featured'}</span>}
                    </div>
                    {venue.avg_rating > 0 && (
                      <span className="venue-card-rating">
                        <StarsDisplay rating={venue.avg_rating} size={14} />
                        <span className="rating-text">{venue.avg_rating.toFixed(1)} ({venue.review_count})</span>
                      </span>
                    )}
                  </div>
                </Link>
                <button
                  className={`fav-btn ${favIds.has(venue.id) ? 'fav-active' : ''}`}
                  onClick={(e) => toggleFav(e, venue.id)}
                  title={favIds.has(venue.id)
                    ? (lang === 'bg' ? 'Премахни от любими' : 'Remove from favorites')
                    : (lang === 'bg' ? 'Добави в любими' : 'Add to favorites')}
                >
                  {favIds.has(venue.id) ? '\u2665' : '\u2661'}
                </button>
              </div>
            ))}
          </div>

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
        </>
      ) : null}
    </div>
  );
}
