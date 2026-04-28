import { hostAddress } from "@shared/host";
import tokenService from './tokenService';

class PlayerService {
    #side: 'white' | 'black' | 'spectator' = 'spectator';
    #userName: string | null = null;

    async getSide(roomId: string, userId: string) {
        console.log('get-side-front')
        if(this.#side != 'spectator') return this.#side;
        
        const token = tokenService.token;
        if(!token) {
            alert('Ви не авторизовані');
            return;
        }
        
        try{
            const response = await fetch (`${hostAddress}/get-side`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

    getUserName() {
        const localStorageJSON = localStorage.getItem('DenisChess');
        if(!localStorageJSON) return null;
        const localStorageData = JSON.parse(localStorageJSON);
        this.#userName = localStorageData.userName;
        return this.#userName;
    }

    setUserName(userName: string) { 
        this.#userName = userName;
        const localStorageJSON = localStorage.getItem('DenisChess');
        const localStorageData = localStorageJSON ? JSON.parse(localStorageJSON) : {};
        localStorageData.userName = userName;
        localStorage.setItem('DenisChess', JSON.stringify(localStorageData));
    }
        
    get UserName() {
        return this.#userName || this.getUserName();
    }

    reset() {
        this.#side = 'spectator';
    }
   
}

export default new PlayerService();