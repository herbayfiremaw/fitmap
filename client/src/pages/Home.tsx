import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { citiesApi, type City } from '../api/cities';
import { trainingTypesApi, type TrainingType } from '../api/training-types';
import { venuesApi, type Venue } from '../api/venues';
import type { MapMarker } from '../components/Map';
import { useRevealAll } from '../hooks/useReveal';
import { useLang } from '../context/LangContext';
import fullLogo from '../assets/fitmap-logo-full.svg';

const LazyVenuesMap = lazy(() =>
  import('../components/Map').then((m) => ({ default: m.VenuesMap })),
);

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const photoSrc = (url: string) => url.startsWith('/') ? `${apiUrl}${url}` : url;

export default function Home() {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const [cities, setCities] = useState<City[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    citiesApi.getAll().then(setCities);
    trainingTypesApi.getAll().then(setTrainingTypes);
    venuesApi.getAll().then(setVenues);
  }, []);

  useRevealAll();

  const featuredVenues = useMemo(
    () => venues.filter((v) => v.is_featured).slice(0, 6),
    [venues],
  );

  const markers: MapMarker[] = useMemo(
    () =>
      venues
        .filter((v) => v.latitude && v.longitude)
        .map((v) => ({
          id: v.id,
          lat: Number(v.latitude),
          lng: Number(v.longitude),
          name: v.name,
          label: v.city ? t(v.city) : undefined,
        })),
    [venues, t],
  );

  return (
    <div className="home">
      <section className="hero">
        <img src={fullLogo} alt="FitMap" className="hero-logo" />
        <p>
          {lang === 'bg'
            ? 'Открийте фитнес зали и студиа в цяла България'
            : 'Discover gyms, studios, and fitness venues across Bulgaria'}
        </p>
        <Link to="/venues" className="btn btn-primary">
          {lang === 'bg' ? 'Разгледай Залите' : 'Browse Venues'}
        </Link>
      </section>

      <section className="section reveal stagger-children">
        <h2>{lang === 'bg' ? 'Градове' : 'Cities'}</h2>
        <div className="city-grid">
          {cities.map((city) => (
            <button
              key={city.id}
              className="city-card reveal-child"
              onClick={() => navigate(`/venues?city=${city.id}`)}
            >
              <img
                src={`/cities/${city.slug}.jpg`}
                alt={t(city)}
                className="city-img"
              />
              <div className="city-overlay">
                <span className="city-name">{t(city)}</span>
                {lang === 'en' && <span className="city-name-bg">{city.name_bg}</span>}
              </div>
            </button>
          ))}
        </div>
      </section>

      {markers.length > 0 && (
        <section className="section reveal">
          <h2>{lang === 'bg' ? 'Зали на Картата' : 'Explore Venues on the Map'}</h2>
          <div className="home-map-wrapper">
            <Suspense fallback={<div style={{ height: 500 }}>{lang === 'bg' ? 'Зареждане...' : 'Loading map...'}</div>}>
              <LazyVenuesMap
                markers={markers}
                onMarkerClick={(id) => navigate(`/venues/${id}`)}
              />
            </Suspense>
          </div>
        </section>
      )}

      <section className="section reveal stagger-children">
        <h2>{lang === 'bg' ? 'Видове Тренировки' : 'Training Types'}</h2>
        <div className="tag-grid">
          {trainingTypes.map((tt) => (
            <button
              key={tt.id}
              className="tag reveal-child"
              onClick={() => navigate(`/venues?type=${tt.id}`)}
            >
              {t(tt)}
            </button>
          ))}
        </div>
      </section>

      {featuredVenues.length > 0 && (
        <section className="section reveal stagger-children">
          <h2>{lang === 'bg' ? 'Препоръчани Зали' : 'Featured Venues'}</h2>
          <div className="card-grid">
            {featuredVenues.map((venue) => (
              <Link
                key={venue.id}
                to={`/venues/${venue.id}`}
                className="venue-card has-photo reveal-child"
              >
                {venue.photos?.length > 0 ? (
                  <div className="venue-card-img">
                    <img src={photoSrc(venue.photos[0])} alt={venue.name} />
                  </div>
                ) : (
                  <div className="venue-card-img venue-card-img-empty">
                    <span>{venue.name.charAt(0)}</span>
                  </div>
                )}
                <div className="venue-card-body">
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
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
