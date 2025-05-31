import { Request, Response } from 'express';
import prisma from '../lib/client';
import bcrypt from 'bcrypt';
import { console } from 'node:inspector/promises';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = req.params;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID provided',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

interface UpdateUserBody {
  username?: string;
  email?: string;
  password?: string;
  avatar?: string;
}

const ALLOWED_UPDATE_FIELDS = ['username', 'email', 'password', 'avatar'];

const USER_SELECT_FIELDS = {
  id: true,
  email: true,
  username: true,
  avatar: true,
  createdAt: true,
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req.params;
    const body = req.body as UpdateUserBody;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID provided',
      });
      return;
    }

    if (!body || Object.keys(body).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No update data provided',
      });
      return;
    }

    const tokenUserId = req.userId;
    if (userId !== tokenUserId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this user',
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const filteredData: Partial<UpdateUserBody> = {};
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_UPDATE_FIELDS.includes(key) && value !== undefined) {
        filteredData[key as keyof UpdateUserBody] = value;
      }
    }

    if (Object.keys(filteredData).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
        allowedFields: ALLOWED_UPDATE_FIELDS,
      });
      return;
    }

    if (filteredData.email && filteredData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: filteredData.email },
        select: { id: true },
      });

      if (emailExists) {
        res.status(409).json({
          success: false,
          message: 'Email already exists',
        });
        return;
      }
    }

    const saltRoundsEnv = process.env.SALT_ROUNDS;
    if (!saltRoundsEnv || isNaN(Number(saltRoundsEnv))) {
      throw new Error(
        'SALT_ROUNDS environment variable is missing or not a number'
      );
    }

    const SALT_ROUNDS = parseInt(saltRoundsEnv, 10);

    if (filteredData.password) {
      filteredData.password = await bcrypt.hash(
        filteredData.password,
        SALT_ROUNDS
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...filteredData,
        updatedAt: new Date(),
      },
      select: USER_SELECT_FIELDS,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        res.status(409).json({
          success: false,
          message: 'Email already exists',
        });
        return;
      }

      if (error.message.includes('Record to update not found')) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating user',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID provided',
      });
      return;
    }

    const tokenUserId = req.userId;
    const isAdmin = req.isAdmin;

    if (userId !== tokenUserId && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user',
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const result = await prisma.$transaction(async tx => {
      const deletedUser = await tx.deletedUser.create({
        data: {
          originalId: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          password: existingUser.password,
          avatar: existingUser.avatar,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
          deletedBy: tokenUserId,
          deletionReason: req.body.reason || undefined,
        },
      });

      await tx.user.delete({
        where: { id: userId },
      });

      return deletedUser;
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUserId: result.originalId,
        deletedAt: result.deletedAt,
      },
    });
  } catch (error) {
    console.error('Error deleting user:', error);

    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      if (error.message.includes('Unique constraint')) {
        res.status(409).json({
          success: false,
          message: 'User has already been deleted',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting user',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const getDeletedUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
      return;
    }

    const deletedUsers = await prisma.deletedUser.findMany({
      select: {
        id: true,
        originalId: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
        deletedAt: true,
        deletedBy: true,
        deletionReason: true,
      },
      orderBy: { deletedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      message: 'Deleted users retrieved successfully',
      data: deletedUsers,
      count: deletedUsers.length,
    });
  } catch (error) {
    console.error('Error fetching deleted users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching deleted users',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const restoreUser = async (req: Request, res: Response) => {
  try {
    const { id: deletedUserId } = req.params;

    if (!req.isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
      return;
    }

    if (!deletedUserId || typeof deletedUserId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid deleted user ID provided',
      });
      return;
    }

    const deletedUser = await prisma.deletedUser.findUnique({
      where: { id: deletedUserId },
    });

    if (!deletedUser) {
      res.status(404).json({
        success: false,
        message: 'Deleted user not found',
      });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: deletedUser.email }, { username: deletedUser.username }],
      },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email or username is already taken by another user',
      });
      return;
    }

    const result = await prisma.$transaction(async tx => {
      const restoredUser = await tx.user.create({
        data: {
          email: deletedUser.email,
          username: deletedUser.username,
          password: deletedUser.password,
          avatar: deletedUser.avatar,
          createdAt: deletedUser.createdAt,
          updatedAt: new Date(),
        },
      });

      await tx.deletedUser.delete({
        where: { id: deletedUserId },
      });

      return restoredUser;
    });

    res.status(200).json({
      success: true,
      message: 'User restored successfully',
      data: {
        id: result.id,
        email: result.email,
        username: result.username,
        restoredAt: result.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error restoring user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while restoring user',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const savePost = async (req: Request, res: Response) => {
  const postId = req.body.id;
  const tokenUserId = req.userId;
  console.log(postId);
  console.log(tokenUserId);

  if (!tokenUserId) {
    return;
  }
  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: 'Post removed from saved list' });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: 'Post saved' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to save the post!', err });
  }
};

export const getMyList = async (req: Request, res: Response) => {
  const tokenUserId = req.userId;

  if (!tokenUserId) {
    res.status(401).json({
      success: false,
      message: 'User authentication required',
    });
    return;
  }

  try {
    const myList = await prisma.post.findMany({
      where: { userId: tokenUserId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      message: 'My list retrieved successfully',
      data: myList,
      count: myList.length,
    });
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting my list',
    });
  }
};

export const getMySaved = async (req: Request, res: Response) => {
  const tokenUserId = req.userId;

  if (!tokenUserId) {
    res.status(401).json({
      success: false,
      message: 'User authentication required',
    });
    return;
  }

  try {
    const mySaved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
    });

    const mySavedPosts = mySaved.map(item => item.post);

    res.status(200).json({
      success: true,
      message: 'My saved posts retrieved successfully',
      data: mySavedPosts,
      count: mySavedPosts.length,
    });
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting my list',
    });
  }
};
