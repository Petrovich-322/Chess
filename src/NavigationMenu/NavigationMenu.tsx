import { useState, useEffect } from 'react';

import NavBtns from './NavBtns';

import './NavigationMenu.css';
import UserProfile from './UserProfile';


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