import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { blogPosts } from '../db/schema';
import { eq, desc, ilike, sql } from 'drizzle-orm';
import { validateRequest } from '../middleware/validation';
import { adminAuthMiddleware } from '../middleware/auth';
import { spawn } from 'child_process';
import path from 'path';

export const blogRouter = Router();

const getBlogPostsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(10),
    offset: z.coerce.number().min(0).default(0),
  }),
});

blogRouter.get(
  '/',
  validateRequest(getBlogPostsSchema),
  async (req, res, next) => {
    try {
      const { search, limit, offset } = req.query as any;

      let query = db
        .select()
        .from(blogPosts)
        .where(sql`${blogPosts.publishedAt} IS NOT NULL`)
        .orderBy(desc(blogPosts.publishedAt));

      if (search) {
        query = query.where(ilike(blogPosts.title, `%${search}%`)) as any;
      }

      const posts = await query.limit(limit).offset(offset);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }
);

blogRouter.get('/:slug', async (req, res, next) => {
  try {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, req.params.slug))
      .limit(1);

    if (!post || !post.publishedAt) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

blogRouter.get(
  '/admin/all',
  adminAuthMiddleware,
  async (req, res, next) => {
    try {
      const posts = await db
        .select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.createdAt));
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }
);

// Updated blog post schema with new social media fields
const blogPostSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.string().min(1),
    excerpt: z.string().min(1),
    image: z.string().optional(),
    video: z.string().optional(),
    mediaType: z.enum(['text', 'image', 'video']).default('text'),
    tags: z.array(z.string()).default([]),
    author: z.string().min(1),
    publishedAt: z.string().nullable().optional(),
    postToSocial: z.boolean().default(false), // Whether to cross-post
  }),
});

// Helper function to execute Python social media posting script
interface SocialMediaResult {
  instagram: { success: boolean; post_id: string | null; error: string | null };
  facebook: { success: boolean; post_id: string | null; error: string | null };
  telegram: { success: boolean; message_id: number | null; error: string | null };
}

async function executeSocialMediaPost(postData: any): Promise<SocialMediaResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'social_media_poster.py');

    // Prepare data for Python script
    const postPayload = {
      title: postData.title,
      excerpt: postData.excerpt,
      tags: postData.tags || [],
      image: postData.image,
      video: postData.video,
      mediaType: postData.mediaType || 'text',
      link: `${process.env.SITE_URL || 'https://trosheencrafts.vercel.app'}/blog/${postData.slug}`
    };

    const pythonProcess = spawn('python3', [
      scriptPath,
      JSON.stringify(postPayload)
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code === 0 || output) {
        try {
          const results = JSON.parse(output);
          resolve(results);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${output}`));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

// Create blog post with optional social media posting
blogRouter.post(
  '/',
  adminAuthMiddleware,
  validateRequest(blogPostSchema),
  async (req, res, next) => {
    try {
      const data = req.body;
      const postToSocial = data.postToSocial;
      delete data.postToSocial; // Remove from data to insert

      // Insert blog post
      const [post] = await db.insert(blogPosts).values({
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        postedToSocial: false,
      }).returning();

      // If user wants to post to social media and post is published
      if (postToSocial && post.publishedAt) {
        try {
          // Execute Python script
          const socialResults = await executeSocialMediaPost(post);

          // Extract post IDs
          const socialPostIds: any = {};
          if (socialResults.instagram?.success) {
            socialPostIds.instagram = socialResults.instagram.post_id;
          }
          if (socialResults.facebook?.success) {
            socialPostIds.facebook = socialResults.facebook.post_id;
          }
          if (socialResults.telegram?.success) {
            socialPostIds.telegram = socialResults.telegram.message_id;
          }

          // Update blog post with social media results
          const [updatedPost] = await db
            .update(blogPosts)
            .set({
              postedToSocial: Object.keys(socialPostIds).length > 0,
              socialPostIds: socialPostIds,
              updatedAt: new Date(),
            })
            .where(eq(blogPosts.id, post.id))
            .returning();

          res.status(201).json({
            post: updatedPost,
            socialResults: socialResults
          });
        } catch (error: any) {
          // Return post even if social media posting fails
          console.error('Social media posting error:', error);
          res.status(201).json({
            post: post,
            socialResults: null,
            socialError: error.message
          });
        }
      } else {
        res.status(201).json({ post });
      }
    } catch (error) {
      next(error);
    }
  }
);

// Endpoint to post existing blog to social media
blogRouter.post(
  '/:id/post-to-social',
  adminAuthMiddleware,
  async (req, res, next) => {
    try {
      const postId = parseInt(req.params.id);

      // Get the blog post
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, postId))
        .limit(1);

      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      if (!post.publishedAt) {
        return res.status(400).json({ message: 'Cannot post unpublished blog to social media' });
      }

      // Execute Python script
      const socialResults = await executeSocialMediaPost(post);

      // Extract post IDs
      const socialPostIds: any = {};
      if (socialResults.instagram?.success) {
        socialPostIds.instagram = socialResults.instagram.post_id;
      }
      if (socialResults.facebook?.success) {
        socialPostIds.facebook = socialResults.facebook.post_id;
      }
      if (socialResults.telegram?.success) {
        socialPostIds.telegram = socialResults.telegram.message_id;
      }

      // Update blog post
      const [updatedPost] = await db
        .update(blogPosts)
        .set({
          postedToSocial: Object.keys(socialPostIds).length > 0,
          socialPostIds: socialPostIds,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, postId))
        .returning();

      res.json({
        post: updatedPost,
        socialResults: socialResults
      });
    } catch (error: any) {
      next(error);
    }
  }
);

blogRouter.put(
  '/:id',
  adminAuthMiddleware,
  validateRequest(blogPostSchema),
  async (req, res, next) => {
    try {
      const data = req.body;
      const postToSocial = data.postToSocial;
      delete data.postToSocial; // Remove from data to update

      const [post] = await db
        .update(blogPosts)
        .set({
          ...data,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, parseInt(req.params.id)))
        .returning();

      if (!post) return res.status(404).json({ message: 'Not found' });

      // If user wants to post to social media and post is published
      if (postToSocial && post.publishedAt && !post.postedToSocial) {
        try {
          const socialResults = await executeSocialMediaPost(post);

          const socialPostIds: any = {};
          if (socialResults.instagram?.success) {
            socialPostIds.instagram = socialResults.instagram.post_id;
          }
          if (socialResults.facebook?.success) {
            socialPostIds.facebook = socialResults.facebook.post_id;
          }
          if (socialResults.telegram?.success) {
            socialPostIds.telegram = socialResults.telegram.message_id;
          }

          const [updatedPost] = await db
            .update(blogPosts)
            .set({
              postedToSocial: Object.keys(socialPostIds).length > 0,
              socialPostIds: socialPostIds,
              updatedAt: new Date(),
            })
            .where(eq(blogPosts.id, post.id))
            .returning();

          res.json({
            post: updatedPost,
            socialResults: socialResults
          });
        } catch (error: any) {
          console.error('Social media posting error:', error);
          res.json({
            post: post,
            socialResults: null,
            socialError: error.message
          });
        }
      } else {
        res.json({ post });
      }
    } catch (error) {
      next(error);
    }
  }
);

blogRouter.delete('/:id', adminAuthMiddleware, async (req, res, next) => {
  try {
    await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(req.params.id)));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});