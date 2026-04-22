import { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { SocketContext } from './SocketContext';

import { checkMove } from 'rules-lib';
import { getAvailableMoves } from 'rules-lib';
import { shahCheck } from 'rules-lib';
import { playerService } from './Services/player';

import { AvailableMoves, ChatStory, MoveStory, SelectedCell, ServerData, Figure } from './Interfaces/interface';

import createBoard from '../backend/createBoard';   
import getUserId from './Services/userId'; 

import Board from './Board/Board'
import PlayerInfo from './PlayerInfo/PlayerInfo';
import GameInfo from './GameInfo/GameInfo';
import NavigationMenu from './NavigationMenu/NavigationMenu';

import './Game.css';

type KingsPosition = {
    whiteKing: {row: number, col: number}, 
    blackKing: {row: number, col: number},
}
type UserInfo = {
    userId: string, 
    side: 'white' | 'black' | 'spectator'
}
type GameTimer = {
    whiteTimer: number,
    blackTimer: number
}

const defUser: UserInfo = {
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
    const [userInfo, setUserStatus] = useState<UserInfo>(defUser);
    const [activeSide, setActiveSide] = useState<string>();
    const [gameTimer, setGameTimer] = useState<GameTimer>(defTimer);
    const [gameEnd, setGameEnd] = useState<boolean>(false);
    const [moveStory, setMoveStory] = useState<MoveStory>([]);
    const [chatStory, setChatStory] = useState<ChatStory>([]);
    const [showMoveStory, setShowMoveStory] = useState<boolean>(false);
    const [availableMoves, setAvailableMoves] = useState<AvailableMoves>([]);
    
    const fieldsCache = useRef<Record<number, any[][]>>({});
    // const moveStoryLength = moveStory.length;
    
    const { roomId } = useParams<{roomId: string}>();

    const userKing = userInfo.side === 'spectator' ? 
        null : kingsPostion[`${userInfo.side}King`];

    useEffect(() => {
        if(!roomId) return;

        const handleUpdateInfo = (data: ServerData) => {
            console.log('---update-info-handler---')
            setActiveSide(data.activeSide);
            setGameTimer({
                whiteTimer: data.players.white.time, 
                blackTimer: data.players.black.time
            });
            setKingsPosition(data.kingsPosition);
            setShowMoveStory(false);
            getAvailableMoves.clear();

            const lastMove = data.moveStory[data.moveStory.length-1];
            const moveTo = lastMove.move.to;
            const moveFrom = lastMove.move.from;

            setMoveStory((prev) => [...prev, lastMove]);

            setField((prevField) => {
                const newField = prevField.map(row => [...row]);
                const figure = newField[moveFrom.row][moveFrom.col];
                newField[moveTo.row][moveTo.col] = {...figure, movements: figure.movements++};
                newField[moveFrom.row][moveFrom.col] = null;
                figure.movements++;

                return newField;
            });

        } 

        const handleInitializeGame = (data: ServerData & {field: (Figure | null)[][]}) => {
            console.log('---initialize Game handler---');
            setField(data.field);
            setActiveSide(data.activeSide);
            setGameTimer({
                whiteTimer: data.players.white.time, 
                blackTimer: data.players.black.time
            });   
            setMoveStory(data.moveStory);
            setGameEnd(data.gameInfo.status);
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
            if(!data.newMessage) return;
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
                socket.emit('joinRoom', {roomId: roomId});
            } else {
                socket.once('connect', () => socket.emit('joinRoom', {roomId: roomId}));
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
        if(activeSide != userInfo.side) return;

        if(userKing && shahCheck(userKing, field)) console.log('SHAH!!!');
    }, [field]);

    const onSelect = (row: number, col: number) => {
        if(showMoveStory)
        {
            setAvailableMoves([]);
            setSelectedCell(null);
            setShowMoveStory(false);    
            return;
        }
        
        if (userInfo.side === 'spectator' || gameEnd) return;

        const updateSelectedCell = () => {
            const newFigure = field[row][col];
            if (newFigure?.color === userInfo.side) 
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
            
            if(userInfo.side != activeSide) 
            {
                updateSelectedCell();
                return;
            }
            
            const prevFigure = field[selectedCell.row][selectedCell.col];
            if(prevFigure && userInfo.side != prevFigure.color) 
            {
                updateSelectedCell();
                return;
            }

            const checkMovement = checkMove(field, selectedCell, { row, col }, userKing);
            
            if(checkMovement) 
            {
                socket.emit('newMove', {
                    side: userInfo.side,
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
                            isUser = {userInfo.side === 'black'}
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
                            isUser = {userInfo.side === 'white'}
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
                        userId = {userInfo.side === 'white' ? 'Білий' : 'Чорний'}
                        roomId = {roomId} 
                    />
                </div>
            </div>
        </div>
    );
}

export default Game;