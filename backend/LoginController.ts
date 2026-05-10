import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from './models/UserSchema';

const Login = async (req: any, res: any) => {
    
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
        res.status(500).json({ message: 'помилка серверу' });

    }

}   

export const login = Login;