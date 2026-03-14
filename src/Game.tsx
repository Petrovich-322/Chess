import { io } from 'socket.io-client';
import { useState, useEffect, use } from 'react';
import { useParams } from 'react-router-dom';

import { checkMove } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';
import { playerService } from './services/player';
import Board from './Board'
import createBoard from './services/createBoard';   
import getUserId from './services/userId'; 


import './Board.css';
import { hostAdress } from './services/host';


interface userInterface {
    userId: string;
    side: string;
}
const defUser: userInterface = {
    userId: 'spectator',
    side: 'spectator',
}

const socket = io(`${hostAdress}`);
let isConnectionMessage = true;

const Game = () => {
    const [field, setField] = useState(createBoard());
    const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
    const [availableMoves, setAvailableMoves] = useState<{row: number; col: number}[]>([]);
    const [userStatus, setUserStatus] = useState<userInterface>(defUser);
    const [activeSide, setActiveSide] = useState<string>();

    const { roomId } = useParams<{roomId: string}>();

    useEffect(() => {
        const initGame = async () =>  {
            if (!roomId) return 'fail';
            const userIdData = await getUserId('');
            const userId = userIdData ?? defUser.userId;
            
            const userSideData = await playerService.getSide(roomId, userId);
            const userSide = userSideData ?? defUser.side;

            const user: userInterface = {
                userId: userId,
                side: userSide,
            }
            console.log('user', user);
            setUserStatus(user);
            const join = () => {
                if(!isConnectionMessage) {
                    // alert('connection succes');
                    console.log('connection succes');
                    isConnectionMessage = true;
                }
                socket.emit('joinRoom', roomId);
                socket.on('updateInfo', (data) => {
                    setField(data.field);
                    setActiveSide(data.activeSide);
                });
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
                isConnectionMessage = false;
            }  
        }
        initGame();
        return () => {
            socket.off('updateInfo');
        }; 
    }, [roomId]);
    
    const onSelect = (row: number, col: number) => {
        if (userStatus?.side === 'spectator') return;
        
        if (selectedCell?.row === row && selectedCell?.col === col) {
            setSelectedCell(null);
            setAvailableMoves([]);
            return;
        }
        if (selectedCell && (roomId === 'test-server' || userStatus.side === activeSide && userStatus.side == field[selectedCell.row][selectedCell.col]?.color)) {
            console.log(`activeSide: ${activeSide} user: ${userStatus.side}`);
            const checkMovement = checkMove(field, selectedCell, { row, col });
            if (checkMovement) {
                socket.emit('newMove', {
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
        <div>
            <Board 
                field = {field}
                selectedCell = {selectedCell}
                availableMoves = {availableMoves}
                onSelect = {onSelect}
            />
        </div>

    )
}

export default Game;