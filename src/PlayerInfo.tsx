import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { MoveStory } from './interfaces/interface';

import './PlayerInfo.css'

interface PlayerInfoProps {
    timer: number, 
    player: string | null,
    moveStory: Array<MoveStory>, 
    activeSide: string | undefined,
    gameEnd: Boolean,
    setGameEnd: Dispatch<SetStateAction<boolean>>
}

const PlayerInfo = (props: PlayerInfoProps) => {
    const {
        timer,
        player,
        moveStory,
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
            setPlayerTimer(prev => prev-1);
        }, 1000);
        return () => {
            if(timerInterval) {
                clearInterval(timerInterval);
            }
        }
    }, [activeSide, gameEnd]);

    useEffect(() => {
        if(playerTimer <= 0 && !gameEnd) setGameEnd(true); 
    }, [playerTimer])
    
    const takenFigures = [];
    for(const moveElement of moveStory) {
        if(moveElement.secondFigure && moveElement.secondFigure.color != player) {
            takenFigures.push(moveElement.secondFigure);
        }
    } 
    return (
        <div className="player-info-container">
            <div className="first-info-label-container"> 
                <p className="player-info-title">{player == 'w' ? 'White' : 'Black'}</p>
                {takenFigures.map((figure) => {
                    const path = `/assets/${figure.color}-${figure.type}.png`
                    return <img src={path} className="taken-figure-img"/>
                })}
            </div>
            <p className="player-info-timer">{`${Math.floor(playerTimer/60)}:${Math.floor(playerTimer%60)}`}</p>
        </div>
    )
}

export default PlayerInfo;