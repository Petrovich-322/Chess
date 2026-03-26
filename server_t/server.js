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

const gameData = {};

const roomNameGeneator = createRoomName();
const addNewGame = (room) => {
    gameData[room] = { 
        field: createBoard(), 
        activeSide: 'w',
        whitePlayer: {
            id: null,
            time: 600,
        },
        blackPlayer: {
            id: null,
            time: 600,
        },
        prevMoveTime: Date.now(),
        lastMove: null,
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
    
    const roomId = req.body.roomId;
    const user = req.body.userId;

    if(!roomId || !user) {
        console.log(`get-side fail ${roomId} || ${user}`);
        res.json({
            side: 'spectator',
            status: 'failed to get side',
        })
    }
    
    if(!gameData[roomId]){
        addNewGame(roomId);
    }
    
    if(!gameData[roomId].whitePlayer.id || gameData[roomId].whitePlayer.id === user) {
        console.log(`white player: ${user}`);
        gameData[roomId].whitePlayer.id = user;
        res.json({
            side: 'w',
            stauts: 'succes',
        });
    }
    
    else if(!gameData[roomId].blackPlayer.id || gameData[roomId].blackPlayer.id === user) {
        console.log(`black player: ${user}`);
        gameData[roomId].blackPlayer.id = user;
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
                addNewGame(roomId);
            }
            socket.join(roomId);
            socket.emit('updateInfo', gameData[roomId]);
            console.log(`User joined room: ${roomId}`); 
        } else {
            console.log(`no room id ${roomId} || join room`);
        }
    });

    socket.on('newMove', ({ side, roomId, move, king}) => {
        if(!roomId) return;
        if(!gameData[roomId]) {
            addNewGame(roomId);
        }
        const field = gameData[roomId].field;
        const data = gameData[roomId];  
        const time = Date.now();
        if(checkMove(field, move.from, move.to, king)) {
            if(!gameData[roomId].prevMoveTime) {
                gameData[roomId].prevMoveTime = time;
            
            } else {
                if(side === 'w') {
                    gameData[roomId].whitePlayer.time -= (time - gameData[roomId].prevMoveTime)/1000;
                }
                else {
                    gameData[roomId].blackPlayer.time -= (time - gameData[roomId].prevMoveTime)/1000;
                }

                gameData[roomId].prevMoveTime = time;
                
            }
            field[move.from.row][move.from.col].movements++;
            field[move.to.row][move.to.col] = field[move.from.row][move.from.col];
            field[move.from.row][move.from.col] = null;
            data.activeSide = data.activeSide === 'w' ? 'b' : 'w';
            data.lastMove = {from: move.from, to: move.to};
            io.to(roomId).emit('updateInfo', data);
        }
    });
});


httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Local: http://localhost:${PORT}`);
});