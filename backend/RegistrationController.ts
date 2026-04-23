import bcrypt from 'bcrypt';
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

const registration = async (req: any, res: any) => {
    try {
        const { userName, password } = req.body;

        if(!userName || !password) {
            res.status(400).json(new responseData({ message: 'no username or password' }));
            return;
        }

        const existingUser = await User.findOne({ userName: userName });
        
        if(existingUser) {
            res.status(409).json(new responseData({ message: 'user already exist' }));
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            userName: userName, 
            password: hashedPassword
        })

        await newUser.save();


        res.status(201).json(new responseData({ message: 'user registrated successfull ' }));

    } catch (err) {
        res.status(500).json(new responseData({ message: 'registration fail' }));
        console.log(err);
    }
}

export default registration;