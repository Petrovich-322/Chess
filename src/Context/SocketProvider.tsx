import { createContext, useState, useEffect } from 'react';    
import { Socket, io } from 'socket.io-client';
import { userService } from '@/services/UserServiceProxy';
import { hostAddress } from '@shared/host';

import { SocketContext } from './SocketContext';

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {  
    const [token, setToken] = useState<string | null>(userService.token);    
    const [socket, setSocket] = useState<Socket | null>(null);  

    useEffect(() => {  
        const handleUserChange = () => {
            setToken(userService.token)
        }
        userService.subscribe(handleUserChange);
        handleUserChange();

        return () => {

        }
    }, []);

    useEffect(() => {   
        if(!token) {
            socket?.disconnect();
            setSocket(null);
            return;
        }

        if(socket) {
            socket.auth = { token };
            if(socket.disconnected) socket.connect();
            console.log('Updated socket auth with new token');
            return;
        }

        const newSocket = io(`${hostAddress}`, { auth: { token }, autoConnect: true, reconnection: true });
        newSocket.on('connect_error', (err) => {    
            console.error('Socket connection error:', err);
            if(err.message === 'Unauthorized') {
                userService.updateUser().then(() => {
                    console.log('User updated successfully after socket connection error');
                }).catch((updateError) => {
                    console.error('Error updating user after socket connection error:', updateError);
                });
            }
        });
        setSocket(newSocket);
        console.log('New Socket connected with token');

        return () => {
            newSocket.off('connect_error');
            newSocket.disconnect(); 
        }

    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}