/**
 * データベース・永続化層実装
 * Developer 5: データベース・パフォーマンス最適化
 * 技術スタック: Prisma, PostgreSQL, Redis
 * セキュリティレベル: High
 * 最終更新: {updated}
 */

import { Prisma } from '@prisma/client'
import { z } from 'zod'

// ページネーション設定
const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type PaginationOptions = z.infer<typeof PaginationSchema>

// ページネーション結果
export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta?: {
    queryTime: number
    fromCache: boolean
  }
}

// フィルター条件
export interface FilterConditions {
  dateRange?: {
    field: string
    start?: Date
    end?: Date
  }
  search?: {
    fields: string[]
    query: string
  }
  status?: string | string[]
  category?: string | string[]
  userId?: string
}

/**
 * 高性能クエリビルダー
 */
export class QueryOptimizer {
  /**
   * ページネーション付きクエリの構築
   */
  static buildPaginatedQuery<T>(
    options: PaginationOptions,
    baseQuery: any = {}
  ): {
    skip: number
    take: number
    orderBy: any
    where: any
  } {
    const { page, limit, sortBy, sortOrder } = PaginationSchema.parse(options)
    const skip = (page - 1) * limit

    return {
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      where: baseQuery.where || {},
    }
  }

  /**
   * 全文検索クエリの構築
   */
  static buildFullTextSearchQuery(
    fields: string[],
    searchTerm: string,
    language: 'english' | 'japanese' = 'japanese'
  ): Prisma.Sql {
    if (!searchTerm.trim()) {
      return Prisma.empty
    }

    const searchFields = fields.join(" || ' ' || ")
    const searchQuery = searchTerm
      .split(' ')
      .filter((term) => term.length > 0)
      .map((term) => `${term}:*`)
      .join(' & ')

    return Prisma.sql`
      to_tsvector(${language}, ${Prisma.raw(searchFields)}) @@ 
      to_tsquery(${language}, ${searchQuery})
    `
  }

  /**
   * 日付範囲フィルターの構築
   */
  static buildDateRangeFilter(
    field: string,
    start?: Date,
    end?: Date
  ): Record<string, any> | undefined {
    if (!start && !end) return undefined

    const filter: Record<string, any> = {}

    if (start && end) {
      filter[field] = {
        gte: start,
        lte: end,
      }
    } else if (start) {
      filter[field] = {
        gte: start,
      }
    } else if (end) {
      filter[field] = {
        lte: end,
      }
    }

    return filter
  }

  /**
   * 複合フィルター条件の構築
   */
  static buildComplexFilter(conditions: FilterConditions): Record<string, any> {
    const where: Record<string, any> = {}

    // 日付範囲フィルター
    if (conditions.dateRange) {
      const dateFilter = this.buildDateRangeFilter(
        conditions.dateRange.field,
        conditions.dateRange.start,
        conditions.dateRange.end
      )
      if (dateFilter) {
        Object.assign(where, dateFilter)
      }
    }

    // ステータスフィルター
    if (conditions.status) {
      where.status = Array.isArray(conditions.status)
        ? { in: conditions.status }
        : conditions.status
    }

    // カテゴリフィルター
    if (conditions.category) {
      where.category = Array.isArray(conditions.category)
        ? { in: conditions.category }
        : conditions.category
    }

    // ユーザーフィルター
    if (conditions.userId) {
      where.userId = conditions.userId
    }

    // 検索フィルター（全文検索を使用）
    if (conditions.search && conditions.search.query.trim()) {
      // この部分は実際のクエリで使用する際にPrismaのwhere条件に変換される
      where._fullTextSearch = conditions.search
    }

    return where
  }

