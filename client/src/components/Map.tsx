import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';

const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  name: string;
  label?: string;
}

interface SingleMapProps {
  lat: number;
  lng: number;
  name: string;
  zoom?: number;
}

interface MultiMapProps {
  markers: MapMarker[];
  onMarkerClick?: (id: string) => void;
}

export function VenueMap({ lat, lng, name, zoom = 15 }: SingleMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      className="map-container"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={markerIcon}>
        <Popup>{name}</Popup>
      </Marker>
    </MapContainer>
  );
}

/* ---- Location Picker (click-to-pin + search) ---- */

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  lang?: 'bg' | 'en';
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.flyTo([lat, lng], map.getZoom(), { duration: 0.5 });
  return null;
}

export function LocationPicker({ lat, lng, onChange, lang = 'en' }: LocationPickerProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=bg`,
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat: newLat, lon: newLng } = data[0];
        const parsedLat = parseFloat(newLat);
        const parsedLng = parseFloat(newLng);
        onChange(parsedLat, parsedLng);
        setFlyTarget({ lat: parsedLat, lng: parsedLng });
      }
    } catch { /* nominatim fail — user can still click */ }
    setSearching(false);
  };

  const center: [number, number] = lat && lng ? [lat, lng] : [42.6977, 23.3219];

  return (
    <div className="location-picker">
      <div className="location-search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          placeholder={lang === 'bg' ? 'Търси адрес...' : 'Search address...'}
        />
        <button type="button" className="btn-sm btn-outline" onClick={handleSearch} disabled={searching}>
          {searching ? '...' : (lang === 'bg' ? 'Търси' : 'Search')}
        </button>
      </div>
      <MapContainer
        center={center}
        zoom={lat && lng ? 15 : 8}
        className="map-container location-picker-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={(newLat, newLng) => { onChange(newLat, newLng); setFlyTarget(null); }} />
        {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
        {lat !== 0 && lng !== 0 && (
          <Marker position={[lat, lng]} icon={markerIcon}>
            <Popup>{lat.toFixed(5)}, {lng.toFixed(5)}</Popup>
          </Marker>
        )}
      </MapContainer>
      <small className="location-hint">
        {lang === 'bg' ? 'Кликнете върху картата или потърсете адрес' : 'Click on the map or search for an address'}
      </small>
    </div>
  );
}

export function VenuesMap({ markers, onMarkerClick }: MultiMapProps) {
  const center: [number, number] = markers.length > 0
    ? [
        markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
        markers.reduce((sum, m) => sum + m.lng, 0) / markers.length,
      ]
    : [42.7, 25.5]; // Center of Bulgaria

  return (
    <MapContainer
      center={center}
      zoom={7}
      className="map-container map-large"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={markerIcon}>
          <Popup>
            <strong
              style={{ cursor: onMarkerClick ? 'pointer' : 'default' }}
              onClick={() => onMarkerClick?.(m.id)}
            >
              {m.name}
            </strong>
            {m.label && <br />}
            {m.label}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
