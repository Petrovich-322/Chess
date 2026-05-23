import 'dotenv/config';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySocketIO from 'fastify-socket.io';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

import auth from './Authorization.ts';
import { createRoomName } from "./room-generator.js";
import { verifyToken } from './dataValidating.ts';
import { userManager }  from './userManager.ts';
import { gameHistoryService } from './GameHistoryService.ts';
import Game from './Game.ts'

import { DecodedTokenReq, CallGameEnd, OnNewMove } from './interfaces/serverInterfaces.ts';
import fastifyCookie from '@fastify/cookie';

const PORT = 3000;
const corsInfo = {
    origin: [
        "http://localhost:5173",    
        "https://nondisputatiously-tetched-kimber.ngrok-free.dev"
    ],
    credentials: true,
    methods: ["GET", "POST"]
}

const gameData: Record<string, Game> = {};

const fastify = Fastify({ logger: true });
await fastify.register(fastifyCors, corsInfo);
await fastify.register(fastifySocketIO, { cors: corsInfo });
await fastify.register(fastifyCookie);
const io = fastify.io;

mongoose.connect('mongodb://0.0.0.0:27017/DenisChessDB')
  .then(() => console.log('Connected to DB'))
  .catch(err => console.error('Connection error:', err));

const roomNameGeneator = createRoomName();

fastify.post('/registration', async (req: FastifyRequest, res: FastifyReply) => {
    return await auth.registration(req, res);
});

fastify.post('/login', async (req: FastifyRequest, res: FastifyReply) => {
    return await auth.login(req, res);
});

fastify.post('/refresh', async (req: FastifyRequest, res: FastifyReply) => {
    return await auth.refresh(req, res);
});

fastify.post('/update-user', { preHandler: verifyToken }, async (req: DecodedTokenReq, reply: FastifyReply) => {
    if(!req.decoded) {
        reply.code(400).send({ message: 'NoToken' });
        return;
    };
    const data = await userManager.getUserData(req.decoded.user.userId);
    return data;
});

fastify.post('/create-room', { preHandler: verifyToken }, async (req: DecodedTokenReq, reply: FastifyReply) => {
    console.log('---Create room request---');
    if(!req.decoded?.user?.userId) {
        reply.code(401).send({ message: 'Невалідні дані авторизації' });
        return;
    } 
    const body = req.body as { time: number | null, side: string | null };
    
    const userId = req.decoded.user.userId;
    const time = body.time ?? 600;
    const userSide = body.side ?? 'white';
    const roomId = roomNameGeneator.next().value as string;
    
    try {
        gameData[roomId] = await Game.create({
            roomId: roomId,
            timeLimit: time,
            [`${userSide}Id`] : userId
        });

        return { roomId: roomId };
    } catch (error) {
        reply.code(500).send({ message: 'Не вдалося створити кімнату' }) 
    }
});

fastify.post('/get-side', { preHandler: verifyToken }, 
    async (req: DecodedTokenReq, reply: FastifyReply) => {
    console.log('---Get-Side-Request---');
    
    if(!req.decoded?.user?.userId) {
        reply.code(401).send({ message: 'Невалідні дані авторизації' });
        return;
    } 
    
    const userId = req.decoded.user.userId;
    const roomId = ((req.query as any).roomId as string);

    if(!roomId || !userId) {
        console.log(`get-side fail ${roomId} || ${userId}`);
        reply.code(400).send({ side: 'spectator', status: 'failed to get side' });
        return;
    }
    
    if(!gameData[roomId]) gameData[roomId] = await Game.create({roomId: roomId});
    
    const side = await gameData[roomId].getUserSide(userId);

    return { side: side, status: 'success' };
    
});

interface IDecoded {
    roomId: string,
    userId: string
}
interface DecodedSocket extends Socket, IDecoded {};

io.use((defSocket, next) => {
    const socket = defSocket as DecodedSocket;
    const token = socket.handshake.auth.token;

    if(!token) {
        console.log('socket auth fail -> no token');
        return next(new Error('Ви не авторизовані'));
    }   

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_KEY as string) as IDecoded;
        socket.userId = decoded.userId;
        next();
    } catch (error) {
        next(new Error('Авторизаційні данні на дійсні'));
    }
    
});

