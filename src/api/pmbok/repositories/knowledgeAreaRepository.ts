/**
 * Knowledge Area Repository
 * Data access layer for PMBOK Knowledge Areas
 */

import { Pool, PoolClient } from 'pg'
import {
  KnowledgeArea,
  CreateKnowledgeAreaDto,
  UpdateKnowledgeAreaDto,
  PMBOKVersion,
  PaginatedResponse,
  ProcessRelationship,
} from '../types'
import { BaseRepository } from './baseRepository'

export class KnowledgeAreaRepository extends BaseRepository<KnowledgeArea> {
  constructor(pool: Pool) {
    super(pool, 'knowledge_areas')
  }

  /**
   * Find all knowledge areas with filters
   */
  async findAll(options: {
    where?: Partial<KnowledgeArea>
    include?: {
      processes?: boolean
      metrics?: boolean
    }
    pagination?: {
      page: number
      limit: number
    }
    order?: Record<string, 'asc' | 'desc'>
  }): Promise<PaginatedResponse<KnowledgeArea>> {
    const { where = {}, include = {}, pagination, order = { display_order: 'asc' } } = options

    let query = `
      SELECT 
        ka.*,
        COUNT(*) OVER() as total_count
      FROM knowledge_areas ka
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    // Apply filters
    if (where.pmbokVersion) {
      query += ` AND ka.pmbok_version = $${paramIndex++}`
      params.push(where.pmbokVersion)
    }

    if (where.isActive !== undefined) {
      query += ` AND ka.is_active = $${paramIndex++}`
      params.push(where.isActive)
    }

    // Apply ordering
    const orderClauses = Object.entries(order)
      .map(([field, direction]) => `ka.${this.toSnakeCase(field)} ${direction.toUpperCase()}`)
      .join(', ')
    query += ` ORDER BY ${orderClauses}`

    // Apply pagination
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
      params.push(pagination.limit, offset)
    }

    const result = await this.pool.query(query, params)
    const rows = result.rows

    if (rows.length === 0) {
      return {
        data: [],
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      }
    }

    const total = parseInt(rows[0].total_count)
    const data = rows.map((row) => this.mapRowToEntity(row))

    // Load additional data if requested
    if (include.processes || include.metrics) {
      await this.loadAdditionalData(data, include)
    }

    return {
      data,
      pagination: {
        page: pagination?.page || 1,
        limit: pagination?.limit || 20,
        total,
        totalPages: Math.ceil(total / (pagination?.limit || 20)),
        hasNext: pagination ? pagination.page * pagination.limit < total : false,
        hasPrevious: pagination ? pagination.page > 1 : false,
      },
    }
  }

  /**
   * Find knowledge area by ID
   */
  async findById(id: string): Promise<KnowledgeArea | null> {
    const query = `
      SELECT * FROM knowledge_areas 
      WHERE id = $1 AND is_active = true
    `

    const result = await this.pool.query(query, [id])

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToEntity(result.rows[0])
  }

  /**
   * Find knowledge area by code and version
   */
  async findByCode(code: string, version: PMBOKVersion): Promise<KnowledgeArea | null> {
    const query = `
      SELECT * FROM knowledge_areas 
      WHERE code = $1 AND pmbok_version = $2 AND is_active = true
    `

    const result = await this.pool.query(query, [code, version])

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToEntity(result.rows[0])
  }

  /**
   * Create a new knowledge area
   */
  async create(
    dto: CreateKnowledgeAreaDto & { createdBy: string; updatedBy: string },
    client?: PoolClient
  ): Promise<KnowledgeArea> {
    const conn = client || this.pool

    const query = `
      INSERT INTO knowledge_areas (
        name, code, description, pmbok_version, 
        color, icon, display_order, metadata,
        created_by, updated_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING *
    `

    const params = [
      dto.name,
      dto.code,
      dto.description,
      dto.pmbokVersion,
      dto.color || null,
      dto.icon || null,
      dto.displayOrder || 0,
      JSON.stringify(dto.metadata || {}),
      dto.createdBy,
      dto.updatedBy,
    ]

    const result = await conn.query(query, params)
    return this.mapRowToEntity(result.rows[0])
  }

  /**
   * Update a knowledge area
   */
  async update(
    id: string,
    dto: UpdateKnowledgeAreaDto & { updatedBy: string },
    client?: PoolClient
  ): Promise<KnowledgeArea> {
    const conn = client || this.pool

    const updates: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Build dynamic update query
    if (dto.name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      params.push(dto.name)
    }

    if (dto.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      params.push(dto.description)
    }

    if (dto.color !== undefined) {
      updates.push(`color = $${paramIndex++}`)
      params.push(dto.color)
    }

    if (dto.icon !== undefined) {
      updates.push(`icon = $${paramIndex++}`)
      params.push(dto.icon)
    }

    if (dto.displayOrder !== undefined) {
      updates.push(`display_order = $${paramIndex++}`)
      params.push(dto.displayOrder)
    }

    if (dto.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`)
      params.push(JSON.stringify(dto.metadata))
    }

    if (dto.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`)
      params.push(dto.isActive)
    }

    updates.push(`updated_by = $${paramIndex++}`)
    params.push(dto.updatedBy)

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    params.push(id)

    const query = `
      UPDATE knowledge_areas 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await conn.query(query, params)
    return this.mapRowToEntity(result.rows[0])
  }

  /**
   * Delete a knowledge area (soft delete)
   */
  async delete(id: string, client?: PoolClient): Promise<void> {
    const conn = client || this.pool

    const query = `
      UPDATE knowledge_areas 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `

    await conn.query(query, [id])
  }

