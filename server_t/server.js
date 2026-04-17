import express from 'express';
import cors from 'cors';    
import { createServer } from 'http';
import { Server } from 'socket.io';
import { checkMove } from 'rules-lib';
import { chachCheck } from 'rules-lib';
import { mateCheck } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';

import createBoard from '../src/Services/createBoard.js';
import createRoomName from "./room-generator.js";

const PORT = 3000;
const corsInfo = {
    origin: [
        "http://localhost:5173",
        "https://nondisputatiously-tetched-kimber.ngrok-free.dev"
    ],
    methods: ["GET", "POST"]
}
const gameData = {};

class Game {
    constructor({ 
        timeLimit = 600, 
        whiteId = null, 
        blackId = null 
    } = {}) {
        this.field = createBoard();
        this.activeSide = 'w';
        this.whitePlayer = {
            id: whiteId,
            time: timeLimit,
        };
        this.blackPlayer = {
            id: blackId,
            time: timeLimit,
        };
        this.moveStory = [];
        this.lastMove = {
            player: 'b',
            time: Date.now()
        };
        this.kingsPosition = {
            whiteKing: {row: 7, col: 4},
            blackKing: {row: 0, col: 4}
        };
        this.gameStatus = {
            gameEnd: false, 
            winner: null
        };
    }
}

const app = express();
app.use(express.json());
app.use(cors(corsInfo));    
const httpServer = createServer(app);
const io = new Server(httpServer, {cors: corsInfo});

const roomNameGeneator = createRoomName();

app.get('/get-user-id', (req, res) => {
    console.log('newUser')
    const id = crypto.randomUUID();
    res.json(id);
});

app.post('/create-room', (req, res) => {
    console.log('---Create room request---');
    const time = req.body.time ? req.body.time : 600; 
    const roomId = roomNameGeneator.next().value
    gameData[roomId] = new Game({timeLimit: time});
    res.json({roomId: roomId});
});

app.post('/get-side', (req, res) => {
    const roomId = req.body.roomId;
    const user = req.body.userId;

    if(!roomId || !user) {
        console.log(`get-side fail ${roomId} || ${user}`);
        res.json({
            side: 'spectator',
            status: 'failed to get side',
        })
    }
    
    if(!gameData[roomId]) {
        gameData[roomId] = new Game();
    }
    const game = gameData[roomId];

    if(!game.whitePlayer.id || game.whitePlayer.id === user) {
        console.log(`white player: ${user}`);
        if(!game.whitePlayer.id) game.whitePlayer.id = user;
        res.json({
            side: 'w',
            stauts: 'succes',
        });
    }
    
    else if(!game.blackPlayer.id || game.blackPlayer.id === user) {
        console.log(`black player: ${user}`);
        if(!game.blackPlayer.id) game.blackPlayer.id = user;
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

const callGameEnd = (roomId, side) => {
    io.to(roomId).emit('gameEnd', {winner: side, activeSide: 'spectator'});
    const game = gameData[roomId];
    game.gameStatus.gameEnd = true;
    game.gameStatus.winner = side;
    
    console.log('gameEnd, winner', side);
}

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (roomId) => {
        if(!roomId) { 
            console.log(`join room -> no room id ${roomId}`);
            return;
        }
        if(!gameData[roomId]) {
            gameData[roomId] = new Game();
        }
        
        socket.join(roomId);

        const game = gameData[roomId];
        const timeDif = (Date.now() - game.lastMove.time)/1000;
        
        const whitePlayerTime = game.activeSide === 'w' ? 
            (game.gameStatus.gameEnd === false ? game.whitePlayer.time - timeDif : 0) : game.whitePlayer.time;
        const blackPlayerTime = game.activeSide === 'b' ? 
            (game.gameStatus.gameEnd === false ? game.blackPlayer.time - timeDif : 0) : game.blackPlayer.time;
        
        const actualGameData = {...game,
            whitePlayer: {
                ...game.whitePlayer,
                time: whitePlayerTime
            },
            blackPlayer: {
                ...game.blackPlayer,
                time: blackPlayerTime
            }
        }
        
        socket.emit('initializeGame', actualGameData);
        
        console.log(`User joined room: ${roomId}`); 
    });

    const onNewMove = (side, roomId, move) => {
        console.log('---New move---');
        
        if(!roomId) {
            console.log(`onNewMove -> no room id ${roomId}`);
            return;
        }
        
        if(!gameData[roomId]) {
            gameData[roomId] = new Game();
        }
        
        const game = gameData[roomId];  
        const field = game.field;
        const kingsPosition = game.kingsPosition;
        const userKing = side === 'w' ? kingsPosition.whiteKing : kingsPosition.blackKing;
        const opponentKing = side === 'w' ? kingsPosition.blackKing : kingsPosition.whiteKing;
        const time = Date.now();

        if(checkMove(field, move.from, move.to, userKing)) {
            console.log('   Check move possibility');
            if(side === 'w') {
                game.whitePlayer.time -= (time - game.lastMove.time)/1000;
                if(field[move.from.row][move.from.col].type === 'king') {
                    kingsPosition.whiteKing = {row: move.to.row, col: move.to.col}
                }
            } else if(side === 'b') {
                game.blackPlayer.time -= (time - game.lastMove.time)/1000;
                if(field[move.from.row][move.from.col].type === 'king') {
                    kingsPosition.blackKing = {row: move.to.row, col: move.to.col}
                }
            }
            game.lastMove.time = time;

            const moveInfo = {
                move: {from: move.from, to: move.to},
                firstFigure: field[move.from.row][move.from.col],
                secondFigure: field[move.to.row][move.to.col],
            }

            field[move.from.row][move.from.col].movements++;
            field[move.to.row][move.to.col] = {...field[move.from.row][move.from.col]};
            field[move.from.row][move.from.col] = null;
            
            game.activeSide = game.activeSide === 'w' ? 'b' : 'w';
            game.lastMove = {player: side, time: time};
            game.moveStory.push(moveInfo);
            io.to(roomId).emit('updateInfo', game);

            if(chachCheck(opponentKing, field)){
                getAvailableMoves.clear();
                const isMate = mateCheck(game.activeSide, field, opponentKing);
                console.log(isMate);
                if(isMate) callGameEnd(roomId, side);
            }
        }
        else {
            io.to(roomId).emit('updateInfo', game);
        }
    }
    
    socket.on('newMove', ({ side, roomId, move }) => {
        // console.log(side, roomId, move);
        if(!roomId || !side || !move) return;
        onNewMove(side, roomId, move);
    });
    
    socket.on('timerGameEnd', ({ roomId, winner }) => {
        if(!roomId || !winner) return; 
        callGameEnd(roomId, winner);
    })
});


httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Local: http://localhost:${PORT}`);
});