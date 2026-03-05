
interface Figure {
    color: string;
    type: string;
}

interface Index {
    rowIndex: number;
    colIndex: number;
}

interface NewCellProps {
    index: Index;
    figure: Figure;
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
        onSelect,
    } = props;

    const divClassList = `cell ${color}-cell ${isSelected ? 'selected' : ''} ${props.isAvailable ? 'available' : ''}`;
    const figureClassList = `figure ${figure?.color}-figure ${figure?.type}-figure`;

    // if(figure)console.log(`${figure.color}-${figure.type}.png`);
    return (
        <div className={divClassList} onClick={() => onSelect(index.rowIndex, index.colIndex)}>
            {figure && <img src={`/assets/${figure?.color}-${figure?.type}.png`} alt={`${figure?.type}`} className={figureClassList} />}
        </div>
    )
}

export default NewCell;