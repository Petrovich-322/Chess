import { SocketContext } from '@/Context/SocketContext';
import apiClient from '@/services/client';
import { Dispatch, SetStateAction, useContext, useEffect } from 'react';

interface SearchingMenuProps {
    setOnClick: Dispatch<SetStateAction<string>>;
}

const SearchingMenu = (props: SearchingMenuProps) => {
    const { setOnClick } = props;
    const socket = useContext(SocketContext);
    useEffect(() => {   
        if(!socket) return;
        apiClient.post('/find-game');

        socket.on('join-game', ({ roomId }: { roomId: string }) => {
            console.log('join-game', roomId);   
            setOnClick('');
            window.location.href = `/game/${roomId}`;
        });
    }, [socket]);

    return (
        <div className="open-menu__container"> 
            <span className="setting-game-title">Пошук гри...</span>
            <div className="searching-menu__loader"></div>
            <button
                className="home-menu__btn return-btn"
                onClick={() => {
                    setOnClick('')
                    apiClient.post('/leave-queue');} 
                }
            >
                Повернутися
            </button>
        </div>
    );
};          

export default SearchingMenu;