import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { DomainService } from '../../../services/domain.service';
import { authenticate } from '../../../middleware/auth';
import { rateLimiter } from '../../../middleware/rate-limiter';

// Request/Response schemas
const DomainQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  complexity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  includeFocusAreas: z.coerce.boolean().default(false),
  includeOutcomes: z.coerce.boolean().default(false),
  includeInteractions: z.coerce.boolean().default(false),
  includeExamples: z.coerce.boolean().default(false),
});

const DomainParamsSchema = z.object({
  id: z.string().cuid(),
});

const InteractionSchema = z.object({
  fromDomainId: z.string().cuid(),
  toDomainId: z.string().cuid(),
  interactionType: z.enum(['STRONG', 'MODERATE', 'WEAK', 'CONDITIONAL']),
  description: z.string().optional(),
  strength: z.number().min(1).max(10).default(5),
});

const PerformanceIndicatorSchema = z.object({
  outcomeId: z.string().cuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  metric: z.string().min(1),
  targetValue: z.number(),
  unit: z.string().min(1),
});

export async function domainRoutes(fastify: FastifyInstance) {
  const domainService = new DomainService();

  // GET /api/v1/domains - List all performance domains
  fastify.get(
    '/domains',
    {
      preHandler: [rateLimiter({ max: 100, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'List all PMBOK 7th Edition performance domains',
        querystring: DomainQuerySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    code: { type: 'string' },
                    name: { type: 'string' },
                    nameEn: { type: 'string' },
                    description: { type: 'string' },
                    complexity: { type: 'string' },
                    order: { type: 'number' },
                    focusAreas: { type: 'array' },
                    outcomes: { type: 'array' },
                    interactions: { type: 'array' },
                  },
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  total: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = DomainQuerySchema.parse(request.query);
      const result = await domainService.listDomains(query);
      return reply.send(result);
    }
  );

  // GET /api/v1/domains/:id - Get single domain
  fastify.get(
    '/domains/:id',
    {
      preHandler: [rateLimiter({ max: 100, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Get a single performance domain by ID',
        params: DomainParamsSchema,
        querystring: z.object({
          includeAll: z.coerce.boolean().default(false),
        }),
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = DomainParamsSchema.parse(request.params);
      const { includeAll } = z.object({
        includeAll: z.coerce.boolean().default(false),
      }).parse(request.query);
      
      const domain = await domainService.getDomainById(id, includeAll);
      
      if (!domain) {
        return reply.code(404).send({ error: 'Domain not found' });
      }
      
      return reply.send({ data: domain });
    }
  );

  // GET /api/v1/domains/:id/interactions - Get domain interactions
  fastify.get(
    '/domains/:id/interactions',
    {
      preHandler: [rateLimiter({ max: 50, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Get all interactions for a domain',
        params: DomainParamsSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = DomainParamsSchema.parse(request.params);
      const interactions = await domainService.getDomainInteractions(id);
      return reply.send({ data: interactions });
    }
  );

  // POST /api/v1/domains/interactions - Create domain interaction
  fastify.post(
    '/domains/interactions',
    {
      preHandler: [authenticate, rateLimiter({ max: 10, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Create a new domain interaction',
        body: InteractionSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const interaction = InteractionSchema.parse(request.body);
      
      // Check authorization (admin only)
      if ((request as any).user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden' });
      }
      
      const result = await domainService.createInteraction(interaction);
      return reply.code(201).send({ data: result });
    }
  );

  // GET /api/v1/domains/:id/performance-indicators - Get performance indicators
  fastify.get(
    '/domains/:id/performance-indicators',
    {
      preHandler: [authenticate, rateLimiter({ max: 50, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Get performance indicators for a domain',
        params: DomainParamsSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = DomainParamsSchema.parse(request.params);
      const indicators = await domainService.getPerformanceIndicators(id);
      return reply.send({ data: indicators });
    }
  );

  // POST /api/v1/domains/performance-indicators - Create performance indicator
  fastify.post(
    '/domains/performance-indicators',
    {
      preHandler: [authenticate, rateLimiter({ max: 10, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Create a new performance indicator',
        body: PerformanceIndicatorSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const indicator = PerformanceIndicatorSchema.parse(request.body);
      
      // Check authorization (admin or instructor)
      if (!['ADMIN', 'INSTRUCTOR'].includes((request as any).user.role)) {
        return reply.code(403).send({ error: 'Forbidden' });
      }
      
      const result = await domainService.createPerformanceIndicator(indicator);
      return reply.code(201).send({ data: result });
    }
  );

  // GET /api/v1/domains/:id/measurements - Get user measurements
  fastify.get(
    '/domains/:id/measurements',
    {
      preHandler: [authenticate, rateLimiter({ max: 30, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Get performance measurements for current user',
        params: DomainParamsSchema,
        querystring: z.object({
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
        }),
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = DomainParamsSchema.parse(request.params);
      const userId = (request as any).user.id;
      const { startDate, endDate } = request.query as any;
      
      const measurements = await domainService.getUserMeasurements(
        id,
        userId,
        startDate,
        endDate
      );
      
      return reply.send({ data: measurements });
    }
  );

  // GET /api/v1/domains/interaction-map - Get complete interaction map
  fastify.get(
    '/domains/interaction-map',
    {
      preHandler: [rateLimiter({ max: 30, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Get complete domain interaction map',
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const map = await domainService.getInteractionMap();
      return reply.send({ data: map });
    }
  );

  // GET /api/v1/domains/:id/principle-mappings - Get principle mappings
  fastify.get(
    '/domains/:id/principle-mappings',
    {
      preHandler: [rateLimiter({ max: 50, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Get principle mappings for a domain',
        params: DomainParamsSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = DomainParamsSchema.parse(request.params);
      const mappings = await domainService.getPrincipleMappings(id);
      return reply.send({ data: mappings });
    }
  );

  // GET /api/v1/domains/:id/process-mappings - Get process mappings
  fastify.get(
    '/domains/:id/process-mappings',
    {
      preHandler: [rateLimiter({ max: 50, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Get PMBOK 6th edition process mappings for a domain',
        params: DomainParamsSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = DomainParamsSchema.parse(request.params);
      const mappings = await domainService.getProcessMappings(id);
      return reply.send({ data: mappings });
    }
  );

  // GET /api/v1/domains/stats - Get domain statistics
  fastify.get(
    '/domains/stats',
    {
      preHandler: [authenticate, rateLimiter({ max: 30, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Get statistics for performance domains',
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.id;
      const stats = await domainService.getDomainStats(userId);
      return reply.send({ data: stats });
    }
  );

  // POST /api/v1/domains/:id/record-measurement - Record performance measurement
  fastify.post(
    '/domains/:id/record-measurement',
    {
      preHandler: [authenticate, rateLimiter({ max: 20, window: '1m' })],
      schema: {
        tags: ['Performance Domains'],
        summary: 'Record a performance measurement',
        params: DomainParamsSchema,
        body: z.object({
          indicatorId: z.string().cuid(),
          value: z.number(),
          context: z.record(z.any()).optional(),
        }),
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = DomainParamsSchema.parse(request.params);
      const userId = (request as any).user.id;
      const { indicatorId, value, context } = request.body as any;
      
      const measurement = await domainService.recordMeasurement({
        indicatorId,
        userId,
        value,
        context,
      });
      
      return reply.code(201).send({ data: measurement });
    }
  );
}