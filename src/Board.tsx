'use client';

import { io } from 'socket.io-client';
import { useState, useEffect, use } from 'react';
import { useParams } from 'react-router-dom';
import createBoard from '../entities/createBoard.ts';
import NewCell from './NewCell';
import { checkMove } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';
import './Board.css';


const defField = createBoard();
let playerSide: string | null = null;

// const socket = io('https://nondisputatiously-tetched-kimber.ngrok-free.dev');
const socket = io('http://localhost:3000');

const Board = () => {
    let { roomId } = useParams<{roomId: string}>();
    const [field, setField] = useState(defField);
    const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
    const [availableMoves, setAvailableMoves] = useState<{row: number; col: number}[]>([]);
    
    useEffect(() => {
        socket.emit('joinRoom', roomId);   
        socket.on('updateInfo', (data) => {
            setField(data.field);
            playerSide = data.playerSide;
        });
        return () => {
            socket.off('updateInfo');
        };        
    }, []);

    const selectField = (row: number, col: number) => {
        const prevFigure = selectedCell ? field[selectedCell.row][selectedCell.col] : null;
        const newFigure = field[row][col];
        if(prevFigure && !playerSide) {
            setSelectedCell({row, col});    
            return;
        }

        if (selectedCell?.row === row && selectedCell?.col === col) {
            setSelectedCell(null);
        } 
        else if(selectedCell && (newFigure?.color === prevFigure?.color)) {
            setSelectedCell({row, col});
        }
        else if (selectedCell && prevFigure) {
            const checkMovement = checkMove(field, selectedCell, {row, col});
            
            if (checkMovement) {
                socket.emit('newMove', {roomId, move: {from: selectedCell, to: {row, col}}});
            }
        }
        setAvailableMoves(getAvailableMoves(field, {row, col}));
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
                            onSelect={selectField}
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