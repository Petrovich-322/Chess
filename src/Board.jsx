import { useState } from 'react';
import NewCell from "./NewCell.jsx";
import "./Board.css";
import move from "rules-lib";

class Figure {
    movements = 0;
    constructor(type, color) {
        this.type = type;
        this.color = color;
    }   
}

const defField = [
    [new Figure('rook','b'),new Figure('knight','b'),new Figure('bishop','b'),
    new Figure('queen','b'),
    new Figure('king','b'),
    new Figure('bishop','b'),new Figure('knight','b'),new Figure('rook','b')],
    
    Array.from({ length: 8 }, () => new Figure('pawn', 'b')),
    
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    
    Array.from({ length: 8 }, () => new Figure('pawn', 'w')),
    
    [new Figure('rook','w'),new Figure('knight','w'),new Figure('bishop','w'),
    new Figure('queen','w'),
    new Figure('king','w'),
    new Figure('bishop','w'),new Figure('knight','w'),new Figure('rook','w')],
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