import createBoard from '@shared/createBoard.ts';

import { Figure, Position } from "../shared/interfaces.ts";

import { checkMove, shahCheck, mateCheck, getAvailableMoves } from 'rules-lib';
import { User } from './models/UserSchema.ts';

type CreateGameData = {
    timeLimit?: number;
    whiteId?: string | null;
    blackId?: string | null;
}
interface CreateGameConstructorData extends CreateGameData {
    whiteUserName: string ;
    blackUserName: string;
}

type PlayerConstructor = {
    id: string | null, 
    timeLimit: number, 
    userName: string
}
class Player {
    id: string | null;
    time: number;
    status: string;
    userName: string;
   
    constructor({id, timeLimit, userName}: PlayerConstructor) {
        this.id = id;
        this.time = timeLimit;
        this.status = "offline";
        this.userName = userName;
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
        move: {from: Position; to: Position};
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
        status: boolean;
        winner: string | null;
    };
    chatStory: [{user: string; text: string}];

    constructor({ 
        timeLimit = 600, 
        whiteId = null, 
        blackId = null,
        whiteUserName = 'Білий',
        blackUserName = 'Чорний'

    }: CreateGameConstructorData) {
        this.field = createBoard();
        this.activeSide = 'white';

        this.players = {
            white: new Player({id: whiteId, timeLimit, userName: whiteUserName}),
            black: new Player({id: blackId, timeLimit, userName: blackUserName})
        };

        this.moveStory = [];
        this.lastMove = {
            player: 'black',
            time: Date.now()
        };
        this.kingsPosition = {
            whiteKing: {row: 7, col: 4},
            blackKing: {row: 0, col: 4}
        };
        this.gameInfo = {
            status: false, 
            winner: null
        };
        this.chatStory = [{
            user: 'Сервер',
            text: 'Гру успішно створено'
        }];
    }
    
    static async create({whiteId, blackId, timeLimit}: CreateGameData) {
        
        const whitePlayer = await User.findById(whiteId);
        const blackPlayer = await User.findById(blackId);
        const whiteUserName = whitePlayer ? whitePlayer.userName : 'Білий';
        const blackUserName = blackPlayer ? blackPlayer.userName : 'Чорний';


        return new Game({
            timeLimit,
            whiteId,
            blackId,
            whiteUserName,
            blackUserName
        });

    };
        
    checkMove = (from: Position, to: Position) => {
        
        const playerColor = this.activeSide;

        if(playerColor === 'spectator') return false;
        
        const opponentColor = playerColor === 'white' ? 'black' : 'white';
        const userKingPos = this.kingsPosition[`${playerColor}King`];
        const opponentKingPos = this.kingsPosition[`${opponentColor}King`];

        if(!checkMove(this.field, from, to, userKingPos)) return false;
        // console.log('check-move true');

        const fieldCopy = this.field.map(row => [...row]);
        const figure = fieldCopy[from.row][from.col];
        fieldCopy[to.row][to.col] = figure;
        fieldCopy[from.row][from.col] = null;

        if(!shahCheck(fieldCopy, opponentKingPos)) return true;
        // console.log('shah true');
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

    getUserSide = async (userId: string) => {
        
        const sides = ['white', 'black'] as const;

        const savedSide = sides.find(side => this.players[side].id === userId);
        if(savedSide) return savedSide;

        const newSide = sides.find(side => !this.players[side].id);
        if(newSide) {

            const user = await User.findById(userId);
            const userName = user ? user.userName : newSide === 'white' ? 'Білий' : 'Чорний';
            this.players[newSide].id = userId;
            this.players[newSide].userName = userName;
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

    setGameStatus = ({status, winner}: {status: boolean, winner: 'white' | 'black' | null}) => {
        
        this.gameInfo.status = status;
        this.gameInfo.winner = winner;

        if(status === true) {
            this.activeSide = 'spectator';
        }

    };

}

export default Game;