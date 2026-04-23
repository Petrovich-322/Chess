import { Dispatch, SetStateAction } from 'react';

import TimeSelector from './TimeSelector';


interface TimePickerProps {
    minutes: number,
    seconds: number,
    setMinutes: Dispatch<SetStateAction<number>>,
    setSeconds: Dispatch<SetStateAction<number>>
    setTimer: (time: number) => void
}

const TimePicker = (props: TimePickerProps) => {
    const {
        minutes,
        seconds, 
        setMinutes,
        setSeconds,
        setTimer
    } = props;
    const timerPresets = [1,5,10,20,30,60];

    return (
        <div className="time-picker container">
            <p className="time-picker title">Обери час</p>
            <div className="manual-time-select-section">
                <TimeSelector 
                    time = {minutes}
                    title = {'Хвилини'}
                    setTime = {setMinutes}
                />
                <span className="colon">:</span>
                
                <TimeSelector 
                    time = {seconds}
                    title = {'Секунди'}
                    setTime = {setSeconds}
                />
            </div>

            <div className="timer-presets container">
                {timerPresets.map((time) => (
                    <button 
                        className={`timer-presets btn ${(minutes === time && seconds === 0) && 'selected'}`} 
                        key={`set-timer-btn-${time}`}
                        onClick={() => setTimer(time)}
                    >
                        {`${time} хв`}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default TimePicker;