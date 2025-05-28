import { Request, Response } from 'express';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  isAdmin?: boolean;
  userId?: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      isAdmin?: boolean;
    }
  }
}

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY environment variable is missing');
}

export const shouldBeLoggedIn = (req: Request, res: Response) => {
  console.log(req.userId);
  res.status(200).json({ message: 'You are authenticated' });
  return;
};

export const shouldBeAdmin = (req: Request, res: Response) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Not Authenticated!' });
    return;
  }

  jwt.verify(
    token,
    JWT_SECRET_KEY,
    (
      err: JsonWebTokenError | null,
      payload: JwtPayload | string | undefined
    ) => {
      if (err) {
        return res.status(403).json({ message: 'Token is not valid' });
      }

      if (!payload) {
        return res.status(403).json({ message: 'Invalid token payload' });
      }

      const customPayload = payload as CustomJwtPayload;

      if (!customPayload.isAdmin) {
        res.status(403).json({ message: 'Not Authorized!' });
        return;
      }

      res.status(200).json({ message: 'You are authenticated as admin' });
      return;
    }
  );
};
