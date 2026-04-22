import createBoard from './createBoard.ts';

import { Figure, Position } from "./interfaces.ts";

import { checkMove, shahCheck, mateCheck } from 'rules-lib';

class Player {
    id: string | null;
    time: number;
    status: string;
    constructor(id: string | null, timeLimit: number) {
        this.id = id;
        this.time = timeLimit;
        this.status = "offline";
    }
}

export class Game {
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
        blackId = null 
    } = {}) {
        this.field = createBoard();
        this.activeSide = 'white';
        this.players = {
            white: new Player(whiteId, timeLimit),
            black: new Player(blackId, timeLimit)
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
        }]
    }

    checkMove = (from: Position, to: Position) => {
        const playerColor = this.activeSide;

        if(playerColor === 'spectator') return;
        
        const opponentColor = playerColor === 'white' ? 'black' : 'white';
        const userKing = this.kingsPosition[`${playerColor}King`];
        const opponentKing = this.kingsPosition[`${opponentColor}King`];

        if(checkMove(this.field, from, to, userKing)) {
            if(shahCheck(opponentKing, this.field)){
                const isMate = mateCheck(playerColor, this.field, opponentKing);
                if(isMate) return 'Mate';
            }
            return true;
        }
        return false;
    }
   
    makeMove = (from: Position, to: Position) => {
        
        if(!from || !to) return;

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

        if(figure.type === 'king') {
            this.kingsPosition[`${updatedFigure.color}King`] = {
                row: to.row, col: to.col
            };
        }

        this.lastMove = {...this.lastMove, player: this.activeSide};

    }

    getUserSide = (userId: string) => {
        
        const sides = ['white', 'black'] as const;

        const savedSide = sides.find(side => this.players[side].id === userId);
        if(savedSide) return savedSide;

        const newSide = sides.find(side => !this.players[side].id);
        if(newSide) {
            this.players[newSide].id = userId;
            return newSide;
        }

        return 'spectator';

    }

    changeActiveSide = () => {

        this.activeSide = this.activeSide === 'white' ? 'black' : 'white';

    }

    sendMessage = (message: {user: string; text: string}) => {

       this.chatStory.push(message);

    }

    addMove = (moveInfo: {
        move: {from: Position, to: Position},
        firstFigure: Figure | null,
        secondFigure: Figure | null
    }) => {

        this.moveStory.push(moveInfo);

    }

    updateTime = (playerColor: 'white' | 'black') => {
        
        const time = Date.now();
        
        this.players[playerColor].time -= (time - this.lastMove.time)/1000;
        this.lastMove = {...this.lastMove, time: time};

    }

    setGameStatus = ({status, winner}: {status: boolean, winner: 'white' | 'black' | null}) => {
        
        this.gameInfo.status = status;
        this.gameInfo.winner = winner;

        if(status === true) {
            this.activeSide = 'spectator';
        }

    }

}