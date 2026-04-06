import { io } from 'socket.io-client';
import { useState, useEffect, use, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { hostAdress } from './services/host';
import { checkMove } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';
import { playerService } from './services/player';
import { serverData } from './interfaces/interface';

import createBoard from './services/createBoard';   
import getUserId from './services/userId'; 

import Board from './Board'
import GameInfo from './GameInfo';
import UserInfo from './UserInfo';

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
    const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
    const [availableMoves, setAvailableMoves] = useState<{row: number; col: number}[]>([]);
    const [kingsPostion, setKingsPosition] = useState<{whiteKing: {row: number, col: number}; blackKing: {row: number, col: number}}>(defKingsPosition);
    const [userStatus, setUserStatus] = useState<{userId: string; side: string;}>(defUser);
    const [activeSide, setActiveSide] = useState<string>();
    const [gameTimer, setGameTimer] = useState<{whiteTimer: number; blackTimer: number}>(defTimer);
    const {roomId} = useParams<{roomId: string}>();

    const onUpdateInfo = (data: serverData) => {
        setActiveSide(data.activeSide);
        setGameTimer({whiteTimer: data.whitePlayer.time, blackTimer: data.blackPlayer.time});
        getAvailableMoves.clear();
        
        const moveTo = data.lastMove.to;
        const moveFrom = data.lastMove.from;
        
        setField((prevField) => {
            const newField = prevField.map(row => [...row]);
            const figure = newField[moveFrom.row][moveFrom.col];
            
            newField[moveTo.row][moveTo.col] = figure;
            newField[moveFrom.row][moveFrom.col] = null;
            figure.movements++;

            if(figure.type === 'king') {
                setKingsPosition(prev => {
                    if(figure.color === 'w') {
                        return {...prev, whiteKing: {row: moveTo.row, col: moveTo.col}};
                    } else {
                        return {...prev, blackKing: {row: moveTo.row, col: moveTo.col}};
                    }
                });
                console.log('King Pos: ', kingsPostion);
            }

            return newField;
        });
    } 

    useEffect(() => {
        const initGame = async () => {
            if(!roomId) return roomId;
            
            socket.on('updateInfo', (data) => {
                onUpdateInfo(data);
            });
            
            socket.on('initializeGame', (data) => {
                console.log('initializeGame');
                setField(data.field);
                setActiveSide(data.activeSide);
                setGameTimer({whiteTimer: data.whitePlayer.time, blackTimer: data.blackPlayer.time});   
            });

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
        let playerTimer: any;
        if(!activeSide) return;
        playerTimer = setInterval(() => {
            setGameTimer(prev => {
                if (!prev) return prev;
                if(activeSide === 'w'){
                    return {...prev,whiteTimer: prev.whiteTimer - 1};
                }
                else return {...prev,blackTimer: prev.blackTimer - 1};
            });
        }, 1000);
        return () => {
            if (playerTimer) {
                clearInterval(playerTimer);
            }
        }
    }, [activeSide]);

    const onSelect = (row: number, col: number) => {
        if (userStatus.side === 'spectator') return;

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
                    king: king,
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
    };
    
    return (
        <div className="game-container">
            <UserInfo 
                userSide = {userStatus.side}
            />
            <Board 
                field = {field}
                selectedCell = {selectedCell}
                availableMoves = {availableMoves}
                onSelect = {onSelect}
            />
            <GameInfo 
                whiteTimer = {gameTimer.whiteTimer}
                blackTimer = {gameTimer.blackTimer}
            />
        </div>
    );
}

export default Game;