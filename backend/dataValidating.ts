import jwt from 'jsonwebtoken';
import { responseData } from './interfaces/shared.ts';

export const verifyToken = (req: any, res: any, next: any) => {
    console.log('---verify token---');

    const authData = req.headers['authorization'];
    const token = authData.split(' ')[1];

    if(!token) {
        res.status(401).json({ message: 'Ви не авторизовані, запит неможливий' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.API_KEY as string);
        req.decoded = {user: decoded};
        next();
    } catch (err) {
        res.status(401).json({ message: 'Ви не авторизовані, запит неможливий' });
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


