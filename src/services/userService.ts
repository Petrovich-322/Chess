import apiClient from "./client";

class UserService {
    #userName: string | null = null;
    #token: string | null = null;
    #rating: number | null = null;

    async updateUser() {
        
        if(!this.#token) {
            console.error('Не авторизований користувач');
            return;
        }

        try {
            const response = await apiClient.get('/update-user');
            const { userName, rating } = response.data;

            if(userName) this.setData('userName', userName);
            if(rating) this.setData('rating', rating);

            console.log(this.#rating);

        } catch (err) {
            this.logOut();
            
            console.error('apiClient answer problem');
        }
    }

    logOut() {
        this.setData('userName', null);
        this.setData('token', null);
        this.setData('rating', null);
    }

    setData(key: 'userName' | 'rating' | 'token', value: string | number | null) {

        const localStorageJSON = localStorage.getItem('DenisChess');
        const localStorageData = localStorageJSON ? JSON.parse(localStorageJSON) : {};

        localStorageData[key] = value;
        localStorage.setItem('DenisChess', JSON.stringify(localStorageData));

        if(value) this.setLocalVariables(key, value);
        
    }

    setLocalVariables(key: 'userName' | 'rating' | 'token', value: string | number) {
        switch (key) {
            case 'userName':
                if(typeof(value) != 'string') throw new TypeError;
                this.#userName = value;
                break;
            case 'rating':
                if(typeof(value) != 'number') throw new TypeError;
                this.#rating = value;
                break;
            case 'token':
                if(typeof(value) != 'string') throw new TypeError;
                this.#token = value;
                break;
        }
    }

    getData(type: 'userName' | 'token' | 'rating') {
       
        const localStorageJSON = localStorage.getItem('DenisChess');
        if(!localStorageJSON) return null;
        const localStorageData = JSON.parse(localStorageJSON);
        
        const data = localStorageData[type];
        
        if(!data && data !== 0) {
            return;
        }

        this.setLocalVariables(type, data);
        return data;

    }

    #getToken() {
        return this.getData('token');
    }

    #getRating() {
        return this.getData('rating');
    }
    
    #getUserName() {
        return this.getData('userName');
    }
        
    get userName() {
        return this.#userName || this.#getUserName();
    }

    get rating() {
        return this.#rating || this.#getRating();
    }

    get token() {
        return this.#token || this.#getToken();
    }
}

export const userService = new UserService();