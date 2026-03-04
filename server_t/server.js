import express from 'express';
import cors from 'cors';    
import { createServer } from 'http';
import { Server } from 'socket.io';
import createBoard from '../entities/createBoard.js';
import createRoomName from "./room-generator.js";
import checkMove from 'rules-lib';

const PORT = 3000;

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
}));    
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
const fieldArray = {};
const roomNameGeneator = createRoomName();

app.get('/create-room', (req, res) => {
    res.json({ roomId: roomNameGeneator.next().value });
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (roomId) => {
        if(!fieldArray[roomId]){
            fieldArray[roomId] = createBoard();
        }
        socket.join(roomId);
        socket.emit('updateBoard', fieldArray[roomId]);
        console.log(`User joined room: ${roomId}`); 
    });

    socket.on('newMove', ({ roomId, move }) => {
        const field = fieldArray[roomId];
        if(checkMove(field, move.from, move.to)) {
            field[move.to.row][move.to.col] = field[move.from.row][move.from.col];
            field[move.from.row][move.from.col] = null;
            io.to(roomId).emit('updateBoard', field);
        }
    });
});

httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Local: http://localhost:${PORT}`);
});