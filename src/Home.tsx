import Board from "./Board";    
import { useNavigate } from 'react-router-dom';
import "./Home.css";

const Home = () => {        
    const navigate = useNavigate();

    const createRoom = async () => {
        const response = await fetch('http://localhost:3000/create-room');
        const data = await response.json().then(data => {
            navigate(`/game/${data.roomId}`);
        });
    }
    
    return (
        <div id="start-btn-container">
            <button id="start-btn" onClick={createRoom}>Create New Room</button>
        </div>
    )
}

export default Home;    