  /**
   * 学習進捗用最適化クエリ
   */
  static buildLearningProgressQuery(
    userId: string,
    filters?: {
      knowledgeAreas?: string[]
      processGroups?: string[]
      status?: string[]
      masteryLevel?: { min?: number; max?: number }
    }
  ) {
    const where: any = { userId }

    if (filters) {
      if (filters.knowledgeAreas && filters.knowledgeAreas.length > 0) {
        where.process = {
          knowledgeArea: { in: filters.knowledgeAreas },
        }
      }

      if (filters.processGroups && filters.processGroups.length > 0) {
        where.process = {
          ...where.process,
          processGroup: { in: filters.processGroups },
        }
      }

      if (filters.status && filters.status.length > 0) {
        where.status = { in: filters.status }
      }

      if (filters.masteryLevel) {
        const masteryFilter: any = {}
        if (filters.masteryLevel.min !== undefined) {
          masteryFilter.gte = filters.masteryLevel.min
        }
        if (filters.masteryLevel.max !== undefined) {
          masteryFilter.lte = filters.masteryLevel.max
        }
        if (Object.keys(masteryFilter).length > 0) {
          where.masteryLevel = masteryFilter
        }
      }
    }

    return {
      where,
      include: {
        // 関連するPMBOKプロセス情報も含める（N+1問題回避）
        process: {
          select: {
            code: true,
            name: true,
            nameJa: true,
            knowledgeArea: true,
            processGroup: true,
          },
        },
      },
      orderBy: [{ lastStudied: 'desc' as const }, { masteryLevel: 'asc' as const }],
    }
  }

  /**
   * 試験結果用最適化クエリ
   */
  static buildExamResultsQuery(
    userId?: string,
    filters?: {
      status?: string[]
      scoreRange?: { min?: number; max?: number }
      dateRange?: { start?: Date; end?: Date }
    }
  ) {
    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        where.status = { in: filters.status }
      }

      if (filters.scoreRange) {
        const scoreFilter: any = {}
        if (filters.scoreRange.min !== undefined) {
          scoreFilter.gte = filters.scoreRange.min
        }
        if (filters.scoreRange.max !== undefined) {
          scoreFilter.lte = filters.scoreRange.max
        }
        if (Object.keys(scoreFilter).length > 0) {
          where.score = scoreFilter
        }
      }

