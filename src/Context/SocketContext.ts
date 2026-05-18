import { createContext } from 'react';
import { io } from 'socket.io-client';

import { hostAddress } from '@shared/host';
import { userService } from '@/services/UserServiceProxy';

export const socket = io(`${hostAddress}`, {
    auth: {
        token: userService.token
    }
});
export const SocketContext = createContext(socket);