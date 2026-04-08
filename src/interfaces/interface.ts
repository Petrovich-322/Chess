export interface serverData {
    field: Array<Array<any>>;
    activeSide: string;
    whitePlayer: {id: number | null; time: number};
    blackPlayer: {id: number | null; time: number};
    moveStory: Array<{from: {row: number, col: number}, to: {row: number, col: number}}>;
    prevMoveTime: number;
    kingsPosition: {whiteKing: {row: number, col: number}, blackKing: {row: number, col: number}};
    // lastMove: {from: {row: number; col: number}; to: {row: number; col: number}};
}