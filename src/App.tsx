import { BrowserRouter, Routes, Route } from 'react-router-dom'; 

import Home from "./Home/Home";
import Game from "./Game/Game";  

import { SocketContext } from '@/Context/SocketContext';
import { socket } from '@/Context/SocketContext';
import { userService } from './services/userService';
import SavedGame from '@/Home/GameHistory/SavedGame';

const App = () => {
    userService.updateUser();

    return (
        <BrowserRouter>
            <SocketContext.Provider value={socket}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game/:roomId" element={<Game />} />
                    <Route path="/savedGame" element={<SavedGame />} />
                </Routes>
            </SocketContext.Provider>
        </BrowserRouter>
  );
}

export default App;
