import { useState, useEffect } from 'react';

import { userService } from "@/services/userService";

const UserProfile = () => { 
    const isLoggedIn = !!userService.token;
    
    return (
        <div className="user-profile__container">
            {isLoggedIn && (
            <div className="user-profile">
                <div className="user-profile__title">
                    <img src = "/public/assets/def-user-icon.jpg"alt="/" className="user-profile__img" />
                    <span className="user-profile__name">{userService.userName}</span>
                </div>
                <span className="user-profile__rating">{`Рейтинг: ${userService.rating}`}</span>
            </div>
            )}
        </div>
    )   
}

export default UserProfile;