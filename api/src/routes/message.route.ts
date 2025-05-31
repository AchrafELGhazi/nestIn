import {
  getMyList,
  getMySaved,
  restoreUser,
  savePost,
} from '../controllers/user.controller';
import { verifyToken } from '../middleware/verifyToken';
import express, { Request, Response } from 'express';

const messageRouter = express.Router();

messageRouter.get(
  '/',
  verifyToken
  // getUsers
);

export default messageRouter;
