import { useState } from 'react';

import CreatingGameMenu from './HomeMenus/CreatingGameMenu/CreatingGameMenu'
import NavigationMenu from '@/NavigationMenu/NavigationMenu';
import RegisterLogMenu from './HomeMenus/RegistrationMenu/RegisterLogMenu';

import { RegistrationService, LoginService } from '@/Services/authorization';
import TokenService from '@/Services/tokenService';
import PlayerService from '@/Services/playerService';

import "./Home.css";

const Home = () => {        
    const [onClick, setOnClick] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const onRegistrationHandler = async (data: {userName: string, password: string}) => {

        const registrationData = {message: 'реєстрація', ...data};
        const response = await RegistrationService.request(registrationData);
        
        if(!response.ok) {
            setMessage(response.data.message);
            console.log(response.data.name, response.data.message);
            return;
        }
        
        alert('Registration success');
        setMessage('');
        
    }

    const onLoginHandler = async (data: { userName: string, password: string }) => {

        const loginData = {message: 'вхід', ...data};
        const response = await LoginService.request(loginData);

        if(!response.ok) {
            setMessage(response.data.message);
            console.log(response.data.name, response.data.message);
            return;
        } 
        
        setMessage('');

        TokenService.setToken(response.data.token);

        PlayerService.setUserName(response.data.userName);
        
        alert('Успішний вхід');
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
                    confirmBtnHandler = {onRegistrationHandler}
                    title = "Реєстрація"
                    message = {message}
                    setMessage = {setMessage}
                    setOnClick  = {setOnClick}
                />}
                {onClick === 'login' && <RegisterLogMenu
                    confirmBtnHandler = {onLoginHandler}
                    title = "Логін" 
                    message = {message}
                    setMessage = {setMessage}
                    setOnClick = {setOnClick}
                />}
            </div>
        </div>
    )
}

export default Home;    