import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ArticleResponseSchema, ErrorResponseSchema } from '../types';
import { ArticleService } from '../services/article.service';
import { TokenService } from '../services/token.service';
import { RateLimitService } from '../services/rate-limit.service';

export async function articleRoutes(
  fastify: FastifyInstance,
  articleService: ArticleService,
  tokenService: TokenService,
  rateLimitService: RateLimitService
) {
  // GET /api/article/:id - Get article content
  fastify.get('/api/article/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: ArticleResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        429: ErrorResponseSchema,
      },
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      // Apply rate limiting
      const ip = request.ip;
      const rateLimitInfo = await rateLimitService.checkRateLimit(ip);
      
      if (rateLimitInfo.exceeded) {
        reply.status(429).send({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            retryAfter: rateLimitInfo.resetTime,
          },
        });
        return;
      }

      // Add rate limit headers
      reply.header('X-RateLimit-Limit', rateLimitInfo.limit.toString());
      reply.header('X-RateLimit-Remaining', Math.max(0, rateLimitInfo.limit - rateLimitInfo.count).toString());
      reply.header('X-RateLimit-Reset', new Date(Date.now() + rateLimitInfo.resetTime * 1000).toISOString());
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const authHeader = request.headers.authorization;
      
      let userId: string | undefined;

      // Extract user ID from token if provided
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const validation = await tokenService.validateToken(token);
        if (validation) {
          userId = validation.userId;
        }
      }

      const article = await articleService.getArticle(id, userId);

      if (!article) {
        reply.status(404).send({
          error: 'Article not found',
          code: 'ARTICLE_NOT_FOUND',
        });
        return;
      }

      reply.send(article);
    } catch (error) {
      fastify.log.error('Article fetch error:', error);
      reply.status(500).send({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  // POST /api/article - Create article
  fastify.post('/api/article', {
    schema: {
      body: ArticleResponseSchema,
      response: {
        201: ArticleResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
      },
    },
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      // Apply rate limiting
      const ip = request.ip;
      const rateLimitInfo = await rateLimitService.checkRateLimit(ip);
      
      if (rateLimitInfo.exceeded) {
        reply.status(429).send({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return;
      }
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const articleData = request.body;
      const article = await articleService.createArticle(articleData);

      reply.status(201).send(article);
    } catch (error) {
      fastify.log.error('Article creation error:', error);
      reply.status(500).send({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  // PUT /api/article/:id - Update article
  fastify.put('/api/article/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: ArticleResponseSchema,
      response: {
        200: ArticleResponseSchema,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const articleData = request.body;
      
      const article = await articleService.updateArticle(id, articleData);

      if (!article) {
        reply.status(404).send({
          error: 'Article not found',
          code: 'ARTICLE_NOT_FOUND',
        });
        return;
      }

      reply.send(article);
    } catch (error) {
      fastify.log.error('Article update error:', error);
      reply.status(500).send({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  // DELETE /api/article/:id - Delete article
  fastify.delete('/api/article/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          },
        },
        404: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const success = await articleService.deleteArticle(id);

      if (!success) {
        reply.status(404).send({
          error: 'Article not found',
          code: 'ARTICLE_NOT_FOUND',
        });
        return;
      }

      reply.send({ success: true });
    } catch (error) {
      fastify.log.error('Article deletion error:', error);
      reply.status(500).send({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });
}
