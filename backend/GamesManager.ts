import Game from './Game.ts';
import { Server } from 'socket.io';
import { createRoomName } from './room-generator.ts';
import { logMethod } from './Logger.ts';

const roomNameGeneator = createRoomName();


class GamesManager {
    static #instance: GamesManager | null = null;

    #gamesData: Record<string, Game>;
    #playersQueue: string[];
    #io: Server;

    constructor(io: Server) {
        this.#gamesData = {};
        this.#playersQueue = [];
        this.#io = io;
    }

    public static getInstance({ io }: { io: Server }) {
        if(!GamesManager.#instance) {
            GamesManager.#instance = new GamesManager(io);
        }
        return GamesManager.#instance;
    }

    @logMethod('DEBUG')
    async createGame({ userId, time, userSide }: { userId?: string, time?: number, userSide?: string }) {
        const roomId = roomNameGeneator.next().value;
        if(!roomId) throw new Error('Не вдалося згенерувати назву кімнати');
        
        try {
            this.#gamesData[roomId] = await Game.create({
                roomId: roomId,
                timeLimit: time,
                [`${userSide}Id`] : userId
            });
    
            return roomId;
        } catch (err: unknown) {
            throw err;
        }
    }

    @logMethod('DEBUG')
    joinQueue(userId: string) {
        if(this.#playersQueue.includes(userId)) {
            throw new Error('Ви вже в черзі');
        }
        this.#playersQueue.push(userId);

        if(this.#playersQueue.length >= 2) {
            console.log(this.#playersQueue);
            const firstPlayerId = this.#playersQueue.shift();
            const secondPlayerId = this.#playersQueue.shift();
            
            if(!firstPlayerId || !secondPlayerId) {
                throw new Error('Помилка при отриманні гравців з черги');
            }
            
            this.joinGame({ firstPlayerId, secondPlayerId });  
        }
    }

    @logMethod('DEBUG')
    leaveQueue(userId: string) {
        const index = this.#playersQueue.indexOf(userId);
        if(index === -1) {
            throw new Error('Ви не в черзі');
        }
        this.#playersQueue.splice(index, 1);
    }

    @logMethod('DEBUG')
    async joinGame({ firstPlayerId, secondPlayerId }: { firstPlayerId: string, secondPlayerId: string }) {
        try {
            const roomId = await this.createGame({ time: 600, userSide: 'white' });

            this.#io.to(firstPlayerId).emit('join-game', { roomId });
            this.#io.to(secondPlayerId).emit('join-game', { roomId });
        } catch (err: unknown) {
            throw err;
        }
    }

    gameById(roomId: string) {
        if(!roomId) return null;
        return this.#gamesData[roomId] || null;
    }

    deleteById(roomId: string) {
        delete this.#gamesData[roomId];
    }
}

export default GamesManager;