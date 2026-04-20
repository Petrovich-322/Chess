import { useState, useContext, useEffect } from 'react';

import { ChatStory, MoveStory } from '../Interfaces/interface';

import './GameInfo.css';
import { SocketContext } from '../SocketContext';

interface GameInfoProps {
    moveStory: MoveStory, 
    chatStory: ChatStory,
    userId: string,
    roomId: string | undefined,
    onMoveClick: (index: number) => void
}

const GameInfo = (props: GameInfoProps) => {
    const socket = useContext(SocketContext);
    const {
        onMoveClick,
        userId,
        chatStory,
        moveStory,
        roomId
    } = props;
    const transition = new Map([
        [0,'a'],[1,'b'],[2,'c'],[3,'d'],[4,'e'],[5,'f'],[6,'g'],[7,'h']
    ]);

    useEffect(() => {
        console.log(chatStory);
    }, [chatStory])

    const [inputValue, setInputValue] = useState<string>('');

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(inputValue === '') return;
        // console.log(inputValue);
        socket.emit('chatNewMessage', {
            user: userId,
            text: inputValue,   
            roomId: roomId
        }); 
        setInputValue('');
    };
    return (
        <div className="game-info container">
            <div className="game-info move-list">
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

            <div className="game-info chat container">
                <div className="game-info chat list">
                    {chatStory.map((message) => (
                        <p 
                            className={`game-info chat message`}
                        >
                            {`${message.user}> ${message.text}`}
                        </p>
                    ))}
                </div>
                <form 
                    className="game-info chat input container"
                    onSubmit={handleSubmit}
                >
                    <input 
                        className="game-info chat input field" 
                        id="game-info-chat-input-field"
                        placeholder="Введіть повідомлення"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button 
                        className="game-info chat input btn"
                        type="submit"
                    >{`>`}
                    </button>
                </form>
            </div> 
        </div>
    )
}

export default GameInfo;