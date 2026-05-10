import clientApi from "./client";
import axios from "axios";

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

    async request ({ userName, password }: AuthorizationInput) {
        const abortController = new AbortController();
        setTimeout(() => abortController.abort(), 4000);

        console.log(userName, password);

        if(!userName || !password) {     
            return new ResponseData('fail', {
                name: 'TypeError',
                message: "Не введено ім'я або пароль"
            });
        }

        try {

            const response = await clientApi.post(this.endpoint, {
                userName: userName,
                password: password
            }, {
                signal: abortController.signal
            });

            const data = response.data;

            const result = new ResponseData('success', data);
            return result;

        } catch (err: unknown) {
            let errName = 'Error';
            let errMessage = 'Сталася невідома помилка';

            if(err instanceof Error) {
                errName = err.name;
                errMessage = err.message;
            } else return new ResponseData('fail', {name: errName, message: errMessage});
            
            if('name' in err && err.name === 'AbortError') {
                errName = 'AbortError';
                errMessage = 'Вичерпано час очікування відповіді';
            } 

            else if(axios.isAxiosError(err)) {
                if(err.response) {
                    errName = 'ResponseError';
                    errMessage = err.response.data.message || `Помилка на сервері - ${err.response.status}`;
                }
                
                else if(err.request) {
                    errName = 'RequestError';
                    errMessage = 'Помилка запиту, спроуйте пізніше/перевірте з\'єднання';
                }
            }

            return new ResponseData('fail', {name: errName, message: errMessage});
        }

    }
}

class Registration extends Authorization {
    protected endpoint = '/registration';
}


class Login extends Authorization {
    protected endpoint = '/login'
}

export const RegistrationService = new Registration();
export const LoginService = new Login();
