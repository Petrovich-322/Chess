export const checkMove = (board, from, to) => {
    const figure = board[from.row][from.col];
    const targetFigure = board[to.row][to.col];

    if(!figure) return false;
    if(figure.color === targetFigure?.color) return false;  
    if(targetFigure?.type === 'king') return false; 
    const oneCellMove = (dx, dy) => {
        if((Math.abs(dx) == 1 || dx == 0) && (Math.abs(dy) == 1 || dy == 0)) return true;
    }

    const forwardMove = (board, from, to, dx, dy) => {
        const xdir = dx > 0 ? 1 : -1;
        const ydir = dy > 0 ? 1 : -1;

        if(dy != 0 && dx != 0) return false;

        if(dy == 0 && Math.abs(dx) > 1) {
            let x = from.col + xdir;
            while(x != to.col) {
                if(board[to.row][x]) return false;
                x += xdir;
            }
        }
        else if(dx == 0 && Math.abs(dy) > 1) {
            let y = from.row + ydir;
            while(y != to.row) {
                if(board[y][to.col]) return false;
                y += ydir;
            }
        }
        return true;
    }

    const diagonalMove = (board, from, to, dx, dy) => {
        const xdir = dx > 0 ? 1 : -1;
        const ydir = dy > 0 ? 1 : -1;
        let x = from.col + xdir;
        let y = from.row + ydir;
        while(x != to.col) {
            if(board[y][x]) return false;
            x += xdir; y += ydir;
        }
        return true;
    }

    const pawnMove = (figure, board, from, to) => {
        const dx = to.col - from.col;
        const dy = to.row - from.row;
        const direction = figure.color === 'w' ? -1 : 1;
        if(dy == direction && dx == 0 && !board[to.row][to.col]) return true;
        if(dy == 2*direction && dx == 0 && figure.movements == 0 && !board[to.row][to.col]) return true; 
        if(dy == direction && Math.abs(dx) == 1 && board[to.row][to.col] && board[to.row][to.col].color != figure.color) return true;
        
        return false;
    }

    const kingMove = (from, to) => {
        const dx = to.col - from.col;
        const dy = to.row - from.row;
        
        if(oneCellMove(dx, dy)) return true;
        return false;
    }   

    const queenMove = (board, from, to) => {
        const dx = to.col - from.col;
        const dy = to.row - from.row;

        if(oneCellMove(dx, dy)) return true;
        if(forwardMove(board, from, to, dx, dy)) return true;
        
        if(Math.abs(dx) == Math.abs(dy)) return diagonalMove(board, from, to, dx, dy);

        return false;
    }

    const knightMove = (from, to) => {
        const dx = to.col - from.col;
        const dy = to.row - from.row;
        if((Math.abs(dx) == 2 && Math.abs(dy) == 1) || (Math.abs(dy) == 2 && Math.abs(dx) == 1)) return true;
        return false;
    }

    const bishopMove = (board, from, to) => {
        const dx = to.col - from.col;
        const dy = to.row - from.row;
        
        if(Math.abs(dx) == Math.abs(dy)) return diagonalMove(board, from, to, dx, dy);

        return false;
    }

    const rookMove = (board, from, to) => {
        const dx = to.col - from.col;
        const dy = to.row - from.row;

        return forwardMove(board, from, to, dx, dy);
    }
    
    if(figure.color === board[to.row][to.col]?.color) return false;
    switch(figure.type) {
        case 'pawn': return pawnMove(figure, board, from, to);
        case 'king': return kingMove(from, to);
        case 'queen': return queenMove(board, from, to);
        case 'knight': return knightMove(from, to);
        case 'bishop': return bishopMove(board, from, to);
        case 'rook': return rookMove(board, from, to);
    }
}

export const getAvailableMoves = (board, position) => {
    const figure = board[position.row][position.col];
    if(!figure) return [];
    const moves = [];
    for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 8; col++) {
            if(checkMove(board, position, {row, col})) {
                moves.push({row, col});
            }
        }
    }
    return moves;
}