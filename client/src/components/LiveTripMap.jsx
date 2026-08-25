// Live trip map — shows the driver's moving location and the pickup point,
// using free OpenStreetMap tiles (no API key, no billing).
//
// Props:
//   driver: [lng, lat] | null   — latest driver location (updates live)
//   pickup: [lng, lat] | null   — pickup point (static)

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker images don't resolve under Vite's bundler, so point
// them at the CDN copies explicitly. Done once at module load.
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetina = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const pickupIcon = new L.Icon({
  iconUrl, iconRetinaUrl: iconRetina, shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// A simple colored circle for the driver so it's visually distinct from pickup.
const driverIcon = L.divIcon({
  className: '',
  html: '<div style="background:#e07a2f;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,.4)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Recenters the map when the driver location changes.
function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position?.[0], position?.[1]]);
  return null;
}

// react-leaflet expects [lat, lng]; our coords are stored [lng, lat].
const toLatLng = (c) => (Array.isArray(c) && c.length === 2 ? [c[1], c[0]] : null);

export default function LiveTripMap({ driver, pickup }) {
  const driverLatLng = toLatLng(driver);
  const pickupLatLng = toLatLng(pickup);
  const center = driverLatLng || pickupLatLng;

  if (!center) {
    return (
      <div className="bg-gray-100 rounded-md p-4 text-sm text-gray-500 text-center">
        Waiting for the driver's location…
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-hidden border" style={{ height: 240 }}>
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pickupLatLng && (
          <Marker position={pickupLatLng} icon={pickupIcon}>
            <Popup>Pickup</Popup>
          </Marker>
        )}
        {driverLatLng && (
          <Marker position={driverLatLng} icon={driverIcon}>
            <Popup>Driver</Popup>
          </Marker>
        )}
        <Recenter position={driverLatLng} />
      </MapContainer>
    </div>
  );
}
