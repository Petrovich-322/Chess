import { Figure } from "../../Interfaces/interface";

interface NewCellProps {
    index: {rowIndex: number;colIndex: number;};
    figure: Figure | null;
    color: string;
    isSelected: boolean;
    isAvailable: boolean;
    onSelect: (rowIndex: number, colIndex: number) => void;
}
const NewCell = (props: NewCellProps) => {
    const {
        index,
        figure,
        color,
        isSelected,
        isAvailable,
        onSelect,
    } = props;

    const divClassList = `cell ${color}-cell ${isSelected ? 'selected' : ''} ${isAvailable ? 'available' : ''}`;
    const figureClassList = `figure ${figure?.color}-figure ${figure?.type}-figure`;

    // if(figure)console.log(`${figure.color}-${figure.type}.png`);
    return (
        <div className={divClassList} onClick={() => onSelect(index.rowIndex, index.colIndex)}>
            {figure && <img src={`/assets/${figure?.color}-${figure?.type}.png`} alt={`${figure?.type}`} className={figureClassList} />}
        </div>
    )
}

export default NewCell;