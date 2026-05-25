import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 

import Home from "./Home/Home";
import GameWrapper from "./Game/Game";  

import { SocketProvider } from './Context/SocketProvider';
import { userService } from './services/UserServiceProxy';
import SavedGame from '@/Home/GameHistory/SavedGame';
import NavigationMenu from './NavigationMenu/NavigationMenu';

const App = () => {
    const [loggedIn, setLoggedIn] = useState<boolean>(!!userService.token);
    userService.subscribe(() => setLoggedIn(!!userService.token));

    useEffect(() => {
        if(loggedIn) userService.updateUser();
        console.log('app update', loggedIn);
    }, [loggedIn]);
 
    return (
        <BrowserRouter>
            <SocketProvider>
                <div className='app__container'>
                    <NavigationMenu />
                    <div className='main-route__container'>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/game/:roomId" element={<GameWrapper />} />
                            <Route path="/savedGame" element={<SavedGame />} />
                        </Routes>
                    </div>
                </div>
            </SocketProvider>
        </BrowserRouter>
  );
}

export default App;
