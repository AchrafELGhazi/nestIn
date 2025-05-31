import { useState } from 'react';
import { createContext } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(io('http://localhost:3005'));
  }, []);

  return <AuthContext.Provider value={socket}>{children}</AuthContext.Provider>;
};
