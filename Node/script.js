import cookieParser from 'cookie-parser';
import routes from './Routes/Samir.routes.js';
import SocketServer from './Socket/socket.js';
import geolib from 'geolib';


// Define your geofence center and radius (e.g., school location)
const GEOFENCE_CENTER = {
  latitude: 28.6139,    // Replace with your location
  longitude: 77.2090
};
const RADIUS_METERS = 100; // Radius around geofence in meters

// Sample function to check location
function checkGeofence(currentLat, currentLon) {
  const isInside = geolib.isPointWithinRadius(
    { latitude: currentLat, longitude: currentLon },
    GEOFENCE_CENTER,
    RADIUS_METERS
  );

  if (isInside) {
    console.log("🟢 Bus is INSIDE the geofence.");
  } else {
    console.log("🔴 Bus is OUTSIDE the geofence.");
  }

  return isInside;
}

// Simulated incoming GPS data (from ESP32 or mobile)
const incomingLocation = {
  latitude: 28.6140,
  longitude: 77.2095
};

// Call geofence check
checkGeofence(incomingLocation.latitude, incomingLocation.longitude);


// Destructures the routes imported from the routes
const { SamirRouter, gpsRouter, rfidRouter } = routes;

// CORS Options
const corsOptions = {
  origin: [
    'http://localhost:5173',       // For local development on your computer
    'http://192.168.1.73:5173',    // For access from a mobile device on the same network (replace with your IP)
  ],
  methods: ['GET', 'POST','PATCH','DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
   
};

const socketServer = new SocketServer(corsOptions);
const app = socketServer.app;
const server = socketServer.getServer();
const io = socketServer.getIo();
app.use(cookieParser());

// Set up routes
app.use('/react', SamirRouter); 
app.use('/gps', (req, res, next) => {
  req.io = io;  // Attach io to the request object
  next();  // Pass control to the next middleware (gpsRouter)
}, gpsRouter); // GPS-specific router
app.use('/rfid', (req, res, next) => {
  req.io = io;  // Attach io to the request object
  next();  // Pass control to the next middleware (rfidRouter)
}, rfidRouter); // RFID-specific route

const PORT = 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://192.168.1.73:${PORT}`); // Update this to your local IP address
});

