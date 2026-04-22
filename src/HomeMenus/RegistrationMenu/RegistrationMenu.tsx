import { Dispatch, SetStateAction, useState } from "react";

import registration from '../../Services/userId';

import './RegistrationMenu.css';
import '../HomeMenus.css';
import HomeMenuNavBtns from "../HomeMenuNavBtns";

interface RegistrationMenuProps {
    setOnRegistration: Dispatch<SetStateAction<boolean>>,
}
const RegistrationMenu = (props: RegistrationMenuProps) => {
    const {
        setOnRegistration
    } = props;
    
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    return (
        <div className="open-menu__container">
            <div className="open-menu__input-container">
                <input 
                    className="open-menu__input username" 
                    placeholder="Введіть ваш нік: "
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <input 
                    className="open-menu__input password" type="password" 
                    placeholder="Введіть пароль: "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

            </div>
            <HomeMenuNavBtns 
                confirmBtnHandler = {async () => await registration({ userName: userName, password: password })}
                returnBtnHandler = {() => setOnRegistration(false)}
                confirmBtnTitle = "Підтверити"
                returnBtnTitle = "Повернутися"
            />
            
        </div>
    )
}

export default RegistrationMenu;