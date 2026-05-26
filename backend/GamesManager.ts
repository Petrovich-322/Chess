import Game from './Game.ts';
import { Server } from 'socket.io';
import { createRoomName } from './room-generator.ts';
import { logMethod } from './Logger.ts';
import { gameHistoryService } from './GameHistoryService.ts';
import { userManager } from './userManager.ts';

const roomNameGeneator = createRoomName();

class GamesManager {
    static #instance: GamesManager | null = null;

    #games: Record<string, Game>;
    #playersQueue: string[];
    #io: Server;

    constructor(io: Server) {
        this.#games = {};
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
    async createGame({ userId, time, userSide }: { userId?: string, time?: number, userSide?: 'white' | 'black' }) {
        const roomId = roomNameGeneator.next().value;
        if(!roomId) throw new Error('Не вдалося згенерувати назву кімнати');
        
        try {
            this.#games[roomId] = await Game.create({
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

        try {
            this.#getPlayers();
        } catch (error) {
            throw error;
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

    #getPlayers() {
        if(this.#playersQueue.length >= 2) {
            console.log(this.#playersQueue);
            const firstPlayerId = this.#playersQueue.shift();
            const secondPlayerId = this.#playersQueue.shift();
            
            if(!firstPlayerId || !secondPlayerId) {
                if(firstPlayerId) this.#playersQueue.unshift(firstPlayerId);
                if(secondPlayerId) this.#playersQueue.unshift(secondPlayerId);
                throw new Error('Помилка при отриманні гравців з черги');
            }
            
            this.joinGame({ firstPlayerId, secondPlayerId });  
        }
    }

    @logMethod('DEBUG')
    async joinGame({ firstPlayerId, secondPlayerId }: { firstPlayerId: string, secondPlayerId: string }) {
        try {
            const roomId = await this.createGame({ 
                userId: firstPlayerId,
                time: 600, 
                userSide: 'white' 
            });

            this.#io.to(firstPlayerId).emit('join-game', { roomId });
            this.#io.to(secondPlayerId).emit('join-game', { roomId });
        } catch (err: unknown) {
            throw err;
        }
    }

    endGame(roomId: string, winnerSide: 'white' | 'black') {
        const game = this.gameById(roomId);
        if(!game) return null;

        game.setGameStatus({ status: 'finished', winner: winnerSide });

        const winner = game.getPlayer(winnerSide);
        const looser = game.getPlayer(winnerSide === 'white' ? 'black' : 'white');
        
        if(!winner || !looser || !winner.id || !looser.id) return null;

        userManager.changeRating({ dRating: +30, userId: winner.id });
        userManager.changeRating({ dRating: -30, userId: looser.id });

        this.#io.to(roomId).emit('gameEnd', {
            winner: winnerSide,
            activeSide: 'spectator'
        });

        gameHistoryService.saveGame(game);

        return { winner };
    }

    gameById(roomId: string) {
        if(!roomId) return null;
        return this.#games[roomId] || null;
    }

    deleteById(roomId: string) {
        delete this.#games[roomId];
    }
}

export default GamesManager;