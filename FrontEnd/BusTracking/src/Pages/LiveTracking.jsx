import React from "react";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import "../Styles/styles.css";
import MapContainer from "../Components/MapContainer";
import Footer from "../Components/Footer";
import Hero from "../Components/Hero";
import { useState } from "react";
import Attendance from "../Components/Attendance";

function LiveTracking({ logins, handleLoginClick, login }) {
  const [activeTab, setActiveTab] = useState("Live Tracking");
  return (
    <div className="app-container">
      <NavBar handleClick={handleLoginClick} login={login} logins={logins} />
      <div className="main-content">
        <SideBar setActiveTab={setActiveTab} activeTab={activeTab} />
        {activeTab === "Live Tracking" ? <MapContainer /> : <Attendance/>}
      </div>
      <Footer />
    </div>
  );
}
export default LiveTracking;
