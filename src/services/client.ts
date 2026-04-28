import axios from 'axios';

import { hostAddress } from '@shared/host';
import TokenService from './tokenService';

const apiClient = axios.create({
    baseURL: hostAddress,
    headers: {
        'Content-Type': 'application/json'
    }
}); 

apiClient.interceptors.request.use((config: any) => {
    const token = TokenService.token;
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;