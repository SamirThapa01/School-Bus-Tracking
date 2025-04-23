import cookieParser from 'cookie-parser';
import routes from './Routes/Samir.routes.js';
import SocketServer from './Socket/socket.js';
import scheduleJobs from './Scheduler/Scheduler.js';
import rateLimit from 'express-rate-limit';
import cors from 'cors';


scheduleJobs(); 

// Destructures the routes imported from the routes
const { SamirRouter, gpsRouter, rfidRouter } = routes;

// Import the SocketServer class and create an instance with CORS options
const corsOptions = {
  origin: [
    'http://localhost:5173',      
    'http://192.168.1.73:5173', 
    'http://172.27.192.1',
    'http://172.27.192.1:5173',
    'http://192.168.1.73:8000',
    'http://192.168.43.106:5173'
    
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

const gpsRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 2, 
  message: 'Too many requests, please try again later.',
});

app.use('/react', SamirRouter); 
app.use('/gps',gpsRateLimiter, (req, res, next) => {
  req.io = io;  
  next();  
}, gpsRouter);
app.use('/rfid', (req, res, next) => {
  req.io = io;  
  next(); }, rfidRouter); 

const PORT = 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port :${PORT}`); 
});

