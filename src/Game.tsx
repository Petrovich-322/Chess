import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { hostAdress } from './services/host';
import { checkMove } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';
import { chachCheck } from 'rules-lib';
import { playerService } from './services/player';

import { ServerData } from './interfaces/interface';
import { MoveStory } from './interfaces/interface';

import createBoard from './services/createBoard';   
import getUserId from './services/userId'; 

import Board from './Board'
import PlayerInfo from './PlayerInfo';
import GameInfo from './GameInfo';

import './Game.css';

const defUser = {
    userId: '---',
    side: 'spectator',
}
const defTimer = {
    whiteTimer: 600,
    blackTimer: 600,
}
const defKingsPosition = {
    whiteKing: {row: 7, col: 4},
    blackKing: {row: 0, col: 4}
}

const socket = io(`${hostAdress}`);

const Game = () => {
    const [field, setField] = useState(createBoard());
    const [tempField, setTempField] = useState(createBoard());
    const [showMoveStory, setShowMoveStory] = useState<boolean>(false);
    const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
    const [availableMoves, setAvailableMoves] = useState<{row: number; col: number}[]>([]);
    const [kingsPostion, setKingsPosition] = useState<{whiteKing: {row: number, col: number}; blackKing: {row: number, col: number}}>(defKingsPosition);
    const [userStatus, setUserStatus] = useState<{userId: string; side: string;}>(defUser);
    const [activeSide, setActiveSide] = useState<string>();
    const [gameTimer, setGameTimer] = useState<{whiteTimer: number; blackTimer: number}>(defTimer);
    const [gameEnd, setGameEnd] = useState<boolean>(false);
    const [moveStory, setMoveStory] = useState<Array<MoveStory>>([]);
    
    const fieldsCache = useRef<Record<number, any[][]>>({});
    
    const {roomId} = useParams<{roomId: string}>();


    const onUpdateInfo = (data: ServerData) => {
        setActiveSide(data.activeSide);
        setGameTimer({whiteTimer: data.whitePlayer.time, blackTimer: data.blackPlayer.time});
        setKingsPosition(data.kingsPosition);
        
        const lastMove = data.moveStory[data.moveStory.length-1];
        const moveTo = lastMove.move.to;
        const moveFrom = lastMove.move.from;

        setMoveStory((prev) => [...prev, lastMove]);
        setShowMoveStory(false);

        setField((prevField) => {
            const newField = prevField.map(row => [...row]);
            const figure = newField[moveFrom.row][moveFrom.col];
            
            newField[moveTo.row][moveTo.col] = figure;
            newField[moveFrom.row][moveFrom.col] = null;
            figure.movements++;

            return newField;
        });

        getAvailableMoves.clear();
    } 

    useEffect(() => {
        const initGame = async () => {
            if(!roomId) return roomId;
            
            socket.on('updateInfo', (data: ServerData) => {
                onUpdateInfo(data);
            });
            
            socket.on('initializeGame', (data: ServerData) => {
                // console.log(data);
                console.log('initializeGame');
                setField(data.field);
                setActiveSide(data.activeSide);
                setGameTimer({whiteTimer: data.whitePlayer.time, blackTimer: data.blackPlayer.time});   
                setMoveStory(data.moveStory);
                setGameEnd(data.gameStatus.gameEnd);
            });

            socket.on('gameEnd', (data) => {
                console.log(`Winner is ${data.winner == 'w' ? 'White' : 'Black'}`);
                setActiveSide(data.activeSide);
                setGameEnd(true);
            })

            const userIdData = await getUserId('');
            const userSideData = await playerService.getSide(roomId, userIdData);
            
            console.log(userSideData);
            setUserStatus({
                userId: userIdData ?? defUser.userId,
                side: userSideData ?? defUser.side
            });
            
            const join = () => {
                console.log('connection succes');
                socket.emit('joinRoom', roomId);
                
                socket.io.once('reconnect_attempt', () => {
                    console.log('Server connection failed, try later');
                });
                socket.io.on('reconnect', (data) => {
                    console.log('connection succes');
                })
            };

            if (socket.connected) {
                join();
            } else {
                socket.once('connect', join);
                console.log('server connection problem'); 
            }  
        }
        initGame();
        return () => {
            socket.off('updateInfo');
        }; 
    }, []);

    useEffect(() => {
        if(activeSide != userStatus.side) return;

        const king = userStatus.side == 'w' ? kingsPostion.whiteKing : kingsPostion.blackKing;
        if(chachCheck(king, field)) console.log('SHAH!!!');
    }, [field]);

    const onSelect = (row: number, col: number) => {
        if(showMoveStory){
            setAvailableMoves([]);
            setSelectedCell(null);
            setShowMoveStory(false);    
            return;
        }
        if (userStatus.side === 'spectator' || gameEnd) return;

        const king = userStatus.side === 'w' ? kingsPostion.whiteKing : kingsPostion.blackKing;

        if (selectedCell?.row === row && selectedCell?.col === col) {
            setSelectedCell(null);
            setAvailableMoves([]);
            return;
        }
        if (selectedCell && (roomId === 'test-server' || userStatus.side === activeSide && userStatus.side === field[selectedCell.row][selectedCell.col]?.color)) {
            const checkMovement = checkMove(field, selectedCell, { row, col }, king);
            if (checkMovement) {
                socket.emit('newMove', {
                    side: userStatus.side,
                    roomId: roomId,
                    move: { from: selectedCell, to: { row, col } },
                });
                setSelectedCell(null);
                setAvailableMoves([]);
                console.log('sending newMove');
                return;
            }
        }
        
        const newFigure = field[row][col];
        if (newFigure?.color === userStatus.side || roomId === 'test-server') {
            setSelectedCell({ row, col });
            setAvailableMoves(getAvailableMoves(field, { row, col }, king));
            return;
        }

        setSelectedCell({ row, col });
        setAvailableMoves([]);
    }

    const onMoveClick = (index: number) => {
        if(fieldsCache.current[index]) {
            setTempField(fieldsCache.current[index]);
            setShowMoveStory(true);
            console.log('cache');
            return;
        }
        const historyField = createBoard();
        
        for(let i=0; i<=index; i++){
            console.log('newField', i);
            const move = moveStory[i].move;
            historyField[move.to.row][move.to.col] = {...historyField[move.from.row][move.from.col]};
            historyField[move.from.row][move.from.col] = null;
        }
        fieldsCache.current[index] = historyField
        setTempField(historyField);
        setShowMoveStory(true);
    }
    
    return (
        <div className="main-container">
            <div className="space-container">

            </div>
            <div className="game-container">
                <PlayerInfo
                    timer = {gameTimer.blackTimer}
                    player = 'b'
                    moveStory = {moveStory}
                    activeSide = {activeSide}
                    gameEnd = {gameEnd}
                    socket = {socket}
                    roomId = {roomId}
                    setGameEnd = {setGameEnd}
                />
                <Board 
                    field = {showMoveStory === false ? field : tempField}
                    selectedCell = {selectedCell}
                    availableMoves = {availableMoves}
                    onSelect = {onSelect}
                />
                <PlayerInfo
                    timer = {gameTimer.whiteTimer}
                    player = 'w'
                    moveStory = {moveStory}
                    activeSide = {activeSide}
                    gameEnd = {gameEnd}
                    socket = {socket}
                    roomId = {roomId} 
                    setGameEnd = {setGameEnd}
                />
            </div>
            <GameInfo 
                onMoveClick = {onMoveClick}
                moveStory = {moveStory}
            />
        </div>
    );
}

export default Game;