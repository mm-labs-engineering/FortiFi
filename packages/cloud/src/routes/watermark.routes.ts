import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WatermarkService } from '../services/watermark.service';

export async function watermarkRoutes(
  fastify: FastifyInstance,
  watermarkService: WatermarkService
) {
  // POST /api/watermark - Create watermark job
  fastify.post('/api/watermark', {
    schema: {
      body: {
        type: 'object',
        properties: {
          articleId: { type: 'string' },
          userId: { type: 'string' },
          assetUrl: { type: 'string', format: 'uri' },
        },
        required: ['articleId', 'userId', 'assetUrl'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            status: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { articleId, userId, assetUrl } = request.body;

      const jobId = await watermarkService.createWatermarkJob(articleId, userId, assetUrl);

      reply.send({
        jobId,
        status: 'PENDING',
      });
    } catch (error) {
      fastify.log.error('Watermark job creation error:', error);
      reply.status(500).send({
        error: 'Failed to create watermark job',
        code: 'WATERMARK_JOB_CREATION_FAILED',
      });
    }
  });

  // GET /api/watermark/:jobId - Get watermark job status
  fastify.get('/api/watermark/:jobId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
        },
        required: ['jobId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            articleId: { type: 'string' },
            userId: { type: 'string' },
            assetUrl: { type: 'string' },
            watermarkText: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] },
            resultUrl: { type: 'string' },
            error: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
    try {
      const { jobId } = request.params;

      const job = await watermarkService.getWatermarkJob(jobId);

      if (!job) {
        reply.status(404).send({
          error: 'Watermark job not found',
          code: 'WATERMARK_JOB_NOT_FOUND',
        });
        return;
      }

      reply.send(job);
    } catch (error) {
      fastify.log.error('Watermark job retrieval error:', error);
      reply.status(500).send({
        error: 'Failed to retrieve watermark job',
        code: 'WATERMARK_JOB_RETRIEVAL_FAILED',
      });
    }
  });
}
