import { Request, Response } from 'express';
import prisma from '../lib/client';

export const addMessage = async (req: Request, res: Response) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;
  const { text } = req.body;

  if (!tokenUserId) {
     res.status(401).json({
      success: false,
      message: 'User authentication required',
    });return;
  }

  if (!text || text.trim().length === 0) {
     res.status(400).json({
      success: false,
      message: 'Message text is required',
    });return;
  }

  if (!chatId) {
     res.status(400).json({
      success: false,
      message: 'Chat ID is required',
    });return;
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userIds: {
          hasSome: [tokenUserId],
        },
      },
    });

    if (!chat) {
       res.status(404).json({
        success: false,
        message: 'Chat not found or access denied',
      });return;
    }

    const result = await prisma.$transaction(async tx => {
      const message = await tx.message.create({
        data: {
          text: text.trim(),
          chatId,
          userId: tokenUserId,
        },
      });

      await tx.chat.update({
        where: {
          id: chatId,
        },
        data: {
          seenBy: [tokenUserId],
          lastMessage: text.trim(),
          updatedAt: new Date(),
        },
      });

      return message;
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sending message',
    });
  }
};
