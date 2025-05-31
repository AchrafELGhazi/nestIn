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

io.on('connection', socket => {
  console.log(socket);
});

console.log(`Starting server on port ${config.port}`);
io.listen(config.port);
console.log('Server is now listening');