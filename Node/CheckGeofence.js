import geolib from 'geolib';


const GEOFENCE_CENTER = {
  latitude: 27.711845,
  longitude: 85.330397,
  };
  const RADIUS_METERS = 100; 
  
  
  function checkGeofence(currentLat, currentLon) {
    console.log("Checking geofence for coordinates:", currentLat, currentLon);
    const isInside = geolib.isPointWithinRadius(
      { latitude: currentLat, longitude: currentLon },
      GEOFENCE_CENTER,
      RADIUS_METERS
    );
  
    if (isInside) {
      console.log("Bus is INSIDE the geofence.");
    } else {
      console.log("Bus is OUTSIDE the geofence.");
    }
  
    return isInside;
  }

  export default checkGeofence;