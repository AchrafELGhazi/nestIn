import express from 'express';

const postRouter = express.Router();

postRouter.get('/test', (req, res) => {
  console.log('router works');
});

export default postRouter;
