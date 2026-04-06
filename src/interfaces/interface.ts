export interface serverData {
    // field: Array<Array<any>>;
    activeSide: string;
    whitePlayer: {id: number | null; time: number};
    blackPlayer: {id: number | null; time: number};
    prevMoveTime: number;
    lastMove: {from: {row: number; col: number}; to: {row: number; col: number}};
}