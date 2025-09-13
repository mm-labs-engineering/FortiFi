import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TokenRequestSchema, ErrorResponseSchema } from '../types';
import { TokenService } from '../services/token.service';
import { RateLimitService } from '../services/rate-limit.service';

export async function tokenRoutes(
  fastify: FastifyInstance,
  tokenService: TokenService,
  rateLimitService: RateLimitService
) {
  // POST /api/token - Generate token
  fastify.post('/api/token', {
    schema: {
      body: TokenRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            expiresAt: { type: 'number' },
            userId: { type: 'string' },
            articleId: { type: 'string' },
          },
        },
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
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
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { articleId, userId } = request.body;

      if (!userId) {
        reply.status(400).send({
          error: 'User ID is required',
          code: 'MISSING_USER_ID',
        });
        return;
      }

      const token = await tokenService.generateToken(userId, articleId);
      const expiresAt = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now

      reply.send({
        token,
        expiresAt,
        userId,
        articleId,
      });
    } catch (error) {
      fastify.log.error('Token generation error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Article not found') {
          reply.status(404).send({
            error: 'Article not found',
            code: 'ARTICLE_NOT_FOUND',
          });
          return;
        }
        
        if (error.message === 'User does not have access to this article') {
          reply.status(403).send({
            error: 'Access denied',
            code: 'ACCESS_DENIED',
          });
          return;
        }
      }

      reply.status(500).send({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  // POST /api/token/validate - Validate token
  fastify.post('/api/token/validate', {
    schema: {
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            userId: { type: 'string' },
            articleId: { type: 'string' },
          },
        },
        400: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest<{ Body: { token: string } }>, reply: FastifyReply) => {
    try {
      const { token } = request.body;

      const validation = await tokenService.validateToken(token);
      
      if (!validation) {
        reply.send({
          valid: false,
          userId: null,
          articleId: null,
        });
        return;
      }

      reply.send({
        valid: true,
        userId: validation.userId,
        articleId: validation.articleId,
      });
    } catch (error) {
      fastify.log.error('Token validation error:', error);
      reply.status(500).send({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  // DELETE /api/token - Revoke token
  fastify.delete('/api/token', {
    schema: {
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          },
        },
        400: ErrorResponseSchema,
      },
    },
  }, async (request: FastifyRequest<{ Body: { token: string } }>, reply: FastifyReply) => {
    try {
      const { token } = request.body;

      const success = await tokenService.revokeToken(token);
      
      reply.send({ success });
    } catch (error) {
      fastify.log.error('Token revocation error:', error);
      reply.status(500).send({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });
}
