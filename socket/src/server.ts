import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  nodeEnv: process.env.NODE_ENV || 'development',
};

if (!config.port) {
  console.error('❌ PORT is required in environment variables');
  process.exit(1);
}

const corsConfig = {
  origin:
    config.nodeEnv === 'production'
      ? config.frontendUrl
      : [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true,
};

const io = new Server({
  cors: corsConfig,
  // pingTimeout: 60000,
  // pingInterval: 25000,
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
};

const log = {
  info: (msg: string) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  server: (msg: string) =>
    console.log(`${colors.magenta}🚀${colors.reset} ${msg}`),
  socket: (msg: string) =>
    console.log(`${colors.blue}🔌${colors.reset} ${msg}`),
};

const logBox = (title: string, content: string, color = colors.blue) => {
  const width = Math.max(title.length, content.length) + 4;
  const border = '─'.repeat(width);

  console.log(`${color}┌${border}┐${colors.reset}`);
  console.log(
    `${color}│${colors.reset} ${colors.bright}${title.padEnd(width - 2)}${
      colors.reset
    } ${color}│${colors.reset}`
  );
  console.log(`${color}├${border}┤${colors.reset}`);
  console.log(
    `${color}│${colors.reset} ${content.padEnd(width - 2)} ${color}│${
      colors.reset
    }`
  );
  console.log(`${color}└${border}┘${colors.reset}`);
};

interface OnlineUser {
  userId: string;
  socketId: string;
}

let onlineUsers: OnlineUser[] = [];

const addUser = (userId: string, socketId: string): void => {
  const userExists = onlineUsers.find(user => user.userId === userId);
  if (!userExists) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId: string): void => {
  onlineUsers = onlineUsers.filter(user => user.socketId !== socketId);
};

const getUser = (userId: string): OnlineUser | undefined => {
  return onlineUsers.find(user => user.userId === userId);
};

io.on('connection', socket => {
  log.socket(`New connection: ${colors.bright}${socket.id}${colors.reset}`);

  socket.on('newUser', (userId: string) => {
    addUser(userId, socket.id);
    log.info(`User ${colors.green}${userId}${colors.reset} joined`);
    console.log('Online users:', onlineUsers);
  });

  socket.on('sendMessage', ({ receiverId, data }) => {
    console.log('receiver: ', receiverId);
    console.log('data: ', data);
    const receiver = getUser(receiverId);
    if (!receiver) {
      log.warning(`Receiver ${receiverId} not found online`);
      return;
    }
    io.to(receiver.socketId).emit('getMessage', data);
    log.info(`Message sent to ${receiverId}`);
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    log.warning(`Socket ${colors.dim}${socket.id}${colors.reset} disconnected`);
    console.log('Online users after disconnect:', onlineUsers);
  });
});

console.log(
  `\n${colors.bright}${colors.bgBlue} SERVER STARTUP ${colors.reset}\n`
);

io.listen(config.port);
logBox('🚀 SERVER', `Port: ${config.port} | Status: READY`, colors.green);

console.log(
  `${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
);
