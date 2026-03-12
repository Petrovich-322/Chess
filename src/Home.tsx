import { useNavigate } from 'react-router-dom';

import getUserId from './services/userId';
import { hostAdress } from './services/host';

import "./Home.css";

getUserId();

const Home = () => {        
    const navigate = useNavigate();
    
    const createRoom = async () => {
        try {
            const response = await fetch(`${hostAdress}/create-room`);
            
            if(!response.ok) {
                throw new Error (`failed to create-room ${response.status}`);
            }

            await response.json().then(data => {
                navigate(`/game/${data.roomPath}`);
            });
        } catch (err) {
            alert(`server is not responding properly ${err}`);
        }
    }
    
    return (
        <div id="start-btn-container">
            <button id="start-btn" onClick={createRoom}>Create New Room</button>
        </div>
    )
}

export default Home;    