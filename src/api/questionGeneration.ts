/**
 * Question Generation API Endpoints
 * RESTful API for AI-powered question generation and management
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../lib/api/trpc'
import { QuestionGenerationAgent, type ModelConfig } from '../services/ai/questionGenerationAgent'
import DifficultyAdjustmentEngine from '../services/ai/difficultyAdjustmentEngine'
import QuestionQualityAssessment from '../services/ai/questionQualityAssessment'
import QuestionDatabaseManager from '../services/ai/questionDatabase'
import { rateLimiter } from '../lib/api/rateLimiter'
import { cacheManager } from '../lib/cache/cacheManager'
import { logger } from '../services/logger'

// Input validation schemas
const generateQuestionSchema = z.object({
  domain: z.enum(['people', 'process', 'business_environment']),
  knowledgeArea: z.string(),
  process: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  type: z.enum(['single', 'multiple', 'scenario', 'calculation', 'drag_drop']).optional(),
  bloomsLevel: z
    .enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'])
    .optional(),
  context: z.string().optional(),
  count: z.number().min(1).max(50).default(1),
  modelConfig: z
    .object({
      provider: z.enum(['openai', 'anthropic', 'ollama']).default('openai'),
      modelName: z.string().optional(),
      temperature: z.number().min(0).max(1).optional(),
    })
    .optional(),
})

const assessQuestionSchema = z.object({
  questionId: z.string().optional(),
  question: z
    .object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.union([z.string(), z.array(z.string())]),
      explanation: z.string(),
      domain: z.string(),
      knowledgeArea: z.string(),
      difficulty: z.string(),
      type: z.string(),
      bloomsLevel: z.string().optional(),
    })
    .optional(),
})

const adaptiveQuestionSchema = z.object({
  studentId: z.string(),
  domain: z.string().optional(),
  knowledgeArea: z.string().optional(),
  targetDifficulty: z.number().min(-3).max(3).optional(),
  excludeQuestionIds: z.array(z.string()).optional(),
})

const updatePerformanceSchema = z.object({
  questionId: z.string(),
  studentId: z.string(),
  isCorrect: z.boolean(),
  timeSpent: z.number(),
  attemptNumber: z.number().default(1),
})

const searchQuestionsSchema = z.object({
  query: z.string().optional(),
  domain: z.array(z.string()).optional(),
  knowledgeArea: z.array(z.string()).optional(),
  difficulty: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  bloomsLevel: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  minQualityScore: z.number().min(0).max(1).optional(),
  isVerified: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z
    .enum(['relevance', 'difficulty', 'quality', 'performance', 'created', 'updated'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Initialize services
let questionAgent: QuestionGenerationAgent | null = null
let difficultyEngine: DifficultyAdjustmentEngine | null = null
let qualityAssessment: QuestionQualityAssessment | null = null
let databaseManager: QuestionDatabaseManager | null = null

/**
 * Initialize AI services
 */
export async function initializeAIServices(config: {
  modelConfig: ModelConfig
  vectorStoreConfig: any
  dbClient: any
}) {
  try {
    // Initialize question generation agent
    questionAgent = new QuestionGenerationAgent(config.modelConfig)

    // Initialize difficulty adjustment engine
    difficultyEngine = new DifficultyAdjustmentEngine({
      minQuestions: 10,
      maxQuestions: 180,
      stoppingCriterion: 'precision',
      targetPrecision: 0.3,
    })

    // Initialize quality assessment
    qualityAssessment = new QuestionQualityAssessment()

    // Initialize database manager
    databaseManager = new QuestionDatabaseManager(config.vectorStoreConfig, config.dbClient)
    await databaseManager.initialize()

    // Load existing questions into vector store
    const existingQuestions = await databaseManager.exportQuestions({ limit: 1000 })
    await questionAgent.initializeVectorStore(existingQuestions)

    logger.info('AI services initialized successfully')
  } catch (error) {
    logger.error('Failed to initialize AI services:', error)
    throw error
  }
}

/**
 * tRPC Router for Question Generation
 */
