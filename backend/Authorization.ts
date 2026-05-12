import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from './models/UserSchema';

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
        
        const token = jwt.sign(
            { userId: user._id, userName: user.userName },
            process.env.API_KEY as string,
            { expiresIn: '72h' }
        );

        res.json({
            token,
            userId: user._id,
            userName: user.userName,
            rating: user.rating
        });


    } catch(err: any) {
        console.log(err.name, err.message);
        res.status(500).json({ message: 'Помилка на сервері' });
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
