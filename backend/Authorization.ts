import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from './models/UserSchema';
import { logMethod } from './Logger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { responseData } from './interfaces/shared';

// console.log('1',process.env.ACCESS_KEY);
// console.log('2',process.env.REFRESH_KEY);

const createAccessToken = (userId: Object, userName: string) => {
    const accessToken = jwt.sign(
        { userId: userId, userName: userName },
        process.env.ACCESS_KEY as string,
        { expiresIn: '15m' }
    );
    return accessToken;
}

const createRefreshToken = (userId: Object) => {
    const refreshToken = jwt.sign(
        { userId: userId },
        process.env.REFRESH_KEY as string,
        { expiresIn: '10d' }
    );
    return refreshToken;
}

class Authorization {
    @logMethod('DEBUG')
    async refresh (req: FastifyRequest, reply: FastifyReply) {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            return reply.code(401).send({ message: 'noData' });
        }
        try { 
            const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_KEY as string);
            const { userId } = decoded;
            const user = await User.findById(userId);
            if(!user) {
                return reply.code(401).send({ message: 'notExist' });
            }
            const userName = user.userName;
            const newAccessToken = createAccessToken(userId, userName);
            const newRefreshToken = createRefreshToken(userId);
            reply.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 10*24*60*60,
                secure: false
            });
            return { newAccessToken };

        } catch (err: unknown) {
            if(err instanceof Error) {
                console.error(err.name, err.message);
            }
            reply.code(400).send({ message: 'invalid' });
        }
    }

    @logMethod('DEBUG')
    async login (req: FastifyRequest, reply: FastifyReply) {
        const { userName, password } = req.body as any;
        
        try {
            const user = await User.findOne({ userName: userName });
            if(!user) {
                reply.code(400).send({ message: 'notExist' });
                return;
            }

            const passwordCheck = await bcrypt.compare(password, user.password);
            if(!passwordCheck) {
                reply.code(400).send({ message: 'unCorPass' });
                return;
            }
            
            const accessToken = createAccessToken(user._id, user.userName);
            const refreshToken = createRefreshToken(user._id);

            reply.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 10*24*60*60,
                secure: false
            });

            return {
                accessToken,
                userId: user._id,
                userName: user.userName,
                rating: user.rating
            }; 
        } catch(err: unknown) {
            if(err instanceof Error) {
                console.error(err.name, err.message, 'Key');
                reply.code(500).send(new responseData({ message: err.message }));
                return;
            }
        }

    }

    @logMethod('DEBUG')
    async registration (req: FastifyRequest, reply: FastifyReply) {
        const { userName, password } = req.body as any; 
        try {
            const existingUser = await User.findOne({ userName: userName });
            
            if(existingUser) {
                reply.code(409).send(new responseData({ message: 'exist' }));
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                userName: userName, 
                password: hashedPassword
            })

            await newUser.save();


            reply.code(201).send(new responseData({ message: 'succes' }));

        } catch (err) {
            reply.code(500).send(new responseData({ message: 'registration fail' }));
            console.log(err);
        }
    }

}

export const authorization = new Authorization();
