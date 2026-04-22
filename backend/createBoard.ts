
import { Figure } from './interfaces'

const createBoard = () => [
    [new Figure('rook','black'),new Figure('knight','black'),new Figure('bishop','black'),
    new Figure('queen','black'),
    new Figure('king','black'),
    new Figure('bishop','black'),new Figure('knight','black'),new Figure('rook','black')],
    
    Array.from({ length: 8 }, () => new Figure('pawn', 'black')),
    
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    
    Array.from({ length: 8 }, () => new Figure('pawn', 'white')),
    
    [new Figure('rook','white'),new Figure('knight','white'),new Figure('bishop','white'),
    new Figure('queen','white'),
    new Figure('king','white'),
    new Figure('bishop','white'),new Figure('knight','white'),new Figure('rook','white')],
];

export default createBoard;