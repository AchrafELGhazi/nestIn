import express from 'express';
import postRouter from './post.route';
import authRouter from './auth.route';
import userRouter from './user.route';

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/post', postRouter);
apiRouter.use('/user', userRouter);

export default apiRouter;
