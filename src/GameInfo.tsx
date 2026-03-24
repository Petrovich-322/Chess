import './GameInfo.css'

const GameInfo = (props: {whiteTimer: number, blackTimer: number}) => {
    const {
        whiteTimer,
        blackTimer
    } = props;
    return (
        <div id="game-info">
            <div className="info-player">
                <p className='info-player-title'>Black player</p>
                <p className='info-player-timer'>{`${Math.floor(blackTimer/60)}:${Math.floor(blackTimer%60)}`}</p>
            </div>
            <div className="info-player">
                <p className='info-player-title'>White player</p>
                <p className='info-player-timer'>{`${Math.floor(whiteTimer/60)}:${Math.floor(whiteTimer%60)}`}</p>
            </div>
        </div>
    )
}

export default GameInfo;