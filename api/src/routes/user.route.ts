import { restoreUser } from './../controllers/user.controller';
import { verifyToken } from './../middleware/verifyToken';
import express, { Request, Response } from 'express';
import {
  deleteUser,
  getDeletedUsers,
  getUser,
  getUsers,
  updateUser,
} from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.get('/', verifyToken, getUsers);
userRouter.get('/deleted', verifyToken, getDeletedUsers);
userRouter.post('/restore/:id', verifyToken, restoreUser);
userRouter.get('/:id', verifyToken, getUser);
userRouter.put('/:id', verifyToken, updateUser);
userRouter.delete('/:id', verifyToken, deleteUser);

export default userRouter;
