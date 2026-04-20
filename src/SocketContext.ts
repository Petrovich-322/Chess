import { createContext } from 'react';
import { io } from 'socket.io-client';

import { hostAddress } from './Services/host';

export const socket = io(`${hostAddress}`);
export const SocketContext = createContext(socket);