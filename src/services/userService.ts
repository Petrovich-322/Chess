class UserService {
    #userName: string | null = null;
    #rating: number = 0;

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

    getRating() {
        const localStorageJSON = localStorage.getItem('DenisChess');
        if(!localStorageJSON) return 0;
        const localStorageData = JSON.parse(localStorageJSON);
        this.#rating = localStorageData.rating || 0;
        return this.#rating;
    }

    setRating(rating: number) {
        this.#rating = rating;
        const localStorageJSON = localStorage.getItem('DenisChess');
        const localStorageData = localStorageJSON ? JSON.parse(localStorageJSON) : {};
        localStorageData.rating = rating;
        localStorage.setItem('DenisChess', JSON.stringify(localStorageData));
    }
        
    get UserName() {
        return this.#userName || this.getUserName();
    }

    get Rating() {
        return this.#rating || 0;
    }

    reset() {
        this.#userName = null;
        this.#rating = 0;
    }
    
   
}

export default new UserService();