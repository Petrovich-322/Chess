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
}

const parseMessage = (text: string) => {
    switch(text) {
        case 'noData':
            return "Не введено ім'я або пароль";
        case 'exist':
            return "Такий користувач вже існує";
        case 'notExist':
            return "Такий користувач не існує";
        case 'unCorPass': 
            return 'Не правильний пароль';
        default:
            return null;
    } 
}
abstract class Authorization { 
    protected abstract endpoint: string;

    async request ({ userName, password }: AuthorizationInput) {
        const abortController = new AbortController();
        setTimeout(() => abortController.abort(), 4000);

        // console.log(userName, password);

        if(!userName || !password) {     
            return new ResponseData('fail', {
                name: 'TypeError',
                message: "Не введено ім'я або пароль"
            });
        }
        
        if(userName.length < 4 || userName.length > 12) {
            return new ResponseData('fail', {
                name: 'TypeError',
                message: `Введене ім'я ${userName.length < 4 ? 'замале' : 'завелике'}`
            });
        }

        if(password.length < 8 || password.length > 14) {
            return new ResponseData('fail', {
                name: 'TypeError',
                message: `Введений пароль ${password.length < 8 ? 'замалий' : 'завеликий'}`
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
            let errName = 'Error', errMessage = 'Сталася невідома помилка';
            console.log(err);

            if(axios.isAxiosError(err)) {
                if(err.response) {
                    errName = 'ResponseError';

                    const unparsedErrMessage = err.response.data.message;
                    const parsedMessage = parseMessage(unparsedErrMessage);

                    errMessage = parsedMessage || unparsedErrMessage || `Помилкa - ${err.response.status}`;
                }
                
                else if(err.request) {
                    errName = 'RequestError';
                    errMessage = 'Помилка запиту, спроуйте пізніше/перевірте з\'єднання';
                }

                else errMessage = err.message;
            }

            else if(err instanceof Error) {
                errName = err.name;
                errMessage = err.name === 'AbortError' ? 'Вичерпано час очікування відповіді' : err.message;
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
