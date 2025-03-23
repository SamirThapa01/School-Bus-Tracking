import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Map({ data }) { 
  function UpdateMapView() {
    const map = useMap();
    map.setView([data.latitude, data.longitude], map.getZoom());  
    return null;
  }

  return (
    <div className="map" style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={[data.latitude, data.longitude]}
        zoom={19}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <UpdateMapView />
        <Marker position={[data.latitude, data.longitude]}>
          <Popup>
            📍 Bus Location: <br /> Latitude: {data.latitude}, Longitude: {data.longitude}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Map;
