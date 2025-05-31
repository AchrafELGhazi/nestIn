import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import chalk from 'chalk';
import { Server } from 'socket.io';

import apiRouter from './routes/api';

dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  nodeEnv: process.env.NODE_ENV || 'development',
};

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use('/api', apiRouter);

interface OnlineUser {
  userId: string;
  socketId: string;
}

let onlineUsers: OnlineUser[] = [];

const addUser = (userId: string, socketId: string) => {
  if (!onlineUsers.some(user => user.userId === userId)) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId: string) => {
  onlineUsers = onlineUsers.filter(user => user.socketId !== socketId);
};

const getUser = (userId: string) => {
  return onlineUsers.find(user => user.userId === userId);
};

const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    // methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', socket => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('newUser', (userId: string) => {
    if (!userId || typeof userId !== 'string') {
      return socket.emit('error', 'Invalid user ID');
    }
    addUser(userId, socket.id);
    console.log(`✅ User ${userId} connected`);
    console.log('Online users:', onlineUsers);
  });

  socket.on('sendMessage', ({ receiverId, data }) => {
    try {
      const receiver = getUser(receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('getMessage', data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

server.listen(config.port, () => {
  const now = new Date().toLocaleString();
  console.log(chalk.greenBright.bold(`🚀 Server started successfully!`));
  console.log(chalk.blueBright(`📅 Date: ${now}`));
  console.log(chalk.yellow(`🌐 Environment: ${config.nodeEnv}`));
  console.log(chalk.cyan(`🔗 Listening on: http://localhost:${config.port}`));
});
