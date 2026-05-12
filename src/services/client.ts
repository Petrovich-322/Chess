import axios from 'axios';

import { hostAddress } from '@shared/host';
import { userService} from './userService';

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

// apiClient.interceptors.response.use(
//     (response) => response,
//     (err) => {
//         console.error('Axious error', err.message);
//         if(err.response?.status === 401) {
//             userService.logOut;
//             window.location.reload();
//         }
//         return err.response;
//     }
// )

export default apiClient;