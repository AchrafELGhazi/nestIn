import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { createContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      // withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    currentUser && socket?.emit('newUser', currentUser.id);
  }, [currentUser, socket]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