export const questionGenerationRouter = createTRPCRouter({
  /**
   * Generate new questions
   */
  generate: protectedProcedure.input(generateQuestionSchema).mutation(async ({ input, ctx }) => {
    if (!questionAgent) {
      throw new Error('Question generation service not initialized')
    }

    const cacheKey = `question:generate:${JSON.stringify(input)}`
    const cached = await cacheManager.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const questions = []

      if (input.count === 1) {
        // Generate single question
        const question = await questionAgent.generateQuestion({
          domain: input.domain,
          knowledgeArea: input.knowledgeArea,
          process: input.process,
          difficulty: input.difficulty,
          type: input.type,
          bloomsLevel: input.bloomsLevel,
          context: input.context,
        })

        // Assess quality
        const qualityReport = await qualityAssessment!.assessQuestion(question)

        // Save to database
        const questionId = await databaseManager!.saveQuestion(
          question,
          ctx.user.id,
          qualityReport.overallScore
        )

        questions.push({
          ...question,
          id: questionId,
          qualityScore: qualityReport.overallScore,
        })
      } else {
        // Generate multiple questions
        const generatedQuestions = await questionAgent.generateQuestionSet({
          count: input.count,
          domainDistribution: { [input.domain]: 1 },
          difficultyDistribution: { [input.difficulty]: 1 },
        })

        for (const question of generatedQuestions) {
          const qualityReport = await qualityAssessment!.assessQuestion(question)
          const questionId = await databaseManager!.saveQuestion(
            question,
            ctx.user.id,
            qualityReport.overallScore
          )

          questions.push({
            ...question,
            id: questionId,
            qualityScore: qualityReport.overallScore,
          })
        }
      }

      // Cache result
      await cacheManager.set(cacheKey, questions, 3600) // 1 hour

      return {
        success: true,
        questions,
        count: questions.length,
      }
    } catch (error) {
      logger.error('Question generation failed:', error)
      throw new Error('Failed to generate questions')
    }
  }),

  /**
   * Get adaptive question based on student performance
   */
  getAdaptiveQuestion: protectedProcedure
    .input(adaptiveQuestionSchema)
    .query(async ({ input, ctx }) => {
      if (!difficultyEngine || !databaseManager) {
        throw new Error('Adaptive testing service not initialized')
      }

      try {
        // Get available questions
        const availableQuestions = await databaseManager.searchQuestions({
          domain: input.domain ? [input.domain] : undefined,
          knowledgeArea: input.knowledgeArea ? [input.knowledgeArea] : undefined,
          isVerified: true,
          limit: 100,
        })

        // Filter out excluded questions
        const questionIds = availableQuestions
          .filter((q) => !input.excludeQuestionIds?.includes(q.id))
          .map((q) => q.id)

        // Select next question using adaptive algorithm
        const nextQuestionId = difficultyEngine.selectNextQuestion(input.studentId, questionIds, {
          domain: input.domain,
          knowledgeArea: input.knowledgeArea,
          excludeIds: input.excludeQuestionIds,
        })

        if (!nextQuestionId) {
          throw new Error('No suitable question found')
        }

        // Get full question details
        const question = availableQuestions.find((q) => q.id === nextQuestionId)

        // Predict success probability
        const successProbability = difficultyEngine.predictSuccessProbability(
          input.studentId,
          nextQuestionId
        )

        return {
          question,
          successProbability,
          recommendedTime: question?.estimated_time || 90,
        }
      } catch (error) {
        logger.error('Adaptive question selection failed:', error)
        throw error
      }
    }),

  /**
   * Assess question quality
   */
  assessQuality: protectedProcedure.input(assessQuestionSchema).mutation(async ({ input, ctx }) => {
    if (!qualityAssessment || !databaseManager) {
      throw new Error('Quality assessment service not initialized')
    }

    try {
      let question = input.question

      // If questionId provided, fetch from database
      if (input.questionId) {
        const dbQuestions = await databaseManager.searchQuestions({
          query: input.questionId,
          limit: 1,
        })

        if (dbQuestions.length === 0) {
          throw new Error('Question not found')
        }

        const dbQuestion = dbQuestions[0]
        question = {
          question: dbQuestion.question_text,
          options: dbQuestion.options,
          correctAnswer: dbQuestion.correct_answer,
          explanation: dbQuestion.explanation,
          domain: dbQuestion.domain,
          knowledgeArea: dbQuestion.knowledge_area,
          difficulty: dbQuestion.difficulty,
          type: dbQuestion.type,
          bloomsLevel: dbQuestion.blooms_level,
        }
      }

      if (!question) {
        throw new Error('Question data required')
      }

      // Perform quality assessment
      const qualityReport = await qualityAssessment.assessQuestion(question as any)

      // Update database if questionId provided
      if (input.questionId) {
        await databaseManager.updateQualityScores(input.questionId, {
          overall: qualityReport.overallScore,
          clarity: qualityReport.dimensions.clarity.score,
          relevance: qualityReport.dimensions.relevance.score,
          fairness: qualityReport.dimensions.fairness.score,
        })
      }

      return {
        success: true,
        report: qualityReport,
      }
    } catch (error) {
      logger.error('Quality assessment failed:', error)
      throw error
    }
  }),

  /**
   * Update question performance
   */
  updatePerformance: protectedProcedure
    .input(updatePerformanceSchema)
    .mutation(async ({ input, ctx }) => {
      if (!difficultyEngine || !databaseManager) {
        throw new Error('Performance tracking service not initialized')
      }

      try {
        // Update student ability
        const studentPerformance = difficultyEngine.updateStudentAbility(
          input.studentId,
          input.questionId,
          input.isCorrect,
          input.timeSpent
        )

        // Update question performance metrics
        await databaseManager.updatePerformance({
          questionId: input.questionId,
          isCorrect: input.isCorrect,
          timeSpent: input.timeSpent,
          studentAbility: studentPerformance.abilityEstimate,
          attemptNumber: input.attemptNumber,
        })

        // Get question effectiveness analysis
        const effectiveness = difficultyEngine.analyzeQuestionEffectiveness(input.questionId)

        return {
          success: true,
          studentPerformance,
          questionEffectiveness: effectiveness,
        }
      } catch (error) {
        logger.error('Performance update failed:', error)
        throw error
      }
    }),

  /**
   * Search questions
   */
  search: publicProcedure.input(searchQuestionsSchema).query(async ({ input }) => {
    if (!databaseManager) {
      throw new Error('Database service not initialized')
    }

    const cacheKey = `question:search:${JSON.stringify(input)}`
    const cached = await cacheManager.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const questions = await databaseManager.searchQuestions(input)

      const result = {
        questions,
        total: questions.length,
        hasMore: questions.length === input.limit,
      }

      // Cache for 5 minutes
      await cacheManager.set(cacheKey, result, 300)

      return result
    } catch (error) {
      logger.error('Question search failed:', error)
      throw error
    }
  }),

  /**
   * Get similar questions
   */
  findSimilar: protectedProcedure
    .input(
      z.object({
        questionText: z.string(),
        threshold: z.number().min(0).max(1).default(0.85),
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ input }) => {
      if (!databaseManager) {
        throw new Error('Database service not initialized')
      }

      try {
        const similarQuestions = await databaseManager.findSimilarQuestions(
          input.questionText,
          input.threshold,
          input.limit
        )

        return {
          questions: similarQuestions,
          count: similarQuestions.length,
        }
      } catch (error) {
        logger.error('Similar question search failed:', error)
        throw error
      }
    }),

  /**
   * Get question statistics
   */
  getStatistics: publicProcedure
    .input(
      z.object({
        questionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      if (!databaseManager) {
        throw new Error('Database service not initialized')
      }

      try {
        const statistics = await databaseManager.getQuestionStatistics(input.questionId)
        return statistics
      } catch (error) {
        logger.error('Failed to get question statistics:', error)
        throw error
      }
    }),

  /**
   * Calibrate question difficulty
   */
  calibrateDifficulty: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        responses: z.array(
          z.object({
            studentAbility: z.number(),
            isCorrect: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!difficultyEngine || !databaseManager) {
        throw new Error('Calibration service not initialized')
      }

      try {
        // Calibrate IRT parameters
        const irtParams = difficultyEngine.calibrateQuestionDifficulty(
          input.questionId,
          input.responses
        )

        // Update database
        await databaseManager.updateIRTParameters(input.questionId, irtParams)

        return {
          success: true,
          parameters: irtParams,
        }
      } catch (error) {
        logger.error('Difficulty calibration failed:', error)
        throw error
      }
    }),

  /**
   * Predict time to mastery
   */
  predictMastery: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        targetAbility: z.number().min(-3).max(3),
        averageQuestionsPerSession: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      if (!difficultyEngine) {
        throw new Error('Prediction service not initialized')
      }

      try {
        const prediction = difficultyEngine.predictTimeToMastery(
          input.studentId,
          input.targetAbility,
          input.averageQuestionsPerSession
        )

        return prediction
      } catch (error) {
        logger.error('Mastery prediction failed:', error)
        throw error
      }
    }),

  /**
   * Bulk import questions
   */
  bulkImport: protectedProcedure
    .input(
      z.object({
        questions: z.array(z.any()), // Should match GeneratedQuestion schema
        assessQuality: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!databaseManager || !qualityAssessment) {
        throw new Error('Import service not initialized')
      }

      try {
        const processedQuestions = []

        for (const question of input.questions) {
          // Optionally assess quality
          if (input.assessQuality) {
            const qualityReport = await qualityAssessment.assessQuestion(question)
            question.qualityScore = qualityReport.overallScore
          }

          processedQuestions.push(question)
        }

        const importCount = await databaseManager.bulkImport(processedQuestions, ctx.user.id)

        return {
          success: true,
          imported: importCount,
          total: input.questions.length,
        }
      } catch (error) {
        logger.error('Bulk import failed:', error)
        throw error
      }
    }),

  /**
   * Export questions
   */
  export: protectedProcedure.input(searchQuestionsSchema).query(async ({ input }) => {
    if (!databaseManager) {
      throw new Error('Export service not initialized')
    }

    try {
      const questions = await databaseManager.exportQuestions(input)

      return {
        questions,
        count: questions.length,
        format: 'json',
      }
    } catch (error) {
      logger.error('Question export failed:', error)
      throw error
    }
  }),
})

