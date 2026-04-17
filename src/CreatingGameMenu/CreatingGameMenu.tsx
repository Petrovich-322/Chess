import { useState, Dispatch, SetStateAction } from 'react';

import TimeSelector from './TimeSelector';

import './CreatingGameMenu.css'

interface CreatingGameMenuProps {
    setOnCreateGame: Dispatch<SetStateAction<boolean>>,
    onCreateGameHandler: (time: number) => void
}

const CreatingGameMenu = (props: CreatingGameMenuProps) => {
    const {
        setOnCreateGame,
        onCreateGameHandler
    } = props;
    const timerPresets = [1,5,10,20,30,60];

    const [minutes, setMinutes] = useState<number>(10);
    const [seconds, setSeconds] = useState<number>(0);

    const setTimer = (minutes: number) => {
        setMinutes(minutes);
        setSeconds(0);
    }

    return (
        <div className="create-game-container">
            <p className="setting-game-title">Налаштування гри</p>
            <div className="time-picker-container">
                <div className="manual-time-select-section">
                    <TimeSelector 
                        time = {minutes}
                        title = {'Хвилини'}
                        setTime = {setMinutes}
                    />
                    <span className="colon">:</span>
                    
                    <TimeSelector 
                        time = {seconds}
                        title = {'Секунди'}
                        setTime = {setSeconds}
                    />
                </div>

                <div className="presets-container">
                    {timerPresets.map((time) => (
                        <button 
                            className="timer-preset-btn" 
                            key={`set-timer-btn-${time}`}
                            onClick={() => setTimer(time)}
                        >
                            {`${time} хв`}
                        </button>
                    ))}
                </div>
            </div>
            <div className="creating-game-menu-navigate-container">
                <button 
                    className="create-game-btn return-btn"
                    onClick={() => setOnCreateGame(false)}
                >Повернутися</button>
                <button 
                    className="create-game-btn confirm-btn"
                    onClick={() => onCreateGameHandler(minutes*60+seconds)}
                >Почати</button>
            </div>
        </div>
    )
}

export default CreatingGameMenu;