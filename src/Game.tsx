import { io } from 'socket.io-client';
import { useState, useEffect, use } from 'react';
import { useParams } from 'react-router-dom';

import { hostAdress } from './services/host';
import { checkMove } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';
import { playerService } from './services/player';
import createBoard from './services/createBoard';   
import getUserId from './services/userId'; 

import Board from './Board'
import GameInfo from './GameInfo';
import UserInfo from './UserInfo';

import './Game.css';

const defUser = {
    userId: 'spectator',
    side: 'spectator',
}
const defTimer = {
    whiteTimer: 600,
    blackTimer: 600,
}

const socket = io(`${hostAdress}`);
let isConnectionMessage = true;

const Game = () => {
    const [field, setField] = useState(createBoard());
    const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
    const [availableMoves, setAvailableMoves] = useState<{row: number; col: number}[]>([]);
    const [userStatus, setUserStatus] = useState<{userId: string; side: string;}>(defUser);
    const [activeSide, setActiveSide] = useState<string>();
    const [gameTimer, setGameTimer] = useState<{whiteTimer: number; blackTimer: number}>(defTimer);
    const { roomId } = useParams<{roomId: string}>();

    useEffect(() => {
        const initGame = async () =>  {
            if (!roomId) return roomId;
            
            socket.on('updateInfo', (data) => {
                setField(data.field);
                setActiveSide(data.activeSide);
                setGameTimer({whiteTimer: data.whitePlayer.time, blackTimer: data.blackPlayer.time});
                getAvailableMoves.clear();
            });

            const userIdData = await getUserId('');
            const userSideData = await playerService.getSide(roomId, userIdData);

            setUserStatus({
                userId: userIdData ?? defUser.userId,
                side: userSideData ?? defUser.side
            });
            const join = () => {
                if(!isConnectionMessage) {
                    // alert('connection succes');
                    console.log('connection succes');
                    isConnectionMessage = true;
                }
                socket.emit('joinRoom', roomId);
                
                socket.io.once('reconnect_attempt', () => {
                    if(isConnectionMessage) {
                        // alert(`Server connection failed, try later`);
                        console.log('Server connection failed, try later');
                    }
                    isConnectionMessage = false;
                });
                socket.io.on('reconnect', (data) => {
                    // alert('Connection succes');
                    console.log('connection succes');
                    isConnectionMessage = true;
                })
            };
            if (socket.connected) {
                join();
            } else {
                socket.once('connect', join);
                // alert('server connection problem');
                console.log('server connection problem'); 
                isConnectionMessage = false;
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
                if(activeSide == 'w'){
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
    }, [activeSide])

    const onSelect = (row: number, col: number) => {
        if (userStatus?.side === 'spectator') return;
        
        if (selectedCell?.row === row && selectedCell?.col === col) {
            setSelectedCell(null);
            setAvailableMoves([]);
            return;
        }
        if (selectedCell && (roomId === 'test-server' || userStatus.side === activeSide && userStatus.side == field[selectedCell.row][selectedCell.col]?.color)) {
            const checkMovement = checkMove(field, selectedCell, { row, col });
            if (checkMovement) {
                socket.emit('newMove', {
                    side: userStatus.side,
                    roomId: roomId,
                    move: { from: selectedCell, to: { row, col } },
                });
                setSelectedCell(null);
                setAvailableMoves([]);
                return;
            }
        }
        
        const newFigure = field[row][col];
        if (newFigure?.color === userStatus?.side || roomId == 'test-server') {
            setSelectedCell({ row, col });
            setAvailableMoves(getAvailableMoves(field, { row, col }));
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

    )
}

export default Game;