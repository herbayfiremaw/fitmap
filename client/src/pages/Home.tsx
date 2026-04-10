import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { citiesApi, type City } from '../api/cities';
import { trainingTypesApi, type TrainingType } from '../api/training-types';
import { venuesApi, type Venue } from '../api/venues';
import type { MapMarker } from '../components/Map';
import fullLogo from '../assets/fitmap-logo-full.svg';

const LazyVenuesMap = lazy(() =>
  import('../components/Map').then((m) => ({ default: m.VenuesMap })),
);

export default function Home() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    citiesApi.getAll().then(setCities);
    trainingTypesApi.getAll().then(setTrainingTypes);
    venuesApi.getAll().then(setVenues);
  }, []);

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
          label: v.city?.name_en,
        })),
    [venues],
  );

  return (
    <div className="home">
      <section className="hero">
        <img src={fullLogo} alt="FitMap" className="hero-logo" />
        <p>Discover gyms, studios, and fitness venues across Bulgaria</p>
        <Link to="/venues" className="btn btn-primary">
          Browse Venues
        </Link>
      </section>

      <section className="section">
        <h2>Cities</h2>
        <div className="city-grid">
          {cities.map((city) => (
            <button
              key={city.id}
              className="city-card"
              onClick={() => navigate(`/venues?city=${city.id}`)}
            >
              <img
                src={`/cities/${city.slug}.jpg`}
                alt={city.name_en}
                className="city-img"
              />
              <div className="city-overlay">
                <span className="city-name">{city.name_en}</span>
                <span className="city-name-bg">{city.name_bg}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {markers.length > 0 && (
        <section className="section">
          <h2>Explore Venues on the Map</h2>
          <div className="home-map-wrapper">
            <Suspense fallback={<div style={{ height: 500 }}>Loading map...</div>}>
              <LazyVenuesMap
                markers={markers}
                onMarkerClick={(id) => navigate(`/venues/${id}`)}
              />
            </Suspense>
          </div>
        </section>
      )}

      <section className="section">
        <h2>Training Types</h2>
        <div className="tag-grid">
          {trainingTypes.map((tt) => (
            <button
              key={tt.id}
              className="tag"
              onClick={() => navigate(`/venues?type=${tt.id}`)}
            >
              {tt.name_en}
            </button>
          ))}
        </div>
      </section>

      {featuredVenues.length > 0 && (
        <section className="section">
          <h2>Featured Venues</h2>
          <div className="card-grid">
            {featuredVenues.map((venue) => (
              <Link
                key={venue.id}
                to={`/venues/${venue.id}`}
                className="venue-card"
              >
                <h3>{venue.name}</h3>
                <p className="venue-city">{venue.city?.name_en}</p>
                <p className="venue-address">{venue.address}</p>
                <div className="venue-tags">
                  {venue.trainingTypes?.map((tt) => (
                    <span key={tt.id} className="tag-small">
                      {tt.name_en}
                    </span>
                  ))}
                </div>
                <span className="venue-price">{venue.price_range}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
