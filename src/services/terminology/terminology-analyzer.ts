/**
 * PMP Terminology Analyzer Engine
 * Advanced semantic analysis and context-aware validation
 */

import {
  TerminologyEntry,
  ValidationRule,
  pmpTerminologyDatabase,
  validationRules,
  contextRules,
  severityConfig,
  regionalVariations,
  learningResources,
} from '../../data/terminology/pmp-terminology-database'

export interface AnalysisResult {
  file: string
  line: number
  column: number
  severity: 'error' | 'warning' | 'suggestion' | 'info'
  term: string
  message: string
  suggestion?: string
  autofix?: boolean
  context?: string
  learningResources?: string[]
  rule?: string
  confidence: number // 0-1 confidence score
}

export interface FileAnalysis {
  file: string
  language: string
  errors: AnalysisResult[]
  warnings: AnalysisResult[]
  suggestions: AnalysisResult[]
  info: AnalysisResult[]
  metrics: AnalysisMetrics
  autofixAvailable: boolean
}

export interface AnalysisMetrics {
  totalIssues: number
  errorCount: number
  warningCount: number
  suggestionCount: number
  infoCount: number
  terminologyScore: number // 0-100
  consistencyScore: number // 0-100
  pmbokCompliance: number // 0-100
  commonMistakes: Map<string, number>
  knowledgeGaps: string[]
}

export interface ContextInfo {
  fileType: 'code' | 'documentation' | 'test' | 'config'
  language: string
  isComment: boolean
  isString: boolean
  isIdentifier: boolean
  surroundingText: string
  semanticRole?: string
}

export class TerminologyAnalyzer {
  private cache: Map<string, FileAnalysis> = new Map()
  private customRules: ValidationRule[] = []
  private region: 'US' | 'UK' = 'US'
  private pmbokVersion: 6 | 7 = 7
  private strictMode: boolean = false
  private learningMode: boolean = true

  constructor(options?: {
    region?: 'US' | 'UK'
    pmbokVersion?: 6 | 7
    strictMode?: boolean
    learningMode?: boolean
    customRules?: ValidationRule[]
  }) {
    if (options) {
      this.region = options.region || 'US'
      this.pmbokVersion = options.pmbokVersion || 7
      this.strictMode = options.strictMode || false
      this.learningMode = options.learningMode !== undefined ? options.learningMode : true
      this.customRules = options.customRules || []
    }
  }

