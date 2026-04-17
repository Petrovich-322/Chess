import { useState, useEffect } from 'react';

import { devServAddress } from '../Services/host';

import './NavigationMenu.css';


const NavigationMenu = () => {
    const [roomId, setRoomId] = useState(null);
    
    useEffect(() => {
        const localStorageDataJSON = localStorage.getItem('DenisChess');
        const localStorageData = localStorageDataJSON ? 
            JSON.parse(localStorageDataJSON) : null;
        const room = localStorageData.prevRoomId;
        if(room) setRoomId(room);
    }, []);

    return (
        <div className="main-nav-bar"> 
            <button 
                className="nav-btn return-home-btn"
                onClick={() => window.location.href = devServAddress}
            >
                Головне меню
            </button>
            {roomId && <button
                className="nav-btn last-game-btn"
                onClick={() => window.location.href = `${devServAddress}game/${roomId}`}
            >   
                Остання гра 
            </button>
            }
        </div>
    )
}

export default NavigationMenu;