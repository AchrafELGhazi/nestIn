import { Request, Response } from 'express';
import prisma from '../lib/client';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  
};
