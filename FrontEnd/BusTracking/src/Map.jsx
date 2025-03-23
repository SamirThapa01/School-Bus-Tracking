import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import './App.css';

function Map() {
  const [location, setLocation] = useState({ latitude: 51.505, longitude: -0.09 });
  useEffect(() => {
    const socket = io('http://localhost:8000');
    socket.on('location', (data) => {
      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function UpdateMapView() {
    const map = useMap();
    map.setView([location.latitude, location.longitude], map.getZoom());
    return null;
  }

  return (
    <div>
    <MapContainer
      center={[location.latitude, location.longitude]} 
      zoom={19} 
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100%' }}
    >
      {/* Satellite tile layer from ESRI */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      <UpdateMapView /> 

      <Marker position={[location.latitude, location.longitude]}>
        <Popup>
          Current Location: <br /> Latitude: {location.latitude}, Longitude: {location.longitude}
        </Popup>
      </Marker>
    </MapContainer>
    
    </div>
    
  );
}

export default Map;
