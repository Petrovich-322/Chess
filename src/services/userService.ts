import apiClient from "./client";

class UserService {
    #userName: string | null = null;
    #rating: number = 0;

    async updateUser() {
        try {
            const response = await apiClient.get('/update-user');
            console.log(response.data);
            const { userName, rating } = response.data;

            if(userName) this.setUserName(userName);
            if(rating) this.setRating(rating);

            console.log(userName, rating);

        } catch (err) {
            console.error('apiClient answer problem');
        }
    }

    setUserName(userName: string) { 
        const localStorageJSON = localStorage.getItem('DenisChess');
        const localStorageData = localStorageJSON ? JSON.parse(localStorageJSON) : {};
        localStorageData.userName = userName;
        localStorage.setItem('DenisChess', JSON.stringify(localStorageData));
        this.#userName = userName;
    }

    setRating(rating: number) {
        const localStorageJSON = localStorage.getItem('DenisChess');
        const localStorageData = localStorageJSON ? JSON.parse(localStorageJSON) : {};
        localStorageData.rating = rating;
        localStorage.setItem('DenisChess', JSON.stringify(localStorageData));
        this.#rating = rating;
    }

    getRating() {
        const localStorageJSON = localStorage.getItem('DenisChess');
        if(!localStorageJSON) return 0;
        const localStorageData = JSON.parse(localStorageJSON);
        this.#rating = localStorageData.rating || 0;
        return this.#rating;
    }
    
    getUserName() {
        const localStorageJSON = localStorage.getItem('DenisChess');
        if(!localStorageJSON) return null;
        const localStorageData = JSON.parse(localStorageJSON);
        this.#userName = localStorageData.userName;
        return this.#userName;
    }
        
    get userName() {
        return this.#userName || this.getUserName();
    }

    get rating() {
        return this.#rating || 0;
    }

    reset() {
        this.#userName = null;
        this.#rating = 0;
    }
    
   
}

export default new UserService();