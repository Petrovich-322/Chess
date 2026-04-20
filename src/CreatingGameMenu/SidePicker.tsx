import { Dispatch, SetStateAction } from "react";

interface SidePickerProps {
    side: string,
    setSide: Dispatch<SetStateAction<string>>
}

const SidePicker = (props: SidePickerProps) => {
    const {
        side,
        setSide
    } = props
    return (
        <div className="side-picker container">
            <p className="side-picker title">Обери сторону</p>
            <button 
                className={`side-picker btn ${side === 'white' && 'selected'}`}
                onClick={() => setSide('white')}
            >
                Білий
            </button>
            <button 
                className={`side-picker btn ${side === 'black' && 'selected'}`}
                onClick={() => setSide('black')}
            >
                Чорний
            </button>
            <button 
                className={`side-picker btn ${side === 'random' && 'selected'}`}
                onClick={() => setSide('random')}
            >
                Випадково
            </button>
        </div>
    );
}

export default SidePicker;