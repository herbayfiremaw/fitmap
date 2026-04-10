import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { venuesApi, type Venue } from '../api/venues';
import { citiesApi, type City } from '../api/cities';
import { trainingTypesApi, type TrainingType } from '../api/training-types';

export default function Venues() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [search, setSearch] = useState('');

  const selectedCity = searchParams.get('city');
  const selectedType = searchParams.get('type');

  useEffect(() => {
    venuesApi.getAll().then(setVenues);
    citiesApi.getAll().then(setCities);
    trainingTypesApi.getAll().then(setTrainingTypes);
  }, []);

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
      return true;
    });
  }, [venues, selectedCity, selectedType, search]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  return (
    <div className="venues-page">
      <h1>Venues</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="filter-row">
          <select
            value={selectedCity ?? ''}
            onChange={(e) => updateFilter('city', e.target.value || null)}
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>

          <select
            value={selectedType ?? ''}
            onChange={(e) => updateFilter('type', e.target.value || null)}
          >
            <option value="">All Training Types</option>
            {trainingTypes.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="no-results">No venues found</p>
      ) : (
        <div className="card-grid">
          {filtered.map((venue) => (
            <Link
              key={venue.id}
              to={`/venues/${venue.id}`}
              className="venue-card"
            >
              <div className="venue-card-header">
                <h3>{venue.name}</h3>
                <span className="venue-price">{venue.price_range}</span>
              </div>
              <p className="venue-city">{venue.city?.name_en}</p>
              <p className="venue-address">{venue.address}</p>
              <div className="venue-tags">
                {venue.trainingTypes?.map((tt) => (
                  <span key={tt.id} className="tag-small">
                    {tt.name_en}
                  </span>
                ))}
              </div>
              <div className="venue-badges">
                {venue.is_verified && <span className="badge verified">Verified</span>}
                {venue.is_featured && <span className="badge featured">Featured</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
