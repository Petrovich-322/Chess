import jwt from 'jsonwebtoken';
import { responseData } from './interfaces/shared.ts';

const { JsonWebTokenError } = jwt;

export const verifyToken = (req: any, res: any, next: any) => {
    console.log('---verify token---');

    const authData = req.headers['authorization'];
    const token = authData.split(' ')[1];

    if(!token) {
        res.status(401).json({ message: 'Ви не авторизовані, запит неможливий' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_KEY as string);
        req.decoded = {user: decoded};
        next();
    } catch (err: unknown) {
        let message = 'Ви не авторизовані, запит неможливий';
        
        if(err instanceof JsonWebTokenError) {
            if(err.name === 'TokenExpiredError') {
                message = 'tokenExpired';
            }
            else message = 'tokenError';
        }

        if(err instanceof Error) {
            console.error(err.name, err.message);
        }
        
        res.status(401).json({ message: message });
    }
}

export const validateAuth = (req: any, res: any, next: any) => {
    const { userName, password } = req.body;

    if(!userName || !password) {
        res.status(400).json(new responseData({ message: 'noData' }));
        return;
    }

    next();

}


