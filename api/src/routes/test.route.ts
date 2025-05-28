import { verifyToken } from './../middleware/verifyToken';
import {
  shouldBeLoggedIn,
  shouldBeAdmin,
} from './../controllers/test.controller';
import express from 'express';

const testRouter = express.Router();

testRouter.get('/should-be-logged-in', verifyToken, shouldBeLoggedIn);
testRouter.get('/should-be-admin',verifyToken, shouldBeAdmin);

export default testRouter;
