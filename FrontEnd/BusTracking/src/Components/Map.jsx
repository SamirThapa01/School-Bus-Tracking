import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Map({ data }) { 
  const mapRef = useRef(); 
  const prevData = useRef(data); 

  function UpdateMapView() {
    const map = useMap();
    useEffect(() => {
      if (
        prevData.current.latitude !== data.latitude ||
        prevData.current.longitude !== data.longitude
      ) {
        map.flyTo([data.latitude, data.longitude], map.getZoom(), { animate: true  }); 
        prevData.current = data;
      }
    }, [data, map]);

    return null;
  }

  return (
    <div className="map" style={{ height: '100%', width: '100%', borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        center={[data.latitude, data.longitude]}
        zoom={19}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
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
