import { Dispatch, SetStateAction } from 'react';

interface TimeSelectorProps {
    time: number,
    title: string,
    setTime: Dispatch<SetStateAction<number>>
}

const TimeSelector = (props: TimeSelectorProps) => {
    const {
        time,
        title,
        setTime
    } = props
    return (
        <div className="number-select-section">
            <input 
                className="time-input-field"
                type="number" 
                value={time.toString()}
                onChange={(e) => 
                    setTime(Math.max(0, Math.min(59,Number(e.target.value))))
                }
            />
            <span className="time-input-title">{title}</span>
        </div>
    )
}

export default TimeSelector;