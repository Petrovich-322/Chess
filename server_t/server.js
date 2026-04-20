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
        this.activeSide = 'white';
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
            player: 'black',
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
        this.chatStory = [{
            user: 'Сервер',
            text: 'Гру успішно створено'
        }]
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
    const time = req.body.time ?? 600;
    const userId = req.body.userId ?? null;
    const userSide = req.body.side ?? 'white';

    console.log(`   userId: ${userId}`);
    console.log(`   userSide ${userSide} || ${req.body.side}`)
    const roomId = roomNameGeneator.next().value
    gameData[roomId] = new Game({
        timeLimit: time,
        [`${userSide}Id`] : userId
    });
    res.json({roomId: roomId});
});

app.post('/get-side', (req, res) => {
    console.log('---Get-Side-Request---');
    const roomId = req.body.roomId;
    const user = req.body.userId;

    console.log(gameData[roomId]);
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

    if((!game.blackPlayer.id && !game.whitePlayer.id) || game.whitePlayer.id === user) {
        console.log(`white player: ${user}`);
        if(!game.whitePlayer.id) game.whitePlayer.id = user;
        res.json({
            side: 'white',
            stauts: 'succes',
        });
        return;
    }
    if(!game.blackPlayer.id || game.blackPlayer.id === user) {
        console.log(`black player: ${user}`);
        if(!game.blackPlayer.id) game.blackPlayer.id = user;
        res.json({
            side: 'black',
            status: 'succes',
        });
        return;
    }
    
    res.json({
        side: 'spectator',
        status: 'succes',
    });
});

const sendChatMessage = (roomId, user, text) => {
    console.log('---new message in chat---');
    const game = gameData[roomId];
    const message = {
        user: user,
        text: text
    }
    game.chatStory.push(message);
    io.to(roomId).emit('chatUpdate', {newMessage: message});
}

const callGameEnd = (roomId, side) => {
    io.to(roomId).emit('gameEnd', {winner: side, activeSide: 'spectator'});
    const game = gameData[roomId];
    game.gameStatus.gameEnd = true;
    game.gameStatus.winner = side;
    sendChatMessage(roomId, 'Сервер', `Переможець - ${side === 'white' ? 'білий' : 'чорний'}`);

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
        const playerColor = `${game.activeSide}`;
        
        const actualPlayerTime = !game.gameStatus.gameEnd ? game[`${playerColor}Player`].time - timeDif : 0;
        const actualGameData = {
            ...game,
            [`${playerColor}Player`]: {
                ...game[`${playerColor}Player`],
                time: actualPlayerTime
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
        const time = Date.now();
        
        const playerColor = `${game.activeSide}`;  
        const opponentColor = `${game.activeSide === 'white' ? 'black' : 'white'}`;
        console.log(playerColor, opponentColor);
        const userKing = kingsPosition[`${playerColor}King`];
        const opponentKing = kingsPosition[`${opponentColor}King`];
        console.log(userKing, opponentKing);

        if(checkMove(field, move.from, move.to, userKing)) {
            console.log('   Check move possibility');

            game[`${playerColor}Player`].time -= (time - game.lastMove.time)/1000;
            if(field[move.from.row][move.from.col].type === 'king') {
                kingsPosition[`${playerColor}King`] = {
                    row: move.to.row, 
                    col: move.to.col
                };
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
            
            game.activeSide = game.activeSide === 'white' ? 'black' : 'white';
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

    socket.on('chatNewMessage', ({roomId, user, text}) => {
        if(!roomId || !user || !text) return;
        sendChatMessage(roomId, user, text);
    })
});


httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Local: http://localhost:${PORT}`);
});