import { useEffect, useState, Dispatch, SetStateAction, useContext } from 'react';

import { MoveStory } from '@/Interfaces/interface';

import { SocketContext } from '@/Context/SocketContext';

import './PlayerInfo.css'


interface PlayerInfoProps {
    timer: number, 
    userInfo: {
        userName: string | null,
        side: 'white' | 'black' | 'spectator',
    },
    moveStory: MoveStory, 
    activeSide: string | undefined,
    gameStatus: string,
    roomId: string | undefined,
    setGameStatus: Dispatch<SetStateAction<string>> | undefined
}

const PlayerInfo = (props: PlayerInfoProps) => {
    const socket = useContext(SocketContext);
    
    const {
        timer,
        userInfo,
        moveStory,
        activeSide,
        gameStatus,
        roomId,
        setGameStatus,
    } = props;

    useEffect(() => {
        setPlayerTimer(timer);
    }, [timer]);

    if(userInfo.userName === null) userInfo.userName = userInfo.side === 'white' ? 'Білий' : 'Чорний';

    const [playerTimer, setPlayerTimer] = useState(timer)

    useEffect(() => {
        let timerInterval: any;

        if(!activeSide || activeSide != userInfo.side || gameStatus === 'finished' || gameStatus === 'prepearing') {
            clearInterval(timerInterval);
            return;
        }
        timerInterval = setInterval(() => {
            setPlayerTimer(prev => prev-1);
        }, 1000);
        return () => {
            if(timerInterval) {
                clearInterval(timerInterval);
            }
        }
    }, [activeSide, gameStatus]);

    useEffect(() => {
        if(playerTimer <= 0 && gameStatus !== 'finished') {
            if(setGameStatus) setGameStatus('finished');
            setPlayerTimer(0);
            socket.emit('timerGameEnd', {
                roomId: roomId, 
                winner: userInfo.side == 'white' ? 'black' : 'white'
            });
        } 
    }, [playerTimer]);
    
    const takenFigures = [];
    for(const moveElement of moveStory) {
        if(moveElement.secondFigure && moveElement.secondFigure.color != userInfo.side) {
            takenFigures.push(moveElement.secondFigure);
        }
    } 

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className={`player-card ${(userInfo?.side === activeSide) ? 'player-card--active' : ''}`}>
            <div className="player-card__main">
                <div className="player-card__user-info">
                    <span className="player-card__name">
                        {userInfo.userName ? userInfo.userName : (userInfo.side === 'white' ? 'Білий' : 'Чорний')} 
                    </span>
                    
                    <div className="player-card__captured">
                        {takenFigures.map((figure, index) => (
                            <img 
                                key={index}
                                src={`/assets/${figure!.color}-${figure!.type}.svg`} 
                                className="player-card__piece" 
                                alt="captured"
                            />
                        ))}
                    </div>
                </div>

                <div className={`player-card__timer ${playerTimer < 30 ? 'player-card__timer--low' : ''}`}>
                    {formatTime(playerTimer)}
                </div>
            </div>
        </div>
    )
}

export default PlayerInfo;