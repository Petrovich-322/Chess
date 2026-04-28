import { createContext } from 'react';
import { io } from 'socket.io-client';

import { hostAddress } from '@shared/host';
import TokenService from '@/Services/tokenService';

export const socket = io(`${hostAddress}`, {
    auth: {
        token: TokenService.token 
    }
});
export const SocketContext = createContext(socket);