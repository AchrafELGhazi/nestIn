import express from 'express';
import postRouter from './post.route';
import authRouter from './auth.route';
import userRouter from './user.route';
import testRouter from './test.route';
import messageRouter from './message.route';
import chatRouter from './chat.route';

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/post', postRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/test', testRouter);
apiRouter.use('/message', messageRouter);
apiRouter.use('/chat', chatRouter);

export default apiRouter;
