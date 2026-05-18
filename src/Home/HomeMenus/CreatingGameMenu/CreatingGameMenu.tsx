import { useNavigate } from 'react-router-dom';
import { useState, Dispatch, SetStateAction } from 'react';

import { userService } from '@/services/UserServiceProxy';
import apiClient from '@/services/client';

import TimePicker from './TimePicker';
import SidePicker from './SidePicker';
import HomeMenuNavBtns from '../HomeMenuNavBtns';

import './CreatingGameMenu.css';
import '../HomeMenus.css';

interface CreatingGameMenuProps {
    setOnClick: Dispatch<SetStateAction<string>>,
}

const CreatingGameMenu = (props: CreatingGameMenuProps) => {
    const { setOnClick } = props;
    
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

        const time = minutes * 60 + seconds;
        const randomSide = getRandomInt(0,1) === 0 ? 'white' : 'black';      
        const finalSide = side != 'random' ? side : randomSide;    
        
        const createRoomData = {
            time: time,
            side: finalSide
        }
        
        const token = userService.token;
        if(!token) {
            alert('Ви не авторизовані');
            return;
        }

        try {
            const response = await apiClient.post('/create-room', createRoomData);
            const roomId = response.data.roomId;    
            
            navigate(`/game/${roomId}`);
        } catch (err: unknown) {
            
            if(err instanceof Error) {
                alert(err.message || 'Сталася помилка при створенні кімнати');
                console.error(`${err.name}: ${err.message}`);
            }

        }
    }

    return (
        <div className="open-menu__container">
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

            <HomeMenuNavBtns 
                confirmBtnHandler = {() => onCreateGameHandler()}
                returnBtnHandler = {() => setOnClick('')}
                confirmBtnTitle = "Створити"
                returnBtnTitle = "Повернутися"
            />
            
        </div>
    );
}

export default CreatingGameMenu;