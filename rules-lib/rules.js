export const checkMove = (board, from, to) => {
    const figure = board[from.row][from.col];
    const targetFigure = board[to.row][to.col];

    if (!figure) return false;
    if (figure.color === targetFigure?.color) return false;
    if (targetFigure?.type === 'king') return false;

    const dx = to.col-from.col;
    const dy = to.row-from.row;

    const isPathClear = () => {
        const xdir = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
        const ydir = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
        let x = from.col + xdir;
        let y = from.row + ydir;

        while (x !== to.col || y !== to.row) {
            if (board[y][x]) return false;
            x += xdir;
            y += ydir;
        }
        return true;
    };

    switch (figure.type) {
        case 'pawn':
            const dir = figure.color === 'w' ? -1 : 1;
            if (dy === dir && dx === 0 && !targetFigure) return true;
            if (dy === 2 * dir && dx === 0 && figure.movements === 0 && !targetFigure && !board[from.row + dir][from.col]) return true;
            if (dy === dir && Math.abs(dx) === 1 && targetFigure) return true;
            return false;

        case 'knight':
            return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dy) === 2 && Math.abs(dx) === 1);

        case 'king':
            return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;

        case 'bishop':
            return Math.abs(dx) === Math.abs(dy) && isPathClear();

        case 'rook':
            return (dx === 0 || dy === 0) && isPathClear();

        case 'queen':
            return (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) && isPathClear();

        default:
            return false;
    }
}

const availableMoves = (board, position) => {
    const moves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (checkMove(board, position, { row, col })) {
                moves.push({ row, col });
            }
        }
    }
    return moves;
}

const memoizationMoves = (fn) => {
    let cache = {};
    
    const memoization = (board, position) => {
        const key = JSON.stringify(position);
        if (key in cache) {
            console.log('cache');
            return cache[key];
        }
        console.log('new key');
        const res = fn(board, position);
        cache[key] = res;
        return res;
    }
    memoization.clear = () => {
        console.log('cleared');
        cache = {};
    }
    return memoization;
}

export const getAvailableMoves = memoizationMoves(availableMoves);