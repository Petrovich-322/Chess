import './PlayerInfo.css'

const PlayerInfo = (props: {timer: number, player: string | null}) => {
    const {
        timer,
        player
    } = props;
    return (
        <div className="player-info-container">
            <p className="player-info-title">{player}</p>
            <p className="player-info-timer">{`${Math.floor(timer/60)}:${Math.floor(timer%60)}`}</p>
        </div>
    )
}

export default PlayerInfo;