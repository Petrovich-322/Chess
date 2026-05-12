import { useEffect, useState, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 

import Home from "./Home/Home";
import Game from "./Game/Game";  

import { SocketContext } from '@/Context/SocketContext';
import { socket } from '@/Context/SocketContext';
import { userService } from './services/userService';
import SavedGame from '@/Home/GameHistory/SavedGame';

export const AppContext = createContext({
    updatePage: () => {}
});

const App = () => {
    const [number, setNumber] = useState(0);
    
    const updatePage = () => {
        setNumber((prev) => prev + 1);
    }

    useEffect(() => {
        if(userService.token) userService.updateUser();
    }, []);
 
    return (
        <BrowserRouter>
            <AppContext.Provider value={{updatePage: updatePage}}>
                <SocketContext.Provider value={socket}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/game/:roomId" element={<Game />} />
                        <Route path="/savedGame" element={<SavedGame />} />
                    </Routes>
                </SocketContext.Provider>
            </AppContext.Provider>
        </BrowserRouter>
  );
}

export default App;
