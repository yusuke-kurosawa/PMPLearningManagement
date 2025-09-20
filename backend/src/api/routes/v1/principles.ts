import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrincipleService } from '../../../services/principle.service';
import { authenticate } from '../../../middleware/auth';
import { rateLimiter } from '../../../middleware/rate-limiter';

// Request/Response schemas
const PrincipleQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  complexity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  includeActions: z.coerce.boolean().default(false),
  includeExamples: z.coerce.boolean().default(false),
  includeMappings: z.coerce.boolean().default(false),
});

const PrincipleParamsSchema = z.object({
  id: z.string().cuid(),
});

const UpdatePrincipleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  details: z.string().optional(),
  complexity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  iconUrl: z.string().url().optional(),
});

const KeyActionSchema = z.object({
  action: z.string().min(1),
  actionEn: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().min(0),
});

const BulkUpdateSchema = z.object({
  principles: z.array(z.object({
    id: z.string().cuid(),
    updates: UpdatePrincipleSchema,
  })),
});

export async function principleRoutes(fastify: FastifyInstance) {
  const principleService = new PrincipleService();

  // GET /api/v1/principles - List all principles with filtering
  fastify.get(
    '/principles',
    {
      preHandler: [rateLimiter({ max: 100, window: '1m' })],
      schema: {
        tags: ['Principles'],
        summary: 'List all PMBOK 7th Edition principles',
        description: 'Retrieve a paginated list of principles with optional filtering and related data inclusion',
        querystring: PrincipleQuerySchema,
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
                    keyActions: { type: 'array' },
                    examples: { type: 'array' },
                    domainMappings: { type: 'array' },
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
      const query = PrincipleQuerySchema.parse(request.query);
      const result = await principleService.listPrinciples(query);
      return reply.send(result);
    }
  );

  // GET /api/v1/principles/:id - Get single principle by ID
  fastify.get(
    '/principles/:id',
    {
      preHandler: [rateLimiter({ max: 100, window: '1m' })],
      schema: {
        tags: ['Principles'],
        summary: 'Get a single principle by ID',
        params: PrincipleParamsSchema,
        querystring: z.object({
          includeAll: z.coerce.boolean().default(false),
        }),
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = PrincipleParamsSchema.parse(request.params);
      const { includeAll } = z.object({
        includeAll: z.coerce.boolean().default(false),
      }).parse(request.query);
      
      const principle = await principleService.getPrincipleById(id, includeAll);
      
      if (!principle) {
        return reply.code(404).send({ error: 'Principle not found' });
      }
      
      return reply.send({ data: principle });
    }
  );

  // GET /api/v1/principles/:id/relationships - Get principle relationships
  fastify.get(
    '/principles/:id/relationships',
    {
      preHandler: [rateLimiter({ max: 50, window: '1m' })],
      schema: {
        tags: ['Principles'],
        summary: 'Get all relationships for a principle',
        params: PrincipleParamsSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = PrincipleParamsSchema.parse(request.params);
      const relationships = await principleService.getPrincipleRelationships(id);
      return reply.send({ data: relationships });
    }
  );

  // GET /api/v1/principles/:id/learning-resources - Get learning resources
  fastify.get(
    '/principles/:id/learning-resources',
    {
      preHandler: [authenticate, rateLimiter({ max: 50, window: '1m' })],
      schema: {
        tags: ['Principles'],
        summary: 'Get learning resources for a principle',
        params: PrincipleParamsSchema,
        querystring: z.object({
          type: z.enum(['VIDEO', 'ARTICLE', 'EBOOK', 'PODCAST', 'INFOGRAPHIC', 'TEMPLATE', 'CASE_STUDY', 'SIMULATION']).optional(),
          difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
        }),
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = PrincipleParamsSchema.parse(request.params);
      const filters = request.query as any;
      const resources = await principleService.getLearningResources(id, filters);
      return reply.send({ data: resources });
    }
  );

  // POST /api/v1/principles/:id/key-actions - Add key actions
  fastify.post(
    '/principles/:id/key-actions',
    {
      preHandler: [authenticate, rateLimiter({ max: 10, window: '1m' })],
      schema: {
        tags: ['Principles'],
        summary: 'Add key actions to a principle',
        params: PrincipleParamsSchema,
        body: z.object({
          actions: z.array(KeyActionSchema),
        }),
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = PrincipleParamsSchema.parse(request.params);
      const { actions } = request.body as any;
      
      // Check authorization (admin only)
      if ((request as any).user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden' });
      }
      
      const result = await principleService.addKeyActions(id, actions);
      return reply.code(201).send({ data: result });
    }
  );

  // PUT /api/v1/principles/:id - Update principle
  fastify.put(
    '/principles/:id',
    {
      preHandler: [authenticate, rateLimiter({ max: 10, window: '1m' })],
      schema: {
        tags: ['Principles'],
        summary: 'Update a principle',
        params: PrincipleParamsSchema,
        body: UpdatePrincipleSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = PrincipleParamsSchema.parse(request.params);
      const updates = UpdatePrincipleSchema.parse(request.body);
      
      // Check authorization (admin only)
      if ((request as any).user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden' });
      }
      
      const result = await principleService.updatePrinciple(id, updates);
      return reply.send({ data: result });
    }
  );

  // POST /api/v1/principles/bulk-update - Bulk update principles
  fastify.post(
    '/principles/bulk-update',
    {
      preHandler: [authenticate, rateLimiter({ max: 5, window: '1m' })],
      schema: {
        tags: ['Principles'],
        summary: 'Bulk update multiple principles',
        body: BulkUpdateSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { principles } = BulkUpdateSchema.parse(request.body);
      
      // Check authorization (admin only)
      if ((request as any).user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden' });
      }
      
      const results = await principleService.bulkUpdatePrinciples(principles);
      return reply.send({ data: results });
    }
  );

  // GET /api/v1/principles/search - Advanced search
  fastify.get(
    '/principles/search',
    {
      preHandler: [rateLimiter({ max: 50, window: '1m' })],
      schema: {
        tags: ['Principles'],
        summary: 'Advanced search across principles',
        querystring: z.object({
          q: z.string().min(2),
          fields: z.array(z.string()).optional(),
          fuzzy: z.coerce.boolean().default(false),
          limit: z.coerce.number().min(1).max(50).default(10),
        }),
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as any;
      const results = await principleService.searchPrinciples(query);
      return reply.send({ data: results });
    }
  );

  // GET /api/v1/principles/compare - Compare multiple principles
  fastify.get(
    '/principles/compare',
    {
      preHandler: [rateLimiter({ max: 30, window: '1m' })],
      schema: {
        tags: ['Principles'],
        summary: 'Compare multiple principles side by side',
        querystring: z.object({
          ids: z.string().transform(val => val.split(',')),
        }),
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { ids } = request.query as any;
      
      if (ids.length > 5) {
        return reply.code(400).send({ error: 'Maximum 5 principles can be compared at once' });
      }
      
      const comparison = await principleService.comparePrinciples(ids);
      return reply.send({ data: comparison });
    }
  );

  // GET /api/v1/principles/stats - Get principles statistics
  fastify.get(
    '/principles/stats',
    {
      preHandler: [authenticate, rateLimiter({ max: 30, window: '1m' })],
      schema: {
        tags: ['Principles'],
        summary: 'Get statistics for principles',
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.id;
      const stats = await principleService.getPrincipleStats(userId);
      return reply.send({ data: stats });
    }
  );
}