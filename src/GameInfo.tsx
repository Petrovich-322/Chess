import './GameInfo.css';

interface gameInfoInterface {
    moveStory: Array<{from: {row: number, col: number}, to: {row: number, col: number}}>,
}
const GameInfo = (props: gameInfoInterface) => {
    const {
        moveStory,
    } = props;
    return (
        <div className="game-info-container">
            {
            }
        </div>
    )
}

export default GameInfo;