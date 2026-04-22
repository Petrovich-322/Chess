export type ChatStory = {
    user: string,
    text: string
}[];

export type SelectedCell = {
    row: number, 
    col: number,
} | null;

export type AvailableMoves = {
    row: number, 
    col: number
}[];

export type MoveStory = {
    move: {from: {row: number, col: number}, to: {row: number, col: number}},
    firstFigure: Figure,
    secondFigure: Figure | null
}[];

export type Figure = {
    color: 'white' | 'black',
    type: string,
    movements: number
};

type Player = {
    id: string,
    time: number
};

export interface ServerData {
    activeSide: string,
    players: {
        white: Player,
        black: Player
    }
    moveStory: MoveStory,
    chatStory: ChatStory,
    prevMoveTime: number,
    kingsPosition: {whiteKing: {row: number, col: number}, blackKing: {row: number, col: number}},
    gameInfo: {status: boolean, winner: string | null}

};

