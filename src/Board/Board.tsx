import NewCell from "./Cell/NewCell";

import type { Figure, SelectedCell, AvailableMoves} from "../Interfaces/interface"; 

import './Board.css';

interface BoardProps {
    field: Array<Array<Figure | null>>,
    selectedCell: SelectedCell,
    availableMoves: AvailableMoves,
    onSelect: (row: number, col: number) => void,
}

const Board = (props: BoardProps) => {
    const {
        field,
        selectedCell,
        availableMoves,
        onSelect
    } = props;
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