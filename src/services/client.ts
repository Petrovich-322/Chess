import axios, { AxiosError } from 'axios';

import { hostAddress } from '@shared/host';
import { userService } from './UserServiceProxy';

const apiClient = axios.create({
    baseURL: hostAddress,
    headers: {
        'Content-Type': 'application/json'
    }
}); 

apiClient.interceptors.request.use((config: any) => {
    const token = userService.token;

    config.headers['Authorization'] = ``
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

interface ErrorMessage {
    message: string;
}

apiClient.interceptors.response.use(
    (response) => response,
    async (err: AxiosError<ErrorMessage>) => {
        console.error('Axious error', err.message);
        if(!err.response || !err.config) {
            userService.logOut;
            return Promise.reject(err);
        }

        const request = err.config;
        if(err.response.status === 401) {
            if(err.response.data.message !== 'tokenExpired') {
                userService.logOut;
                return Promise.reject(err);
            } 
            try {
                const res = await axios.post(`${hostAddress}/refresh`, {}, { 
                    withCredentials: true
                });
                const accessToken = res.data.accessToken as string;
                userService.setData('token', accessToken);
                console.log('success updating token');

                if (request.headers) {
                    request.headers['Authorization'] = `Bearer ${accessToken}`;
                }
                return apiClient(request);

            } catch (fetchError) {
                userService.logOut;
                return Promise.reject(err);
            }
        }

        return Promise.reject(err);
    }
);

export default apiClient;
