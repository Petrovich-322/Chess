import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import createBoard from '@shared/createBoard';

import Board from "@/Game/Board/Board";
import GameInfo from "@/Game/GameInfo/GameInfo";
import PlayerInfo from '@/Game/PlayerInfo/PlayerInfo';
import NavigationMenu from '@/NavigationMenu/NavigationMenu';

import { Figure } from '@shared/interfaces';

import '@/Game/Game.css';

interface SavedGameProps {
    whitePlayer: {
        userData: any,
        time: number
    }
    blackPlayer: {
        userData: any,
        time: number
    } 
    moveStory: any[],
    chatStory: {
        user: string,
        text: string
    }[],
}
const SavedGame = () => {
    const location = useLocation();
    const game = location.state?.game;

    if (!game) window.location.href = './';

    const {
        whitePlayer,
        blackPlayer,
        moveStory,
        chatStory
    } = game;

    const [field, setField] = useState<(Figure | null)[][]>(createBoard())

    const onMoveClick = (index: number) => {
        const tempField = createBoard();
        for(let i = 0; i <= index; i++) {
            const move = moveStory[i].move;
            tempField[move.to.row][move.to.col] = {
                ...tempField[move.from.row][move.from.col]
            };
            tempField[move.from.row][move.from.col] = null;
        }
        setField(tempField);
    }
    return (
        <div className="main-container">
            <NavigationMenu />
            <div className="page-container">
                <div className="full-game-container">
                    <div className="vertical-game-container">
                        <PlayerInfo
                            timer = {blackPlayer.time}
                            userInfo = {{userName: blackPlayer.userData.userName, side: 'spectator'}}
                            moveStory = {moveStory}
                            activeSide = {'spectator'}
                            gameStatus = {'finished'}
                            roomId = {undefined}
                            setGameStatus = {undefined}
                        />
                        <Board 
                            field = {field}
                            selectedCell = {null}
                            availableMoves = {[]}
                            onSelect = {undefined}
                        />
                        <PlayerInfo
                            timer = {whitePlayer.time}
                            userInfo = {{userName: whitePlayer.userData.userName, side: 'spectator'}}
                            moveStory = {moveStory}
                            activeSide = {'spectator'}
                            gameStatus = {'finished'}
                            roomId = {undefined} 
                            setGameStatus = {undefined}
                        />
                    </div>
                    <GameInfo 
                        onMoveClick = {onMoveClick}
                        moveStory = {moveStory}
                        chatStory={chatStory}
                        userName = {'Spectator'}
                        roomId = {undefined} 
                    />
                </div>
            </div>
        </div>
    );
};

export default SavedGame;