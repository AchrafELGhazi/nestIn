import {
  addChat,
  getChat,
  getChats,
  readChat,
} from '../controllers/chat.controller';
import { verifyToken } from '../middleware/verifyToken';
import express, { Request, Response } from 'express';

const chatRouter = express.Router();

chatRouter.get('/', verifyToken, getChats);
chatRouter.get('/:id', verifyToken, getChat);
chatRouter.post('/', verifyToken, addChat);
chatRouter.put('/read/:id', verifyToken, readChat);

export default chatRouter;
