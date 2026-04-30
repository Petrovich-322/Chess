
class TokenService {
    #tokenData = null;
    
    getToken() {
        const localStorageJSON = localStorage.getItem('DenisChess');
        const locaStorageData = localStorageJSON ? JSON.parse(localStorageJSON) : null;

        const token = locaStorageData ? locaStorageData.token : null;
        if(!token) return null;
        
        this.#tokenData = token;

        return token;
    }
    
    setToken(token: string) {
        const localStorageJSON = localStorage.getItem('DenisChess');
        const locaStorageData = localStorageJSON ? JSON.parse(localStorageJSON) : {};

        locaStorageData.token = token;

        localStorage.setItem('DenisChess', JSON.stringify(locaStorageData));
    }

    get isLoggedIn() {
        return !!this.token;
    }
    get token(){
        return this.#tokenData ?? this.getToken();
    }
} 

export default new TokenService();