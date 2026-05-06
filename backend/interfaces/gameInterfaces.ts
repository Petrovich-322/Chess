export interface CreateGameData {
    timeLimit?: number;
    whiteId?: string | null;
    blackId?: string | null;
}

export interface CreateGameConstructorData extends CreateGameData {
    whitePlayer: {
        userName: string,
        rating: number
    };
    blackPlayer: {
        userName: string,
        rating: number
    };
}

export interface PlayerConstructor {
    id: string | null, 
    timeLimit: number, 
    userName: string
}