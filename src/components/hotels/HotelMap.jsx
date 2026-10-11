import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../common/Button';
import './HotelMap.css';

// Fix for default Leaflet marker icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const HotelMap = ({ latitude, longitude, title }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [geoStatus, setGeoStatus] = useState(''); // 'requesting', 'success', 'error'

  const isValidCoordinates = 
    latitude != null && longitude != null && 
    !isNaN(latitude) && !isNaN(longitude) &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180;

  if (!isValidCoordinates) {
    return (
      <div className="hotel-map-error">
        <h3>Location unavailable</h3>
        <p>Invalid hotel coordinates.</p>
      </div>
    );
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Location services are not supported by this browser.');
      setGeoStatus('error');
      return;
    }

    setGeoStatus('requesting');
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGeoStatus('success');
      },
      (error) => {
        setGeoStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location access was denied. You can still view the hotel\'s location.');
        } else {
          setGeoError('Unable to determine your current location.');
        }
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="hotel-map-container">
      <div className="hotel-map-header">
        <Button 
          variant="secondary" 
          onClick={handleUseMyLocation}
          disabled={geoStatus === 'requesting'}
        >
          {geoStatus === 'requesting' ? 'Locating...' : 'Use My Location'}
        </Button>
        {geoStatus === 'success' && <span className="geo-success-msg">Your location detected.</span>}
        {geoStatus === 'error' && <span className="geo-error-msg">{geoError}</span>}
      </div>

      <div className="map-wrapper">
        <MapContainer 
          center={[latitude, longitude]} 
          zoom={13} 
          scrollWheelZoom={false}
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={[latitude, longitude]}>
            <Popup>{title}</Popup>
          </Marker>

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default HotelMap;
