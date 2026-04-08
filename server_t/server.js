import express from 'express';
import cors from 'cors';    
import { createServer } from 'http';
import { Server } from 'socket.io';
import { checkMove } from 'rules-lib';
import { figureShahMoves } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';

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
        moveStory: [],
        prevMoveTime: Date.now(),
        // lastMove: null,
        kingsPosition: {
            whiteKing: {row: 7, col: 4},
            blackKing: {row: 0, col: 4}
        }
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
            socket.emit('initializeGame', gameData[roomId]);
            console.log(`User joined room: ${roomId}`); 
        } else {
            console.log(`no room id ${roomId} || join room`);
        }
    });


    const onNewMove = (side, roomId, move) => {
        if(!roomId) return;
        if(!gameData[roomId]) {
            addNewGame(roomId);
        }
        const field = gameData[roomId].field;
        const data = gameData[roomId];  
        const kingsPosition = data.kingsPosition;
        const time = Date.now();
        console.log('checking newMove');
        
        if(checkMove(field, move.from, move.to, side === 'w' ? kingsPosition.whiteKing : kingsPosition.blackKing)) {
            console.log('newMove succes');
            if(!gameData[roomId].prevMoveTime) {
                gameData[roomId].prevMoveTime = time;
            
            } else {
                if(side === 'w') {
                    gameData[roomId].whitePlayer.time -= (time - gameData[roomId].prevMoveTime)/1000;
                } else {
                    gameData[roomId].blackPlayer.time -= (time - gameData[roomId].prevMoveTime)/1000;
                }
                gameData[roomId].prevMoveTime = time;
            }
            
            if(field[move.from.row][move.from.col].type === 'king'){
                if(side === 'w') {
                    kingsPosition.whiteKing = {row: move.to.row, col: move.to.col}
                } else {
                    kingsPosition.blackKing = {row: move.to.row, col: move.to.col}
                }
            }
            
            field[move.from.row][move.from.col].movements++;
            field[move.to.row][move.to.col] = {...field[move.from.row][move.from.col]};
            field[move.from.row][move.from.col] = null;
            data.activeSide = data.activeSide === 'w' ? 'b' : 'w';
            // data.lastMove = {from: move.from, to: move.to};
            data.moveStory.push({from: move.from, to: move.to});
            io.to(roomId).emit('updateInfo', data);

            const king = side === 'w' ? kingsPosition.blackKing : kingsPosition.whiteKing
            if(!figureShahMoves(king, field)){
                console.log('MAT CHECK')
                for(let row=0;row<8;row++){
                    for(let col=0;col<8;col++){
                        if(field[row][col]?.color === (side === 'w' ? 'b' : 'w')) {
                            // console.log(row, col, getAvailableMoves(field, { row, col }, king))
                            if(getAvailableMoves(field, { row, col }, king).length != 0) {
                                return;
                            }
                        }
                    }
                }
                io.to(roomId).emit('gameEnd', {winner: side, activeSide: 'spectator'});
            }
        }
        else {
            io.to(roomId).emit('updateInfo', gameData[roomId]);
        }
    }
    socket.on('newMove', ({ side, roomId, move, king }) => {
        onNewMove(side, roomId, move, king);
    });
});


httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Local: http://localhost:${PORT}`);
});