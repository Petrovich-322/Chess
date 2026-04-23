import { useEffect, useState, Dispatch, SetStateAction, useContext } from 'react';

import { MoveStory } from '@/Interfaces/interface';

import './PlayerInfo.css'
import { SocketContext } from '@/SocketContext';

interface PlayerInfoProps {
    isUser: boolean,
    timer: number, 
    player: string | null,
    moveStory: MoveStory, 
    activeSide: string | undefined,
    gameEnd: Boolean,
    roomId: string | undefined,
    setGameEnd: Dispatch<SetStateAction<boolean>>
}

const PlayerInfo = (props: PlayerInfoProps) => {
    const socket = useContext(SocketContext);
    
    const {
        isUser,
        timer,
        player,
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

        if(!activeSide || activeSide != player || gameEnd) {
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
            socket.emit('timerGameEnd', {roomId: roomId, winner: player == 'white' ? 'black' : 'white'});
        } 
    }, [playerTimer]);
    
    const takenFigures = [];
    for(const moveElement of moveStory) {
        if(moveElement.secondFigure && moveElement.secondFigure.color != player) {
            takenFigures.push(moveElement.secondFigure);
        }
    } 

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className={`player-card ${(player === activeSide) ? 'player-card--active' : ''}`}>
            <div className="player-card__main">
                <div className="player-card__user-info">
                    <span className="player-card__name">
                        {player === 'white' ? 'Білий' : 'Чорний'} 
                        {isUser && <span className="player-card__tag">(користувач)</span>}
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