import { UserDataKey, UserDataValue } from "./UserService.ts";

export class UserCache {
    #storageKey = 'DenisChess';

    get(key: UserDataKey): UserDataValue {
        const localStorageJSON = localStorage.getItem(this.#storageKey);
        if(!localStorageJSON) return null;

        const localStorageData = JSON.parse(localStorageJSON);
        return localStorageData[key] as string | number ?? null;
    }

    set(key: UserDataKey, value: UserDataValue): void {
        const localStorageJSON = localStorage.getItem(this.#storageKey);
        const localStorageData = localStorageJSON ? JSON.parse(localStorageJSON) : {};
        localStorageData[key] = value;
        localStorage.setItem(this.#storageKey, JSON.stringify(localStorageData));
    }

    clear(): void {
        localStorage.removeItem(this.#storageKey);
    }
}

export const userCache = new UserCache();