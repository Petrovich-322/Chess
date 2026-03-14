import { hostAdress } from "./host";

class Player {
    #side: string | null = null;

    async getSide(roomId: string, userId: string) {
        console.log('get-side-front')
        if(this.#side) return this.#side;
        
        try{
            const response = await fetch (`${hostAdress}/get-side`, {
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

            const data = await response.json();
            this.#side = data.side;
            return this.#side;
        } catch (err) {
            alert(`failed to get your side, you are aded to spectartor ${err}`)
            return 'spectator';
        }
    }
    reset() {
        this.#side = null;
    }
    get side() {
        return this.#side;
    } 
}

export const playerService = new Player;