  /**
   * Get relationships for a knowledge area
   */
  async getRelationships(knowledgeAreaId: string): Promise<ProcessRelationship[]> {
    const query = `
      SELECT pr.* 
      FROM process_relationships pr
      JOIN processes sp ON pr.source_process_id = sp.id
      JOIN processes tp ON pr.target_process_id = tp.id
      WHERE sp.knowledge_area_id = $1 OR tp.knowledge_area_id = $1
      ORDER BY pr.relationship_type, pr.strength DESC
    `

    const result = await this.pool.query(query, [knowledgeAreaId])

    return result.rows.map((row) => ({
      id: row.id,
      sourceProcessId: row.source_process_id,
      targetProcessId: row.target_process_id,
      relationshipType: row.relationship_type,
      strength: parseFloat(row.strength),
      description: row.description,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  /**
   * Update process count for a knowledge area
   */
  async updateProcessCount(knowledgeAreaId: string, client?: PoolClient): Promise<void> {
    const conn = client || this.pool

    const query = `
      UPDATE knowledge_areas 
      SET process_count = (
        SELECT COUNT(*) 
        FROM processes 
        WHERE knowledge_area_id = $1 AND is_active = true
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `

    await conn.query(query, [knowledgeAreaId])
  }

  /**
   * Get statistics for all knowledge areas
   */
  async getStatistics(): Promise<any> {
    const query = `
      SELECT 
        ka.id,
        ka.name,
        ka.pmbok_version,
        COUNT(DISTINCT p.id) as process_count,
        COUNT(DISTINCT pi.itto_item_id) as itto_count,
        AVG(p.estimated_learning_time) as avg_learning_time
      FROM knowledge_areas ka
      LEFT JOIN processes p ON ka.id = p.knowledge_area_id AND p.is_active = true
      LEFT JOIN process_itto pi ON p.id = pi.process_id
      WHERE ka.is_active = true
      GROUP BY ka.id, ka.name, ka.pmbok_version
      ORDER BY ka.display_order
    `

    const result = await this.pool.query(query)

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      pmbokVersion: row.pmbok_version,
      processCount: parseInt(row.process_count),
      ittoCount: parseInt(row.itto_count),
      avgLearningTime: parseFloat(row.avg_learning_time) || 0,
    }))
  }

  /**
   * Search knowledge areas by text
   */
  async search(searchText: string, limit = 10): Promise<KnowledgeArea[]> {
    const query = `
      SELECT * FROM knowledge_areas
      WHERE is_active = true
        AND (
          name ILIKE $1
          OR code ILIKE $1
          OR description ILIKE $1
        )
      ORDER BY 
        CASE 
          WHEN name ILIKE $2 THEN 1
          WHEN code ILIKE $2 THEN 2
          ELSE 3
        END,
        display_order
      LIMIT $3
    `

    const searchPattern = `%${searchText}%`
    const exactPattern = searchText

    const result = await this.pool.query(query, [searchPattern, exactPattern, limit])

    return result.rows.map((row) => this.mapRowToEntity(row))
  }

  /**
   * Load additional data for knowledge areas
   */
  private async loadAdditionalData(
    areas: KnowledgeArea[],
    include: { processes?: boolean; metrics?: boolean }
  ): Promise<void> {
    const areaIds = areas.map((a) => a.id)

    if (include.processes && areaIds.length > 0) {
      const query = `
        SELECT 
          p.*,
          p.knowledge_area_id
        FROM processes p
        WHERE p.knowledge_area_id = ANY($1) AND p.is_active = true
        ORDER BY p.knowledge_area_id, p.display_order
      `

      const result = await this.pool.query(query, [areaIds])

      const processMap = new Map<string, any[]>()
      result.rows.forEach((row) => {
        const kaId = row.knowledge_area_id
        if (!processMap.has(kaId)) {
          processMap.set(kaId, [])
        }
        processMap.get(kaId)!.push(this.mapProcessRow(row))
      })

      areas.forEach((area) => {
        ;(area as any).processes = processMap.get(area.id) || []
      })
    }

    if (include.metrics && areaIds.length > 0) {
      // Load metrics from materialized view
      const query = `
        SELECT * FROM mv_knowledge_area_stats
        WHERE id = ANY($1)
      `

      const result = await this.pool.query(query, [areaIds])

      const metricsMap = new Map<string, any>()
      result.rows.forEach((row) => {
        metricsMap.set(row.id, {
          totalProcesses: parseInt(row.total_processes),
          totalIttoItems: parseInt(row.total_itto_items),
          avgLearningTime: parseFloat(row.avg_learning_time),
          totalRelationships: parseInt(row.total_relationships),
        })
      })

      areas.forEach((area) => {
        ;(area as any).metrics = metricsMap.get(area.id) || null
      })
    }
  }

  /**
   * Map database row to entity
   */
  private mapRowToEntity(row: any): KnowledgeArea {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      pmbokVersion: row.pmbok_version,
      processCount: parseInt(row.process_count),
      color: row.color,
      icon: row.icon,
      displayOrder: parseInt(row.display_order),
      metadata: row.metadata,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    }
  }

  /**
   * Map process row to entity
   */
  private mapProcessRow(row: any): any {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      knowledgeAreaId: row.knowledge_area_id,
      processGroupId: row.process_group_id,
      description: row.description,
      complexity: row.complexity,
      estimatedLearningTime: row.estimated_learning_time,
      displayOrder: row.display_order,
    }
  }
}
