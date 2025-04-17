import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Map from "./Map";
import Updates from "./Updates";
import WeatherBox from "./WeatherBox";

const MapContainer = ({ setGetLocation, city }) => {
  const [rfid, setRfid] = useState(null);
  const [location, setLocation] = useState({
    latitude: 51.505,
    longitude: -0.09,
  });
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketConnection = io("http://172.27.192.1:8000");
    setSocket(socketConnection);

    socketConnection.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socketConnection.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });


    socketConnection.on("gpsData", (data) => {
      setLocation({
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
      });
      setGetLocation({
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
      });
    });


    socketConnection.on("newLocation", (data) => {
      setLocation({
        latitude: data.lat ?? 0,
        longitude: data.long ?? 0,
      });
      setGetLocation({
        latitude: data.lat ?? 0,
        longitude: data.long ?? 0,
      });
      console.log("New location received:", data);
    });

    socketConnection.on("rfidData", (data) => {
      setRfid(data.rfid);
      console.log("RFID data received:", data.rfid);
      addAlert({
        type: "rfid",
        message: `ID: ${data.rfid}`,
        timestamp: new Date().toISOString(),
      });
    });

    socketConnection.on("emergencyBroadcast", (data) => {
      console.log("Emergency alert received:", data);
      addAlert({
        type: data.type,
        location: data.location,
        timestamp: data.timestamp || new Date().toISOString(),
        driverId: data.driverId,
      });
    });

    socketConnection.on("emergencyMessageBroadcast", (data) => {
      console.log("Emergency message received:", data);
      addAlert({
        type: "message",
        message: data.message,
        location: data.location,
        timestamp: data.timestamp || new Date().toISOString(),
        driverId: data.driverId,
      });
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);


  const addAlert = (alert) => {
    setEmergencyAlerts((prevAlerts) => {
      const newAlerts = [alert, ...prevAlerts];
      return newAlerts.slice(0, 10);
    });
  };



  return (
    <div className="map-container">
      <div className="map-placeholder">
        <Map data={location} emergencyAlerts={emergencyAlerts} />
      </div>
      <div className="side-panel">
        <WeatherBox city={city} />
        <Updates rfid={rfid} emergencyAlerts={emergencyAlerts} />
      </div>
    </div>
  );
};

export default MapContainer;
