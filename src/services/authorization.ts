import { hostAddress } from "./host";

class ResponseData<T> {
    status: 'success' | 'fail';
    data: T;
    constructor(status: 'success' | 'fail', data: T) {
        this.status = status
        this.data = data
    }
    get ok () {
        return this.status === 'success';
    }
}

interface AuthorizationInput {
    userName: string,
    password: string,
    message: string
}

abstract class Authorization { 
    protected abstract endpoint: string;

    async request ({ userName, password, message }: AuthorizationInput) {
        const abortController = new AbortController();
        setTimeout(() => abortController.abort(), 4000);

        if(!userName || !password) {        
            return new ResponseData('fail', {
                name: 'TypeError',
                message: "Не введено ім'я або пароль"
            });
        }

        try {
            
            const response = await fetch(`${hostAddress}/${this.endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName: userName, password: password }),
                signal: abortController.signal
            });

            if(!response.ok) {
                const data = await response.json().catch(() => {});
                
                return new ResponseData('fail', {
                    name: data.name || 'Відповідь сервера',
                    message: data.message || `Помилка ${message}`
                });
            }

            const data = await response.json();

            const result = new ResponseData('success', data);
            return result;

        } catch (err: any) {
            const result = new ResponseData('fail', {name: err.name, message: err.message});
            
            if(err.name === 'AbortError') {
                result.data.message = 'fetch time limit';
            } 

            return result;
        }

    }
}

// export default registration;

class Registration extends Authorization {
    protected endpoint = '/registration';
}


class Login extends Authorization {
    protected endpoint = '/login'
}

export const RegistrationService = new Registration();
export const LoginService = new Login();
