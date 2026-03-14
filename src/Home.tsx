import { useNavigate } from 'react-router-dom';

import { playerService } from './services/player';
import { hostAdress } from './services/host';
import getUserId from './services/userId';

import "./Home.css";

await getUserId('');

const Home = () => {        
    const navigate = useNavigate();
    
    const createRoom = async () => {
        playerService.reset();
        try {
            const response = await fetch(`${hostAdress}/create-room`);
            
            if(!response.ok) {
                throw new Error (`failed to create-room ${response.status}`);
            }

            await response.json().then(data => {
                navigate(`/game/${data.roomId}`);
            });
        } catch (err) {
            alert(`server is not responding properly ${err}`);
        }
    }

    const newUser = async () => {
        await getUserId('newUser');
    }
    
    return (
        <div id="start-btn-container">
            <button id="start-btn" className="btn" onClick={createRoom}>Create New Room</button>
            <button id="new-user-btn" className="btn" onClick={newUser}>createNewUser</button>
        </div>
    )
}

export default Home;    