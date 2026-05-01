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
    gameEnd: Boolean,
    roomId: string | undefined,
    setGameEnd: Dispatch<SetStateAction<boolean>>
}

const PlayerInfo = (props: PlayerInfoProps) => {
    const socket = useContext(SocketContext);
    
    const {
        timer,
        userInfo,
        moveStory,
        activeSide,
        gameEnd,
        roomId,
        setGameEnd,
    } = props;

    const [playerTimer, setPlayerTimer] = useState(timer)

    useEffect(() => {
        setPlayerTimer(timer);
    }, [timer])

    useEffect(() => {
        let timerInterval: any;

        if(!activeSide || activeSide != userInfo.side || gameEnd) {
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
    }, [activeSide, gameEnd]);

    useEffect(() => {
        if(playerTimer <= 0 && !gameEnd) {
            setGameEnd(true);
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
                        {userInfo?.userName ? userInfo.userName : (userInfo?.side === 'white' ? 'Білий' : 'Чорний')} 
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