import createBoard from '@shared/createBoard.ts';

import { Figure, Position } from "../shared/interfaces.ts";

import { checkMove, shahCheck, mateCheck, getAvailableMoves } from 'rules-lib';
import { User } from './models/UserSchema.ts';
import { userManager } from './userManager.ts';

import { PlayerConstructor, CreateGameConstructorData, CreateGameData } from './interfaces/gameInterfaces.ts';

const serverUser = 'Сервер';

const defUser = {
    userName: null,
    rating: 0
}

class Player {
    id: string | null;
    rating: number;
    time: number;
    status: 'active' | 'offline';
    userName: string;
   
    constructor({id, timeLimit, userName}: PlayerConstructor) {
        this.id = id;
        this.time = timeLimit;
        this.status = "offline";
        this.userName = userName;
        this.rating = 0;
    }
}

class Game {
    field: (Figure | null)[][];
    activeSide: 'white' | 'black' | 'spectator';
    players: {
        white: Player;
        black: Player;
    };
    moveStory: {
        move: {from: Position; to: Position} | null;
        firstFigure: any;
        secondFigure: any;
    }[];
    lastMove: {
        player: string;
        time: number;
    };
    kingsPosition: {
        whiteKing: Position;
        blackKing: Position;
    };
    gameInfo: {
        status: string;
        winner: string | null;
    };
    chatStory: [{user: string; text: string}];
    gameEndTimer: any;

    constructor({ 
        timeLimit = 600, 
        whiteId = null, 
        blackId = null,
        whitePlayer,
        blackPlayer,

    }: CreateGameConstructorData) {
        this.field = createBoard();
        this.activeSide = 'spectator';

        this.players = {
            white: new Player({id: whiteId, timeLimit, userName: whitePlayer.userName}),
            black: new Player({id: blackId, timeLimit, userName: blackPlayer.userName})
        };

        this.moveStory = [{
            move: null,
            firstFigure: null,
            secondFigure: null
        }];
        this.lastMove = {
            player: 'black',
            time: Date.now()
        };
        this.kingsPosition = {
            whiteKing: {row: 7, col: 4},
            blackKing: {row: 0, col: 4}
        };
        this.gameInfo = {
            status: 'prepearing',
            winner: null
        };
        this.chatStory = [{
            user: serverUser,
            text: 'Гру успішно створено'
        }];
        this.gameEndTimer = null;
    }
    
    static async create({whiteId, blackId, timeLimit}: CreateGameData) {
        
        const whiteUser = await userManager.getUserData(whiteId);
        const blackUser = await userManager.getUserData(blackId);
    
        const whitePlayer = whiteUser ?? {...defUser, userName: 'Білий'};
        const blackPlayer = blackUser ?? {...defUser, userName: 'Чорний'};

        return new Game({
            timeLimit,
            whiteId,
            blackId,
            whitePlayer,
            blackPlayer
        });

    };
        
    checkMove = (from: Position, to: Position) => {
        
        const playerColor = this.activeSide;

        if(playerColor === 'spectator') return false;
        
        const opponentColor = playerColor === 'white' ? 'black' : 'white';
        const userKingPos = this.kingsPosition[`${playerColor}King`];
        const opponentKingPos = this.kingsPosition[`${opponentColor}King`];

        if(!checkMove(this.field, from, to, userKingPos)) return false;

        const fieldCopy = this.field.map(row => [...row]);
        const figure = fieldCopy[from.row][from.col];
        fieldCopy[to.row][to.col] = figure;
        fieldCopy[from.row][from.col] = null;

        if(!shahCheck(fieldCopy, opponentKingPos)) return true;
        if(mateCheck(fieldCopy, opponentKingPos)) {
            console.log('mate true');
            return 'Mate';
        }
                
        return true;
    };
   
