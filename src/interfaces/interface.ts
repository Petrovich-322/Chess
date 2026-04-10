
export interface Figure {
    color: string;
    type: string;
}

export interface MoveStory {
    move: {from: {row: number, col: number}, to: {row: number, col: number}},
    firstFigure: Figure,
    secondFigure: Figure | null
}

export interface ServerData {
    field: Array<Array<any>>;
    activeSide: string;
    whitePlayer: {id: number | null; time: number};
    blackPlayer: {id: number | null; time: number};
    moveStory: Array<MoveStory>,
    prevMoveTime: number;
    kingsPosition: {whiteKing: {row: number, col: number}, blackKing: {row: number, col: number}};
}
