import express from 'express';
import cors from 'cors';    
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

import registration from './RegistrationController.ts';
import createRoomName from "./room-generator.js";

import { Game } from './Game.ts'
import { Position } from './interfaces.ts';

const PORT = 3000;
const corsInfo = {
    origin: [
        "http://localhost:5173",    
        "https://nondisputatiously-tetched-kimber.ngrok-free.dev"
    ],
    methods: ["GET", "POST"]
}

const gameData: Record<string, Game> = {};

const app = express();
app.use(express.json());
app.use(cors(corsInfo));    
const httpServer = createServer(app);
const io = new Server(httpServer, {cors: corsInfo});

mongoose.connect('mongodb://127.0.0.1:27017/DenisChessDB')
  .then(() => console.log('Connected to DB'))
  .catch(err => console.error('Connection error:', err));

const roomNameGeneator = createRoomName();

app.post('/registration', (req, res) => {
    registration(req, res);
    console.log('New User')
});

app.post('/create-room', (req, res) => {
    console.log('---Create room request---');
    if(!req.body.userId) return; 
    const { userId } = req.body;
    const time = req.body.time ?? 600;
    const userSide = req.body.side ?? 'white';

    console.log(`   userId: ${userId}`);
    console.log(`   userSide ${userSide} || ${req.body.side}`)
    
    const roomId = roomNameGeneator.next().value as string;
    
    gameData[roomId] = new Game({
        timeLimit: time,
        [`${userSide}Id`] : userId
    });
    res.json({roomId: roomId});
});

app.post('/get-side', (req, res) => {
    console.log('---Get-Side-Request---');
    const { roomId, userId } = req.body;

    if(!roomId || !userId) {
        console.log(`get-side fail ${roomId} || ${userId}`);
        res.json({ side: 'spectator', status: 'failed to get side' })
        return;
    }
    
    if(!gameData[roomId]) gameData[roomId] = new Game();
    
    const side = gameData[roomId].getUserSide(userId);

    res.json({ side: side, status: 'success' });
});

const sendChatMessage = ({ roomId, user, text }: 
    {roomId: string, user: string, text: string}) => {
    
    console.log('---new message in chat---');
    const game = gameData[roomId];
    const message = {
        user: user,
        text: text
    }
    game.sendMessage(message);

    io.to(roomId).emit('chatUpdate', {newMessage: message});

}

const callGameEnd = ({ roomId, winner }: {roomId: string, winner: 'white' | 'black'}) => {
    
    const game = gameData[roomId];
    game.setGameStatus({status: true, winner: winner});
    
    const messageText = `Переможець - ${winner === 'white' ? 'білий' : 'чорний'}`; 
    sendChatMessage({ roomId: roomId, user: 'Сервер', text: messageText });

    io.to(roomId).emit('gameEnd', {winner: winner, activeSide: 'spectator'});
    console.log('gameEnd, winner', winner);

}

const callUpdateInfo = ({ roomId }: {roomId: string}) => {
    
    const game = gameData[roomId];
    const { field, ...gameInfo } = game;
    
    io.to(roomId).emit('updateInfo', gameInfo);
    
}

type OnNewMoveType = {
    side: 'white' | 'black', 
    roomId: string, 
    move: {from: Position; to: Position}
};

const onNewMove = ({ side, roomId, move }: OnNewMoveType) => {
    console.log('---New move---');

    if(!gameData[roomId] || side != gameData[roomId].activeSide) return;    
    const game = gameData[roomId];

    const moveRes = game.checkMove(move.from, move.to);
    if(!moveRes) return;
    
    game.makeMove(move.from, move.to);
    game.updateTime(side);
    game.changeActiveSide(); 

    if(moveRes === 'Mate') callGameEnd({ roomId: roomId, winner: side });
    
    callUpdateInfo({ roomId: roomId });
}

io.on('connection', (socket) => {
    console.log('A user connected');

    const handleJoinRoom = (data: {roomId: string}) => {
        const roomId = data.roomId;

        if(!roomId) { 
            console.log(`join room -> no room id ${roomId}`);
            return;
        }
        if(!gameData[roomId]) {
            gameData[roomId] = new Game();
        }
        
        socket.join(roomId);

        const game = gameData[roomId];
        
        if(!game.gameInfo.status && game.activeSide != 'spectator'){
            game.updateTime(game.activeSide);
        }
        socket.emit('initializeGame', game);
        
        console.log(`User joined room: ${roomId}`); 
    }

    socket.on('joinRoom', handleJoinRoom);

    socket.on('newMove', ({ side, roomId, move }) => {
        if(!roomId || !side || !move) return;
    
        onNewMove({ side: side, roomId: roomId, move: move });
    });
    
    socket.on('timerGameEnd', ({ roomId, winner }) => {
        if(!roomId || !winner) return; 

        callGameEnd({ roomId: roomId, winner: winner });
    })

    socket.on('chatNewMessage', ({ roomId, user, text }) => {
        if(!roomId || !user || !text) return;
        
        sendChatMessage({ roomId: roomId, user: user, text: text });
    })
});


httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Local: http://localhost:${PORT}`);
});