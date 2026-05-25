import 'dotenv/config';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySocketIO from 'fastify-socket.io';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

import auth from './Authorization.ts';
import { verifyToken } from './dataValidating.ts';
import { userManager }  from './userManager.ts';
import { gameHistoryService } from './GameHistoryService.ts';
import GamesManager from './GamesManager.ts';

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
};


const fastify = Fastify({ logger: true });
await fastify.register(fastifyCors, corsInfo);
await fastify.register(fastifySocketIO, { cors: corsInfo });
await fastify.register(fastifyCookie);
const io = fastify.io;

const gamesManager = GamesManager.getInstance({ io: io });

mongoose.connect('mongodb://0.0.0.0:27017/DenisChessDB')
  .then(() => console.log('Connected to DB'))
  .catch(err => console.error('Connection error:', err));

fastify.post('/registration', async (req: FastifyRequest, res: FastifyReply) => {
    return await auth.registration(req, res);
});

fastify.post('/login', async (req: FastifyRequest, res: FastifyReply) => {
    return await auth.login(req, res);
});

fastify.post('/refresh', async (req: FastifyRequest, res: FastifyReply) => {
    return await auth.refresh(req, res);
});

fastify.get('/update-user', { preHandler: verifyToken }, async (req: DecodedTokenReq, reply: FastifyReply) => {
    if(!req.decoded) {
        reply.code(400).send({ message: 'NoToken' });
        return;
    };
    const data = await userManager.getUserData(req.decoded.userId);
    return data;
});

fastify.post('/create-game', { preHandler: verifyToken }, async (req: DecodedTokenReq, reply: FastifyReply) => {
    console.log('---Create game request---');
    if(!req.decoded) {
        reply.code(400).send({ message: 'NoToken' });
        return;
    };
    const body = req.body as { time: number | null, side: string | null };
    
    const userId = req.decoded.userId;
    const time = body.time ?? 600;
    const userSide = body.side ?? 'white';
    
    try {
        const roomId = await gamesManager.createGame({ userId, time, userSide });
        return { roomId };
    } catch (error) {
        let errorMessage = 'Не вдалося створити кімнату';
        if(error instanceof Error) {
            errorMessage = error.message || errorMessage;
        }
        reply.code(500).send({ message: errorMessage });
    }
});

fastify.post('/find-game', { preHandler: verifyToken }, async (req: DecodedTokenReq, reply: FastifyReply) => {
    console.log('---Find game request---'); 
    if(!req.decoded) {
        reply.code(401).send({ message: 'Невалідні дані авторизації' });
        return;
    };

    const userId = req.decoded.userId;
    try {
        gamesManager.joinQueue(userId);
    } catch (error) {
        let errorMessage = 'Сталася помилка при пошуку гри';
        if(error instanceof Error) {
            errorMessage = error.message || errorMessage;
        }
        reply.code(500).send({ message: errorMessage });
    }
});

fastify.post('/leave-queue', { preHandler: verifyToken }, async (req: DecodedTokenReq, reply: FastifyReply) => {
    console.log('---Leave queue request---');   
    if(!req.decoded) {  
        reply.code(401).send({ message: 'Невалідні дані авторизації' });
        return;
    }
    const userId = req.decoded.userId;
    try {
        gamesManager.leaveQueue(userId);
    } catch (error) {
        let errorMessage = 'Сталася помилка при виході з черги';
        if(error instanceof Error) {
            errorMessage = error.message || errorMessage;
        }
        reply.code(500).send({ message: errorMessage });
    }
});

fastify.post('/get-side', { preHandler: verifyToken }, async (req: DecodedTokenReq, reply: FastifyReply) => {
    console.log('---Get-Side-Request---');
    
    if(!req.decoded?.user?.userId) {
        reply.code(401).send({ message: 'Невалідні дані авторизації' });
        return;
    } 
    
    const userId = req.decoded.user.userId;
    const roomId = ((req.query as any).roomId as string);

    const game = gamesManager.gameById(roomId);

    if(!roomId || !userId || !game) {
        reply.code(400).send({ side: 'spectator' });
        return;
    }
    
    const side = await game.getUserSide(userId);

    return { side };
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

    const userId = socket.userId;
    if(!userId) {
        console.log('Socket connection error: no user id');
        socket.disconnect();
        return;
    }

    if(userId) {
        socket.join(userId);    
    }

    socket.on('disconnect', async () => {
        const roomId = socket.roomId;
        const game = gamesManager.gameById(roomId);
        if(!roomId || !game) return;

        const room = fastify.io.sockets.adapter.rooms.get(roomId);
        const usersCount = room ? room.size : 0;
        
        if(game.status === 'active' && usersCount === 0) {
            game.gameEndTimer = setTimeout(async () => {
                console.log(`Таймер вийшов. Автозавершення гри ${roomId}`);
                
                callGameEnd({ winnerSide: game.activeSide === 'white' ? 'black' : 'white' });
                
                gamesManager.deleteById(roomId);
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
        const game = gamesManager.gameById(roomId);
        if(!roomId || !user || !text || !game) return;

        if(text[0] === '/') {
            const command = text.slice(1).trim().toLowerCase();
            if(command === 'start') {
                if(game.status !== 'prepearing' || !game.isAllPlayers) {
                    sendChatMessage({ user: 'Сервер', text: 'Цю команду не можливо виконати'});
                    return;
                }
                sendChatMessage({ user: 'Сервер', text: 'Гру успішно почато'});
                game.startTimer();
                game.activeSide = 'white';
                game.setGameStatus({ status: 'active' });    
                handleJoinRoom({ roomId: roomId });
                return;
            }
        }

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

        const game = gamesManager.gameById(roomId);
        if(!game) return;

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

        const game = gamesManager.gameById(roomId);
        if(!game) return;

        const { field, ...gameInfo } = game;
        
        io.to(roomId).emit('updateInfo', gameInfo);
    }

    const handleJoinRoom = ({ roomId }: {roomId: string}) => {

        if(!roomId || !gamesManager.gameById(roomId)) { 
            console.log(`join room -> no room id ${roomId}`);
            return;
        }
        
        socket.roomId = roomId;
        socket.join(roomId);

        const game = gamesManager.gameById(roomId);
        if(!game) return;

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
        
        const game = gamesManager.gameById(roomId);
        if(!game) return;

        if(game.gameInfo.status === 'prepearing') {
            sendChatMessage({ user: 'Сервер', text: 'Гра ще не почалася!' });
            return;
        }

        if(game.gameInfo.status === 'finished') {
            sendChatMessage({ user: 'Сервер', text: 'Гра вже закінчилася!' });
            return;
        }

        const userId = (socket as any).userId;
        if(!userId || !game) return;
        
        const userSide = await game.getUserSide(userId);
        if(userSide === 'spectator') return;

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