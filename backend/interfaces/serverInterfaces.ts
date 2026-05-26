import { Position } from '@shared/interfaces.ts';
import { JwtPayload } from 'jsonwebtoken';

export interface OnNewMove {
    side: 'white' | 'black', 
    move: {from: Position; to: Position}
};

export interface CallGameEnd {
    winnerSide: 'white' | 'black',
}

export interface IDecoded {
    roomId: string,
    userId: string
}

declare module 'fastify' {
  interface FastifyRequest {
    decoded: {
      user: string | JwtPayload;
      userId: string;
    };
  }
}