import { useState, useContext, useEffect, useRef } from 'react';

import { ChatStory, MoveStory } from '@/Interfaces/interface';

import './GameInfo.css';
import { SocketContext } from '@/SocketContext';

interface GameInfoProps {
    moveStory: MoveStory, 
    chatStory: ChatStory,
    userId: string,
    roomId: string | undefined,
    onMoveClick: (index: number) => void
}

const GameInfo = (props: GameInfoProps) => {
    const {
        onMoveClick,
        userId,
        chatStory,
        moveStory,
        roomId
    } = props;

    const [inputValue, setInputValue] = useState<string>('');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const moveStoryEndRef = useRef<HTMLDivElement>(null);
    const socket = useContext(SocketContext);

    const transition = new Map([
        [0,'a'],[1,'b'],[2,'c'],[3,'d'],[4,'e'],[5,'f'],[6,'g'],[7,'h']
    ]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatStory])
    useEffect(() => {
        moveStoryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [moveStory])

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
        <aside className="game-sidebar">
            <div className="move-list">
                {moveStory.map((element, index) => {
                    const { from, to, } = element.move;
                    const { firstFigure, secondFigure } = element;
                    const start = `/assets/${firstFigure?.color}-${firstFigure?.type}.svg`;
                    const end = `/assets/${secondFigure?.color}-${secondFigure?.type}.svg`;
                    return (
                        <div className="move-item" onClick={() => onMoveClick(index)} key={`move-${index}`}>
                            <p className="move-item__number">{`${index+1}: `}</p> 
                            <img src={start} className="move-item__piece" alt={`${firstFigure?.type}`} />
                            <p className="move-item__coords">
                                {transition.get(from.col)}{8-from.row}{' => '}{transition.get(to.col)}{8-to.row}
                            </p>
                            {secondFigure && <img src={end} className="move-item__piece" alt={`${secondFigure?.type}`} />}
                        </div>
                    )
                })}
                <div ref = {moveStoryEndRef}> </div>
            </div>

            <div className="chat">
                <div className="chat__messages">
                    {chatStory.map((message, index) => (
                        <div key={`${index}-message`} className="chat__message">
                            <span className="chat__user">{message.user}&gt;</span>
                            <span className="chat__text">{message.text}</span>
                        </div>
                    ))}
                    <div ref = {messagesEndRef}></div>
                </div>
                <form 
                    className="chat__form"
                    onSubmit={handleSubmit}
                >
                    <input 
                        className="chat__input" 
                        id="game-info-chat-input-field"
                        placeholder="Введіть повідомлення"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button 
                        className="chat__send-btn"
                        type="submit"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </form>
            </div> 
        </aside>
    )
}

export default GameInfo;