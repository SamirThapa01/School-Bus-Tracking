import {Server} from 'socket.io';
import express from 'express';
import http from 'http';
import cors from 'cors';


class SocketServer{
        constructor (corsOptions){
            this.app = express();
            this.app.use(express.json());
            this.app.use(cors(corsOptions));
            this.app.use(express.urlencoded({ extended: true }));
            this.server = http.createServer(this.app);
            this.io = new Server(this.server,{cors:corsOptions});
            // handle the socket io connection

            this.io.on('connection',(socket)=>{
                console.log("A client is connected", socket.id);
                socket.on('disconnect',()=>{
                    console.log("Client disconnected",socket.id);
                })
            })
        }

        getServer(){
            return this.server;
        }

        getIo(){
            return this.io;
        }
}

export default SocketServer;