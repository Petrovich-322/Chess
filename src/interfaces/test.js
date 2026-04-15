class Game {
    constructor({ 
        timeLimit = 600, 
        whiteId = null, 
        blackId = null 
    } = {}) {
        this.activeSide = 'w';
        this.whitePlayer = {
            id: whiteId,
            time: timeLimit,
        };
        this.blackPlayer = {
            id: blackId,
            time: timeLimit,
        };
        this.moveStory = [];
        this.lastMove = {
            player: 'b',
            time: Date.now()
        };
        this.kingsPosition = {
            whiteKing: {row: 7, col: 4},
            blackKing: {row: 0, col: 4}
        };
        this.gameStatus = {
            gameEnd: false, 
            winner: null
        };
    }
}

const game1 = new Game();
const game2 = new Game({timeLimit: 600});
const game3 = new Game({timeLimit: 100, blackId: 123, whiteId: 456});

console.log(game1);
console.log(game2);
console.log(game3);