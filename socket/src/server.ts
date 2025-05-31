import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL;

const io = new Server({
  cors: {
    origin: FRONTEND_URL,
  },
});

io.on('connection', socket => {
  console.log(socket);
});
