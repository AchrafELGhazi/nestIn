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

postRouter.get('/', getPosts);
postRouter.post('/', verifyToken, createPost);
postRouter.get('/:id', getPost);
postRouter.delete('/:id', verifyToken, deletePost);
postRouter.put('/:id', verifyToken, updatePost);

export default postRouter;
