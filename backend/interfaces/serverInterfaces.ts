import { Position } from '@shared/interfaces.ts';
import express from 'express';

export interface DecodedTokenReq extends express.Request {
    decoded?: any;
}

export interface OnNewMove {
    side: 'white' | 'black', 
    move: {from: Position; to: Position}
};

export interface CallGameEnd {
    winnerSide: 'white' | 'black',
}