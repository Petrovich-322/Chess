import { hostAddress } from "./host";

import ResponseData from "./ResponseData";

const login = async ({ userName, password }: { userName: string, password: string }) => {
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), 4000);

    if(!userName || !password) {        
        return new ResponseData('fail', {
            name: 'TypeError',
            message: "Не введено ім'я або пароль"
        });
    }

    try {

        const response = await fetch(`${hostAddress}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: userName, password: password }),
            signal: abortController.signal
        });
        
        if(!response.ok) {
            const data = await response.json().catch(() => {});
            
            return new ResponseData('fail', {
                name: data.name || 'Відповідь сервера',
                message: data.message || 'Помилка входу'
            });
        }

        const data = await response.json();


    } catch (err: any) {
        const result = new ResponseData('fail', {name: err.name, message: err.message});
        
        if(err.name === 'AbortError') {
            result.data.message = 'fetch time limit';
        } 

        return result;
        
    }

}