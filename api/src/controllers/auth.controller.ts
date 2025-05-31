import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import prisma from '../lib/client';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY environment variable is missing');
}

const saltRoundsEnv = process.env.SALT_ROUNDS;
if (!saltRoundsEnv || isNaN(Number(saltRoundsEnv))) {
  throw new Error(
    'SALT_ROUNDS environment variable is missing or not a number'
  );
}

const SALT_ROUNDS = parseInt(saltRoundsEnv, 10);

const isProduction = process.env.NODE_ENV === 'production';


export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!password) {
      res.status(400).json({ message: 'Password is required' });
      return
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const age = 1000 * 60 * 60 * 24 * 7 * 4;

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: true, // come-back
      },
      JWT_SECRET_KEY,
      { expiresIn: age }
    );

    const { password:userPassword, ...userInfo } = user;
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: age,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to login user' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token').status(200).json({ message: 'Logout successful' });
};
