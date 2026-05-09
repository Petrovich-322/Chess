import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { SocketContext } from '@/Context/SocketContext';

import './GameHistory.css';
import userService from '@/services/userService';

const GameHistory = () => {
    const socket = useContext(SocketContext);
    const navigate = useNavigate();

    const [gameHistory, setGameHistory] = useState<any[]>([]);
    
    useEffect(() => {
        socket.emit('get-game-history');

        socket.on('update-game-history', (game) => {
            setGameHistory((prev) => [...prev, game]);
        });
        socket.on('get-history-complete', () => {
            socket.off('update-game-history');
            socket.off('get-history-complete');
        })
        
        return () => {
            socket.off('update-game-history');
            socket.off('get-history-complete');
        };
    }, []);

    useEffect(() => {
        console.log("Історія оновилася:", gameHistory);
    }, [gameHistory]);


    const onClick = (game: any) => {
        navigate('./savedGame', {state: { game }});
    }

    return (
        <div className='game-history__container-main'>
            <div className='game-history__container'>
                {gameHistory.map((game, index) => {
                    const opponent = game.whitePlayer.userData.userName === userService.userName ? game.blackPlayer : game.whitePlayer;
                    const userColor = game.whitePlayer.userData.userName === userService.userName ? 'white' : 'black';
                    const gameResult = game.winner === userColor ? 'win' : 'loose';

                    return (
                        <div 
                            className='game-history__game' 
                            key={`game-history__game-${index}`}
                            onClick={() => onClick(game)}
                        >
                            <div className='game-history__game-img__container'>
                                <img src='public/assets/def-user-icon.jpg' className='game-history__game-img'></img>
                            </div>
                            <span className='game-history__game-userName'>{`${opponent.userData.userName} (${opponent.userData.rating})`}</span>
                            <div className='game-history__game-result__container'>
                                <span className={`game-history__game-result ${gameResult}`}>{gameResult === 'win' ? 'Перемога' : 'Поразка'}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default GameHistory;