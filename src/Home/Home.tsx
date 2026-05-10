import { useState, useEffect } from 'react';

import CreatingGameMenu from './HomeMenus/CreatingGameMenu/CreatingGameMenu'
import NavigationMenu from '@/NavigationMenu/NavigationMenu';
import RegisterLogMenu from './HomeMenus/RegistrationMenu/RegisterLogMenu';
import GameHistory from './GameHistory/GameHistory';

import { RegistrationService, LoginService } from '@/services/authorization';
import { userService } from '@/services/userService';

import "./Home.css";

interface AuthData {
    userName: string;
    password: string;
}

const Home = () => {        
    const [onClick, setOnClick] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        if(userService.token) {
            console.log('loh');
            userService.updateUser();
        }
    }, [])

    const onRegistrationHandler = async (data: AuthData) => {

        const registrationData = {message: 'реєстрація', ...data};
        const response = await RegistrationService.request(registrationData);
        
        if(!response.ok) {
            setMessage(response.data.message);
            console.log(response.data.name, response.data.message);
            return false;
        }
                
        return true;
    }

    const onLoginHandler = async (data: AuthData) => {

        const loginData = {message: 'вхід', ...data};
        const response = await LoginService.request(loginData);

        if(!response.ok) {
            setMessage(response.data.message);
            console.log(response.data.name, response.data.message);
            return false;
        } 
        
        try {
            userService.setData('token', response.data.token);

            userService.setData('userName',response.data.userName);
            
            userService.setData('rating', response.data.rating);

        } catch (err) {
            console.error('Error in setting user data:', err);
        }

        window.location.reload();

        return true;
    }

    const handlerWrapper = (fn: (data: AuthData) => Promise<boolean>) => {
        return async function(data: AuthData) {
            if(!await fn(data)) return;
            setMessage('');
            setOnClick('');
        }
    }
    
    return (
        <div className="main-container">
            <NavigationMenu />
            <div className="main-menu-container">
                <div id="start-btn-container">
                    <button 
                        className="main-menu-btn start-btn" 
                        onClick={() => setOnClick('createGame')}
                    >
                        Створити гру
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
                    setOnClick = {setOnClick}
                />
                }
                {onClick === 'registration' && <RegisterLogMenu 
                    confirmBtnHandler = {handlerWrapper(onRegistrationHandler)}
                    title = "Реєстрація"
                    message = {message}
                    setMessage = {setMessage}
                    setOnClick  = {setOnClick}
                />}
                {onClick === 'login' && <RegisterLogMenu
                    confirmBtnHandler = {handlerWrapper(onLoginHandler)}
                    title = "Логін" 
                    message = {message}
                    setMessage = {setMessage}
                    setOnClick = {setOnClick}
                />}

            </div>
            <GameHistory />
        </div>
    )
}

export default Home;    