import { Position } from '@shared/interfaces.ts';
import express from 'express';

export interface DecodedTokenReq extends express.Request {
    decoded?: any;
}

export interface OnNewMove {
    side: 'white' | 'black', 
    roomId: string, 
    move: {from: Position; to: Position}
};

export interface CallGameEnd {
    roomId: string, 
    winnerSide: 'white' | 'black',
}