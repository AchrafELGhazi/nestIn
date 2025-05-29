import { verifyToken } from './../middleware/verifyToken';
import {
  getPost,
  getPosts,
  createPost,
  deletePost,
  updatePost,
} from './../controllers/post.controller';
import express from 'express';

const postRouter = express.Router();

postRouter.get('/', getPosts); //ok
postRouter.get('/:id', getPost); //ok
postRouter.post('/', verifyToken, createPost); //ok
postRouter.delete('/:id', verifyToken, deletePost); //ok
postRouter.put('/:id', verifyToken, updatePost);

export default postRouter;
