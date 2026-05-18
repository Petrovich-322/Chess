import { IUserService, UserDataKey, UserDataValue, UserService } from './UserService.ts';

class UserServiceProxy implements IUserService {
    #service: UserService;
    #TTL: number = 2000;
    #lastUpdate: number = 0;
    #updating: boolean = false;

    constructor(service: UserService) {
        this.#service = service;
    }

    async updateUser(): Promise<void> {
        const time = Date.now();
        if(this.#lastUpdate && (time - this.#lastUpdate) < this.#TTL) {
            console.log('update canceled');
            return;
        }
        if(this.#updating) {
            console.log('canceled bc - already updating');
            return;
        }
        this.#updating = true;
        console.log('updating user');
        await this.#service.updateUser();
        this.#lastUpdate = time;
        this.#updating = false;
        return;
    }

    subscribe(callback: () => void): void {
        this.#service.subscribe(callback);
    }

    logOut(): void {
        this.#service.logOut();
        this.#lastUpdate = 0;
    }

    setData(key: UserDataKey, value: UserDataValue) {
        this.#service.setData(key, value);
    }

    get userName () {
        return this.#service.userName;
    }

    get rating () {
        return this.#service.rating;
    }

    get token () {
        return this.#service.token;
    }
}

const service = new UserService();
export const userService = new UserServiceProxy(service);
