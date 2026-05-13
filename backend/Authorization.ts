import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from './models/UserSchema';

// console.log('1',process.env.ACCESS_KEY);
// console.log('2',process.env.REFRESH_KEY);
class responseData {
    message: string;
    name: string;
    constructor({ 
        message = '', 
        name = 'Server Response' 
    } = {}) {
        this.message = message,
        this.name = name
    }
}

const createAccessToken = ( userId: Object, userName: string ) => {
    const accessToken = jwt.sign(
        { userId: userId, userName: userName },
        process.env.ACCESS_KEY as string,
        { expiresIn: '15m' }
    );

    return accessToken;
}

export const refresh = async (req: any, res: any) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) {
        return res.status(401).json({ message: 'noData' });
    }
    try { 
        const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_KEY as string);
        const { userId } = decoded;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(401).json({ message: 'notExist' });
        }
        const userName = user.userName;
        const accessToken = createAccessToken(userId, userName);
        res.json({ accessToken });

    } catch (err: unknown) {
        if(err instanceof Error) {
            console.error(err.name, err.message);
        }
        res.status(400).json({ message: 'invalid' });
    }
}

export const login = async (req: any, res: any) => {
    const { userName, password } = req.body;
    try {
        const user = await User.findOne({ userName: userName });
        if(!user) {
            res.status(400).json({ message: 'notExist' });
            return;
        }

        const passwordCheck = await bcrypt.compare(password, user.password);
        if(!passwordCheck) {
            res.status(400).json({ message: 'unCorPass' });
            return;
        }
        
        const accessToken = createAccessToken(user._id, user.userName);

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_KEY as string,
            { expiresIn: '10d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 10*24*60*1000
        });

        res.json({
            accessToken,
            userId: user._id,
            userName: user.userName,
            rating: user.rating
        }); 

        return;
    } catch(err: unknown) {
        if(err instanceof Error) {
            console.error(err.name, err.message, 'Key');
            res.status(500).json(new responseData({ message: err.message }));
        }
        return;
    }

}

export const registration = async (req: any, res: any) => {
    const { userName, password } = req.body;
    try {
        const existingUser = await User.findOne({ userName: userName });
        
        if(existingUser) {
            res.status(409).json(new responseData({ message: 'exist' }));
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            userName: userName, 
            password: hashedPassword
        })

        await newUser.save();


        res.status(201).json(new responseData({ message: 'succes' }));

    } catch (err) {
        res.status(500).json(new responseData({ message: 'registration fail' }));
        console.log(err);
    }
}
