import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import cors from 'cors';
import axios from 'axios';
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
        this.connectedClients = new Map();
        this.io.on('connection', (socket) => {
            console.log("A client is connected:", socket.id);
            
            this.connectedClients.set(socket.id, {
                id: socket.id,
                type: 'unknown', 
                lastSeen: new Date().toISOString()
            });
            
            socket.on('sendLocation', (data) => {
                console.log('Received location data from', socket.id, ':', data);
                const clientInfo = this.connectedClients.get(socket.id) || { id: socket.id };
                clientInfo.type = 'driver'; 
                clientInfo.location = {
                    lat: data.lat,
                    long: data.long,
                    accuracy: data.accuracy
                };
                clientInfo.lastSeen = new Date().toISOString();
                this.connectedClients.set(socket.id, clientInfo);
                
                
                this.io.emit('newLocation', {
                    ...data,
                    driverId: socket.id,
                    timestamp: data.timestamp || new Date().toISOString()
                });
            });
            
            // Handle GPS data from any source
            socket.on('gpsData', (data) => {
                console.log('Received GPS data from', socket.id, ':', data);
                
                // Update client info
                const clientInfo = this.connectedClients.get(socket.id) || { id: socket.id };
                clientInfo.type = 'gps_device';
                clientInfo.location = {
                    latitude: data.latitude,
                    longitude: data.longitude
                };
                clientInfo.lastSeen = new Date().toISOString();
                this.connectedClients.set(socket.id, clientInfo);
                
                // Broadcast GPS data to all connected clients
                this.io.emit('gpsData', {
                    ...data,
                    sourceId: socket.id,
                    timestamp: data.timestamp || new Date().toISOString()
                });
            });
            
            // Handle RFID data
            socket.on('rfidData', (data) => {
                console.log('Received RFID data from', socket.id, ':', data);
                
                // Update client info
                const clientInfo = this.connectedClients.get(socket.id) || { id: socket.id };
                clientInfo.type = 'rfid_device';
                clientInfo.lastSeen = new Date().toISOString();
                this.connectedClients.set(socket.id, clientInfo);
                
                // Broadcast RFID data to all connected clients
                this.io.emit('rfidData', {
                    ...data,
                    sourceId: socket.id,
                    timestamp: data.timestamp || new Date().toISOString()
                });
            });
            
            // Handle emergency alerts
            socket.on('emergencyAlert', async (data, callback) => {
                console.log(`EMERGENCY ALERT from ${socket.id}:`, data);
                console.log(data.type, data.message, data.location);
                // Update client info
                const clientInfo = this.connectedClients.get(socket.id) || { id: socket.id };
                clientInfo.type = 'driver'; 
                clientInfo.lastSeen = new Date().toISOString();
                clientInfo.lastEmergency = {
                    type: data.type,
                    timestamp: data.timestamp || new Date().toISOString()
                };
                this.connectedClients.set(socket.id, clientInfo);
                
                const emergencyData = {
                    ...data,
                    driverId: socket.id,
                    timestamp: data.timestamp || new Date().toISOString()
                };
                
                // Broadcast emergency to all connected clients
                this.io.emit('emergencyBroadcast', emergencyData);
                this.logEmergency(emergencyData);

                // call the API endpoint
                try {
                    await axios.post('http://localhost:8000/react/emergency', {
                       data
                    });
                    console.log("try",data);
                    console.log("Emergency alert API called successfully");
                } catch (error) {
                    console.error("Failed to send emergency alert to API:", error.message);
                }
            
                if (typeof callback === 'function') {
                    callback({ 
                        success: true, 
                        message: 'Emergency alert received and processed'
                    });
                }
            
                if (typeof callback === 'function') {
                    callback({ 
                        success: true, 
                        message: 'Emergency alert received and processed'
                    });
                }
                
                // Send confirmation back to the driver that sent the alert
                socket.emit('emergencyReceived', { 
                    type: data.type, 
                    timestamp: data.timestamp || new Date().toISOString() 
                });
            });
            
            // Handle emergency messages
            socket.on('emergencyMessage', async (data, callback) => {
                console.log(`EMERGENCY MESSAGE from ${socket.id}:`, data);
                try {
                    await axios.post('http://localhost:8000/react/emergency-message', {
                        data
                    });
                    console.log("Emergency message API called successfully");
                } catch (error) {
                    console.error("Failed to send emergency message to API:", error.message);
                }
                
                const clientInfo = this.connectedClients.get(socket.id) || { id: socket.id };
                clientInfo.type = 'driver'; 
                clientInfo.lastSeen = new Date().toISOString();
                clientInfo.lastMessage = {
                    message: data.message,
                    timestamp: data.timestamp || new Date().toISOString()
                };
                this.connectedClients.set(socket.id, clientInfo);
                
                // Prepare message data to broadcast
                const messageData = {
                    ...data,
                    driverId: socket.id,
                    timestamp: data.timestamp || new Date().toISOString()
                };
                
                // Broadcast message to all connected clients
                this.io.emit('emergencyMessageBroadcast', messageData);
                
                // Log the emergency message
                this.logEmergencyMessage(messageData);
                
                // Send acknowledgment back to the client
                if (typeof callback === 'function') {
                    callback({ 
                        success: true, 
                        message: 'Emergency message received and processed' 
                    });
                }
                
                // Send confirmation back to the driver that sent the message
                socket.emit('messageReceived', { 
                    success: true,
                    timestamp: data.timestamp || new Date().toISOString() 
                });
            });
            
            // Handle any custom message type
            socket.on('message', (data) => {
                console.log(`Custom message from ${socket.id}:`, data);
                
                // Update client info
                const clientInfo = this.connectedClients.get(socket.id) || { id: socket.id };
                clientInfo.lastSeen = new Date().toISOString();
                this.connectedClients.set(socket.id, clientInfo);
                
                // Broadcast message to all connected clients
                this.io.emit('message', {
                    ...data,
                    senderId: socket.id,
                    timestamp: data.timestamp || new Date().toISOString()
                });
            });
            
            // Handle client disconnection
            socket.on('disconnect', () => {
                console.log("Client disconnected:", socket.id);
                
                // Get client info before removing
                const clientInfo = this.connectedClients.get(socket.id);
                this.connectedClients.delete(socket.id);
                this.io.emit('clientDisconnected', { 
                    clientId: socket.id,
                    clientType: clientInfo?.type || 'unknown'
                });
            });
        });
    }


    logEmergency(emergencyData) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] EMERGENCY LOG: ${emergencyData.type} from ${emergencyData.driverId}`);
        
        if (emergencyData.location) {
            console.log(`Location: Lat ${emergencyData.location.lat}, Long ${emergencyData.location.long}`);
        }
    }
    
    
    logEmergencyMessage(messageData) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] EMERGENCY MESSAGE LOG from ${messageData.driverId}`);
        console.log(`Message: "${messageData.message}"`);
        
        if (messageData.location) {
            console.log(`Location: Lat ${messageData.location.lat}, Long ${messageData.location.long}`);
        }
    }

    getServer() {
        return this.server;
    }

    getIo() {
        return this.io;
    }
    
   
    getConnectedClients() {
        return Array.from(this.connectedClients.values());
    }
    
    
    getConnectedDrivers() {
        return Array.from(this.connectedClients.values())
            .filter(client => client.type === 'driver');
    }
    
    broadcastToAll(event, data) {
        this.io.emit(event, {
            ...data,
            timestamp: data.timestamp || new Date().toISOString()
        });
    }
}

export default SocketServer;