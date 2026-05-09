import { useState, useEffect } from 'react';

import userService from "@/services/userService";
import tokenService from "@/services/tokenService";

const UserProfile = () => { 
    const isLoggedIn = tokenService.isLoggedIn;
    
    return (
        <div className="user-profile__container">
            {isLoggedIn && (
            <div className="user-profile">
                <div className="user-profile__title">
                    <img src = "/public/assets/def-user-icon.jpg"alt="/" className="user-profile__img" />
                    <span className="user-profile__name">{userService.getUserName()}</span>
                </div>
                <span className="user-profile__rating">{`Рейтинг: ${userService.getRating()}`}</span>
            </div>
            )}
        </div>
    )   
}

export default UserProfile;