io.on('connection', (defSocket) => {
    console.log('A user connected');

    const socket = defSocket as DecodedSocket;

    socket.on('disconnect', async () => {
        const roomId = socket.roomId;
        const game = gameData[roomId];
        if(!roomId || !game) return;

        const room = fastify.io.sockets.adapter.rooms.get(roomId);
        const usersCount = room ? room.size : 0;
        
        if(game.status === 'active' && usersCount === 0) {
            game.gameEndTimer = setTimeout(async () => {
                console.log(`Таймер вийшов. Автозавершення гри ${roomId}`);
                
                callGameEnd({ winnerSide: game.activeSide === 'white' ? 'black' : 'white' });
                
                delete gameData[roomId];
            }, 60000);
        }

    })

    socket.on('get-game-history', async () => {
        console.log('get-game-hist');
        const generator = gameHistoryService.getHistoryGenerator(socket.userId);

        for await (const game of generator) {
            socket.emit('update-game-history', game);
        }

        socket.emit('get-history-complete');
    });

    const sendChatMessage = ({ user, text }: 
        { user: string, text: string}) => {
        const roomId = socket.roomId;

        if(!roomId || !user || !text) return;

        if(text[0] === '/') {
            const command = text.slice(1).trim().toLowerCase();
            if(command === 'start') {
                if(gameData[roomId].status !== 'prepearing' || !gameData[roomId].isAllPlayers) {
                    sendChatMessage({ user: 'Сервер', text: 'Цю команду не можливо виконати'});
                    return;
                }
                sendChatMessage({ user: 'Сервер', text: 'Гру успішно почато'});
                gameData[roomId].startTimer();
                gameData[roomId].activeSide = 'white';
                gameData[roomId].setGameStatus({ status: 'active' });    
                handleJoinRoom({ roomId: roomId });
                return;
            }
        }

        const game = gameData[roomId];
        const message = {
            user: user,
            text: text
        }
        game.sendMessage(message);

        io.to(roomId).emit('chatUpdate', {newMessage: message});
    }

    const callGameEnd = ({ winnerSide }: CallGameEnd) => {
        const roomId = socket.roomId;
        console.log('---call game end---');
        if(!roomId || !winnerSide) return;

        const game = gameData[roomId];
        game.setGameStatus({status: 'finished', winner: winnerSide});

        const winner = game.getPlayerId(winnerSide);
        const looser = game.getPlayerId(winnerSide === 'white' ? 'black' : 'white');
        
        if(winner) userManager.changeRating({dRating: +30, userId: winner});
        if(looser) userManager.changeRating({dRating: -30, userId: looser});

        const messageText = `Переможець - ${game.players[winnerSide].userName}`; 
        sendChatMessage({ user: 'Сервер', text: messageText });

        io.to(roomId).emit('gameEnd', {
            winner: winnerSide,
            activeSide: 'spectator'
        });

        gameHistoryService.saveGame(game);
    }   

    const callUpdateInfo = () => {
        const roomId = socket.roomId;

        if(!roomId) return;

        const game = gameData[roomId];
        const { field, ...gameInfo } = game;
        
        io.to(roomId).emit('updateInfo', gameInfo);
    }

    const handleJoinRoom = ({ roomId }: {roomId: string}) => {

        if(!roomId || !gameData[roomId]) { 
            console.log(`join room -> no room id ${roomId}`);
            return;
        }
        
        socket.roomId = roomId;
        socket.join(roomId);

        const game = gameData[roomId];
        if(game.gameEndTimer) {
            console.log('Cancel game end (user returned)');
            clearTimeout(game.gameEndTimer);
            game.gameEndTimer = null;
        }
        
        if(game.status != 'finished' && game.activeSide != 'spectator') {
            game.updateTime(game.activeSide);
        }
        io.to(roomId).emit('initializeGame', game);
        
        console.log(`User joined room: ${roomId}`); 
    }

    const onNewMove = async ({ move }: OnNewMove) => {
        const roomId = socket.roomId;

        if(!roomId || !move) return;
        
        if(gameData[roomId].gameInfo.status === 'prepearing') {
            sendChatMessage({ user: 'Сервер', text: 'Гра ще не почалася!' });
            return;
        }

        if(gameData[roomId].gameInfo.status === 'finished') {
            sendChatMessage({ user: 'Сервер', text: 'Гра вже закінчилася!' });
            return;
        }

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
            callGameEnd({ winnerSide: userSide });
        }
        
        callUpdateInfo();
    }

    socket.on('joinRoom', handleJoinRoom);
    socket.on('newMove', onNewMove);
    socket.on('timerGameEnd', callGameEnd);
    socket.on('chatNewMessage', sendChatMessage)

});

await fastify.listen({ port: PORT, host: '0.0.0.0' });