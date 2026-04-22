import { useState } from 'react';

import CreatingGameMenu from './HomeMenus/CreatingGameMenu/CreatingGameMenu'
import NavigationMenu from './NavigationMenu/NavigationMenu';

import "./Home.css";
import RegistrationMenu from './HomeMenus/RegistrationMenu/RegistrationMenu';

const Home = () => {        
    const [onCreateGame, setOnCreateGame] = useState<boolean>(false);
    const [onRegistration, setOnRegistration] = useState<boolean>(false);
    
    return (
        <div className="main-container">
            <NavigationMenu />
            <div className="main-menu-container">
                <div id="start-btn-container">
                    <button className="main-menu-btn start-btn" onClick={() => setOnCreateGame(true)}>Створити гру</button>
                    <button className="main-menu-btn new-user-btn" onClick={() => setOnRegistration(true)}>Реєстрація</button>
                </div>
                {onCreateGame && <CreatingGameMenu
                    setOnCreateGame = {setOnCreateGame}
                />
                }
                {onRegistration && <RegistrationMenu 
                    setOnRegistration = {setOnRegistration}
                />}
            </div>
        </div>
    )
}

export default Home;    