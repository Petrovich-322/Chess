import { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { SocketContext } from '@/Context/SocketContext';

import { checkMove, getAvailableMoves, shahCheck} from 'rules-lib';
import userService from '@/services/userService';

import { AvailableMoves, ChatStory, MoveStory, SelectedCell, ServerData, Figure } from '../Interfaces/interface';

import createBoard from '@shared/createBoard';   

import Board from './Board/Board'
import PlayerInfo from './PlayerInfo/PlayerInfo';
import GameInfo from './GameInfo/GameInfo';
import NavigationMenu from '../NavigationMenu/NavigationMenu';

import './Game.css';
import apiClient from '@/services/client';

type KingsPosition = {
    whiteKing: {row: number, col: number}, 
    blackKing: {row: number, col: number},
}
type UserInfo = {
    side: 'white' | 'black' | 'spectator',
    userName: string | null    
}
type GameTimer = {
    whiteTimer: number,
    blackTimer: number
}

const defUser: UserInfo = {
    side: 'spectator',
    userName: null
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
    console.log('render');
    const socket = useContext(SocketContext);

    const [kingsPostion, setKingsPosition] = useState<KingsPosition>(defKingsPos);
    const [field, setField] = useState(createBoard());
    const [tempField, setTempField] = useState(createBoard());
    const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
    
    const [userInfo, setUserInfo] = useState<UserInfo>(defUser);
    const [whitePlayerInfo, setWhitePlayerInfo] = useState<UserInfo>(defUser);
    const [blackPlayerInfo, setBlackPlayerInfo] = useState<UserInfo>(defUser);

    const [activeSide, setActiveSide] = useState<string>();
    const [gameTimer, setGameTimer] = useState<GameTimer>(defTimer);
    const [gameStatus, setGameStatus] = useState<string>('prepearing');
    const [moveStory, setMoveStory] = useState<MoveStory>([]);
    const [chatStory, setChatStory] = useState<ChatStory>([]);
    const [showMoveStory, setShowMoveStory] = useState<boolean>(false);
    const [availableMoves, setAvailableMoves] = useState<AvailableMoves>([]);

    const fieldsCache = useRef<Record<number, any[][]>>({});
    
    const { roomId } = useParams<{roomId: string}>();

    const userKing = userInfo.side === 'spectator' ? 
        null : kingsPostion[`${userInfo.side}King`];

    useEffect(() => {
        if(!roomId) return;

        const handleUpdateInfo = (data: ServerData) => {
            console.log('---update-info-handler---')
            getAvailableMoves.clear();
            setActiveSide(data.activeSide);
            setGameTimer({
                whiteTimer: data.players.white.time, 
                blackTimer: data.players.black.time
            });
            setKingsPosition(data.kingsPosition);
            setShowMoveStory(false);


            const lastMove = data.moveStory[data.moveStory.length-1];
            const castlingMove = data.moveStory[data.moveStory.length-2];
            const moveTo = lastMove.move.to;
            const moveFrom = lastMove.move.from;

            if(castlingMove && castlingMove.firstFigure.type === 'king' && castlingMove.firstFigure.color === lastMove.firstFigure.color) {
                const castMoveTo = castlingMove.move.to;
                const castMoveFrom = castlingMove.move.from;
                
                setMoveStory((prev) => [...prev, castlingMove, lastMove]);

                setField((prevField) => {
                    const newField = prevField.map(row => [...row]);
                    const figure = newField[moveFrom.row][moveFrom.col];
                    const secFigure = newField[castMoveFrom.row][castMoveFrom.col];
                    newField[moveTo.row][moveTo.col] = {...figure, movements: figure.movements++};
                    newField[moveFrom.row][moveFrom.col] = null; 
                    
                    newField[castMoveTo.row][castMoveTo.col] = {...secFigure, movements: secFigure.movements++};
                    newField[castMoveFrom.row][castMoveFrom.col] = null;
                    return newField;
                });
            }

            else {
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
            setGameStatus(data.gameInfo.status);
            setChatStory(data.chatStory);
            
            setWhitePlayerInfo({
                side: 'white',
                userName: data.players.white.userName ?? 'Білий'
            });
            setBlackPlayerInfo({
                side: 'black',
                userName: data.players.black.userName ?? 'Чорний'
            });

        };

        const handleGameEnd = (data: {winner: string, activeSide: string}) => {
            if(!data.winner) {
                console.log('---game end, winner is undefinded---');
                return;
            }
            console.log(`Winner is ${data.winner}`);
            setActiveSide(data.activeSide);
            setGameStatus('finished');

            userService.updateUser();
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
            try {
                const response = await apiClient.post(`/get-side?roomId=${roomId}`);
                const userSide = response.data.side;

                setUserInfo({
                    side: userSide ?? defUser.side,
                    userName: userService.userName
                });

                if (socket.connected) {
                    socket.emit('joinRoom', {roomId: roomId});
                } else {
                    socket.once('connect', () => socket.emit('joinRoom', {roomId: roomId}));
                } 
            } catch (err) {
                console.error('Error in initializing game:', err);
            }
        };

        initGame();
        
        return () => {
            socket.off('updateInfo', handleUpdateInfo);
            socket.off('initializeGame', handleInitializeGame);
            socket.off('gameEnd', handleGameEnd);
            socket.off('chatUpdate', handleChatUpdate);
        }; 

    }, []);

    useEffect(() => {
        if(activeSide != userInfo.side) return;

        if(userKing && shahCheck(field, userKing)) console.log('SHAH!!!');
    }, [field]);

    const onSelect = (row: number, col: number) => {
        if(showMoveStory)
        {
            setAvailableMoves([]);
            setSelectedCell(null);
            setShowMoveStory(false);    
            return;
        }
        
        if (userInfo.side === 'spectator' || gameStatus === 'finished') return;

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
            return;
        }
        const historyField = createBoard();
        
        for(let i=0; i<=index; i++) {
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
                            timer = {gameTimer.blackTimer}
                            userInfo = {blackPlayerInfo}
                            moveStory = {moveStory}
                            activeSide = {activeSide}
                            gameStatus = {gameStatus}
                            roomId = {roomId}
                            setGameStatus = {setGameStatus}
                        />
                        <Board 
                            field = {showMoveStory === false ? field : tempField}
                            selectedCell = {selectedCell}
                            availableMoves = {availableMoves}
                            onSelect = {onSelect}
                        />
                        <PlayerInfo
                            timer = {gameTimer.whiteTimer}
                            userInfo = {whitePlayerInfo}
                            moveStory = {moveStory}
                            activeSide = {activeSide}
                            gameStatus = {gameStatus}
                            roomId = {roomId} 
                            setGameStatus = {setGameStatus}
                        />
                    </div>
                    <GameInfo 
                        onMoveClick = {onMoveClick}
                        moveStory = {moveStory}
                        chatStory={chatStory}
                        userId = {userInfo.userName ? 
                            userInfo.userName : (userInfo.side === 'white' ? 'Білий' : 'Чорний')}
                        roomId = {roomId} 
                    />
                </div>
            </div>
        </div>
    );
}

export default Game;