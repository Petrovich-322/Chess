import { io } from 'socket.io-client';
import { useState, useEffect, use } from 'react';
import { useParams } from 'react-router-dom';

import { checkMove } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';
import { playerStatus } from './services/player.ts';
import createBoard from './services/createBoard.ts';   
import getUserId from './services/userId.ts'; 

import NewCell from './NewCell';
import './Board.css';
import { hostAdress } from './services/host.ts';

const socket = io(`${hostAdress}`);

const userStatus = await getUserId()

const Board = () => {
    const [field, setField] = useState(createBoard());
    const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
    const [availableMoves, setAvailableMoves] = useState<{row: number; col: number}[]>([]);
    
    const { roomId } = useParams<{roomId: string}>();
    const roomPath = roomId ?? 'game-error';

    useEffect(() => {
        const side = async () => {
            await playerStatus.getSide(roomPath, userStatus.userId).then(data => {
                userStatus.side = data;
            });
        }
        side();
        console.log(userStatus);
        socket.emit('joinRoom', roomPath);   
        socket.on('updateInfo', (data) => {
            setField(data.field);
            userStatus.activeSide = data.playerSide;
            console.log(userStatus)
            
        });
        return () => {
            socket.off('updateInfo');
        }; 
    }, []);
    
    const onSelect = (row: number, col: number) => {
        const prevFigure = selectedCell ? field[selectedCell.row][selectedCell.col] : null;
        const newFigure = field[row][col];

        if (selectedCell?.row === row && selectedCell?.col === col) {
            setSelectedCell(null);
            setAvailableMoves([]);
        } 
        else if (prevFigure?.color != userStatus.side && roomId != 'test-server') {
            setSelectedCell({row, col});
        }
        else if(selectedCell && (newFigure?.color === prevFigure?.color)) {
            setSelectedCell({row, col});
        }
        
        else if (selectedCell && prevFigure && (roomId == 'test-server' ||  userStatus.side === userStatus.activeSide)) {
            const checkMovement = checkMove(field, selectedCell, {row, col});
            if (checkMovement) {
                socket.emit('newMove', {
                    roomPath, 
                    move: {from: selectedCell, to: {row, col}}, 
                });
                setAvailableMoves([]);
            }
        }
        if (newFigure?.color === userStatus.side || roomId == 'test-server') setAvailableMoves(getAvailableMoves(field, {row, col}));
        else setAvailableMoves([]);
        setSelectedCell({row, col});
    };
    
    return (
        <div className='board'>
            {field.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className='board-row'>
                    {row.map((column, colIndex) => (
                        <NewCell 
                            key={`row-${rowIndex}-col-${colIndex}`}
                            index={
                                {rowIndex: rowIndex,
                                colIndex: colIndex,}
                            }
                            figure={column}
                            color={(rowIndex+colIndex)%2===0 ? 'white' : 'black'}
                            isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                            isAvailable={availableMoves.some(move => move.row === rowIndex && move.col === colIndex)}
                            onSelect={onSelect}
                        />
                        ))
                    }
                </div>
                ))
            }
        </div>
    )
}

export default Board;