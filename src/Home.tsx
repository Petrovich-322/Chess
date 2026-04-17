import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { playerService } from './Services/player';
import { hostAddress } from './Services/host';
import getUserId from './Services/userId';

import CreatingGameMenu from './CreatingGameMenu/CreatingGameMenu'
import NavigationMenu from './NavigationMenu/NavigationMenu';

import "./Home.css";

await getUserId('');

const Home = () => {        
    const [onCreateGame, setOnCreateGame] = useState<boolean>(false)
    
    const navigate = useNavigate();
    
    const onCreateGameHandler = async (time: number) => {
        playerService.reset();
        const createRoomData = {
            time: time
        }
        
        try {
            const response = await fetch(`${hostAddress}/create-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createRoomData)
            });
            
            if(!response.ok) {
                throw new Error (`failed to create-room ${response.status}`);
            }
            
            const result = await response.json();
            
            navigate(`/game/${result.roomId}`);
        } catch (err) {
            alert(`server is not responding properly ${err}`);
        }
    }
    
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
                    onCreateGameHandler={onCreateGameHandler}
                />
                }
            </div>
        </div>
    )
}

export default Home;    