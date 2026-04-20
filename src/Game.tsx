import { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { SocketContext } from './SocketContext';

import { checkMove } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';
import { chachCheck } from 'rules-lib';
import { playerService } from './Services/player';

import { AvailableMoves, ChatStory, MoveStory, SelectedCell, ServerData } from './Interfaces/interface';

import createBoard from './Services/createBoard';   
import getUserId from './Services/userId'; 

import Board from './Board/Board'
import PlayerInfo from './PlayerInfo/PlayerInfo';
import GameInfo from './GameInfo/GameInfo';
import NavigationMenu from './NavigationMenu/NavigationMenu';

import './Game.css';

interface KingsPosition {
    whiteKing: {row: number, col: number}, 
    blackKing: {row: number, col: number},
}
interface UserStatus {
    userId: string, 
    side: 'white' | 'black' | 'spectator'
}
interface GameTimer {
    whiteTimer: number,
    blackTimer: number
}

const defUser: UserStatus = {
    userId: '---',
    side: 'spectator',
}
const defTimer: GameTimer = {
    whiteTimer: 600,
    blackTimer: 600,
}
const defKingsPos: KingsPosition = {
    whiteKing: {row: 7, col: 4},
    blackKing: {row: 0, col: 4}
}


const Game = () => {
    const socket = useContext(SocketContext);

    const [kingsPostion, setKingsPosition] = useState<KingsPosition>(defKingsPos);
    const [field, setField] = useState(createBoard());
    const [tempField, setTempField] = useState(createBoard());
    const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
    const [userStatus, setUserStatus] = useState<UserStatus>(defUser);
    const [activeSide, setActiveSide] = useState<string>();
    const [gameTimer, setGameTimer] = useState<GameTimer>(defTimer);
    const [gameEnd, setGameEnd] = useState<boolean>(false);
    const [moveStory, setMoveStory] = useState<MoveStory>([]);
    const [chatStory, setChatStory] = useState<ChatStory>([]);
    const [showMoveStory, setShowMoveStory] = useState<boolean>(false);
    const [availableMoves, setAvailableMoves] = useState<AvailableMoves>([]);
    
    const fieldsCache = useRef<Record<number, any[][]>>({});
    
    const {roomId} = useParams<{roomId: string}>();

    const userKing = userStatus.side === 'spectator' ? 
        null : kingsPostion[`${userStatus.side}King`];
    

    useEffect(() => {
        if(!roomId) return;

        const handleUpdateInfo = (data: ServerData) => {
            setActiveSide(data.activeSide);
            setGameTimer({
                whiteTimer: data.whitePlayer.time, 
                blackTimer: data.blackPlayer.time
            });
            setKingsPosition(data.kingsPosition);
            
            const lastMove = data.moveStory[data.moveStory.length-1];
            const moveTo = lastMove.move.to;
            const moveFrom = lastMove.move.from;

            setMoveStory((prev) => [...prev, lastMove]);
            setShowMoveStory(false);

            setField((prevField) => {
                const newField = prevField.map(row => [...row]);
                const figure = newField[moveFrom.row][moveFrom.col];
                
                newField[moveTo.row][moveTo.col] = figure;
                newField[moveFrom.row][moveFrom.col] = null;
                figure.movements++;

                return newField;
            });

            getAvailableMoves.clear();
        } 

        const handleInitializeGame = (data: ServerData) => {
            console.log('initializeGame');
            setField(data.field);
            setActiveSide(data.activeSide);
            setGameTimer({
                whiteTimer: data.whitePlayer.time, 
                blackTimer: data.blackPlayer.time
            });   
            setMoveStory(data.moveStory);
            setGameEnd(data.gameStatus.gameEnd);
            setChatStory(data.chatStory);
        };

        const handleGameEnd = (data: {winner: string, activeSide: string}) => {
            if(!data.winner) {
                console.log('---game end, winner is undefinded---');
                return;
            }
            console.log(`Winner is ${data.winner}`);
            setActiveSide(data.activeSide);
            setGameEnd(true);
        }

        const handleChatUpdate = (data: {newMessage: {user: string, text: string}}) => {
            console.log('Message');
            if(!data.newMessage) return;
            console.log('Message succes');
            console.log(data.newMessage);
            setChatStory(prev => [...prev, data.newMessage]);
        }

        socket.on('initializeGame', handleInitializeGame);
        socket.on('updateInfo', handleUpdateInfo);
        socket.on('gameEnd', handleGameEnd);
        socket.on('chatUpdate', handleChatUpdate);

        const initGame = async () => {
            const localStorageDataJSON = localStorage.getItem('DenisChess');
            const localStorageData = localStorageDataJSON ? 
                JSON.parse(localStorageDataJSON) : {userId: null, prevRoomId: null};
            localStorageData.prevRoomId = roomId; 
            console.log(localStorageData);
            localStorage.setItem('DenisChess', JSON.stringify(localStorageData));
        

            const userIdData = await getUserId('');
            const userSideData = await playerService.getSide(roomId, userIdData);
            
            console.log(userSideData);
            setUserStatus({
                userId: userIdData ?? defUser.userId,
                side: userSideData ?? defUser.side
            });
            
            if (socket.connected) {
                socket.emit('joinRoom', roomId);
            } else {
                socket.once('connect', () => socket.emit('joinRoom', roomId));
            } 
        };

        initGame();
        
        return () => {
            socket.off('updateInfo', handleUpdateInfo);
            socket.off('initializeGame', handleInitializeGame);
            socket.off('gameEnd', handleGameEnd);
            socket.off('chatUpdate', handleChatUpdate);
        }; 
    }, [roomId, socket]);

    useEffect(() => {
        if(activeSide != userStatus.side) return;

        if(userKing && chachCheck(userKing, field)) console.log('SHAH!!!');
    }, [field]);

    const onSelect = (row: number, col: number) => {
        if(showMoveStory)
        {
            setAvailableMoves([]);
            setSelectedCell(null);
            setShowMoveStory(false);    
            return;
        }
        
        if (userStatus.side === 'spectator' || gameEnd) return;

        const updateSelectedCell = () => {
            const newFigure = field[row][col];
            if (newFigure?.color === userStatus.side) 
            {
                setSelectedCell({ row, col });
                setAvailableMoves(getAvailableMoves(field, { row, col }, userKing));
                return;
            }

            setSelectedCell({ row, col });
            setAvailableMoves([]);
        }

        if(selectedCell) {
            if(selectedCell.row === row && selectedCell.col === col) 
            {
                setSelectedCell(null);
                setAvailableMoves([]);
                return;
            }
            
            if(userStatus.side != activeSide) 
            {
                updateSelectedCell();
                return;
            }
            
            const prevFigure = field[selectedCell.row][selectedCell.col];
            if(prevFigure && userStatus.side != prevFigure.color) 
            {
                updateSelectedCell();
                return;
            }

            const checkMovement = checkMove(field, selectedCell, { row, col }, userKing);
            
            if(checkMovement) 
            {
                socket.emit('newMove', {
                    side: userStatus.side,
                    roomId: roomId,
                    move: { from: selectedCell, to: { row, col } },
                });
                setSelectedCell(null);
                setAvailableMoves([]);
                console.log('sending newMove');
                return;
            }
        }

        updateSelectedCell();
    }

    const onMoveClick = (index: number) => {
        if(fieldsCache.current[index]) {
            setTempField(fieldsCache.current[index]);
            setShowMoveStory(true);
            // console.log('cache');
            return;
        }
        const historyField = createBoard();
        
        for(let i=0; i<=index; i++) {
            // console.log('newField', i);
            const move = moveStory[i].move;
            historyField[move.to.row][move.to.col] = {
                ...historyField[move.from.row][move.from.col]
            };
            historyField[move.from.row][move.from.col] = null;
        }
        
        fieldsCache.current[index] = historyField
        setTempField(historyField);
        setShowMoveStory(true);
    }
    
    return (
        <div className="main-container">
            <NavigationMenu />
            <div className="page-container">
                <div className="full-game-container">
                    <div className="vertical-game-container">
                        <PlayerInfo
                            isUser = {userStatus.side === 'black'}
                            timer = {gameTimer.blackTimer}
                            player = 'black'
                            moveStory = {moveStory}
                            activeSide = {activeSide}
                            gameEnd = {gameEnd}
                            roomId = {roomId}
                            setGameEnd = {setGameEnd}
                        />
                        <Board 
                            field = {showMoveStory === false ? field : tempField}
                            selectedCell = {selectedCell}
                            availableMoves = {availableMoves}
                            onSelect = {onSelect}
                        />
                        <PlayerInfo
                            isUser = {userStatus.side === 'white'}
                            timer = {gameTimer.whiteTimer}
                            player = 'white'
                            moveStory = {moveStory}
                            activeSide = {activeSide}
                            gameEnd = {gameEnd}
                            roomId = {roomId} 
                            setGameEnd = {setGameEnd}
                        />
                    </div>
                    <GameInfo 
                        onMoveClick = {onMoveClick}
                        moveStory = {moveStory}
                        chatStory={chatStory}
                        userId = {userStatus.side === 'white' ? 'Білий' : 'Чорний'}
                        roomId = {roomId} 
                    />
                </div>
            </div>
        </div>
    );
}

export default Game;