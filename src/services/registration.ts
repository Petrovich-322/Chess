import { hostAddress } from "./host";

import ResponseData from "./ResponseData";

const registration = async ({ userName, password }: {userName: string, password: string}) => {
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), 4000);

    if(!userName || !password) {        
        return new ResponseData('fail', {
            name: 'TypeError',
            message: "Не введено ім'я або пароль"
        });
    }

    try {
        
        const response = await fetch(`${hostAddress}/registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: userName, password: password }),
            signal: abortController.signal
        });

        if(!response.ok) {
            const data = await response.json().catch(() => {});
            
            return new ResponseData('fail', {
                name: data.name || 'Відповідь сервера',
                message: data.message || 'Помилка реєстрації'
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

export default registration;



