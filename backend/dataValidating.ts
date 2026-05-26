import jwt from 'jsonwebtoken';
import { responseData } from './interfaces/shared.ts';
import { FastifyReply, FastifyRequest } from 'fastify';

const { JsonWebTokenError } = jwt;

const __errMessage = 'Невалідні дані авторизації';

export const verifyToken = async (req: FastifyRequest, reply: FastifyReply) => {
    console.log('---verify token---');
    
    const authData = req.headers['authorization'];
    const token = authData?.split(' ')[1];

    if(!token) {
        reply.code(401).send({ message: __errMessage });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_KEY as string);
        if(typeof decoded !== 'object' || !decoded) {
            reply.code(401).send({ message: __errMessage });
            throw new Error();
        }
        if(!('userId' in decoded)) {
            reply.code(401).send({ message: __errMessage });
            throw new Error();
        } 
        
        req.decoded = { user: decoded, userId: decoded.userId };
    } catch (err: unknown) {
        let message = __errMessage;
        
        if(err instanceof JsonWebTokenError) {
            if(err.name === 'TokenExpiredError') {
                message = 'tokenExpired';
            }
            else message = 'tokenError';
        }

        if(err instanceof Error) {
            console.error(err.name, err.message);
        }
        
        reply.code(401).send({ message: message });
        return;
    }
}

export const validateAuth = (req: FastifyRequest, reply: FastifyReply) => {
    const { userName, password } = req.body as any;

    if(!userName || !password) {
        reply.code(400).send(new responseData({ message: 'noData' }));
        return;
    }

}


