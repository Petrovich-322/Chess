import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        default: 0
    }
});

export const User = mongoose.model('User', userSchema);