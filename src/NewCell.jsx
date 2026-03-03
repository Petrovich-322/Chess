const NewCell = (props) => {
    const {
        index,
        figure,
        color,
        isSelected,
        onSelect,
    } = props;

    const divClassList = `cell ${color}-cell ${isSelected ? 'selected' : ''}`;
    const figureClassList = `figure ${figure?.color}-figure ${figure?.type}-figure`;

    // if(figure)console.log(`${figure.color}-${figure.type}.png`);
    return (
        <div className={divClassList} onClick={() => onSelect(index.rowIndex, index.colIndex)}>
            {figure && <img src={`/assets/${figure?.color}-${figure?.type}.png`} alt={`${figure?.type}`} className={figureClassList} />}
        </div>
    )
}

export default NewCell;