    makeMove = (from: Position, to: Position) => {
        
        if(!from || !to) return;

        try {
            const field = this.field;
            const figure = field[from.row][from.col];

            if(!figure) return;
            
            const updatedFigure = {
                ...figure,
                movements: figure.movements++
            }

            const moveInfo = {
                move: {from: from, to: to},
                firstFigure: updatedFigure,
                secondFigure: field[to.row][to.col],
            }
            
            this.addMove(moveInfo);

            field[to.row][to.col] = updatedFigure;
            field[from.row][from.col] = null;

            const castling = () => {

                // console.log('castling');
                const isLong = to.col < from.col;
                const rookFromCol = isLong ? 0 : 7;
                const rookToCol = isLong ? 3 : 5;
                
                const rook = field[from.row][rookFromCol];
                if(!rook) return;
                // console.log('rook', rook);

                field[from.row][rookToCol] = { ...rook, movements: rook.movements++ };
                field[from.row][rookFromCol] = null;

                this.addMove({
                    move: {from: {row: from.row, col: rookFromCol}, to: {row: from.row, col: rookToCol}},
                    firstFigure: field[from.row][rookToCol],
                    secondFigure: null
                })

            }

            if(figure.type === 'king') {
                // console.log('king move');
                if(Math.abs(to.col - from.col) === 2) castling();

                this.kingsPosition[`${updatedFigure.color}King`] = {
                    row: to.row, col: to.col
                };
            }

            this.lastMove = {...this.lastMove, player: this.activeSide};

            getAvailableMoves.clear();
        } catch (err) {
            console.log('Error in makeMove:', err);
        }

    };

    getUserSide = async (userId: string | null) => {
        
        const sides = ['white', 'black'] as const;

        const savedSide = sides.find(side => this.players[side].id === userId);
        if(savedSide) return savedSide;

        const newSide = sides.find(side => !this.players[side].id);
        if(newSide) {

            const user = await User.findById(userId);
            const userName = user ? user.userName : newSide === 'white' ? 'Білий' : 'Чорний';
            this.players[newSide].id = userId;
            this.players[newSide].userName = userName;
            this.players[newSide].status = 'active';
            this.sendMessage({user: serverUser, text: `Користувач ${userName} приєднався`});

            return newSide;

        }

        return 'spectator';

    };

    changeActiveSide = () => {

        this.activeSide = this.activeSide === 'white' ? 'black' : 'white';

    };

    sendMessage = (message: {user: string; text: string}) => {

       this.chatStory.push(message);

    };

    addMove = (moveInfo: {
        move: {from: Position, to: Position},
        firstFigure: Figure | null,
        secondFigure: Figure | null
    }) => {

        this.moveStory.push(moveInfo);

    };

    updateTime = (playerColor: 'white' | 'black') => {
        
        const time = Date.now();
        
        this.players[playerColor].time -= (time - this.lastMove.time)/1000;
        this.lastMove = {...this.lastMove, time: time};

    };

    startTimer = () => {
        
        const time = Date.now();

        this.lastMove = { ...this.lastMove, time: time}

    }

    setGameStatus = ({status = null, winner = null}: {status?: string | null, winner?: 'white' | 'black' | null}) => {
        
        this.gameInfo.status = status ?? this.gameInfo.status;
        this.gameInfo.winner = winner ?? this.gameInfo.winner;

        if(status === 'finished') {
            this.activeSide = 'spectator';
        }

    };
    
    removeActivePlayer = (userId: string) => {
        const sides = ['white', 'black'] as const;
        for(const side of sides) {
            if(this.players[side].id === userId) {
                const user =this.players[side];

                user.status === 'offline';
                this.sendMessage({user: serverUser, text: `Користувач ${user.userName} вийшов`});
            }
        }
    }
    
    get status() {
        return this.gameInfo.status;
    }
    
    getPlayerId(side: 'white' | 'black') {
        return this.players[side].id ?? null;
    }

    get isAllPlayers() {
        const sides = ['white', 'black'] as const;
        const newSide = sides.find(side => !this.players[side].id);
        if(newSide) return false;
        return true;
    }

}

export default Game;