import { useState, useEffect } from 'react';
import { userService } from "@/services/UserServiceProxy";

interface userI {
    name: string | null,
    rating: number | null 
}

const UserProfile = () => { 
    const [user, setUser] = useState<userI>({
        name: userService.userName,
        rating: userService.rating
    });
    const isLoggedIn = !!userService.token;
    userService.subscribe(() => setUser({
        name: userService.userName,
        rating: userService.rating
    }));

    return (
        <div className="user-profile__container">
            {isLoggedIn && (
            <div className="user-profile">
                <div className="user-profile__title">
                    <img src = "/public/assets/def-user-icon.jpg"alt="/" className="user-profile__img" />
                    <span className="user-profile__name">{user.name}</span>
                    <span className="user-profile__rating">{`(${user.rating})`}</span>
                </div>
                <button 
                    className='user-profile__out'
                    onClick={() => userService.logOut()}
                >
                    Вийти
                </button>
            </div>
            )}
        </div>
    )   
}

export default UserProfile;