import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import cors from 'cors';

class SocketServer {
    constructor(corsOptions) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(cors(corsOptions));
        this.app.use(express.urlencoded({ extended: true }));
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: corsOptions,
        });

        // Listen for new client connections
        this.io.on('connection', (socket) => {
            console.log("A client is connected:", socket.id);

            // Listen for 'sendLocation' event from this particular socket
            socket.on('sendLocation', (data) => {
                console.log('Received location data:', data);
                // You can emit this data to other clients if needed
                this.io.emit('newLocation', data);
            });
            socket.on('disconnect', () => {
                console.log("Client disconnected:", socket.id);
            });
        });
    }

    getServer() {
        return this.server;
    }

    getIo() {
        return this.io;
    }
}

export default SocketServer;
