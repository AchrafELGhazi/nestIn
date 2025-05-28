import express, { Request, Response } from 'express';

const userRouter = express.Router();

userRouter.get('/test', (req: Request, res: Response) => {
  console.log('router works');
});

export default userRouter;
