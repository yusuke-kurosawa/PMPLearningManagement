/**
 * PMP Terminology API
 * RESTful API endpoints for terminology validation and analysis
 */

import {
  TerminologyAnalyzer,
  FileAnalysis,
  AnalysisResult,
} from '../../services/terminology/terminology-analyzer'
import {
  pmpTerminologyDatabase,
  TerminologyEntry,
  ValidationRule,
  validationRules,
  learningResources,
  getTermById,
  getTermsByKnowledgeArea as _getTermsByKnowledgeArea,
  getTermsByProcessGroup as _getTermsByProcessGroup,
  getDeprecatedTerms as _getDeprecatedTerms,
} from '../../data/terminology/pmp-terminology-database'

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface ValidationRequest {
  content: string
  fileName?: string
  options?: {
    pmbokVersion?: 6 | 7
    region?: 'US' | 'UK'
    strictMode?: boolean
    contextAware?: boolean
    semanticAnalysis?: boolean
  }
}

export interface ValidationResponse {
  analysis: FileAnalysis
  suggestions: AutofixSuggestion[]
  learningPaths: LearningPath[]
}

export interface AutofixSuggestion {
  line: number
  column: number
  original: string
  suggested: string
  confidence: number
  autoApplicable: boolean
}

export interface LearningPath {
  topic: string
  resources: string[]
  glossaryTerms: number[]
  estimatedTime: string
}

export interface BatchValidationRequest {
  files: Array<{
    path: string
    content: string
  }>
  options?: ValidationRequest['options']
}

export interface TermSearchRequest {
  query: string
  filters?: {
    knowledgeArea?: string[]
    processGroup?: string[]
    pmbokVersion?: 6 | 7
    onlyDeprecated?: boolean
  }
  limit?: number
  offset?: number
}

export interface TeamMetricsRequest {
  startDate?: string
  endDate?: string
  groupBy?: 'user' | 'file' | 'knowledgeArea' | 'day' | 'week'
}

export interface TeamMetrics {
  period: string
  totalChecks: number
  totalIssues: number
  averageScore: number
  commonMistakes: Array<{
    term: string
    count: number
    correctTerm: string
  }>
  knowledgeGaps: Array<{
    area: string
    issueCount: number
    improvement: number
  }>
  userMetrics?: Array<{
    user: string
    checksPerformed: number
    averageScore: number
    topIssues: string[]
  }>
}

// Singleton instance
let analyzerInstance: TerminologyAnalyzer | null = null

function _getAnalyzer(options?: Record<string, unknown>): TerminologyAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new TerminologyAnalyzer(options)
  } else if (options) {
    analyzerInstance.updateConfig(options)
  }
  return analyzerInstance
}

// Alias for backward compatibility
const getAnalyzer = _getAnalyzer

/**
 * Terminology API Class
 */
