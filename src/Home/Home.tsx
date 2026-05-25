import { useState } from 'react';

import CreatingGameMenu from './HomeMenus/CreatingGameMenu/CreatingGameMenu'
import AuthorizationMenu from './HomeMenus/Authorization/Authorization';
import GameHistory from './GameHistory/GameHistory';
import SearchingMenu from './HomeMenus/SearchingMenu/SearchingMenu';

import { RegistrationService, LoginService } from '@/services/authorization';
import { userService } from '@/services/UserServiceProxy';

import "./Home.css";

interface AuthData {
    userName: string;
    password: string;
}

const Home = () => {        
    const [onClick, setOnClick] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const onRegistrationHandler = async (data: AuthData) => {
        const response = await RegistrationService.request(data);
        
        if(!response.ok) {
            setMessage(response.data.message);
            console.error(response.data.name, response.data.message);
            return false;
        }
                
        onLoginHandler(data);

        return true;
    }

    const onLoginHandler = async (data: AuthData) => {
        const response = await LoginService.request(data);

        if(!response.ok) {
            setMessage(response.data.message);
            console.error(response.data.name, response.data.message);
            return false;
        } 
        
        try {
            userService.setData({
                token: response.data.accessToken,
                userName: response.data.userName,
                rating: response.data.rating
            });
        } catch (err: unknown) {
            if(err instanceof Error) {
                console.error('Невдалося зберегти інфо', err.name, err.message);
            }
            console.error('Невідома помилка')
        }
        return true;
    }

    const wrapper = (fn: (data: AuthData) => Promise<boolean>) => {
        return async function(data: AuthData) {
            if(!await fn(data)) return;
            setMessage('');
            setOnClick('');
        }
    }
    
    return (
        <div className="main-container">
            <div className='home-menu__container'>
                <div className="start-btn-container">
                    <button
                        className="main-menu-btn start-btn"
                        onClick={() => setOnClick('createGame')}
                    >
                        Створити гру
                    </button>
                    <button
                        className="main-menu-btn start-btn"
                        onClick={() => setOnClick('findGame')}
                    >
                        Пошук гри
                    </button>
                    <button
                        className="main-menu-btn new-user-btn"
                        onClick={() => setOnClick('login')}
                    >
                        Логін
                    </button>
                    <button
                        className="main-menu-btn new-user-btn"
                        onClick={() => setOnClick('registration')}
                    >
                        Реєстрація
                    </button>
                    
                </div>
                {onClick === 'createGame' && <CreatingGameMenu
                    setOnClick = {() => setOnClick('')}
                />}
                {onClick === 'findGame' && <SearchingMenu
                    setOnClick = {() => setOnClick('')}
                />}
                {onClick === 'registration' && <AuthorizationMenu 
                    confirmBtnHandler = {wrapper(onRegistrationHandler)}
                    title = "Реєстрація"
                    message = {message}
                    setMessage = {setMessage}
                    setOnClick  = {() => setOnClick('')}
                />}
                {onClick === 'login' && <AuthorizationMenu
                    confirmBtnHandler = {wrapper(onLoginHandler)}
                    title = "Логін" 
                    message = {message}
                    setMessage = {setMessage}
                    setOnClick = {() => setOnClick('')}
                />}
            </div>
            
            <GameHistory />
        </div>
    )
}

export default Home;    