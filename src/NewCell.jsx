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
    return (
        <div className={divClassList} onClick={() => onSelect(index.rowIndex, index.colIndex)}>
            {figure && <p className={figureClassList}>{figure.type}</p> }
        </div>
    )
}

export default NewCell;