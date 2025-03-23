import React from 'react'
import Details from './Details'
function BusCard({bus}) {
  return (
    <div className="bus-card">
      <div className="bus-header">
        <h3 className="bus-title">Bus #{bus.id}</h3>
        <span className={`status-badge ${
          bus.status === 'On Time' ? 'status-active' : 'status-delayed'
        }`}>
          {bus.status}
        </span>
      </div>
      <div className="route-info">{bus.route}</div>
      <div className="bus-details">
        <Details label="Driver" value={bus.driver} />
        <Details label="Current Location" value={bus.location} />
        <Details label="Students" value={bus.students} />
        <Details label="Speed" value={bus.speed} />
      </div>
    </div>
  )
}

export default BusCard