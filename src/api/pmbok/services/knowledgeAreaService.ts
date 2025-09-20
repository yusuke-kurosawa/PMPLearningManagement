/**
 * Knowledge Area Service
 * Business logic layer for PMBOK Knowledge Area management
 */

import {
  KnowledgeArea,
  KnowledgeAreaDetail,
  CreateKnowledgeAreaDto,
  UpdateKnowledgeAreaDto,
  KnowledgeAreaFilters,
  KnowledgeAreaMetrics,
  PaginatedResponse,
  PaginationParams,
  ValidationResult,
  PMBOKVersion,
  ApiError,
} from '../types'
import { KnowledgeAreaRepository } from '../repositories/knowledgeAreaRepository'
import { ProcessRepository } from '../repositories/processRepository'
import { UserProgressRepository } from '../repositories/userProgressRepository'
import { CacheService } from './cacheService'
import { ValidationService } from './validationService'
import { AuditService } from './auditService'
import { EventEmitter } from 'events'

export class KnowledgeAreaService extends EventEmitter {
  private knowledgeAreaRepo: KnowledgeAreaRepository
  private processRepo: ProcessRepository
  private userProgressRepo: UserProgressRepository
  private cache: CacheService
  private validator: ValidationService
  private audit: AuditService

  // Cache TTL configurations
  private readonly CACHE_TTL = {
    LIST: 3600, // 1 hour
    DETAIL: 1800, // 30 minutes
    METRICS: 300, // 5 minutes
  }

  constructor(
    knowledgeAreaRepo: KnowledgeAreaRepository,
    processRepo: ProcessRepository,
    userProgressRepo: UserProgressRepository,
    cache: CacheService,
    validator: ValidationService,
    audit: AuditService
  ) {
    super()
    this.knowledgeAreaRepo = knowledgeAreaRepo
    this.processRepo = processRepo
    this.userProgressRepo = userProgressRepo
    this.cache = cache
    this.validator = validator
    this.audit = audit
  }

  /**
   * List all knowledge areas with optional filters and pagination
   */
  async listKnowledgeAreas(
    filters: KnowledgeAreaFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<KnowledgeArea>> {
    const cacheKey = this.generateCacheKey('ka:list', { filters, pagination })

    // Try to get from cache
    const cached = await this.cache.get<PaginatedResponse<KnowledgeArea>>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Apply default pagination
      const { page = 1, limit = 20, sort = 'displayOrder', order = 'asc' } = pagination

      // Get data from repository
      const result = await this.knowledgeAreaRepo.findAll({
        where: {
          pmbokVersion: filters.pmbokVersion,
          isActive: filters.isActive !== false,
        },
        include: {
          processes: filters.includeProcesses,
          metrics: filters.includeMetrics,
        },
        pagination: { page, limit },
        order: { [sort]: order },
      })

      // Cache the result
      await this.cache.set(cacheKey, result, this.CACHE_TTL.LIST)

      return result
    } catch (error) {
      this.handleError('Failed to list knowledge areas', error)
      throw error
    }
  }

