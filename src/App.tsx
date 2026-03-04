import Home from "./Home";
import Board from "./Board";  
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game/:roomId" element={<Board />} />
            </Routes>
        </BrowserRouter>
  );
}

export default App;
