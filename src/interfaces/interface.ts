export type ChatStory = {
    user: string
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
    type: string
};

export interface ServerData {
    field: Array<Array<any>>;
    activeSide: string;
    whitePlayer: {id: number | null; time: number};
    blackPlayer: {id: number | null; time: number};
    moveStory: MoveStory,
    chatStory: ChatStory,
    prevMoveTime: number;
    kingsPosition: {whiteKing: {row: number, col: number}, blackKing: {row: number, col: number}};
    gameStatus: {gameEnd: boolean, winner: string | null}
    
};

