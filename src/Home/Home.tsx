import { useState } from 'react';

import CreatingGameMenu from './HomeMenus/CreatingGameMenu/CreatingGameMenu'
import NavigationMenu from '@/NavigationMenu/NavigationMenu';
import RegisterLogMenu from './HomeMenus/RegistrationMenu/RegisterLogMenu';

import registration from '@/Services/registration';

import "./Home.css";

const Home = () => {        
    const [onCreateGame, setOnCreateGame] = useState<boolean>(false);
    const [onRegistration, setOnRegistration] = useState<boolean>(false);
    const [onLogin, setOnLogin] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const onRegistrationHandler = async (data: {userName: string, password: string}) => {
        
        const response = await registration(data);
        
        if(!response.ok) {
            setMessage(response.data.message);
        } else {
            alert('Registration success');
            setMessage('');
        }
        // alert(`${response.data.name}: ${response.data.message}`);
        console.log(response.data.name, response.data.message);
    }

    const onLoginHandler = async  () => {
        console.log('login');
    }
    return (
        <div className="main-container">
            <NavigationMenu />
            <div className="main-menu-container">
                <div id="start-btn-container">
                    <button 
                        className="main-menu-btn start-btn" 
                        onClick={() => setOnCreateGame(true)}
                    >
                        Створити гру
                    </button>
                    <button 
                        className="main-menu-btn new-user-btn"
                        onClick={() => setOnLogin(true)}
                    >
                        Логін
                    </button>
                    <button 
                        className="main-menu-btn new-user-btn" 
                        onClick={() => setOnRegistration(true)}
                    > 
                        Реєстрація
                    </button>
                </div>
                {onCreateGame && <CreatingGameMenu
                    setOnCreateGame = {setOnCreateGame}
                />
                }
                {onRegistration && <RegisterLogMenu 
                    confirmBtnHandler = {onRegistrationHandler}
                    title = "Реєстрація"
                    message = {message}
                    setOnRegLog  = {setOnRegistration}
                />}
                {onLogin && <RegisterLogMenu
                    confirmBtnHandler = {onLoginHandler}
                    title = "Логін" 
                    message = {message}
                    setOnRegLog = {setOnLogin}
                />}
            </div>
        </div>
    )
}

export default Home;    