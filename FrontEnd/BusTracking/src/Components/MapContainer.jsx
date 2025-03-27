import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Map from "./Map";
import Updates from "./Updates";
import WeatherBox from "./WeatherBox";

const MapContainer = () => {
  const [rfid, setRfid] = useState(null);
  const [location, setLocation] = useState({
    latitude: 51.505,
    longitude: -0.09,
  });

  useEffect(() => {
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    socket.on("gpsData", (data) => {
      setLocation({
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
      });
    });

    socket.on("rfidData", (data) => {
      setRfid(data.rfid);
      console.log(data.rfid);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="map-container">
      <div className="map-placeholder">
        <Map data={location} />
      </div>
      <WeatherBox />
      <Updates rfid={rfid} />
    </div>
  );
};

export default MapContainer;
