import { useState, useEffect } from 'react';

import UserProfile from './UserProfile';
import NavBtns from './NavBtns';

import './NavigationMenu.css';


const NavigationMenu = () => {
    const [roomId, setRoomId] = useState(null);
    
    useEffect(() => {
        
    }, []);

    return (
        <div className="main-nav-bar"> 
            <UserProfile />   
            <NavBtns 
                roomId={roomId} 
            />
        </div>
    )
}

export default NavigationMenu;