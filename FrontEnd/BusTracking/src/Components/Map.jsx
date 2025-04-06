import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Map({ data }) {
  const mapRef = useRef();
  const prevData = useRef(data);
  const prevAlertShown = useRef(false);
  const GEOFENCE_CENTER = {
    latitude: 27.7292505,
    longitude: 85.44357,
  };
  const GEOFENCE_RADIUS = 100; 

  function UpdateMapView() {
    const map = useMap();
    useEffect(() => {
      if (
        prevData.current.latitude !== data.latitude ||
        prevData.current.longitude !== data.longitude
      ) {
        map.flyTo([data.latitude, data.longitude], map.getZoom(), { animate: true });
        prevData.current = data;
      }
    }, [data, map]);

    return null;
  }

  useEffect(() => {
    if (data?.geofenceAlert && !prevAlertShown.current) {
      toast.info(` Geofence Alert: ${data.geofenceAlert}`, {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      prevAlertShown.current = true;
    }

    if (!data?.geofenceAlert) {
      prevAlertShown.current = false;
    }
  }, [data?.geofenceAlert]);

  return (
    <div className="map" style={{ height: '100%', width: '100%', borderRadius: "12px", overflow: "hidden" }}>
      <ToastContainer />
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
             Bus Location: <br /> Latitude: {data.latitude}, Longitude: {data.longitude}
          </Popup>
        </Marker>
        <Circle
          center={[GEOFENCE_CENTER.latitude, GEOFENCE_CENTER.longitude]}
          radius={GEOFENCE_RADIUS}
          pathOptions={{
            color: 'blue',
            fillColor: '#3388ff',
            fillOpacity: 0.3
          }}
        />
      </MapContainer>
    </div>
  );
}

export default Map;
