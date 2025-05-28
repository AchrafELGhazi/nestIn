import { NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

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

interface CustomJwtPayload extends JwtPayload {
  id: string;
  isAdmin: boolean;
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

      if (!payload || typeof payload === 'string') {
        return res.status(403).json({ message: 'Invalid token payload' });
      }

      const customPayload = payload as CustomJwtPayload;

      req.userId = customPayload.id;
      req.isAdmin = customPayload.isAdmin;

      next();
    }
  );
};
