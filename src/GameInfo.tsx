import './GameInfo.css';

import { MoveStory } from './interfaces/interface';

const GameInfo = (props: {moveStory: Array<MoveStory>, onMoveClick: (index: number) => void}) => {
    const {
        onMoveClick,
        moveStory,
    } = props;
    const transition = new Map([
        [0,'a'],[1,'b'],[2,'c'],[3,'d'],[4,'e'],[5,'f'],[6,'g'],[7,'h']
    ]);
    return (
        <div className="game-info-container">
            <div className="move-list">
                {moveStory.map((element, index) => {
                    const { from, to, } = element.move;
                    const { firstFigure, secondFigure } = element;
                    const start = `/assets/${firstFigure.color}-${firstFigure.type}.png`;
                    const end = `/assets/${secondFigure?.color}-${secondFigure?.type}.png`;
                    return (
                        <div className="move-info-container" onClick={() => onMoveClick(index)} key={`move-${index}`}>
                            <p className="move-story-elements move-counter">{`${index+1}: `}</p> 
                            <img src={start} className="game-info-figure-image move-story-elements" alt={`${firstFigure.type}`} />
                            <p className="move-story-elements">{transition.get(from.col)}{8-from.row}{' => '}{transition.get(to.col)}{8-to.row}</p>
                            {secondFigure && <img src={end} className="game-info-figure-image" alt={`${secondFigure.type}`} />}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default GameInfo;