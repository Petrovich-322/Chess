import { useState } from 'react';
import NewCell from "./NewCell.jsx";
import "./Board.css";
import move from "./rules.js";

class figure {
    movements = 0;
    constructor (type, color) {
        this.type = type;
        this.color = color;
    }   
}

const defField = [
    [new figure('rook','b'),new figure('knight','b'),new figure('bishop','b'),
    new figure('king','b'),
    new figure('queen','b'),
    new figure('bishop','b'),new figure('knight','b'),new figure('rook','b')],
    
    Array.from({ length: 8 }, () => new figure('pawn', 'b')),
    
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    
    Array.from({ length: 8 }, () => new figure('pawn', 'w')),
    
    [new figure('rook','w'),new figure('knight','w'),new figure('bishop','w'),
    new figure('king','w'),
    new figure('queen','w'),
    new figure('bishop','w'),new figure('knight','w'),new figure('rook','w')],
]

const Board = () => {
    const [field, setField] = useState(defField);
    const [selectedCell, setSelectedCell] = useState(null);
    const [playerSide, setPlayerSide] = useState('w');
    
    const selectField = (row, col) => {
        if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
            setSelectedCell(null);
        } 
        else if (selectedCell && field[selectedCell.row][selectedCell.col]?.color != playerSide) {
            setSelectedCell(null);
        }
        else if (selectedCell && field[selectedCell.row][selectedCell.col] && (!field[row][col] || field[row][col].color != field[selectedCell.row][selectedCell.col].color)) {
            
            const checkMovement = move(field, field[selectedCell.row][selectedCell.col], selectedCell, {row, col});
            // console.log(field);
            if (checkMovement) {
                const newField = field.map(row => [...row]);

                newField[selectedCell.row][selectedCell.col].movements++;
                newField[row][col] = newField[selectedCell.row][selectedCell.col];
                newField[selectedCell.row][selectedCell.col] = null;

                setField(newField);
                setSelectedCell(null);
                playerSide == 'w' ? setPlayerSide('b') : setPlayerSide('w');
            }
        }
        else {
            // console.log(`cell: ${field[row][col]?.type}`);
            setSelectedCell({row, col});
        }
    };
    
    return (
        <div className="board">
            {field.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="board-row">
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