import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { hostAdress } from './Services/host';
import { checkMove } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';
import { chachCheck } from 'rules-lib';
import { playerService } from './Services/player';

import { AvailableMoves, SelectedCell, ServerData } from './Interfaces/interface';
import { MoveStory } from './Interfaces/interface';

import createBoard from './Services/createBoard';   
import getUserId from './Services/userId'; 

import Board from './Board/Board'
import PlayerInfo from './PlayerInfo/PlayerInfo';
import GameInfo from './GameInfo/GameInfo';

import './Game.css';

interface KingsPosition {
    whiteKing: {row: number, col: number}, 
    blackKing: {row: number, col: number}
}
interface UserStatus {
    userId: string, 
    side: string
}
interface GameTimer {
    whiteTimer: number,
    blackTimer: number
}

const defUser = {
    userId: '---',
    side: 'spectator',
}
const defTimer = {
    whiteTimer: 600,
    blackTimer: 600,
}
const defKingsPos = {
    whiteKing: {row: 7, col: 4},
    blackKing: {row: 0, col: 4}
}

const socket = io(`${hostAdress}`);

const Game = () => {
    const [field, setField] = useState(createBoard());
    const [tempField, setTempField] = useState(createBoard());
    const [showMoveStory, setShowMoveStory] = useState<boolean>(false);
    const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
    const [availableMoves, setAvailableMoves] = useState<AvailableMoves>([]);
    const [kingsPostion, setKingsPosition] = useState<KingsPosition>(defKingsPos);
    const [userStatus, setUserStatus] = useState<UserStatus>(defUser);
    const [activeSide, setActiveSide] = useState<string>();
    const [gameTimer, setGameTimer] = useState<GameTimer>(defTimer);
    const [gameEnd, setGameEnd] = useState<boolean>(false);
    const [moveStory, setMoveStory] = useState<MoveStory[]>([]);
    
    const fieldsCache = useRef<Record<number, any[][]>>({});
    
    const {roomId} = useParams<{roomId: string}>();

    const userKing = userStatus.side === 'w' ? kingsPostion.whiteKing : kingsPostion.blackKing;
    
    const onUpdateInfo = (data: ServerData) => {
        setActiveSide(data.activeSide);
        setGameTimer({
            whiteTimer: data.whitePlayer.time, 
            blackTimer: data.blackPlayer.time
        });
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
            
            const localStorageDataJSON = localStorage.getItem('DenisChess');
            const localStorageData = localStorageDataJSON ? JSON.parse(localStorageDataJSON) : {userId: null, prevRoomId: null};
            localStorageData.prevRoomId = roomId; 
            console.log(localStorageData);
            localStorage.setItem('DenisChess', JSON.stringify(localStorageData));

            socket.on('updateInfo', (data: ServerData) => {
                onUpdateInfo(data);
            });
            
            socket.on('initializeGame', (data: ServerData) => {
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
                socket.io.on('reconnect', () => {
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

        if(chachCheck(userKing, field)) console.log('SHAH!!!');
    }, [field]);

    const onSelect = (row: number, col: number) => {
        if(showMoveStory)
        {
            setAvailableMoves([]);
            setSelectedCell(null);
            setShowMoveStory(false);    
            return;
        }
        
        if (userStatus.side === 'spectator' || gameEnd) return;

        const updateSelectedCell = () => {
            const newFigure = field[row][col];
            if (newFigure?.color === userStatus.side) 
            {
                setSelectedCell({ row, col });
                setAvailableMoves(getAvailableMoves(field, { row, col }, userKing));
                return;
            }

            setSelectedCell({ row, col });
            setAvailableMoves([]);
        }

        if(selectedCell) {
            if(selectedCell.row === row && selectedCell.col === col) 
            {
                setSelectedCell(null);
                setAvailableMoves([]);
                return;
            }
            
            if(userStatus.side !== activeSide) {
                updateSelectedCell();
                return;
            }
            
            if(userStatus.side === field[selectedCell.row][selectedCell.col]?.color) 
            {
                const checkMovement = checkMove(field, selectedCell, { row, col }, userKing);
                
                if(checkMovement) 
                {
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
        }

        updateSelectedCell();
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