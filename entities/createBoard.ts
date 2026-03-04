class Figure {
    movements = 0;
    type: string;
    color: string;
    constructor(type: string, color: string) {
        this.type = type;
        this.color = color;
    }
}

const createBoard = () => [
    [new Figure('rook','b'),new Figure('knight','b'),new Figure('bishop','b'),
    new Figure('queen','b'),
    new Figure('king','b'),
    new Figure('bishop','b'),new Figure('knight','b'),new Figure('rook','b')],
    
    Array.from({ length: 8 }, () => new Figure('pawn', 'b')),
    
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    
    Array.from({ length: 8 }, () => new Figure('pawn', 'w')),
    
    [new Figure('rook','w'),new Figure('knight','w'),new Figure('bishop','w'),
    new Figure('queen','w'),
    new Figure('king','w'),
    new Figure('bishop','w'),new Figure('knight','w'),new Figure('rook','w')],
];

export default createBoard;