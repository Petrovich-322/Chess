import { useState, useEffect } from 'react';
import React, { useSyncExternalStore } from 'react';
import { userService } from "@/services/UserServiceProxy";

const UserProfile = () => { 
    const [, setUpdate ] = useState(0);
    const isLoggedIn = !!userService.token;
    userService.subscribe(() => setUpdate((prev) => prev + 1));

    return (
        <div className="user-profile__container">
            {isLoggedIn && (
            <div className="user-profile">
                <div className="user-profile__title">
                    <img src = "/public/assets/def-user-icon.jpg"alt="/" className="user-profile__img" />
                    <span className="user-profile__name">{userService.userName}</span>
                    <span className="user-profile__rating">{`(${userService.rating})`}</span>
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