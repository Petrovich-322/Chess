import { Position } from '@shared/interfaces.ts';
import { FastifyRequest } from 'fastify';
import { JwtPayload } from 'jsonwebtoken';

export interface DecodedTokenReq extends FastifyRequest {
    decoded?: {
        user: any
        userId: string
    }
}

export interface OnNewMove {
    side: 'white' | 'black', 
    move: {from: Position; to: Position}
};

export interface CallGameEnd {
    winnerSide: 'white' | 'black',
}