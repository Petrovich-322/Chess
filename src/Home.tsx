import { useState } from 'react';

import getUserId from './Services/userId';

import CreatingGameMenu from './CreatingGameMenu/CreatingGameMenu'
import NavigationMenu from './NavigationMenu/NavigationMenu';

import "./Home.css";

await getUserId('');

const Home = () => {        
    const [onCreateGame, setOnCreateGame] = useState<boolean>(false)
    
    
    return (
        <div className="main-container">
            <NavigationMenu />
            <div className="main-menu-container">
                <div id="start-btn-container">
                    <button className="main-menu-btn start-btn" onClick={() => setOnCreateGame(true)}>Створити гру</button>
                    <button className="main-menu-btn new-user-btn" onClick={async () => await getUserId('newUser')}>Створити користувача(костиль)</button>
                </div>
                {onCreateGame && <CreatingGameMenu
                    setOnCreateGame={setOnCreateGame}
                />
                }
            </div>
        </div>
    )
}

export default Home;    