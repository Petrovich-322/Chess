import { useNavigate } from 'react-router-dom';
import { useState, Dispatch, SetStateAction } from 'react';

import { playerService } from '../Services/player';
import { hostAddress } from '../Services/host';

import TimePicker from './TimePicker';
import SidePicker from './SidePicker';

import './CreatingGameMenu.css'

interface CreatingGameMenuProps {
    setOnCreateGame: Dispatch<SetStateAction<boolean>>,
}

const CreatingGameMenu = (props: CreatingGameMenuProps) => {
    const { setOnCreateGame } = props;
    
    const [minutes, setMinutes] = useState<number>(10);
    const [seconds, setSeconds] = useState<number>(0);
    const [side, setSide] = useState<string>('white');

    const setTimer = (minutes: number) => {
        setMinutes(minutes);
        setSeconds(0);
    }

    const getRandomInt = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const navigate = useNavigate();
    
    const onCreateGameHandler = async () => {
        playerService.reset();

        const time = minutes*60+seconds;
        const randomSide = getRandomInt(0,1) === 0 ? 'white' : 'black';      
        const finalSide = side != 'random' ? side : randomSide;    
        
        const localStorageDataJSON = localStorage.getItem('DenisChess');
        const localStorageData = localStorageDataJSON ? 
            JSON.parse(localStorageDataJSON) : null;
        const userId = localStorageData ? 
            localStorageData.userId : null;

        const createRoomData = {
            userId: userId,
            time: time,
            side: finalSide
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
        <div className="create-game-container">
            <p className="setting-game-title">Налаштування гри</p>
            <TimePicker
                minutes = {minutes}
                seconds = {seconds}
                setMinutes = {setMinutes}
                setSeconds = {setSeconds}
                setTimer = {setTimer}
            />
            <SidePicker 
                side = {side}
                setSide = {setSide}
            />
            <div className="creating-game-menu-navigate-container">
                <button 
                    className="create-game-btn return-btn"
                    onClick={() => setOnCreateGame(false)}
                >Повернутися</button>
                <button 
                    className="create-game-btn confirm-btn"
                    onClick={() => onCreateGameHandler()}
                >Почати</button>
            </div>
            
        </div>
    );
}

export default CreatingGameMenu;