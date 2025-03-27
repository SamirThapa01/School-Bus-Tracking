import React from "react";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import "../Styles/styles.css";
import MapContainer from "../Components/MapContainer";
import Profile from "../Components/Profile";
import Footer from "../Components/Footer";

function ProfilePage({ logins, handleLoginClick, login }) {
  return (
    <div className="app-container">
      <NavBar handleClick={handleLoginClick} login={login} logins={logins} />
      <div className="main-content">
        <Profile />
      </div>
      <Footer/>
    </div>
  );
}
export default ProfilePage;
