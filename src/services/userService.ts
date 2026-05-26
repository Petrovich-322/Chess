import apiClient from "./client";

import { UserCache, userCache } from "./UserServiceCache";

export type UserDataKey = 'userName' | 'token' | 'rating';
export type UserDataValue = string | number | null;
export type SetDataParams = { token: string; userName: string; rating: number; }

export interface IUserService {
    readonly userName: string | null;
    readonly rating: number | null;
    readonly token: string | null;

    updateUser(): Promise<void>;
    subscribe(callback: () => void): void;
    unsubscribe(callback: () => void): void;
    logOut(): void; 
    
    setToken(token: string): void;
    setData({ token, userName, rating }: SetDataParams): void;
}

export class UserService implements IUserService{
    #cache: UserCache = userCache;

    #listeners: (() => void)[] = [];

    #userName: string | null = null;
    #token: string | null = null;
    #rating: number | null = null;

    async updateUser() {
        if(!this.#token) {
            console.error('Не авторизований користувач');
            // this.logOut();
            return;
        }
        try {
            const response = await apiClient.get('/update-user');
            const { userName, rating } = response.data;

            if(userName) this.#setLocalVariables('userName', userName);
            if(rating) this.#setLocalVariables('rating', rating);

            this.#updatePage();
        } catch (err: unknown) {
            this.logOut();
            if(err instanceof Error) {
                console.error(err.name, err.message);
            }
            console.error('Unknown error');
        }
    }

    #updatePage() {
        for (const listener of this.#listeners) {
            listener();
        }
    }

    subscribe(callback: () => void) {
        this.#listeners.push(callback);
    }

    unsubscribe(callback: () => void) {
        const index = this.#listeners.indexOf(callback);
        if (index !== -1) {
            this.#listeners.splice(index, 1);
        }
    }

    logOut() {
        console.log('log out');
        this.#userName = null;
        this.#rating = null
        this.#token = null;
        this.#cache.clear();
        // window.location.reload();
        this.#updatePage();
    }

    #setLocalVariables(key: UserDataKey, value: UserDataValue) {
        switch (key) {
            case 'userName':
                if(typeof(value) != 'string' && value != null) throw new TypeError;
                this.#userName = value; break;
            case 'rating':
                if(typeof(value) != 'number' && value != null) throw new TypeError;
                this.#rating = value; break;
            case 'token':
                if(typeof(value) != 'string' && value != null) throw new TypeError;
                this.#token = value; break;
        }
    }

    setToken(token: string) {
        try {
            this.#setLocalVariables('token', token);
        } catch (err) {
            console.error('Помилка при збереженні токена', err);
            return;
        }   
        this.#cache.set('token', token);
    }

    #getData(key: UserDataKey): UserDataValue {
        const data = this.#cache.get(key);
        this.#setLocalVariables(key, data);
        return data;
    }

    setData(data: SetDataParams): void {
        const keys = Object.keys(data) as UserDataKey[];

        for(const key of keys) {
            const value = data[key];
            try{
                this.#setLocalVariables(key, value);
            } catch (err) {
                console.error('Помилка при збереженні даних користувача', err);
                continue;
            }
            this.#cache.set(key, value);
        }

        // this.updateUser();
        this.#updatePage();
    }
        
    get userName(): string | null {
        return this.#userName ?? this.#getData('userName') as string | null;
    }

    get rating(): number | null {
        return this.#rating ?? this.#getData('rating') as number | null;
    }

    get token(): string | null {
        return this.#token ?? this.#getData('token') as string | null;
    }
}
