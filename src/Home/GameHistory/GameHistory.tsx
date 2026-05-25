import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { SocketContext } from '@/Context/SocketContext';

import './GameHistory.css';
import { userService } from '@/services/UserServiceProxy';

const GameHistory = () => {
    const socket = useContext(SocketContext);
    const navigate = useNavigate();

    const [gameHistory, setGameHistory] = useState<any[]>([]);
    
    userService.subscribe(() => {
        setGameHistory([]);
        if(socket) socket.emit('get-game-history');
    });
    
    useEffect(() => {
        if(!socket) return;
        setGameHistory([]);
        
        socket.emit('get-game-history');

        socket.on('update-game-history', (game) => {
            setGameHistory((prev) => [...prev, game]);
        });

        return () => {
            socket.off('update-game-history');
        };
    }, [socket]);

    const onClick = (game: any) => {
        navigate('./savedGame', {state: { game }});
    }

    return (
        <div className='game-history__container-main'>
            <div className='game-history__container'>
                {gameHistory.toReversed().map((game, index) => {
                    const opponent = game.whitePlayer.userData.userName === userService.userName ? game.blackPlayer : game.whitePlayer;
                    const userColor = game.whitePlayer.userData.userName === userService.userName ? 'white' : 'black';
                    const gameResult = game.winner === userColor ? 'win' : 'loose';

                    return (
                        <div 
                            className='game-history__game' 
                            key={`game-history__game-${index}`}
                            onClick={() => onClick(game)}
                        >
                            <div className='game-history__game-first__column'>
                                <div className='game-history__game-img__container'>
                                    <img src='public/assets/def-user-icon.jpg' className='game-history__game-img'></img>
                                </div>
                                <span className='game-history__game-userName'>{`${opponent.userData.userName} (${opponent.userData.rating})`}</span>
                                <div className='game-history__game-result__container'>
                                    <span className={`game-history__game-result ${gameResult}`}>{gameResult === 'win' ? 'Перемога' : 'Поразка'}</span>
                                </div>
                            </div>
                            <div className='game-history__game-date__container'>
                                <span>{game.date}</span>
                            </div>
                        </div>

                    )
                })}
            </div>
        </div>
    );
}

export default GameHistory;