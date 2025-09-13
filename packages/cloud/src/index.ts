import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { tokenRoutes } from './routes/token.routes';
import { articleRoutes } from './routes/article.routes';
import { watermarkRoutes } from './routes/watermark.routes';
import { ArticleServiceImpl } from './services/article.service';
import { TokenServiceImpl } from './services/token.service';
import { RateLimitServiceImpl } from './services/rate-limit.service';
import { WatermarkServiceImpl } from './services/watermark.service';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Initialize services
const articleService = new ArticleServiceImpl(prisma);
const tokenService = new TokenServiceImpl(prisma);
const rateLimitService = new RateLimitServiceImpl(prisma);
const watermarkService = new WatermarkServiceImpl(prisma);

// Create Fastify instance
const fastify = Fastify({
  logger:
    process.env['NODE_ENV'] === 'development'
      ? {
          level: process.env['LOG_LEVEL'] || 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          },
        }
      : {
          level: process.env['LOG_LEVEL'] || 'info',
        },
});

async function build() {
  // Register plugins
  await fastify.register(cors, {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Disable CSP for API
  });

  await fastify.register(rateLimit, {
    max: config.rateLimit.maxRequests,
    timeWindow: config.rateLimit.windowMs,
    errorResponseBuilder: (request, context) => ({
      error: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(context.ttl / 1000),
    }),
  });

  // Swagger documentation
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'FortiFi API',
        description: 'API for FortiFi paywall hardening service',
        version: '1.0.0',
      },
      host: `${config.host}:${config.port}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Bearer token for authentication',
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: header => header,
    transformSpecification: (swaggerObject, _request, _reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  // Health check endpoint
  fastify.get('/health', async (_request, _reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Register services with fastify instance
  fastify.decorate('articleService', articleService);
  fastify.decorate('tokenService', tokenService);
  fastify.decorate('rateLimitService', rateLimitService);
  fastify.decorate('watermarkService', watermarkService);

  // Register routes
  await fastify.register(tokenRoutes, { prefix: '' });
  await fastify.register(articleRoutes, { prefix: '' });
  await fastify.register(watermarkRoutes, { prefix: '' });

  // Error handler
  fastify.setErrorHandler((error: Error, request, reply) => {
    fastify.log.error(error);

    reply.status(500).send({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    fastify.log.info(`Received ${signal}, shutting down gracefully...`);

    try {
      await fastify.close();
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      fastify.log.error({ error }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return fastify;
}

// Start server
async function start() {
  try {
    const app = await build();

    await app.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`🚀 FortiFi API server running on http://${config.host}:${config.port}`);
    console.log(`📚 API documentation available at http://${config.host}:${config.port}/docs`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start if this file is run directly
if (require.main === module) {
  start();
}

export { build, start };
