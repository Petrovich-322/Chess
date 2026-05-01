import 'dotenv/config';
import express from 'express';
import cors from 'cors';    
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

import registration from './RegistrationController.ts';
import login from './LoginController.ts';
import createRoomName from "./room-generator.js";
import Game  from './Game.ts'
import { Position } from '../shared/interfaces.ts';
import verifyToken from './tokenVerification.ts';
import jwt from 'jsonwebtoken';

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

mongoose.connect('mongodb://192.168.1.108:27017/DenisChessDB')
  .then(() => console.log('Connected to DB'))
  .catch(err => console.error('Connection error:', err));

const roomNameGeneator = createRoomName();


interface DecodedTokenReq extends express.Request {
    decoded?: any;
}

app.post('/registration', (req, res) => {

    registration(req, res);
    console.log('---Registration Request---');
    
});

app.post('/login', (req, res) => {

    login(req, res);
    console.log('---Login Request---');

})

app.post('/create-room', verifyToken, async (req: DecodedTokenReq, res) => {

    console.log('---Create room request---');
    if(!req.decoded.user.userId) return; 
    const userId = req.decoded.user.userId;
    const time = req.body.time ?? 600;
    const userSide = req.body.side ?? 'white';

    console.log(`   userId: ${userId}`);
    console.log(`   userSide ${userSide} || ${req.body.side}`)
    
    const roomId = roomNameGeneator.next().value as string;
    
    gameData[roomId] = await Game.create({
        timeLimit: time,
        [`${userSide}Id`] : userId
    });
    res.json({roomId: roomId});

});

app.post('/get-side', verifyToken, async (req: DecodedTokenReq, res) => {

    console.log('---Get-Side-Request---');
    const userId = req.decoded.user.userId;
    const roomId = req.query.roomId;

    if(!roomId || typeof roomId !== 'string' || !userId) {
        console.log(`get-side fail ${roomId} || ${userId}`);
        res.json({ side: 'spectator', status: 'failed to get side' })
        return;
    }
    
    if(!gameData[roomId]) gameData[roomId] = await Game.create({});
    
    const side = await gameData[roomId].getUserSide(userId);

    res.json({ side: side, status: 'success' });

});

const sendChatMessage = ({ roomId, user, text }: 
    {roomId: string, user: string, text: string}) => {
    
    if(!roomId || !user || !text) return;

    // console.log('---new message in chat---');
    const game = gameData[roomId];
    const message = {
        user: user,
        text: text
    }
    game.sendMessage(message);

    io.to(roomId).emit('chatUpdate', {newMessage: message});

}

type OnNewMoveType = {
    side: 'white' | 'black', 
    roomId: string, 
    move: {from: Position; to: Position}
};

io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if(!token) {
        console.log('socket auth fail -> no token');
        return next(new Error('Ви не авторизовані'));
    }   

    try {
        
        const decoded = jwt.verify(token, process.env.API_KEY as string) as any;
        (socket as any).userId = decoded.userId;
        next();

    } catch (error) {

        next(new Error('Авторизаційні данні на дійсні'));
        
    }
    
});

io.on('connection', (socket) => {
    console.log('A user connected');

    const callGameEnd = ({ roomId, winner }: {roomId: string, winner: 'white' | 'black'}) => {
        console.log('---call game end---');
        if(!roomId || !winner) return;

        const game = gameData[roomId];
        game.setGameStatus({status: true, winner: winner});
        
        const messageText = `Переможець - ${game.players[winner].userName}`; 
        sendChatMessage({ roomId: roomId, user: 'Сервер', text: messageText });

        io.to(roomId).emit('gameEnd', {winner: winner, activeSide: 'spectator'});
        console.log('gameEnd, winner', winner);

    }

    const callUpdateInfo = ({ roomId }: {roomId: string}) => {
        
        if(!roomId) return;

        const game = gameData[roomId];
        const { field, ...gameInfo } = game;
        
        io.to(roomId).emit('updateInfo', gameInfo);
        
    }

    const handleJoinRoom = ({ roomId }: {roomId: string}) => {

        if(!roomId) { 
            console.log(`join room -> no room id ${roomId}`);
            return;
        }
        
        if(!gameData[roomId]) return;
        
        socket.join(roomId);

        const game = gameData[roomId];
        
        if(!game.gameInfo.status && game.activeSide != 'spectator') {
            game.updateTime(game.activeSide);
        }
        io.to(roomId).emit('initializeGame', game);
        
        console.log(`User joined room: ${roomId}`); 

    }

    const onNewMove = async ({ roomId, move }: OnNewMoveType) => {
        if(!roomId || !move) return;

        console.log('---   New move   ---');

        const userId = (socket as any).userId;
        if(!userId || !gameData[roomId]) return;
        
        const userSide = await gameData[roomId].getUserSide(userId);
        if(userSide === 'spectator') return;
        
        const game = gameData[roomId];

        const isMove = game.checkMove(move.from, move.to);
        if(!isMove) return;
        
        game.makeMove(move.from, move.to);
        game.updateTime(userSide);
        game.changeActiveSide(); 

        if(isMove === 'Mate') {
            
            console.log('---   Mate!   ---');   
            callGameEnd({ roomId: roomId, winner: userSide });

        }
        
        callUpdateInfo({ roomId: roomId });
    }

    socket.on('joinRoom', handleJoinRoom);
    socket.on('newMove', onNewMove);
    socket.on('timerGameEnd', callGameEnd);
    socket.on('chatNewMessage', sendChatMessage)

});

httpServer.listen(PORT, '127.0.0.1', () => {

    console.log(`Local: http://localhost:${PORT}`);
    
});