export class TerminologyAPI {
  /**
   * Validate content for terminology issues
   */
  static async validate(request: ValidationRequest): Promise<ApiResponse<ValidationResponse>> {
    try {
      const analyzer = getAnalyzer(request.options)
      const fileName = request.fileName || 'content.md'

      const analysis = await analyzer.analyzeFile(fileName, request.content, {
        contextAware: request.options?.contextAware ?? true,
        semanticAnalysis: request.options?.semanticAnalysis ?? true,
      })

      // Generate autofix suggestions
      const suggestions = this.generateAutofixSuggestions(analysis)

      // Generate learning paths
      const learningPaths = this.generateLearningPaths(analysis)

      return {
        success: true,
        data: {
          analysis,
          suggestions,
          learningPaths,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Batch validate multiple files
   */
  static async batchValidate(
    request: BatchValidationRequest
  ): Promise<ApiResponse<ValidationResponse[]>> {
    try {
      const analyzer = getAnalyzer(request.options)
      const results: ValidationResponse[] = []

      for (const file of request.files) {
        const analysis = await analyzer.analyzeFile(file.path, file.content, {
          contextAware: request.options?.contextAware ?? true,
          semanticAnalysis: request.options?.semanticAnalysis ?? true,
          useCache: true,
        })

        results.push({
          analysis,
          suggestions: this.generateAutofixSuggestions(analysis),
          learningPaths: this.generateLearningPaths(analysis),
        })
      }

      return {
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Apply autofix to content
   */
  static async autofix(content: string, analysis: FileAnalysis): Promise<ApiResponse<string>> {
    try {
      const analyzer = getAnalyzer()
      const fixed = analyzer.generateAutofix(analysis, content)

      return {
        success: true,
        data: fixed,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Search terminology database
   */
  static async searchTerms(request: TermSearchRequest): Promise<ApiResponse<TerminologyEntry[]>> {
    try {
      let results = [...pmpTerminologyDatabase]

      // Apply search query
      if (request.query) {
        const query = request.query.toLowerCase()
        results = results.filter(
          (term) =>
            term.term.toLowerCase().includes(query) ||
            term.canonical.toLowerCase().includes(query) ||
            term.definition.toLowerCase().includes(query) ||
            term.aliases.some((a) => a.toLowerCase().includes(query)) ||
            term.deprecated.some((d) => d.toLowerCase().includes(query))
        )
      }

      // Apply filters
      if (request.filters) {
        if (request.filters.knowledgeArea?.length) {
          results = results.filter((term) =>
            term.knowledgeArea?.some((ka) => {
              const filters = request.filters
              return filters?.knowledgeArea?.includes(ka) ?? false
            })
          )
        }

        if (request.filters.processGroup?.length) {
          results = results.filter((term) =>
            term.processGroup?.some((pg) => {
              const filters = request.filters
              return filters?.processGroup?.includes(pg) ?? false
            })
          )
        }

        if (request.filters.pmbokVersion) {
          const version = request.filters.pmbokVersion
          results = results.filter((term) => (version === 6 ? term.pmbok6 : term.pmbok7))
        }

        if (request.filters.onlyDeprecated) {
          results = results.filter((term) => term.deprecated && term.deprecated.length > 0)
        }
      }

      // Apply pagination
      const offset = request.offset || 0
      const limit = request.limit || 50
      results = results.slice(offset, offset + limit)

      return {
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Get term by ID
   */
  static async getTerm(id: string): Promise<ApiResponse<TerminologyEntry | undefined>> {
    try {
      const term = getTermById(id)

      return {
        success: true,
        data: term,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Get custom validation rules
   */
  static async getValidationRules(): Promise<ApiResponse<ValidationRule[]>> {
    try {
      return {
        success: true,
        data: validationRules,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Add custom validation rule
   */
  static async addCustomRule(rule: ValidationRule): Promise<ApiResponse<boolean>> {
    try {
      const analyzer = getAnalyzer()
      analyzer.addCustomRule(rule)

      return {
        success: true,
        data: true,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Get team metrics
   */
  static async getTeamMetrics(request: TeamMetricsRequest): Promise<ApiResponse<TeamMetrics>> {
    try {
      // This would normally fetch from a database
      // For now, return mock data
      const metrics: TeamMetrics = {
        period: `${request.startDate || 'all-time'} to ${request.endDate || 'now'}`,
        totalChecks: 247,
        totalIssues: 892,
        averageScore: 78.5,
        commonMistakes: [
          { term: 'project lead', count: 45, correctTerm: 'Project Manager' },
          { term: 'work breakdown', count: 38, correctTerm: 'Work Breakdown Structure' },
          { term: 'risk mitigation', count: 32, correctTerm: 'Risk Response' },
          { term: 'stakeholder list', count: 28, correctTerm: 'Stakeholder Register' },
          { term: 'planning phase', count: 25, correctTerm: 'Planning Process Group' },
        ],
        knowledgeGaps: [
          { area: 'Risk Management', issueCount: 127, improvement: -15 },
          { area: 'Scope Management', issueCount: 98, improvement: 8 },
          { area: 'Integration Management', issueCount: 76, improvement: 12 },
        ],
        userMetrics:
          request.groupBy === 'user'
            ? [
                {
                  user: 'developer1',
                  checksPerformed: 89,
                  averageScore: 82.3,
                  topIssues: ['project lead', 'work breakdown', 'stakeholder list'],
                },
                {
                  user: 'developer2',
                  checksPerformed: 67,
                  averageScore: 75.8,
                  topIssues: ['risk mitigation', 'planning phase', 'budgeted value'],
                },
              ]
            : undefined,
      }

      return {
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Get learning resources for a topic
   */
  static async getLearningResources(topic: string): Promise<
    ApiResponse<{
      glossaryIds: number[]
      links: string[]
      suggestedReading: string[]
    }>
  > {
    try {
      const resources = learningResources[topic] || {
        glossaryIds: [],
        links: [],
        suggestedReading: [],
      }

      return {
        success: true,
        data: resources,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Clear analyzer cache
   */
  static async clearCache(): Promise<ApiResponse<boolean>> {
    try {
      const analyzer = getAnalyzer()
      analyzer.clearCache()

      return {
        success: true,
        data: true,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Helper: Generate autofix suggestions
   */
  private static generateAutofixSuggestions(analysis: FileAnalysis): AutofixSuggestion[] {
    const suggestions: AutofixSuggestion[] = []

    for (const issue of [...analysis.errors, ...analysis.warnings]) {
      if (issue.autofix && issue.suggestion) {
        suggestions.push({
          line: issue.line,
          column: issue.column,
          original: issue.term,
          suggested: this.extractSuggestion(issue),
          confidence: issue.confidence,
          autoApplicable: issue.severity !== 'suggestion',
        })
      }
    }

    return suggestions
  }

  /**
   * Helper: Extract suggestion from result
   */
  private static extractSuggestion(result: AnalysisResult): string {
    if (result.suggestion && result.suggestion.length <= result.term.length * 2) {
      return result.suggestion
    }

    // Find the term in the database
    const dbTerm = pmpTerminologyDatabase.find((t) => t.id === result.rule)
    return dbTerm?.canonical || result.term
  }

  /**
   * Helper: Generate learning paths
   */
  private static generateLearningPaths(analysis: FileAnalysis): LearningPath[] {
    const paths: LearningPath[] = []
    const addedTopics = new Set<string>()

    // Based on knowledge gaps
    for (const gap of analysis.metrics.knowledgeGaps) {
      if (!addedTopics.has(gap)) {
        const resources = learningResources[gap]
        if (resources) {
          paths.push({
            topic: gap,
            resources: resources.links || [],
            glossaryTerms: resources.glossaryIds || [],
            estimatedTime: this.estimateLearningTime(resources),
          })
          addedTopics.add(gap)
        }
      }
    }

    // Based on common mistakes
    const topMistakes = Array.from(analysis.metrics.commonMistakes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    for (const [term] of topMistakes) {
      // Find related learning resources
      const relatedTerm = pmpTerminologyDatabase.find(
        (t) => t.deprecated.includes(term) || t.term === term
      )

      if (relatedTerm?.knowledgeArea) {
        for (const area of relatedTerm.knowledgeArea) {
          if (!addedTopics.has(area)) {
            const resources = learningResources[area]
            if (resources) {
              paths.push({
                topic: area,
                resources: resources.links || [],
                glossaryTerms: resources.glossaryIds || [],
                estimatedTime: this.estimateLearningTime(resources),
              })
              addedTopics.add(area)
            }
          }
        }
      }
    }

    return paths
  }

  /**
   * Helper: Estimate learning time
   */
  private static estimateLearningTime(resources: {
    links?: string[]
    suggestedReading?: string[]
  }): string {
    const linkCount = (resources.links || []).length
    const readingCount = (resources.suggestedReading || []).length
    const totalItems = linkCount + readingCount

    if (totalItems <= 2) {
      return '15-30 minutes'
    }
    if (totalItems <= 5) {
      return '30-60 minutes'
    }
    return '1-2 hours'
  }
}

// Express.js route handlers (if using Express)
export const terminologyRoutes = {
  // POST /api/terminology/validate
  validate: async (
    req: { body: ValidationRequest },
    res: { status: (code: number) => { json: (data: unknown) => void } }
  ) => {
    const result = await TerminologyAPI.validate(req.body)
    res.status(result.success ? 200 : 400).json(result)
  },

  // POST /api/terminology/batch-validate
  batchValidate: async (
    req: { body: BatchValidationRequest },
    res: { status: (code: number) => { json: (data: unknown) => void } }
  ) => {
    const result = await TerminologyAPI.batchValidate(req.body)
    res.status(result.success ? 200 : 400).json(result)
  },

  // POST /api/terminology/autofix
  autofix: async (
    req: { body: { content: string; analysis: FileAnalysis } },
    res: { status: (code: number) => { json: (data: unknown) => void } }
  ) => {
    const result = await TerminologyAPI.autofix(req.body.content, req.body.analysis)
    res.status(result.success ? 200 : 400).json(result)
  },

  // GET /api/terminology/search
  search: async (
    req: { query: TermSearchRequest },
    res: { status: (code: number) => { json: (data: unknown) => void } }
  ) => {
    const result = await TerminologyAPI.searchTerms(req.query)
    res.status(result.success ? 200 : 400).json(result)
  },

  // GET /api/terminology/:id
  getTerm: async (
    req: { params: { id: string } },
    res: { status: (code: number) => { json: (data: unknown) => void } }
  ) => {
    const result = await TerminologyAPI.getTerm(req.params.id)
    res.status(result.success ? 200 : 404).json(result)
  },

  // GET /api/terminology/rules
  getRules: async (
    req: unknown,
    res: { status: (code: number) => { json: (data: unknown) => void } }
  ) => {
    const result = await TerminologyAPI.getValidationRules()
    res.status(result.success ? 200 : 400).json(result)
  },

  // POST /api/terminology/rules
  addRule: async (
    req: { body: ValidationRule },
    res: { status: (code: number) => { json: (data: unknown) => void } }
  ) => {
    const result = await TerminologyAPI.addCustomRule(req.body)
    res.status(result.success ? 200 : 400).json(result)
  },

  // GET /api/terminology/metrics
  getMetrics: async (
    req: { query: TeamMetricsRequest },
    res: { status: (code: number) => { json: (data: unknown) => void } }
  ) => {
    const result = await TerminologyAPI.getTeamMetrics(req.query)
    res.status(result.success ? 200 : 400).json(result)
  },

  // GET /api/terminology/learning/:topic
  getLearning: async (
    req: { params: { topic: string } },
    res: { status: (code: number) => { json: (data: unknown) => void } }
  ) => {
    const result = await TerminologyAPI.getLearningResources(req.params.topic)
    res.status(result.success ? 200 : 404).json(result)
  },

  // DELETE /api/terminology/cache
  clearCache: async (
    req: unknown,
    res: { status: (code: number) => { json: (data: unknown) => void } }
  ) => {
    const result = await TerminologyAPI.clearCache()
    res.status(result.success ? 200 : 400).json(result)
  },
}