  /**
   * Get detailed information about a specific knowledge area
   */
  async getKnowledgeArea(
    id: string,
    includeProcesses = false,
    includeMetrics = false,
    includeRelationships = false
  ): Promise<KnowledgeAreaDetail> {
    const cacheKey = this.generateCacheKey('ka:detail', {
      id,
      includeProcesses,
      includeMetrics,
      includeRelationships,
    })

    // Try to get from cache
    const cached = await this.cache.get<KnowledgeAreaDetail>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Get base knowledge area
      const knowledgeArea = await this.knowledgeAreaRepo.findById(id)
      if (!knowledgeArea) {
        throw this.createNotFoundError('Knowledge area not found')
      }

      const detail: KnowledgeAreaDetail = { ...knowledgeArea }

      // Load additional data in parallel
      const promises: Promise<any>[] = []

      if (includeProcesses) {
        promises.push(
          this.processRepo.findByKnowledgeArea(id).then((processes) => {
            detail.processes = processes
          })
        )
      }

      if (includeMetrics) {
        promises.push(
          this.calculateKnowledgeAreaMetrics(id).then((metrics) => {
            detail.metrics = metrics
          })
        )
      }

      if (includeRelationships) {
        promises.push(
          this.knowledgeAreaRepo.getRelationships(id).then((relationships) => {
            detail.relationships = relationships
          })
        )
      }

      await Promise.all(promises)

      // Cache the result
      await this.cache.set(cacheKey, detail, this.CACHE_TTL.DETAIL)

      return detail
    } catch (error) {
      this.handleError(`Failed to get knowledge area ${id}`, error)
      throw error
    }
  }

  /**
   * Create a new knowledge area
   */
  async createKnowledgeArea(dto: CreateKnowledgeAreaDto, userId: string): Promise<KnowledgeArea> {
    // Validate input
    const validation = await this.validator.validateKnowledgeArea(dto)
    if (!validation.isValid) {
      throw this.createValidationError(validation)
    }

    // Check for duplicates
    const existing = await this.knowledgeAreaRepo.findByCode(dto.code, dto.pmbokVersion)
    if (existing) {
      throw this.createConflictError('Knowledge area with this code already exists')
    }

    try {
      // Begin transaction
      const knowledgeArea = await this.knowledgeAreaRepo.transaction(async (trx) => {
        // Create knowledge area
        const created = await this.knowledgeAreaRepo.create(
          {
            ...dto,
            createdBy: userId,
            updatedBy: userId,
          },
          trx
        )

        // Audit log
        await this.audit.log(
          {
            action: 'CREATE',
            entityType: 'KnowledgeArea',
            entityId: created.id,
            userId,
            data: dto,
          },
          trx
        )

        return created
      })

      // Clear cache
      await this.cache.invalidate('ka:list:*')

      // Emit event
      this.emit('knowledgeArea:created', knowledgeArea)

      return knowledgeArea
    } catch (error) {
      this.handleError('Failed to create knowledge area', error)
      throw error
    }
  }

  /**
   * Update an existing knowledge area
   */
  async updateKnowledgeArea(
    id: string,
    dto: UpdateKnowledgeAreaDto,
    userId: string
  ): Promise<KnowledgeArea> {
    // Validate input
    const validation = await this.validator.validateKnowledgeAreaUpdate(dto)
    if (!validation.isValid) {
      throw this.createValidationError(validation)
    }

    try {
      // Check if exists
      const existing = await this.knowledgeAreaRepo.findById(id)
      if (!existing) {
        throw this.createNotFoundError('Knowledge area not found')
      }

      // Begin transaction
      const updated = await this.knowledgeAreaRepo.transaction(async (trx) => {
        // Update knowledge area
        const result = await this.knowledgeAreaRepo.update(
          id,
          {
            ...dto,
            updatedBy: userId,
          },
          trx
        )

        // Audit log
        await this.audit.log(
          {
            action: 'UPDATE',
            entityType: 'KnowledgeArea',
            entityId: id,
            userId,
            data: { before: existing, after: dto },
          },
          trx
        )

        return result
      })

      // Clear cache
      await this.cache.invalidate(`ka:*:${id}:*`)
      await this.cache.invalidate('ka:list:*')

      // Emit event
      this.emit('knowledgeArea:updated', { before: existing, after: updated })

      return updated
    } catch (error) {
      this.handleError(`Failed to update knowledge area ${id}`, error)
      throw error
    }
  }

  /**
   * Delete a knowledge area
   */
  async deleteKnowledgeArea(id: string, userId: string): Promise<void> {
    try {
      // Check if exists
      const existing = await this.knowledgeAreaRepo.findById(id)
      if (!existing) {
        throw this.createNotFoundError('Knowledge area not found')
      }

      // Check for dependencies
      const processCount = await this.processRepo.countByKnowledgeArea(id)
      if (processCount > 0) {
        throw this.createConflictError(
          `Cannot delete knowledge area with ${processCount} associated processes`
        )
      }

      // Begin transaction
      await this.knowledgeAreaRepo.transaction(async (trx) => {
        // Soft delete (set isActive = false)
        await this.knowledgeAreaRepo.update(
          id,
          {
            isActive: false,
            updatedBy: userId,
          },
          trx
        )

        // Audit log
        await this.audit.log(
          {
            action: 'DELETE',
            entityType: 'KnowledgeArea',
            entityId: id,
            userId,
            data: existing,
          },
          trx
        )
      })

      // Clear cache
      await this.cache.invalidate(`ka:*:${id}:*`)
      await this.cache.invalidate('ka:list:*')

      // Emit event
      this.emit('knowledgeArea:deleted', existing)
    } catch (error) {
      this.handleError(`Failed to delete knowledge area ${id}`, error)
      throw error
    }
  }

  /**
   * Calculate metrics for a knowledge area
   */
  async calculateKnowledgeAreaMetrics(
    knowledgeAreaId: string,
    userId?: string
  ): Promise<KnowledgeAreaMetrics> {
    const cacheKey = this.generateCacheKey('ka:metrics', { knowledgeAreaId, userId })

    // Try to get from cache
    const cached = await this.cache.get<KnowledgeAreaMetrics>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Get all processes in the knowledge area
      const processes = await this.processRepo.findByKnowledgeArea(knowledgeAreaId)
      const processIds = processes.map((p) => p.id)

      const metrics: KnowledgeAreaMetrics = {
        totalProcesses: processes.length,
        completedProcesses: 0,
        masteryLevel: 0,
        averageScore: 0,
        totalLearningTime: 0,
      }

      if (userId && processIds.length > 0) {
        // Get user progress for all processes
        const progressData = await this.userProgressRepo.findByUserAndProcesses(userId, processIds)

        if (progressData.length > 0) {
          metrics.completedProcesses = progressData.filter(
            (p) => p.completionPercentage >= 100
          ).length

          const totalScore = progressData.reduce((sum, p) => sum + (p.score || 0), 0)
          metrics.averageScore = totalScore / progressData.length

          metrics.totalLearningTime = progressData.reduce((sum, p) => sum + p.timeSpent, 0)

          // Calculate mastery level (weighted average)
          const masteryWeights = {
            beginner: 0.25,
            intermediate: 0.5,
            advanced: 0.75,
            expert: 1.0,
          }

          const totalMastery = progressData.reduce(
            (sum, p) => sum + masteryWeights[p.masteryLevel],
            0
          )
          metrics.masteryLevel = (totalMastery / processes.length) * 100

          // Get last activity
          const lastActivities = progressData
            .filter((p) => p.lastAccessed)
            .map((p) => p.lastAccessed!)

          if (lastActivities.length > 0) {
            metrics.lastActivity = new Date(Math.max(...lastActivities.map((d) => d.getTime())))
          }
        }
      }

      // Cache the result
      await this.cache.set(cacheKey, metrics, this.CACHE_TTL.METRICS)

      return metrics
    } catch (error) {
      this.handleError('Failed to calculate knowledge area metrics', error)
      throw error
    }
  }

  /**
   * Get knowledge area recommendations for a user
   */
  async getRecommendations(userId: string): Promise<KnowledgeArea[]> {
    try {
      // Get user's progress summary
      const progressSummary = await this.userProgressRepo.getUserSummary(userId)

      // Find knowledge areas with low completion or not started
      const allAreas = await this.knowledgeAreaRepo.findAll({
        where: { isActive: true, pmbokVersion: PMBOKVersion.V6 },
      })

      // Sort by recommendation score
      const recommendations = allAreas.data
        .map((area) => {
          const progress = progressSummary.find((p) => p.knowledgeAreaId === area.id)
          const score = this.calculateRecommendationScore(area, progress)
          return { area, score }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((r) => r.area)

      return recommendations
    } catch (error) {
      this.handleError('Failed to get recommendations', error)
      throw error
    }
  }

  /**
   * Calculate recommendation score for a knowledge area
   */
  private calculateRecommendationScore(area: KnowledgeArea, progress?: any): number {
    let score = 100

    if (!progress) {
      // Not started - high priority
      return score
    }

    // Reduce score based on completion
    score -= progress.avgCompletion || 0

    // Adjust based on last activity (boost recently active areas)
    if (progress.lastActivity) {
      const daysSinceActivity = Math.floor(
        (Date.now() - new Date(progress.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceActivity < 7) {
        score += 20 // Recent activity bonus
      } else if (daysSinceActivity > 30) {
        score += 10 // Needs refresh bonus
      }
    }

    // Adjust based on mastery level
    if (progress.avgScore < 70) {
      score += 15 // Needs improvement bonus
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Bulk import knowledge areas
   */
  async bulkImport(
    areas: CreateKnowledgeAreaDto[],
    userId: string
  ): Promise<{ successful: number; failed: number; errors: any[] }> {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as any[],
    }

    for (const area of areas) {
      try {
        await this.createKnowledgeArea(area, userId)
        results.successful++
      } catch (error: any) {
        results.failed++
        results.errors.push({
          area: area.code,
          error: error.message,
        })
      }
    }

    // Clear all caches after bulk operation
    await this.cache.invalidate('ka:*')

    return results
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(prefix: string, params: any): string {
    const paramStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${JSON.stringify(v)}`)
      .join(':')
    return `${prefix}:${paramStr}`
  }

  /**
   * Create error objects
   */
  private createNotFoundError(message: string): ApiError {
    return {
      code: 'NOT_FOUND',
      message,
      timestamp: new Date(),
    }
  }

  private createConflictError(message: string): ApiError {
    return {
      code: 'CONFLICT',
      message,
      timestamp: new Date(),
    }
  }

  private createValidationError(validation: ValidationResult): ApiError {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: { errors: validation.errors },
      timestamp: new Date(),
    }
  }

  /**
   * Handle and log errors
   */
  private handleError(context: string, error: any): void {
    console.error(`[KnowledgeAreaService] ${context}:`, error)
    this.emit('error', { context, error })
  }
}
