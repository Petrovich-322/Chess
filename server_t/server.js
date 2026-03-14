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
const addNewGame = (room) => {
    gameData[room] = { 
        field: createBoard(), 
        activeSide: 'w',
        firstPlayer: null,
        secondPlayer: null,
    };
}
app.get('/get-user-id', (req, res) => {
    console.log('newUser')
    const id = crypto.randomUUID();
    res.json(id);
});
app.get('/create-room', (req, res) => {
    res.json({roomId: roomNameGeneator.next().value});
});
app.post('/get-side', (req, res) => {
    console.log('get-side-request')
    
    const room = req.body.roomId;
    const user = req.body.userId;

    if(!room || !user) {
        console.log(`get-side fail ${room} || ${user}`);
        res.json({
            side: 'spectator',
            status: 'failed to get side',
        })
    }
    
    if(!gameData[room]){
        addNewGame(room);
    }
    
    if(!gameData[room].firstPlayer || gameData[room].firstPlayer === user) {
        console.log(`white player: ${user}`);
        gameData[room].firstPlayer = user;
        res.json({
            side: 'w',
            stauts: 'succes',
        });
    }
    
    else if(!gameData[room].secondPlayer || gameData[room].secondPlayer === user) {
        console.log(`black player: ${user}`);
        gameData[room].secondPlayer = user;
        res.json({
            side: 'b',
            status: 'succes',
        });
    }
    
    else res.json({
        side: 'spectator',
        status: 'succes',
    });
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (roomId) => {
        if(roomId) { 
            if(!gameData[roomId]){
                gameData[roomId] = { 
                    field: createBoard(), 
                    activeSide: 'w',
                    firstPlayer: null,
                    secondPlayer: null,
                };
            }
            socket.join(roomId);
            socket.emit('updateInfo', gameData[roomId]);
            console.log(`User joined room: ${roomId}`); 
        } else {
            console.log(`no room id ${roomId} || join room`);
        }
    });

    socket.on('newMove', ({ roomId, move }) => {
        if(!roomId) return;
        if(!gameData[roomId]) {
            addNewGame(roomId);
        }
        const field = gameData[roomId].field;
        const data = gameData[roomId];  
        if(checkMove(field, move.from, move.to)) {
            field[move.from.row][move.from.col].movements++;
            field[move.to.row][move.to.col] = field[move.from.row][move.from.col];
            field[move.from.row][move.from.col] = null;
            data.activeSide = data.activeSide === 'w' ? 'b' : 'w';
            io.to(roomId).emit('updateInfo', data);
        }
    });
});


httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Local: http://localhost:${PORT}`);
});