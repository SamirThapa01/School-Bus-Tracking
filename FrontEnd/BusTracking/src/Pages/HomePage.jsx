import React from 'react'
import NavBar from '../Components/NavBar';
import SideBar from '../Components/SideBar';
import '../Styles/styles.css'
import MapContainer from '../Components/MapContainer';

function HomePage({ logins, handleLoginClick, login }) {
  return (
    <div className="app-container">
      <NavBar handleClick={handleLoginClick} login={login} logins={logins} />
      <div className="main-content">
        <SideBar />
        <MapContainer />
      </div>
    </div>
  );
}
export default HomePage;
