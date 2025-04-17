import React from "react";
import Details from "./Details";
function BusCard({ bus, locationData }) {
  return (
    <div className="bus-card">
      <div className="bus-header">
        <h3 className="bus-title">Bus #{bus.id}</h3>
      </div>
      <div className="route-info">{bus.route}</div>
      <div className="bus-details">
        <Details label="Driver" value={bus.driver} />
        <Details label="Current Location" value={locationData?.address?.road} />
        <Details label="Students" value={bus.students} />
        <Details label="Speed" value={bus.speed} />
      </div>
    </div>
  );
}

export default BusCard;
