import { hostAddress } from "./host";

class Player {
    #side: 'white' | 'black' | 'spectator' = 'spectator';

    async getSide(roomId: string, userId: string) {
        console.log('get-side-front')
        if(this.#side != 'spectator') return this.#side;
        
        try{
            const response = await fetch (`${hostAddress}/get-side`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: roomId,
                    userId: userId
                }),
            });

            if(!response.ok) {
                throw new Error (`Server response ${response.status}`)
            }

            // console.log('playerService-await');
            const data = await response.json();
            this.#side = data.side;
            // console.log(`playerService: ${data.side} || #{this.#side}`);
            return this.#side;
        } catch (err) {
            alert(`failed to get your side, you are aded to spectartor ${err}`)
            return 'spectator';
        }
    }
    reset() {
        this.#side = 'spectator';
    }
    get side() {
        return this.#side;
    } 
}

export const playerService = new Player;