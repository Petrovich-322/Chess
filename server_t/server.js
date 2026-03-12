import express from 'express';
import cors from 'cors';    
import { createServer } from 'http';
import { Server } from 'socket.io';
import { checkMove } from 'rules-lib';

import createBoard from '../src/services/createBoard.js';
import createRoomName from "./room-generator.js";

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://nondisputatiously-tetched-kimber.ngrok-free.dev"
    ],
    methods: ["GET", "POST"]
}));    
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://nondisputatiously-tetched-kimber.ngrok-free.dev"
        ],
        methods: ["GET", "POST"]
    }
});

const gameData = {

};
const roomNameGeneator = createRoomName();

app.get('/get-user-id', (req, res) => {
    const id = crypto.randomUUID();
    res.json(id);
});
app.get('/create-room', (req, res) => {
    res.json({roomPath: roomNameGeneator.next().value});
});
app.post('/get-side', (req, res) => {
    const room = req.body.roomPath;
    const user = req.body.userId;
    if(!gameData[room]) {
        if(!gameData[room]){
            gameData[room] = { 
                field: createBoard(), 
                playerSide: 'w',
                firstPlayer: null,
                secondPlayer: null,
            };
        }
    }
    // console.log(data.roomId);
    if(!gameData[room].firstPlayer || gameData[room].firstPlayer === user) {
        console.log(`first: ${gameData[room].firstPlayer} || user: ${user} || second ${gameData[room].secondPlayer}`)
        gameData[room].firstPlayer = user;
        res.json({
            side: 'w'});
    }
    else if(!gameData[room].secondPlayer || gameData[room].secondPlayer === user) {
        gameData[room].secondPlayer = user;
        res.json({
            side: 'b'});
    }
    else res.json({
        side: 'spectator'});
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('joinRoom', (roomPath) => {
        if(!gameData[roomPath]){
            gameData[roomPath] = { 
                field: createBoard(), 
                playerSide: 'w',
                firstPlayer: null,
                secondPlayer: null,
            };
        }
        socket.join(roomPath);
        socket.emit('updateInfo', gameData[roomPath]);
        console.log(`User joined room: ${roomPath}`); 
    });

    socket.on('newMove', ({ roomPath, move }) => {
        const field = gameData[roomPath].field;
        const data = gameData[roomPath];  
        if(checkMove(field, move.from, move.to)) {
            field[move.from.row][move.from.col].movements++;
            field[move.to.row][move.to.col] = field[move.from.row][move.from.col];
            field[move.from.row][move.from.col] = null;
            data.playerSide = data.playerSide === 'w' ? 'b' : 'w';
            io.to(roomPath).emit('updateInfo', data);
        }
    });
});


httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Local: http://localhost:${PORT}`);
});