import { addMessage } from '../controllers/message.controller';
import {
  getMyList,
  getMySaved,
  restoreUser,
  savePost,
} from '../controllers/user.controller';
import { verifyToken } from '../middleware/verifyToken';
import express, { Request, Response } from 'express';

const messageRouter = express.Router();

messageRouter.post('/:id', verifyToken, addMessage);

export default messageRouter;
