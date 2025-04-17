import cookieParser from 'cookie-parser';
import routes from './Routes/Samir.routes.js';
import SocketServer from './Socket/socket.js';
import geolib from 'geolib';
import scheduleJobs from './Scheduler/Scheduler.js';

scheduleJobs(); // Schedule jobs for API calls


// Define your geofence center and radius (e.g., school location)
const GEOFENCE_CENTER = {
  latitude: 28.6139, 
  longitude: 77.2090
};
const RADIUS_METERS = 100; 


function checkGeofence(currentLat, currentLon) {
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

// Simulated incoming GPS data (from ESP32 or mobile)
const incomingLocation = {
  latitude: 28.6140,
  longitude: 77.2095
};

// Call geofence check
checkGeofence(incomingLocation.latitude, incomingLocation.longitude);


// Destructures the routes imported from the routes
const { SamirRouter, gpsRouter, rfidRouter } = routes;

// Import the SocketServer class and create an instance with CORS options
const corsOptions = {
  origin: [
    'http://localhost:5173',      
    'http://192.168.1.73:5173', 
    'http://172.27.192.1'   
  ],
  methods: ['GET', 'POST','PATCH','DELETE',"PUT"],
  allowedHeaders: ['Content-Type'],
  credentials: true,
   
};

const socketServer = new SocketServer(corsOptions);
const app = socketServer.app;
const server = socketServer.getServer();
const io = socketServer.getIo();
app.use(cookieParser());


app.use('/react', SamirRouter); 
app.use('/gps', (req, res, next) => {
  req.io = io;  
  next();  
}, gpsRouter);
app.use('/rfid', (req, res, next) => {
  req.io = io;  
  next(); }, rfidRouter); 

const PORT = 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://192.168.1.73.1:${PORT}`); // Update this to your local IP address
});

