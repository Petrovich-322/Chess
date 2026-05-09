import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    whitePlayer: { 
        userData: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        time: { 
            type: Number,
            default: 600
        }
    },
    blackPlayer: { 
        userData: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        time: { 
            type: Number,
            default: 600
        }
    },
    moveStory: { 
        type: Array,
        default: null

    },
    chatStory: {
        type: Array, 
        default: null
    },
    winner: {
        type: String,
        default: null
    }

});

export const SavedGame = mongoose.model('SavedGame', gameSchema);