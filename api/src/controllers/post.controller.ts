import { Request, Response } from 'express';
import prisma from '../lib/client';

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show newest posts first
      },
    });

    res.status(200).json({
      success: true,
      message: 'Posts retrieved successfully',
      data: posts,
      count: posts.length,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching posts',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;

    if (!postId || typeof postId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid post ID provided',
      });
      return;
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Post retrieved successfully',
      data: post,
    });
  } catch (error) {
    console.error('Internal server error while fetching the post:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching the post',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tokenUserId = req.userId;
    if (!tokenUserId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to create post, login first',
      });
      return;
    }

    const {
      title,
      price,
      img,
      address,
      city,
      bedroom,
      bathroom,
      latitude,
      longitude,
      type,
      property,
    } = req.body;

    if (
      !title ||
      !price ||
      !address ||
      !city ||
      !longitude ||
      !latitude ||
      !type ||
      !property
    ) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
      return;
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        price: parseFloat(price),
        img,
        address,
        city,
        bedroom: bedroom ? parseInt(bedroom) : 0,
        bathroom: bathroom ? parseInt(bathroom) : 0,
        latitude,
        longitude,
        type,
        property,
        userId: tokenUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost,
    });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating post',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  const postId = req.params.id;

  if (!postId || typeof postId !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Invalid post ID provided',
    });
    return;
  }

  try {
    const postToDelete = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!postToDelete) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    const idInPost = postToDelete.userId;
    const tokenUserId = req.userId;
    const isAdmin = req.isAdmin;

    if (idInPost !== tokenUserId && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
      return;
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting post',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

type Type = 'buy' | 'rent';
type Property = 'apartment' | 'house' | 'condo' | 'land';

interface UpdatePostBody {
  title?: string;
  price?: number;
  img?: string;
  address?: string;
  city?: string;
  bedroom?: number;
  bathroom?: number;
  latitude?: string;
  longitude?: string;
  type?: Type;
  property?: Property;
}

export const updatePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.id;
    const body = req.body as UpdatePostBody;

    if (!postId || typeof postId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid postId provided',
      });
      return;
    }

    if (!body || Object.keys(body).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No updated data provided',
      });
      return;
    }

    const postToUpdate = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postToUpdate) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    const idOfPost = postToUpdate.userId;
    const tokenUserId = req.userId;
    const isAdmin = req.isAdmin;

    if (idOfPost !== tokenUserId && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update post',
      });
      return;
    }

    const updateData = { ...body };
    if (updateData.price && typeof updateData.price === 'string') {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.bedroom && typeof updateData.bedroom === 'string') {
      updateData.bedroom = parseInt(updateData.bedroom);
    }
    if (updateData.bathroom && typeof updateData.bathroom === 'string') {
      updateData.bathroom = parseInt(updateData.bathroom);
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost,
    });
  } catch (error) {
    console.error('Error updating post:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating post',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
