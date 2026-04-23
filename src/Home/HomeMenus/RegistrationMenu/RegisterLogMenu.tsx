import { Dispatch, SetStateAction, useState } from "react";

import HomeMenuNavBtns from "../HomeMenuNavBtns";

import './RegisterLogMenu.css';
import '../HomeMenus.css';

interface RegisterLogMenuProps {
    title: string,
    message: string,
    confirmBtnHandler: ({ userName, password }: 
        { userName: string, password: string }) => Promise<void>,
    setOnRegLog: Dispatch<SetStateAction<boolean>>,
}
const RegisterLogMenu = (props: RegisterLogMenuProps) => {
    const {
        title,
        message,
        confirmBtnHandler,
        setOnRegLog
    } = props;
    
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    return (
        <div className="open-menu__container">
            <h1 className="open-menu__title">{title}</h1>
            <div className="open-menu__main-container">
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
                <p className="open-menu__message">{message}</p>
            </div>

            <HomeMenuNavBtns 
                confirmBtnHandler = {() => confirmBtnHandler({ userName: userName, password: password })}
                returnBtnHandler = {() => setOnRegLog(false)}
                confirmBtnTitle = "Підтверити"
                returnBtnTitle = "Повернутися"
            />
            
        </div>
    )
}

export default RegisterLogMenu;