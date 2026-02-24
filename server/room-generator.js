function* createRoomName(duration) {
    const roomNames = new Set();
    const startTime = Date.now();

    const firstW = ['King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn'];
    const secondW = ['win', 'loss', 'draw', 'move', 'capture', 'take', 'check', 'checkmate', 'stalemate', 'resign', 'promote'];
    
    while(Date.now() - startTime <= duration) {
        const newRoomName = `${firstW[Math.floor(Math.random()*firstW.length)]}-${secondW[Math.floor(Math.random()*secondW.length)]}-${Math.floor(Math.random()*100)}`;
        if(!roomNames.has(newRoomName)) {
            roomNames.add(newRoomName);
            yield newRoomName;
        }
    }
}

const newRoomName = createRoomName();

const timeOut = (iterator, duration) => {
    const startTime = Date.now();

    return {
        next() {
            const time = Date.now();
            if (time - startTime > duration) return {
                value: undefined, 
                done: true,
            };
            else return iterator.next();
        },

        [Symbol.iterator]() {
            return this;
        },
    }
}

const newRoomNameTimeOut = timeOut(createRoomName(), 7);

for(const i of newRoomNameTimeOut) console.log(i);