import { Request, Response } from 'express';
import prisma from '../lib/client';

export const getChats = async (req: Request, res: Response) => {
  const tokenUserId = req.userId;
  if (!tokenUserId) {
    res.status(401).json({
      success: false,
      message: 'User authentication required',
    });
    return;
  }

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIds: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Chats retrieved successfully',
      data: chats,
      count: chats.length,
    });
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting chats',
    });
  }
};

export const getChat = async (req: Request, res: Response): Promise<void> => {
  const chatId = req.params.id;
  const tokenUserId = req.userId;

  if (!tokenUserId) {
    res.status(401).json({
      success: false,
      message: 'User authentication required',
    });
    return;
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userIds: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!chat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
      return;
    }

    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: {
          push: tokenUserId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Chat retrieved successfully',
      data: chat,
    });
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting chat',
    });
  }
};

export const addChat = async (req: Request, res: Response) => {
  const tokenUserId = req.userId;
  const { receiverId } = req.body;

  if (!tokenUserId) {
    res.status(401).json({
      success: false,
      message: 'User authentication required',
    });
    return;
  }

  if (!receiverId) {
    res.status(400).json({
      success: false,
      message: 'Receiver ID is required',
    });
    return;
  }

  if (tokenUserId === receiverId) {
    res.status(400).json({
      success: false,
      message: 'Cannot create chat with yourself',
    });
    return;
  }

  try {
    const existingChat = await prisma.chat.findFirst({
      where: {
        userIds: {
          hasEvery: [tokenUserId, receiverId],
        },
      },
    });

    if (existingChat) {
      res.status(200).json({
        success: true,
        message: 'Chat already exists',
        data: existingChat,
      });
      return;
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
      return;
    }

    const newChat = await prisma.chat.create({
      data: {
        userIds: [tokenUserId, receiverId],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: newChat,
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating chat',
    });
  }
};

export const readChat = async (req: Request, res: Response) => {
  const chatId = req.params.id;
  const tokenUserId = req.userId;

  if (!tokenUserId) {
    res.status(401).json({
      success: false,
      message: 'User authentication required',
    });
    return;
  }

  try {
    const existingChat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userIds: {
          hasSome: [tokenUserId],
        },
      },
    });

    if (!existingChat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found or access denied',
      });
      return;
    }

    const chat = await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: {
          push: tokenUserId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Chat marked as read',
      data: chat,
    });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while marking chat as read',
    });
  }
};
