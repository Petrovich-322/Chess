import './GameInfo.css';

interface gameInfoInterface {
    moveStory: Array<{from: {row: number, col: number}, to: {row: number, col: number}}>,
}
const GameInfo = (props: gameInfoInterface) => {
    const {
        moveStory,
    } = props;
    console.log(moveStory);
    const transition = new Map([
        [0,'a'],[1,'b'],[2,'c'],[3,'d'],[4,'e'],[5,'f'],[6,'g'],[7,'h']
    ]);
    return (
        <div className="game-info-container">
            <div className="move-list">
                {moveStory.map((move, index) => (
                    <div className="game-info-move" key={`move-${index}`}> 
                        <p className="move-title">{transition.get(move.from.row)}{move.from.col}{' => '}{transition.get(move.to.row)}{move.to.col}</p>
                    </div>
                ))
                }
            </div>
        </div>
    )
}

export default GameInfo;