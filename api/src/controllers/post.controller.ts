import { Request, Response } from 'express';
import prisma from '../lib/client';

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: (query.city as string) || undefined,
        type: (query.type as any) || undefined,
        property: (query.property as any) || undefined,
        bedroom: query.bedroom ? parseInt(query.bedroom as string) : undefined,
        price: {
          gte: query.minPrice ? parseInt(query.minPrice as string) : undefined,
          lte: query.maxPrice ? parseInt(query.maxPrice as string) : undefined,
        },
      },
      include: {
        PostDetail: true,
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
        createdAt: 'desc',
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
  const postId = req.params.id;

  if (!postId || typeof postId !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Invalid post ID provided',
    });
    return;
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        PostDetail: true,
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

interface PostData {
  title: string;
  price: number;
  images: string[];
  address: string;
  city: string;
  bedroom: number;
  bathroom: number;
  latitude: string;
  longitude: string;
  type: 'buy' | 'rent';
  property: 'apartment' | 'house' | 'condo' | 'land';
}

interface PostDetailData {
  description: string;
  utilities?: string;
  pet?: string;
  income?: string;
  size?: number;
  school?: number;
  bus?: number;
  restaurant?: number;
}

interface CreatePostBody {
  postData: PostData;
  postDetail: PostDetailData;
}

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

    const { postData, postDetail } = req.body as CreatePostBody;

    // Validate that both postData and postDetail are provided
    if (!postData || !postDetail) {
      res.status(400).json({
        success: false,
        message: 'Missing postData or postDetail',
      });
      return;
    }

    // Validate required fields in postData
    if (
      !postData.title ||
      !postData.price ||
      !postData.images ||
      !Array.isArray(postData.images) ||
      postData.images.length === 0 ||
      !postData.address ||
      !postData.city ||
      !postData.latitude ||
      !postData.longitude ||
      !postData.type ||
      !postData.property
    ) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields in postData',
      });
      return;
    }

    // Validate required fields in postDetail
    if (!postDetail.description) {
      res.status(400).json({
        success: false,
        message: 'Description is required in postDetail',
      });
      return;
    }

    const newPost = await prisma.post.create({
      data: {
        ...postData,
        price:
          typeof postData.price === 'string'
            ? parseFloat(postData.price)
            : postData.price,
        bedroom:
          typeof postData.bedroom === 'string'
            ? parseInt(postData.bedroom)
            : postData.bedroom,
        bathroom:
          typeof postData.bathroom === 'string'
            ? parseInt(postData.bathroom)
            : postData.bathroom,
        userId: tokenUserId,
        PostDetail: {
          create: {
            ...postDetail,
            size: postDetail.size
              ? typeof postDetail.size === 'string'
                ? parseInt(postDetail.size)
                : postDetail.size
              : null,
            school: postDetail.school
              ? typeof postDetail.school === 'string'
                ? parseInt(postDetail.school)
                : postDetail.school
              : null,
            bus: postDetail.bus
              ? typeof postDetail.bus === 'string'
                ? parseInt(postDetail.bus)
                : postDetail.bus
              : null,
            restaurant: postDetail.restaurant
              ? typeof postDetail.restaurant === 'string'
                ? parseInt(postDetail.restaurant)
                : postDetail.restaurant
              : null,
          },
        },
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
        PostDetail: true,
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
      where: { id: postId },
    });

    if (!postToDelete) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    const tokenUserId = req.userId;
    const isAdmin = req.isAdmin;

    if (postToDelete.userId !== tokenUserId && !isAdmin) {
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

interface UpdatePostBody {
  postData?: Partial<PostData>;
  postDetail?: Partial<PostDetailData>;
}

export const updatePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.id;
    const { postData, postDetail } = req.body as UpdatePostBody;

    if (!postId || typeof postId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid postId provided',
      });
      return;
    }

    if (
      (!postData || Object.keys(postData).length === 0) &&
      (!postDetail || Object.keys(postDetail).length === 0)
    ) {
      res.status(400).json({
        success: false,
        message: 'No updated data provided',
      });
      return;
    }

    const postToUpdate = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        PostDetail: true,
      },
    });

    if (!postToUpdate) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    const tokenUserId = req.userId;
    const isAdmin = req.isAdmin;

    if (postToUpdate.userId !== tokenUserId && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update post',
      });
      return;
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Handle postData updates
    if (postData && Object.keys(postData).length > 0) {
      const processedPostData = { ...postData };

      if (
        processedPostData.price &&
        typeof processedPostData.price === 'string'
      ) {
        processedPostData.price = parseFloat(processedPostData.price);
      }
      if (
        processedPostData.bedroom &&
        typeof processedPostData.bedroom === 'string'
      ) {
        processedPostData.bedroom = parseInt(processedPostData.bedroom);
      }
      if (
        processedPostData.bathroom &&
        typeof processedPostData.bathroom === 'string'
      ) {
        processedPostData.bathroom = parseInt(processedPostData.bathroom);
      }

      Object.assign(updateData, processedPostData);
    }

    // Handle postDetail updates
    if (postDetail && Object.keys(postDetail).length > 0) {
      const processedPostDetail = { ...postDetail };

      if (
        processedPostDetail.size &&
        typeof processedPostDetail.size === 'string'
      ) {
        processedPostDetail.size = parseInt(processedPostDetail.size);
      }
      if (
        processedPostDetail.school &&
        typeof processedPostDetail.school === 'string'
      ) {
        processedPostDetail.school = parseInt(processedPostDetail.school);
      }
      if (
        processedPostDetail.bus &&
        typeof processedPostDetail.bus === 'string'
      ) {
        processedPostDetail.bus = parseInt(processedPostDetail.bus);
      }
      if (
        processedPostDetail.restaurant &&
        typeof processedPostDetail.restaurant === 'string'
      ) {
        processedPostDetail.restaurant = parseInt(
          processedPostDetail.restaurant
        );
      }

      if (postToUpdate.PostDetail) {
        // Update existing PostDetail
        updateData.PostDetail = {
          update: processedPostDetail,
        };
      } else {
        // Create new PostDetail if it doesn't exist
        updateData.PostDetail = {
          create: {
            description: processedPostDetail.description || '',
            ...processedPostDetail,
          },
        };
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
        PostDetail: true,
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
