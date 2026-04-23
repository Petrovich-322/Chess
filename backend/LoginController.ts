import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

import { User } from './models/UserSchema';

const JWT = process.env.API_KEY;
console.log(JWT);

const login = async (req: any, res: any) => {
    
    try {

        const { userName, password } = req.body;   

        const user = await User.findOne({ userName: userName });
        if(!user) {
            res.status(400).json({ message: 'такого користувача не існує' });
            return;
        }

        const passwordCheck = await bcrypt.compare(password, user.password);
        if(!passwordCheck) {
            res.status(400).json({ message: 'неправильний пароль' });
        }
        
        const token = jwt.sign(
            { userId: user._id, userName: user.userName },
            JWT as any,
            { expiresIn: '72h' }
        );

        res.json({
            token,
            userId: user._id,
        });


    } catch(err: any) {
        console.log(err.name, err.message);
        res.status(500).json({ message: 'помилка серверу' });

    }

}   

export default login;