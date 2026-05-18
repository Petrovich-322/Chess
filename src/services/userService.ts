import apiClient from "./client";

import { UserCache, userCache } from "./UserServiceCache";

export type UserDataKey = 'userName' | 'token' | 'rating';
export type UserDataValue = string | number | null;
export interface IUserService {
    readonly userName: string | null;
    readonly rating: number | null;
    readonly token: string | null;

    updateUser(): Promise<void>;
    subscribe(callback: () => void): void;
    logOut(): void; 

    setData(key: UserDataKey, value: UserDataValue): void;
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

            if(userName) this.setData('userName', userName);
            if(rating) this.setData('rating', rating);

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
            console.log(listener);
        }
    }

    subscribe(callback: () => void) {
        this.#listeners.push(callback);
    }

    logOut() {
        console.log('log out');
        this.#userName = null;
        this.#rating = null
        this.#token = null;
        this.#cache.clear();
        window.location.reload();
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
    #getData(key: UserDataKey): UserDataValue {
        const data = this.#cache.get(key);
        this.#setLocalVariables(key, data);
        return data;
    }

    setData(key: UserDataKey, value: UserDataValue) {
        this.#cache.set(key, value);
        this.#setLocalVariables(key, value);
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
