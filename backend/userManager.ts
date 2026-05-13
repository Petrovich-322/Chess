import { User } from './models/UserSchema';

interface UpdateUser {
    data: Record<string, any>,
    userId: string,
}

interface ChangeRating {
    dRating: number,
    userId: string
}

class UserManager {
    
    async getUserData (userId: string | null | undefined) {
        const user = await User.findById(userId);
        if(!user) {
            console.log('Не можливо знайти користувача');
            return null;
        }
        return user;
    }
    
    async update ({ data, userId }: UpdateUser) {
        const user = await User.findByIdAndUpdate(userId, data);
        if(!user) {
            console.log('Неможливо оновити користувача');
            return false;
        }
    }

    async changeRating ({ dRating, userId }: ChangeRating) {
        const user = await User.findById(userId);
        if(!user) {
            console.log('Неможливо змінити данні користувача');
            return false;
        }

        if((user.rating + dRating) < 0 && dRating < 0) return false;

        user.rating += dRating;
        user.save();

    }

} 

export const userManager = new UserManager;