import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import './PlayerInfo.css'

interface PlayerInfoProps {
    timer: number, 
    player: string | null,
    activeSide: string | undefined,
    gameEnd: Boolean,
    setGameEnd: Dispatch<SetStateAction<boolean>>
}

const PlayerInfo = (props: PlayerInfoProps) => {
    const {
        timer,
        player,
        activeSide,
        gameEnd,
        setGameEnd
    } = props;

    const [playerTimer, setPlayerTimer] = useState(timer)

    useEffect(() => {
        setPlayerTimer(timer);
    }, [timer])

    useEffect(() => {
        let timerInterval: any;
        if(gameEnd || !activeSide || activeSide != player) {
            clearInterval(timerInterval);
            return;
        }
        timerInterval = setInterval(() => {
            setPlayerTimer(prev => {
                if(prev === 0) {
                    setGameEnd(true); 
                    return prev;
                }
                return prev-1;
            });
        }, 1000);
        return () => {
            if(timerInterval) {
                clearInterval(timerInterval);
            }
        }
    }, [activeSide, gameEnd]);

    return (
        <div className="player-info-container">
            <p className="player-info-title">{player == 'w' ? 'White' : 'Black'}</p>
            <p className="player-info-timer">{`${Math.floor(playerTimer/60)}:${Math.floor(playerTimer%60)}`}</p>
        </div>
    )
}

export default PlayerInfo;