/**
 * Express REST API endpoints (alternative to tRPC)
 */
export function createQuestionGenerationAPI(): Router {
  const router = Router()

  // Apply rate limiting
  router.use(rateLimiter)

  /**
   * POST /api/questions/generate
   * Generate new questions
   */
  router.post('/generate', async (req: Request, res: Response) => {
    try {
      const input = generateQuestionSchema.parse(req.body)

      if (!questionAgent) {
        return res.status(503).json({ error: 'Service unavailable' })
      }

      const question = await questionAgent.generateQuestion({
        domain: input.domain,
        knowledgeArea: input.knowledgeArea,
        process: input.process,
        difficulty: input.difficulty,
        type: input.type,
        bloomsLevel: input.bloomsLevel,
        context: input.context,
      })

      res.json({ success: true, question })
    } catch (error) {
      logger.error('API error:', error)
      res.status(400).json({ error: error.message })
    }
  })

  /**
   * GET /api/questions/adaptive
   * Get adaptive question for student
   */
  router.get('/adaptive/:studentId', async (req: Request, res: Response) => {
    try {
      if (!difficultyEngine) {
        return res.status(503).json({ error: 'Service unavailable' })
      }

      const studentId = req.params.studentId
      const excludeIds = req.query.exclude ? (req.query.exclude as string).split(',') : []

      const nextQuestionId = difficultyEngine.selectNextQuestion(
        studentId,
        [], // Would fetch from database
        { excludeIds }
      )

      res.json({
        success: true,
        questionId: nextQuestionId,
      })
    } catch (error) {
      logger.error('API error:', error)
      res.status(400).json({ error: error.message })
    }
  })

  /**
   * POST /api/questions/assess
   * Assess question quality
   */
  router.post('/assess', async (req: Request, res: Response) => {
    try {
      const input = assessQuestionSchema.parse(req.body)

      if (!qualityAssessment) {
        return res.status(503).json({ error: 'Service unavailable' })
      }

      const report = await qualityAssessment.assessQuestion(input.question as any)

      res.json({ success: true, report })
    } catch (error) {
      logger.error('API error:', error)
      res.status(400).json({ error: error.message })
    }
  })

  /**
   * GET /api/questions/search
   * Search questions
   */
  router.get('/search', async (req: Request, res: Response) => {
    try {
      if (!databaseManager) {
        return res.status(503).json({ error: 'Service unavailable' })
      }

      const questions = await databaseManager.searchQuestions({
        query: req.query.q as string,
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0,
      })

      res.json({ success: true, questions })
    } catch (error) {
      logger.error('API error:', error)
      res.status(400).json({ error: error.message })
    }
  })

  /**
   * GET /api/questions/:id/statistics
   * Get question statistics
   */
  router.get('/:id/statistics', async (req: Request, res: Response) => {
    try {
      if (!databaseManager) {
        return res.status(503).json({ error: 'Service unavailable' })
      }

      const statistics = await databaseManager.getQuestionStatistics(req.params.id)

      res.json({ success: true, statistics })
    } catch (error) {
      logger.error('API error:', error)
      res.status(400).json({ error: error.message })
    }
  })

  return router
}

export default questionGenerationRouter
