import './GameInfo.css'

const GameInfo = () => {
    return (
        <div id="game-info">
            <div id="info-player-black">
                <p>Black player</p>
                <p>{'Timer'}</p>

            </div>
            <div id="info-player-White">
                <p>white player</p>
                <p>{'Timer'}</p>
            </div>
        </div>
    )
}

export default GameInfo;