  /**
   * Analyze a file for terminology issues
   */
  public async analyzeFile(
    filePath: string,
    content: string,
    options?: {
      useCache?: boolean
      contextAware?: boolean
      semanticAnalysis?: boolean
    }
  ): Promise<FileAnalysis> {
    // Check cache
    if (options?.useCache && this.cache.has(filePath)) {
      return this.cache.get(filePath)!
    }

    const fileType = this.detectFileType(filePath)
    const language = this.detectLanguage(filePath)
    const lines = content.split('\n')
    const results: AnalysisResult[] = []

    // Analyze each line
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]
      const lineResults = await this.analyzeLine(line, lineNum + 1, filePath, {
        fileType,
        language,
        contextAware: options?.contextAware,
        semanticAnalysis: options?.semanticAnalysis,
        previousLine: lineNum > 0 ? lines[lineNum - 1] : undefined,
        nextLine: lineNum < lines.length - 1 ? lines[lineNum + 1] : undefined,
      })
      results.push(...lineResults)
    }

    // Apply custom rules
    const customResults = this.applyCustomRules(content, filePath)
    results.push(...customResults)

    // Regional variations check
    if (this.region) {
      const regionalResults = this.checkRegionalVariations(content, filePath)
      results.push(...regionalResults)
    }

    // Categorize results
    const analysis: FileAnalysis = {
      file: filePath,
      language,
      errors: results.filter((r) => r.severity === 'error'),
      warnings: results.filter((r) => r.severity === 'warning'),
      suggestions: results.filter((r) => r.severity === 'suggestion'),
      info: results.filter((r) => r.severity === 'info'),
      metrics: this.calculateMetrics(results, content),
      autofixAvailable: results.some((r) => r.autofix),
    }

    // Cache results
    if (options?.useCache) {
      this.cache.set(filePath, analysis)
    }

    return analysis
  }

  /**
   * Analyze a single line for terminology issues
   */
  private async analyzeLine(
    line: string,
    lineNumber: number,
    filePath: string,
    context: {
      fileType: string
      language: string
      contextAware?: boolean
      semanticAnalysis?: boolean
      previousLine?: string
      nextLine?: string
    }
  ): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = []

    // Skip empty lines and certain patterns
    if (!line.trim() || this.shouldSkipLine(line, context)) {
      return results
    }

    // Check against terminology database
    for (const term of pmpTerminologyDatabase) {
      // Skip terms not relevant to current PMBOK version
      if (this.pmbokVersion === 6 && !term.pmbok6) {
        continue
      }
      if (this.pmbokVersion === 7 && !term.pmbok7) {
        continue
      }

      // Check for deprecated terms
      if (term.deprecated && term.deprecated.length > 0) {
        for (const deprecated of term.deprecated) {
          const regex = new RegExp(`\\b${this.escapeRegex(deprecated)}\\b`, 'gi')
          let match

          while ((match = regex.exec(line)) !== null) {
            // Context-aware check
            if (context.contextAware) {
              const contextInfo = this.getContextInfo(line, match.index, match[0], context)

              if (this.shouldSkipBasedOnContext(contextInfo)) {
                continue
              }
            }

            // Semantic analysis
            let confidence = 0.8
            if (context.semanticAnalysis) {
              confidence = await this.calculateSemanticConfidence(
                deprecated,
                term.canonical,
                line,
                context
              )

              if (confidence < 0.5) {
                continue // Skip low confidence matches
              }
            }

            results.push({
              file: filePath,
              line: lineNumber,
              column: match.index + 1,
              severity: term.severity,
              term: match[0],
              message: `Use "${term.canonical}" instead of "${match[0]}"`,
              suggestion:
                line.substring(0, match.index) +
                term.canonical +
                line.substring(match.index + match[0].length),
              autofix: term.autofix,
              context: this.getTermContext(term),
              learningResources: this.getLearningResources(term),
              rule: term.id,
              confidence,
            })
          }
        }
      }

      // Check using custom patterns
      if (term.pattern) {
        let match
        const pattern = new RegExp(term.pattern.source, term.pattern.flags)

        while ((match = pattern.exec(line)) !== null) {
          // Check exclude pattern
          if (term.excludePattern) {
            const excludeMatch = term.excludePattern.test(line)
            if (excludeMatch) {
              continue
            }
          }

          results.push({
            file: filePath,
            line: lineNumber,
            column: match.index + 1,
            severity: term.severity,
            term: match[0],
            message: `Consider using "${term.canonical}" for consistency`,
            suggestion: term.canonical,
            autofix: term.autofix,
            context: this.getTermContext(term),
            learningResources: this.getLearningResources(term),
            rule: term.id,
            confidence: 0.9,
          })
        }
      }
    }

    // Check validation rules
    for (const rule of validationRules) {
      if (!this.isRuleApplicable(rule, filePath)) {
        continue
      }

      let match
      while ((match = rule.pattern.exec(line)) !== null) {
        results.push({
          file: filePath,
          line: lineNumber,
          column: match.index + 1,
          severity: rule.severity,
          term: match[0],
          message: rule.description,
          suggestion: rule.replacement
            ? line.substring(0, match.index) +
              match[0].replace(rule.pattern, rule.replacement) +
              line.substring(match.index + match[0].length)
            : undefined,
          autofix: !!rule.replacement,
          rule: rule.id,
          confidence: 0.85,
        })
      }
    }

    return results
  }

  /**
   * Apply custom validation rules
   */
  private applyCustomRules(content: string, filePath: string): AnalysisResult[] {
    const results: AnalysisResult[] = []
    const lines = content.split('\n')

    for (const rule of this.customRules) {
      if (!this.isRuleApplicable(rule, filePath)) {
        continue
      }

      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum]
        let match

        while ((match = rule.pattern.exec(line)) !== null) {
          results.push({
            file: filePath,
            line: lineNum + 1,
            column: match.index + 1,
            severity: rule.severity,
            term: match[0],
            message: rule.description,
            suggestion: rule.replacement
              ? match[0].replace(rule.pattern, rule.replacement)
              : undefined,
            autofix: !!rule.replacement,
            rule: rule.id,
            confidence: 0.75,
          })
        }
      }
    }

    return results
  }

  /**
   * Check for regional spelling variations
   */
  private checkRegionalVariations(content: string, filePath: string): AnalysisResult[] {
    const results: AnalysisResult[] = []
    const variations = regionalVariations[this.region].spelling
    const lines = content.split('\n')

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]

      for (const variation of variations) {
        const incorrectSpelling = this.region === 'US' ? variation.uk : variation.us
        const correctSpelling = this.region === 'US' ? variation.us : variation.uk
        const regex = new RegExp(`\\b${incorrectSpelling}\\b`, 'gi')
        let match

        while ((match = regex.exec(line)) !== null) {
          results.push({
            file: filePath,
            line: lineNum + 1,
            column: match.index + 1,
            severity: 'info',
            term: match[0],
            message: `Regional spelling: use "${correctSpelling}" for ${this.region} English`,
            suggestion: correctSpelling,
            autofix: true,
            rule: 'regional-spelling',
            confidence: 0.95,
          })
        }
      }
    }

    return results
  }

  /**
   * Calculate semantic confidence score
   */
  private async calculateSemanticConfidence(
    found: string,
    expected: string,
    line: string,
    context: any
  ): Promise<number> {
    // Simple semantic analysis based on context
    let confidence = 0.5

    // Check if terms are in similar semantic context
    const foundLower = found.toLowerCase()
    const expectedLower = expected.toLowerCase()

    // Exact match increases confidence
    if (foundLower === expectedLower) {
      confidence = 1.0
    }
    // Partial match
    else if (foundLower.includes(expectedLower) || expectedLower.includes(foundLower)) {
      confidence = 0.8
    }
    // Check surrounding words for context
    else {
      const words = line.toLowerCase().split(/\s+/)
      const foundIndex = words.findIndex((w) => w.includes(foundLower))

      if (foundIndex > -1) {
        // Check adjacent words for project management context
        const pmKeywords = [
          'project',
          'management',
          'pmbok',
          'pmi',
          'scope',
          'schedule',
          'cost',
          'quality',
          'risk',
        ]
        const adjacentWords = [words[foundIndex - 1], words[foundIndex + 1]].filter(Boolean)

        if (adjacentWords.some((w) => pmKeywords.includes(w))) {
          confidence += 0.3
        }
      }
    }

    // Adjust based on file type
    if (context.fileType === 'documentation') {
      confidence += 0.1
    } else if (context.fileType === 'code' && !this.isInComment(line)) {
      confidence -= 0.1
    }

    return Math.min(1.0, Math.max(0, confidence))
  }

  /**
   * Get context information for a match
   */
  private getContextInfo(line: string, position: number, term: string, context: any): ContextInfo {
    const isComment = this.isInComment(line)
    const isString = this.isInString(line, position)
    const isIdentifier = this.isIdentifier(line, position)

    return {
      fileType: context.fileType,
      language: context.language,
      isComment,
      isString,
      isIdentifier,
      surroundingText: line.substring(
        Math.max(0, position - 20),
        Math.min(line.length, position + term.length + 20)
      ),
      semanticRole: this.detectSemanticRole(line, position, term),
    }
  }

  /**
   * Calculate analysis metrics
   */
  private calculateMetrics(results: AnalysisResult[], content: string): AnalysisMetrics {
    const totalIssues = results.length
    const errorCount = results.filter((r) => r.severity === 'error').length
    const warningCount = results.filter((r) => r.severity === 'warning').length
    const suggestionCount = results.filter((r) => r.severity === 'suggestion').length
    const infoCount = results.filter((r) => r.severity === 'info').length

    // Calculate terminology score (100 = perfect)
    const lines = content.split('\n').length
    const issuesPerLine = totalIssues / Math.max(1, lines)
    const terminologyScore = Math.max(0, Math.round(100 - issuesPerLine * 50))

    // Calculate consistency score
    const uniqueTerms = new Set(results.map((r) => r.term.toLowerCase()))
    const consistencyScore = Math.max(0, Math.round(100 - uniqueTerms.size * 5))

    // Calculate PMBOK compliance
    const pmbokErrors = results.filter(
      (r) => r.rule && pmpTerminologyDatabase.find((t) => t.id === r.rule)
    ).length
    const pmbokCompliance = Math.max(0, Math.round(100 - pmbokErrors * 10))

    // Track common mistakes
    const commonMistakes = new Map<string, number>()
    for (const result of results) {
      const count = commonMistakes.get(result.term) || 0
      commonMistakes.set(result.term, count + 1)
    }

    // Identify knowledge gaps
    const knowledgeGaps: string[] = []
    const errorsByArea = new Map<string, number>()

    for (const result of results) {
      if (result.rule) {
        const term = pmpTerminologyDatabase.find((t) => t.id === result.rule)
        if (term?.knowledgeArea) {
          for (const area of term.knowledgeArea) {
            const count = errorsByArea.get(area) || 0
            errorsByArea.set(area, count + 1)
          }
        }
      }
    }

    // Top 3 knowledge areas with issues
    const sortedAreas = Array.from(errorsByArea.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([area]) => area)
    knowledgeGaps.push(...sortedAreas)

    return {
      totalIssues,
      errorCount,
      warningCount,
      suggestionCount,
      infoCount,
      terminologyScore,
      consistencyScore,
      pmbokCompliance,
      commonMistakes,
      knowledgeGaps,
    }
  }

  /**
   * Helper methods
   */
  private detectFileType(filePath: string): string {
    if (filePath.endsWith('.md')) {
      return 'documentation'
    }
    if (filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts')) {
      return 'test'
    }
    if (filePath.endsWith('.json') || filePath.endsWith('.yml')) {
      return 'config'
    }
    return 'code'
  }

  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      md: 'markdown',
      json: 'json',
      yml: 'yaml',
      yaml: 'yaml',
    }
    return languageMap[ext || ''] || 'unknown'
  }

  private shouldSkipLine(line: string, context: any): boolean {
    // Skip import/export statements
    if (/^\s*(import|export)\s/.test(line)) {
      return true
    }

    // Skip URLs and email addresses
    if (/https?:\/\/|@\w+\.\w+/.test(line)) {
      return true
    }

    // Skip base64 or long hash strings
    if (/[a-zA-Z0-9]{40,}/.test(line)) {
      return true
    }

    return false
  }

  private shouldSkipBasedOnContext(context: ContextInfo): boolean {
    // Skip if in a URL or file path
    if (/[\/\\]/.test(context.surroundingText)) {
      return true
    }

    // Skip if in a technical identifier (e.g., variable names in code)
    if (context.fileType === 'code' && context.isIdentifier && !context.isComment) {
      return this.strictMode ? false : true
    }

    return false
  }

  private isInComment(line: string): boolean {
    return /^\s*\/\/|^\s*\/\*|^\s*\*|<!--/.test(line)
  }

  private isInString(line: string, position: number): boolean {
    const beforePosition = line.substring(0, position)
    const singleQuotes = (beforePosition.match(/'/g) || []).length
    const doubleQuotes = (beforePosition.match(/"/g) || []).length
    const backticks = (beforePosition.match(/`/g) || []).length

    return singleQuotes % 2 === 1 || doubleQuotes % 2 === 1 || backticks % 2 === 1
  }

  private isIdentifier(line: string, position: number): boolean {
    // Check if the term is part of a variable/function name
    const beforeChar = line[position - 1]
    const afterChar = line[position + line.match(/\w+/)?.[0]?.length || 0]

    return /[a-zA-Z_$]/.test(beforeChar || '') || /[a-zA-Z0-9_$]/.test(afterChar || '')
  }

  private detectSemanticRole(line: string, position: number, term: string): string {
    // Simple semantic role detection
    if (/^#/.test(line.trim())) {
      return 'heading'
    }
    if (/^\s*\*/.test(line)) {
      return 'list-item'
    }
    if (/\b(const|let|var|function|class)\b/.test(line)) {
      return 'declaration'
    }
    if (/\b(describe|it|test)\b/.test(line)) {
      return 'test'
    }
    return 'content'
  }

  private isRuleApplicable(rule: ValidationRule, filePath: string): boolean {
    if (!rule.fileTypes || rule.fileTypes.length === 0) {
      return true
    }

    return rule.fileTypes.some((pattern) => {
      const regex = new RegExp(pattern.replace('*', '.*'))
      return regex.test(filePath)
    })
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  private getTermContext(term: TerminologyEntry): string {
    const contexts = term.context.map((c) => c.example).join('; ')
    return `${term.definition}. Examples: ${contexts}`
  }

  private getLearningResources(term: TerminologyEntry): string[] {
    const resources: string[] = []

    // Add links from learning resources mapping
    if (term.knowledgeArea) {
      for (const area of term.knowledgeArea) {
        const areaResources = learningResources[area]
        if (areaResources?.links) {
          resources.push(...areaResources.links)
        }
      }
    }

    // Add PMBOK references
    if (term.pmbok6) {
      resources.push('PMBOK Guide 6th Edition')
    }
    if (term.pmbok7) {
      resources.push('PMBOK Guide 7th Edition')
    }

    return [...new Set(resources)] // Remove duplicates
  }

  /**
   * Generate autofix for a file
   */
  public generateAutofix(analysis: FileAnalysis, content: string): string {
    const fixedContent = content
    const lines = fixedContent.split('\n')

    // Sort results by line and column (reverse order to maintain positions)
    const fixableResults = [...analysis.errors, ...analysis.warnings]
      .filter((r) => r.autofix && r.suggestion)
      .sort((a, b) => {
        if (a.line === b.line) {
          return b.column - a.column
        }
        return b.line - a.line
      })

    for (const result of fixableResults) {
      const lineIndex = result.line - 1
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex]
        const before = line.substring(0, result.column - 1)
        const after = line.substring(result.column - 1 + result.term.length)

        // Extract just the replacement term from the suggestion
        const replacement = this.extractReplacement(result)
        lines[lineIndex] = before + replacement + after
      }
    }

    return lines.join('\n')
  }

  private extractReplacement(result: AnalysisResult): string {
    // If suggestion contains the full line, extract just the replacement
    if (result.suggestion && result.suggestion.length > result.term.length * 2) {
      // Find the term in the database
      const dbTerm = pmpTerminologyDatabase.find((t) => t.id === result.rule)
      return dbTerm?.canonical || result.term
    }
    return result.suggestion || result.term
  }

  /**
   * Clear analysis cache
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * Update configuration
   */
  public updateConfig(options: {
    region?: 'US' | 'UK'
    pmbokVersion?: 6 | 7
    strictMode?: boolean
    learningMode?: boolean
  }): void {
    if (options.region) {
      this.region = options.region
    }
    if (options.pmbokVersion) {
      this.pmbokVersion = options.pmbokVersion
    }
    if (options.strictMode !== undefined) {
      this.strictMode = options.strictMode
    }
    if (options.learningMode !== undefined) {
      this.learningMode = options.learningMode
    }

    // Clear cache when config changes
    this.clearCache()
  }

  /**
   * Add custom rules
   */
  public addCustomRule(rule: ValidationRule): void {
    this.customRules.push(rule)
  }

  /**
   * Remove custom rule
   */
  public removeCustomRule(ruleId: string): void {
    this.customRules = this.customRules.filter((r) => r.id !== ruleId)
  }
}
