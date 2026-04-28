export type Position = {
    row: number;
    col: number
}

export class Figure {
    movements = 0;
    type: string;
    color: 'white' | 'black';
    constructor(type: string, color: 'white' | 'black') {
        this.type = type;
        this.color = color;
    }
}
