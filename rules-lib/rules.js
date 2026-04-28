const simpleShahCheck= (king, checkBoard, moves, type) => {
    const { row, col } = king;
    const dir = type!='pawn' ? 1 : (checkBoard[row][col].color==='white' ? -1 : 1); 
    
    for(const i of moves) {
        if(row+i[0]*dir < 0 || row+i[0]*dir > 7 || col+i[1] > 7 || col+i[1] < 0) continue;
        
        const destination = checkBoard[row+i[0]*dir][col+i[1]]; 
        if(!destination || destination.type!=type) continue;
        
        if(destination.color != checkBoard[row][col].color) return false;
    }
    return true;
}

const lineShahCheck = (king, checkBoard, moves, type) => {
    const { row, col } = king;
    const cycle = (x,y) => {
        for(let i = 1; i < 8; i++) {
            if(row+y*i > 7 || row+y*i < 0 || col+x*i > 7 || col+x*i < 0) break;
            const element = checkBoard[row + y*i][col + x*i];
            // console.log(element, row+y*i, col+x*i, y*i, x*i);
            if(element?.color != checkBoard[row][col].color && type == 'diagonal' && (element?.type === 'bishop' || element?.type === 'queen')) return false;
            if(element?.color != checkBoard[row][col].color && type == 'linear' && (element?.type === 'rook' || element?.type === 'queen')) return false;
            else if(element) break;
        }
        return true;
    }
    for(const i of moves) {
        if(!cycle(i[0],i[1])) return false;
    }
    // console.log('itaretion end');
    return true;
}

export const shahCheck = (checkBoard, king) => {
    const kingMoves = [[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[1,1],[0,1]];
    const knightMoves = [[-2,-1],[-1,-2],[1,-2],[2,-1],[2,1],[2,2],[-1,2],[-2,1]];
    const pawnMoves = [[1,1],[1,-1]];
    
    const bishopMoves = [[1,1],[1,-1],[-1,1],[-1,-1]];
    const rookMoves = [[1,0],[-1,0],[0,1],[0,-1]];  

    if(!simpleShahCheck(king, checkBoard, kingMoves, 'king')) return true;
    // console.log('       -no king');
    if(!simpleShahCheck(king, checkBoard, knightMoves, 'knight')) return true;
    // console.log('       -no knight');
    if(!simpleShahCheck(king, checkBoard, pawnMoves, 'pawn')) return true;
    // console.log('       -no pawn');
    if(!lineShahCheck(king, checkBoard, bishopMoves, 'diagonal')) return true;
    // console.log('       -no bishop/queen');
    if(!lineShahCheck(king, checkBoard, rookMoves, 'linear')) return true;
    // console.log('       -no rook/queen');
    return false;
}

export const isShah = (board, from, to, king) => {
    const figure = board[from.row][from.col];
    const checkBoard = board.map(row => [...row]);
    
    checkBoard[to.row][to.col] = {...checkBoard[from.row][from.col]};
    checkBoard[from.row][from.col] = null;
    const currentKingPos = figure.type === 'king' ? {row: to.row, col: to.col} : king;
    
    return shahCheck(checkBoard, currentKingPos);
}

export const checkMove = (board, from, to, king) => {
    // console.log('***Check Move***');
    const figure = board[from.row][from.col];
    const targetFigure = board[to.row][to.col];

    if(!figure) {
        // console.log('   -no figure-');
        return false;
    }
    if(figure.color === targetFigure?.color) return false;
    if(targetFigure?.type === 'king') return false;

    const dx = to.col-from.col;
    const dy = to.row-from.row;

    const isPathClear = () => {
        const xdir = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
        const ydir = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
        let x = from.col + xdir;
        let y = from.row + ydir;

        while(x !== to.col || y !== to.row) {
            if(board[y][x]) return false;
            x+=xdir;
            y+=ydir;
        }
        return true; 
    }

    if(isShah(board, from, to, king)) {
        return false;
    }
    else {
        // console.log('   -shah for user-');
    }
    
    switch (figure.type) {
        case 'pawn':
            const dir = figure.color === 'white' ? -1 : 1;
            if (dy === dir && dx === 0 && !targetFigure) return true;
            if (dy === 2 * dir && dx === 0 && figure.movements === 0 && !targetFigure && !board[from.row + dir][from.col]) return true;
            if (dy === dir && Math.abs(dx) === 1 && targetFigure) return true;
            return false;

        case 'knight':
            return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dy) === 2 && Math.abs(dx) === 1);

        case 'king':
            if(Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return true;

            if(Math.abs(dx) === 2 && dy === 0 && figure.movements === 0) {
                const isLong = dx === -2;
                const rookCol = isLong ? 0 : 7;
                const rook = board[from.row][rookCol];

                if(rook?.type !== 'rook' || rook.movements !== 0 || rook.color !== figure.color) return false;

                const step = isLong ? -1 : 1;
                for(let x = from.col + step; isLong ? x > 0 : x < 7; x += step) {
                    if (board[from.row][x]) return false;
                }

                if(shahCheck(board, from)) return false;

                const tempBoard = board.map(r => [...r]);
                tempBoard[from.row][from.col + step] = { ...figure };
                tempBoard[from.row][from.col] = null;
                
                if(shahCheck(tempBoard, { row: from.row, col: from.col + step })) return false;

                return true;
            }
            return false;
        case 'bishop':
            return (Math.abs(dx) === Math.abs(dy) && isPathClear());
        case 'rook':
            return ((dx === 0 || dy === 0) && isPathClear());
        case 'queen':
            return ((dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) && isPathClear());
        default:
            return false;
    }
}

const availableMoves = (board, position, king) => {
    const moves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (checkMove(board, position, { row, col }, king)) {
                moves.push({ row, col });
            }
        }
    }
    return moves;
}

const memoizationMoves = (fn) => {
    let cache = {};
    
    const memoization = (board, position, king) => {
        const key = JSON.stringify(position);
        if (key in cache) {
            // console.log('cache');
            return cache[key];
        }
        // console.log('new key');
        const res = fn(board, position, king);
        cache[key] = res;
        return res;
    }
    memoization.clear = () => {
        // console.log('cleared');
        cache = {};
    }
    return memoization;
}

export const mateCheck = (field, kingPos) => {
    const king = field[kingPos.row][kingPos.col];
    if(!king) return false; 
    const color = king.color;
    
    for(let row = 0; row < 8; row++){
        for(let col = 0 ; col < 8; col++){
            // console.log(field[row][col], getAvailableMoves(field, { row, col }, king));
            const piece = field[row][col] 
            if(piece?.color === color) {
                const moves = getAvailableMoves(field, { row, col }, kingPos);
                if(moves.length > 0) return false;
            }
        }
    }
    return true;
}

export const getAvailableMoves = memoizationMoves(availableMoves);

