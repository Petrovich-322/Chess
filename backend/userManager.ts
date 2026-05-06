import { User } from './models/UserSchema';

interface UpdateUser {
    data: Record<string, any>,
    userId: string,
}

interface ChangeRating {
    dRating: number,
    userId: string
}

class userManager {
    
    async getUserData (userId: string | null | undefined) {
        const user = await User.findById(userId);
        if(!user) {
            console.log('такого користувача не існує/проблема db');
            return null;
        }
        return user;
    }
    
    async update ({ data, userId }: UpdateUser) {
        const user = await User.findByIdAndUpdate(userId, data);
        if(!user) {
            console.log('такого користувача не існує/проблема db');
            return false;
        }
    }

    async changeRating ({ dRating, userId }: ChangeRating) {
        const user = await User.findById(userId);
        if(!user) {
            console.log('такого користувача не існує/проблема db');
            return false;
        }

        if((user.rating + dRating) < 0 && dRating < 0) return false;

        user.rating += dRating;
        user.save();

    }

} 

export default new userManager;