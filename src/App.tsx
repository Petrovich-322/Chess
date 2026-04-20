import { BrowserRouter, Routes, Route } from 'react-router-dom'; 

import Home from "./Home";
import Board from "./Game";  

import { SocketContext } from './SocketContext';
import { socket } from './SocketContext';

const App = () => {
    return (
        <BrowserRouter>
            <SocketContext.Provider value={socket}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game/:roomId" element={<Board />} />
                </Routes>
            </SocketContext.Provider>
        </BrowserRouter>
  );
}

export default App;
