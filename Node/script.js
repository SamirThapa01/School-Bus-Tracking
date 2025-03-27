import cookieParser from 'cookie-parser';
import routes from './Routes/Samir.routes.js';
import SocketServer from './Socket/socket.js';

// Destructures the routes imported from the routes
const { SamirRouter, gpsRouter, rfidRouter } = routes;

// CORS Options
const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST','PATCH'],
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
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
