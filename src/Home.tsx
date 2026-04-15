import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { playerService } from './Services/player';
import { hostAdress } from './Services/host';
import getUserId from './Services/userId';

import CreatingGameMenu from './CreatingGameMenu/CreatingGameMenu'

import "./Home.css";

await getUserId('');

const Home = () => {        
    const [onCreateGame, setOnCreateGame] = useState<boolean>(false)
    
    const navigate = useNavigate();
    
    const onCreateGameHandler = async (time: number) => {
        playerService.reset();
        const data = {
            time: time
        }
        
        try {
            const response = await fetch(`${hostAdress}/create-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
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

    const newUser = async () => {
        await getUserId('newUser');
    }
    
    return (
        <div className="main-menu-container">
            <div id="start-btn-container">
                <button className="btn start-btn" onClick={() => setOnCreateGame(true)}>Створити гру</button>
                <button className="btn new-user-btn" onClick={newUser}>Створити користувача(костиль)</button>
            </div>
            {onCreateGame && <CreatingGameMenu
                setOnCreateGame={setOnCreateGame}
                onCreateGameHandler={onCreateGameHandler}
            />
            }
        </div>
    )
}

export default Home;    