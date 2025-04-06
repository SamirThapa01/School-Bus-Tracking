import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const Driver = () => {
  const [location, setLocation] = useState({
    lat: null,
    long: null,
    accuracy: null,
  });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const socketConnection = io("http://192.168.1.73:8000");

    // Socket event listeners
    socketConnection.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socketConnection.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    setSocket(socketConnection);

    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    // Set interval to send location every 5 seconds
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setLocation({
            lat: latitude,
            long: longitude,
            accuracy,
          });
          console.log("Sending location:", latitude, longitude);

          // Emit the location every 5 seconds if socket is connected
          if (socketConnection.connected) {
            socketConnection.emit("sendLocation", {
              lat: latitude,
              long: longitude,
              accuracy,
            });
          } else {
            console.log("Socket not connected, location will not be sent.");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }, 5000); // Send every 5 seconds

    // Cleanup: Clear the interval when component unmounts
    return () => {
      clearInterval(intervalId); // Clear the interval
      socketConnection.disconnect(); // Disconnect the socket
    };
  }, []);

  return (
    <div>
      <h2>Tracking Location</h2>
      <p>Latitude: {location.lat}</p>
      <p>Longitude: {location.long}</p>
      <p>Accuracy: {location.accuracy} meters</p>
    </div>
  );
};

export default Driver;
