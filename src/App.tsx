import { useEffect, useState, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 

import Home from "./Home/Home";
import Game from "./Game/Game";  

import { SocketContext } from '@/Context/SocketContext';
import { socket } from '@/Context/SocketContext';
import { userService } from './services/userService';
import SavedGame from '@/Home/GameHistory/SavedGame';
import NavigationMenu from './NavigationMenu/NavigationMenu';

const App = () => {

    useEffect(() => {
        if(userService.token) userService.updateUser();
    }, []);
 
    return (
        <BrowserRouter>
            <SocketContext.Provider value={socket}>
                <div className='app__container'>
                    <NavigationMenu />
                    <div className='main-route__container'>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/game/:roomId" element={<Game />} />
                            <Route path="/savedGame" element={<SavedGame />} />
                        </Routes>
                    </div>
                </div>
            </SocketContext.Provider>
        </BrowserRouter>
  );
}

export default App;
