import mongoose from "mongoose";

import Game from "./Game";

import { SavedGame } from "./models/SavedGame";

class GameHistoryService {

    async saveGame (game: Game) {
        const { players, moveStory, chatStory, gameInfo: { winner } } = game;

        const newGame = new SavedGame({
            whitePlayer: {
                userData: players.white.id,
                time: players.white.time
            },
            blackPlayer: {
                userData: players.black.id,
                time: players.black.time
            },
            moveStory: moveStory,
            chatStory: chatStory,
            winner: winner
        })

        await newGame.save();
    }

    async *getHistoryGenerator(userId: string) {

        const cursor = SavedGame.find({
            $or: [
                { 'whitePlayer.userData': userId },
                { 'blackPlayer.userData': userId }
            ]
        })
        .populate('whitePlayer.userData blackPlayer.userData', 'userName rating')
        .cursor();
        
        for await (const game of cursor) {
            if(game) yield game;
        }
        
    } 

}

export default new GameHistoryService();