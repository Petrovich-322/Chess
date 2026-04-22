import bcrypt from 'bcrypt';
import { User } from './models/UserSchema';

const registration = async (req: any, res: any) => {
    try {
        const { userName, password } = req.body;

        const existingUser = await User.findOne({ userName });
        
        if(existingUser) {
            res.json({ text: 'user already exist' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            userName: userName, 
            password: hashedPassword
        })

        await newUser.save();

        res.json({ text: 'user registered successfull '});

    } catch (err) {
        res.json({ text: 'registration fail' });
        console.log(err);
    }
}

export default registration;