      if (filters.dateRange) {
        const dateFilter = this.buildDateRangeFilter(
          'startTime',
          filters.dateRange.start,
          filters.dateRange.end
        )
        if (dateFilter) {
          Object.assign(where, dateFilter)
        }
      }
    }

    return {
      where,
      include: {
        // 試験回答の詳細も含める（分析用）
        answers: {
          include: {
            question: {
              select: {
                knowledgeArea: true,
                processGroup: true,
                difficulty: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'desc' as const },
    }
  }

  /**
   * ダッシュボード用集約クエリ
   */
  static buildDashboardQuery(userId: string) {
    return {
      // 学習進捗サマリー
      learningProgress: {
        where: { userId },
        _count: {
          _all: true,
        },
        _avg: {
          masteryLevel: true,
          totalStudyTime: true,
        },
        groupBy: ['status'],
      },

      // 試験結果サマリー
      examResults: {
        where: {
          userId,
          status: 'COMPLETED',
        },
        _count: {
          _all: true,
        },
        _avg: {
          score: true,
          correctAnswers: true,
        },
        orderBy: {
          startTime: 'desc',
        },
        take: 5,
      },

      // 最近の活動
      recentActivity: {
        where: { userId },
        orderBy: { lastStudied: 'desc' },
        take: 10,
        include: {
          process: {
            select: {
              name: true,
              nameJa: true,
              knowledgeArea: true,
            },
          },
        },
      },
    }
  }

  /**
   * バッチ処理用最適化クエリ
   */
  static buildBatchQuery<T>(
    batchSize: number = 1000,
    lastId?: string
  ): {
    take: number
    cursor?: { id: string }
    orderBy: { id: 'asc' }
  } {
    const query: any = {
      take: batchSize,
      orderBy: { id: 'asc' as const },
    }

    if (lastId) {
      query.cursor = { id: lastId }
      query.skip = 1 // Skip the cursor record
    }

    return query
  }

  /**
   * 重複除去クエリ
   */
  static buildDistinctQuery(field: string | string[], additionalFields?: string[]) {
    const distinct = Array.isArray(field) ? field : [field]

    return {
      distinct,
      select: [...distinct, ...(additionalFields || [])].reduce(
        (acc, fieldName) => {
          acc[fieldName] = true
          return acc
        },
        {} as Record<string, boolean>
      ),
    }
  }
}

/**
 * クエリキャッシュマネージャー
 */
export class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private defaultTTL = 5 * 60 * 1000 // 5分

  /**
   * キャッシュキーの生成
   */
  private generateKey(query: object): string {
    return Buffer.from(JSON.stringify(query)).toString('base64')
  }

  /**
   * キャッシュからデータを取得
   */
  get<T>(query: object): T | null {
    const key = this.generateKey(query)
    const cached = this.cache.get(key)

    if (!cached) return null

    // TTL チェック
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  /**
   * データをキャッシュに保存
   */
  set<T>(query: object, data: T, ttl?: number): void {
    const key = this.generateKey(query)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  /**
   * 特定のパターンのキャッシュを無効化
   */
  invalidate(pattern: string): number {
    let invalidated = 0

    for (const [key, _] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        invalidated++
      }
    }

    return invalidated
  }

  /**
   * すべてのキャッシュをクリア
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 期限切れのキャッシュを削除
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, cached] of this.cache) {
      if (now > cached.timestamp + cached.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * キャッシュ統計の取得
   */
  getStats(): {
    size: number
    hitRate: number
    totalRequests: number
    cacheHits: number
  } {
    // 実装を簡略化（実際にはより詳細な統計が必要）
    return {
      size: this.cache.size,
      hitRate: 0, // 実装が必要
      totalRequests: 0, // 実装が必要
      cacheHits: 0, // 実装が必要
    }
  }
}

/**
 * インデックスヒント用ヘルパー
 */
export class IndexOptimizer {
  /**
   * 推奨インデックスの生成
   */
  static suggestIndexes(
    tableName: string,
    whereConditions: Record<string, any>,
    orderBy?: Record<string, 'asc' | 'desc'>
  ): string[] {
    const suggestions: string[] = []

    // WHERE条件からインデックス候補を生成
    const whereFields = Object.keys(whereConditions)
    if (whereFields.length > 0) {
      if (whereFields.length === 1) {
        suggestions.push(
          `CREATE INDEX idx_${tableName}_${whereFields[0]} ON "${tableName}" ("${whereFields[0]}");`
        )
      } else {
        suggestions.push(
          `CREATE INDEX idx_${tableName}_${whereFields.join('_')} ON "${tableName}" (${whereFields.map((f) => `"${f}"`).join(', ')});`
        )
      }
    }

    // ORDER BY からインデックス候補を生成
    if (orderBy) {
      const orderFields = Object.keys(orderBy)
      if (orderFields.length > 0) {
        const orderClause = orderFields
          .map((field) => `"${field}" ${orderBy[field].toUpperCase()}`)
          .join(', ')
        suggestions.push(
          `CREATE INDEX idx_${tableName}_order_${orderFields.join('_')} ON "${tableName}" (${orderClause});`
        )
      }
    }

    // 複合インデックス（WHERE + ORDER BY）
    if (whereFields.length > 0 && orderBy) {
      const orderFields = Object.keys(orderBy)
      const allFields = [...whereFields, ...orderFields]
      const uniqueFields = Array.from(new Set(allFields))

      if (uniqueFields.length > whereFields.length) {
        suggestions.push(
          `CREATE INDEX idx_${tableName}_composite_${uniqueFields.join('_')} ON "${tableName}" (${uniqueFields.map((f) => `"${f}"`).join(', ')});`
        )
      }
    }

    return suggestions
  }

  /**
   * クエリプランの分析（開発環境用）
   */
  static analyzeQuery(query: string): string {
    if (process.env.NODE_ENV === 'development') {
      return `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`
    }
    return query
  }
}

// エクスポート用インスタンス
export const queryCache = new QueryCache()

// 定期的なキャッシュクリーンアップ
setInterval(
  () => {
    queryCache.cleanup()
  },
  10 * 60 * 1000
) // 10分ごと

export default {
  QueryOptimizer,
  QueryCache,
  IndexOptimizer,
  queryCache,
}
