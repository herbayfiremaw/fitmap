import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
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
