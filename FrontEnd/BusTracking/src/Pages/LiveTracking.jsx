import React, { useState, useEffect } from "react";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import "../Styles/styles.css";
import MapContainer from "../Components/MapContainer";
import Footer from "../Components/Footer";
import Hero from "../Components/Hero";
import Attendance from "../Components/Attendance";
import axios from "axios";

function LiveTracking({ logins, handleLoginClick, login }) {
  const [getLocation, setGetLocation] = useState({});
  const [locationData, setLocationData] = useState(null);

  const getLocationName = async (lat, lon) => {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            format: "jsonv2",
            lat: lat,
            lon: lon,
          },
          headers: {
            "Accept-Language": "en",
          },
        }
      );

      const data = response.data;
      setLocationData(data);

      console.log("Name:", data);
      console.log("City:", data.address.county);
      console.log("Full Address:", data.display_name);

      return data;
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      return null;
    }
  };

  useEffect(() => {
    if (getLocation.latitude && getLocation.longitude) {
      getLocationName(getLocation.latitude, getLocation.longitude);
    }
  }, [getLocation]);

  const [activeTab, setActiveTab] = useState("Live Tracking");

  return (
    <div className="app-container">
      <NavBar handleClick={handleLoginClick} login={login} logins={logins} />
      <div className="main-content">
        <SideBar
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          locationData={locationData}
        />
        {activeTab === "Live Tracking" ? (
          <MapContainer
            setGetLocation={setGetLocation}
            city={locationData?.address?.county}
          />
        ) : (
          <Attendance />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default LiveTracking;
