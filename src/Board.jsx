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
        
        const prevFigure = selectedCell ? field[selectedCell.row][selectedCell.col] : null;
        const newFigure = field[row][col];

        if (prevFigure?.row === row && prevFigure?.col === col) {
            setSelectedCell(null);
        } 
        // else if (prevFigure && newFigure?.color != playerSide) {
        //     setSelectedCell(null);
        // }
        else if (prevFigure && (!newFigure || newFigure.color != prevFigure.color)) {
            
            const checkMovement = move(field, prevFigure, selectedCell, {row, col});
            if (checkMovement) {
                const newField = field.map(row => [...row]);
                
                const figure = newField[selectedCell.row][selectedCell.col];
                figure.movements++;
                newField[row][col] = figure;
                newField[selectedCell.row][selectedCell.col] = null;    

                setField(newField);
                setSelectedCell(null);
                playerSide == 'w' ? setPlayerSide('b') : setPlayerSide('w');
            }
        }
        else {
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