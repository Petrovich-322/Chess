function* createRoomName() {
    const roomNames = new Set();

    const firstW = ['King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn'];
    const secondW = ['win', 'loss', 'draw', 'move', 'capture', 'take', 'check', 'checkmate', 'stalemate', 'resign', 'promote'];
    
    while(true) {
        const newRoomName = `${firstW[Math.floor(Math.random()*firstW.length)]}-${secondW[Math.floor(Math.random()*secondW.length)]}-${Math.floor(Math.random()*100)}`;
        if(!roomNames.has(newRoomName)) {
            roomNames.add(newRoomName);
            yield newRoomName;
        }
    }
}

export default createRoomName;