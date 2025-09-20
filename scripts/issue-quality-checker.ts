#!/usr/bin/env node
/**
 * Issue Quality Checker
 * TypeScript version with enhanced type safety and GitHub Actions integration
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import type {
  ScriptResult,
  ScriptOptions,
  LogLevel,
  IssueQualityMetrics,
  GitHubIssue,
  QualityStandards,
  IssueType,
  IssueSeverity,
  QualityCheck,
  QualityRecommendation,
  SLACompliance,
} from '../src/types/devops/scripts'

// ==================== Type Definitions ====================

interface IssueQualityConfig {
  qualityStandards: QualityStandards
  outputFormats: ('console' | 'json' | 'markdown')[]
  enableSLACheck: boolean
  generateReport: boolean
}

interface QualityCheckResult {
  valid: boolean
  score: number
  issues: string[]
  isSecurityIssue?: boolean
}

interface ComprehensiveQualityResult {
  checks: Record<string, QualityCheckResult>
  score: number
  recommendations: QualityRecommendation[]
  severity: IssueSeverity
  needsImprovement: boolean
  isCompliant: boolean
  slaCompliance?: SLACompliance
}

interface QualityReportData {
  issue: GitHubIssue
  qualityResult: ComprehensiveQualityResult
  timestamp: string
  generatedBy: string
}

interface GitHubActionContext {
  github: any
  context: any
  core: any
}

// ==================== Constants ====================

const CONFIG: IssueQualityConfig = {
  qualityStandards: {
    title: {
      minLength: 10,
      maxLength: 200,
      forbiddenPatterns: [/^test$/i, /^fix$/i, /^bug$/i, /^issue$/i, /^problem$/i, /^\s*$/],
      requiredPatterns: {
        bug: /\[(bug|error|問題)\]/i,
        feature: /\[(feature|機能|要望)\]/i,
        security: /\[(security|セキュリティ)\]/i,
      },
    },
    description: {
      minLength: 50,
      maxLength: 5000,
      requiredSections: {
        bug: ['## Bug Description', '## Steps to Reproduce', '## Expected Behavior'],
        feature: ['## Feature Summary', '## Problem Statement', '## Proposed Solution'],
        security: [
          '## Security Issue Summary',
          '## Affected Components',
          '## Severity Assessment',
        ],
      },
    },
    labels: {
      required: true,
      priority: ['priority:critical', 'priority:high', 'priority:medium', 'priority:low'],
      component: ['component:', 'area:'],
      type: ['bug', 'enhancement', 'security', 'documentation'],
    },
    sla: {
      'priority:critical': 2, // hours
      'priority:high': 24,
      'priority:medium': 72,
      'priority:low': 168,
      security: 1,
      bug: 48,
    },
  },
  outputFormats: ['console', 'json'],
  enableSLACheck: true,
  generateReport: true,
}

// ==================== Main Class ====================

class IssueQualityChecker {
  private config: IssueQualityConfig
  private githubContext?: GitHubActionContext

  constructor(githubContext?: GitHubActionContext, customConfig?: Partial<IssueQualityConfig>) {
    this.githubContext = githubContext
    this.config = { ...CONFIG, ...customConfig }
  }

  private log(message: string, level: LogLevel = 'info'): void {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      fatal: '💀',
    }[level]

    console.log(`${emoji} ${message}`)

    // GitHub Actions core logging if available
    if (this.githubContext?.core) {
      switch (level) {
        case 'error':
        case 'fatal':
          this.githubContext.core.error(message)
          break
        case 'warn':
          this.githubContext.core.warning(message)
          break
        case 'debug':
          this.githubContext.core.debug(message)
          break
        default:
          this.githubContext.core.info(message)
      }
    }
  }

  /**
   * Issue品質総合チェック
   */
  async checkIssueQuality(issue: GitHubIssue): Promise<ComprehensiveQualityResult> {
    this.log(`Analyzing issue quality for: ${issue.title}`, 'info')

    const checks: Record<string, QualityCheckResult> = {
      title: this.checkTitle(issue),
      description: this.checkDescription(issue),
      labels: this.checkLabels(issue),
      template: this.checkTemplate(issue),
      security: this.checkSecurityCompliance(issue),
      assignee: this.checkAssignee(issue),
      priority: this.checkPriority(issue),
      component: this.checkComponent(issue),
    }

    const score = this.calculateQualityScore(checks)
    const recommendations = this.generateRecommendations(checks, issue)
    const severity = this.assessIssueSeverity(issue)
    const slaCompliance = this.config.enableSLACheck ? this.checkSLACompliance(issue) : undefined

    return {
      checks,
      score,
      recommendations,
      severity,
      needsImprovement: score < 70,
      isCompliant: score >= 80,
      slaCompliance,
    }
  }

  /**
   * タイトル品質チェック
   */
  private checkTitle(issue: GitHubIssue): QualityCheckResult {
    const title = issue.title || ''
    const result: QualityCheckResult = {
      valid: true,
      score: 0,
      issues: [],
    }

    // 長さチェック
    if (title.length < this.config.qualityStandards.title.minLength) {
      result.valid = false
      result.issues.push(
        `タイトルが短すぎます（${title.length}文字 < ${this.config.qualityStandards.title.minLength}文字）`
      )
    } else {
      result.score += 20
    }

    if (title.length > this.config.qualityStandards.title.maxLength) {
      result.issues.push(
        `タイトルが長すぎます（${title.length}文字 > ${this.config.qualityStandards.title.maxLength}文字）`
      )
      result.score -= 10
    }

    // 禁止パターンチェック
    const forbiddenMatch = this.config.qualityStandards.title.forbiddenPatterns.find((pattern) =>
      pattern.test(title)
    )
    if (forbiddenMatch) {
      result.valid = false
      result.issues.push('タイトルが具体的でありません（一般的すぎる表現）')
    } else {
      result.score += 10
    }

    // タグパターンチェック
    const hasProperTag = Object.values(this.config.qualityStandards.title.requiredPatterns).some(
      (pattern) => pattern.test(title)
    )
    if (hasProperTag) {
      result.score += 20
    } else {
      result.issues.push('タイトルに適切なタグ（[BUG], [FEATURE], [SECURITY]など）がありません')
    }

    result.score = Math.max(0, Math.min(100, result.score))
    return result
  }

  /**
   * 説明文品質チェック
   */
  private checkDescription(issue: GitHubIssue): QualityCheckResult {
    const body = issue.body || ''
    const result: QualityCheckResult = {
      valid: true,
      score: 0,
      issues: [],
    }

    // 長さチェック
    if (body.length < this.config.qualityStandards.description.minLength) {
      result.valid = false
      result.issues.push(
        `説明文が短すぎます（${body.length}文字 < ${this.config.qualityStandards.description.minLength}文字）`
      )
    } else {
      result.score += 30
    }

    // 必要セクションチェック
    const issueType = this.detectIssueType(issue)
    const requiredSections = this.config.qualityStandards.description.requiredSections[issueType] || []

    let sectionsFound = 0
    for (const section of requiredSections) {
      if (body.includes(section)) {
        sectionsFound++
      } else {
        result.issues.push(`必要なセクション「${section}」がありません`)
      }
    }

    if (requiredSections.length > 0) {
      result.score += Math.round((sectionsFound / requiredSections.length) * 40)
    } else {
      result.score += 20 // 特定タイプでない場合のデフォルトスコア
    }

    // コードブロックや構造化テキストのチェック
    const hasCodeBlocks = /```[\s\S]*?```/.test(body)
    const hasLists = /^\s*[-*+]\s+/m.test(body) || /^\s*\d+\.\s+/m.test(body)
    const hasHeaders = /^#+\s+/m.test(body)

    if (hasCodeBlocks || hasLists || hasHeaders) {
      result.score += 30
    } else {
      result.issues.push('構造化された情報（リスト、ヘッダー、コードブロック）がありません')
    }

    result.score = Math.max(0, Math.min(100, result.score))
    return result
  }

  /**
   * ラベル品質チェック
   */
  private checkLabels(issue: GitHubIssue): QualityCheckResult {
    const labels = (issue.labels || []).map((label) =>
      typeof label === 'string' ? label : label.name
    )

    const result: QualityCheckResult = {
      valid: true,
      score: 0,
      issues: [],
    }

    // ラベル存在チェック
    if (labels.length === 0) {
      result.valid = false
      result.issues.push('ラベルが設定されていません')
      return result
    }

    result.score += 20

    // 優先度ラベルチェック
    const hasPriority = labels.some((label) =>
      this.config.qualityStandards.labels.priority.includes(label)
    )
    if (hasPriority) {
      result.score += 30
    } else {
      result.issues.push('優先度ラベル（priority:xxx）がありません')
    }

    // コンポーネントラベルチェック
    const hasComponent = labels.some((label) =>
      this.config.qualityStandards.labels.component.some((prefix) => label.startsWith(prefix))
    )
    if (hasComponent) {
      result.score += 25
    } else {
      result.issues.push('コンポーネント/エリアラベルがありません')
    }

    // タイプラベルチェック
    const hasType = labels.some((label) => this.config.qualityStandards.labels.type.includes(label))
    if (hasType) {
      result.score += 25
    } else {
      result.issues.push('種類ラベル（bug, enhancement, etc）がありません')
    }

    result.score = Math.max(0, Math.min(100, result.score))
    return result
  }

  /**
   * テンプレート利用チェック
   */
  private checkTemplate(issue: GitHubIssue): QualityCheckResult {
    const body = issue.body || ''
    const result: QualityCheckResult = {
      valid: true,
      score: 0,
      issues: [],
    }

    const templateIndicators = [
      '## Bug Description',
      '## Steps to Reproduce',
      '## Expected Behavior',
      '## Feature Summary',
      '## Problem Statement',
      '## Security Issue Summary',
      '## Affected Components',
    ]

    const foundIndicators = templateIndicators.filter((indicator) => body.includes(indicator))

    if (foundIndicators.length === 0) {
      result.issues.push('Issueテンプレートが使用されていません')
      result.score = 0
    } else {
      result.score = Math.round((foundIndicators.length / templateIndicators.length) * 100)
    }

    return result
  }

  /**
   * セキュリティコンプライアンスチェック
   */
  private checkSecurityCompliance(issue: GitHubIssue): QualityCheckResult {
    const labels = (issue.labels || []).map((label) =>
      typeof label === 'string' ? label : label.name
    )

    const result: QualityCheckResult = {
      valid: true,
      score: 100,
      issues: [],
      isSecurityIssue: false,
    }

    // セキュリティIssueかどうか判定
    const securityLabels = ['security', 'vulnerability', 'auth', 'authorization']
    result.isSecurityIssue = labels.some((label) =>
      securityLabels.some((secLabel) => label.toLowerCase().includes(secLabel))
    )

    if (result.isSecurityIssue) {
      // セキュリティIssue特有のチェック
      const body = issue.body || ''

      // 必要な情報の確認
      const requiredSecurityInfo = [
        '## Security Issue Summary',
        '## Affected Components',
        '## Severity Assessment',
        '## Impact Assessment',
      ]

      const missingInfo = requiredSecurityInfo.filter((info) => !body.includes(info))
      if (missingInfo.length > 0) {
        result.issues.push(`セキュリティIssueに必要な情報が不足: ${missingInfo.join(', ')}`)
        result.score -= missingInfo.length * 25
      }

      // 適切な優先度設定の確認
      const hasCriticalPriority = labels.includes('priority:critical')
      if (!hasCriticalPriority) {
        result.issues.push('セキュリティIssueには priority:critical ラベルが必要です')
        result.score -= 30
      }

      // 公開情報の確認（機密情報の漏洩チェック）
      const sensitivePatterns = [
        /password\s*[:=]\s*[\w\d]+/i,
        /api[_-]?key\s*[:=]\s*[\w\d-]+/i,
        /secret\s*[:=]\s*[\w\d]+/i,
        /token\s*[:=]\s*[\w\d.-]+/i,
      ]

      const hasSensitiveData = sensitivePatterns.some((pattern) => pattern.test(body))
      if (hasSensitiveData) {
        result.issues.push('⚠️ 機密情報が含まれている可能性があります')
        result.score -= 50
      }
    }

    result.score = Math.max(0, Math.min(100, result.score))
    return result
  }

  /**
   * 担当者アサイン状況チェック
   */
  private checkAssignee(issue: GitHubIssue): QualityCheckResult {
    const result: QualityCheckResult = {
      valid: true,
      score: 0,
      issues: [],
    }

    if (issue.assignees && issue.assignees.length > 0) {
      result.score = 100
    } else {
      // 優先度によってアサイン必須度を変える
      const labels = (issue.labels || []).map((label) =>
        typeof label === 'string' ? label : label.name
      )

      const isCritical = labels.includes('priority:critical') || labels.includes('security')
      if (isCritical) {
        result.valid = false
        result.issues.push('クリティカルなIssueには担当者のアサインが必要です')
      } else {
        result.issues.push('担当者がアサインされていません')
        result.score = 50 // 必須ではないが推奨
      }
    }

    return result
  }

  /**
   * 優先度適切性チェック
   */
  private checkPriority(issue: GitHubIssue): QualityCheckResult {
    const labels = (issue.labels || []).map((label) =>
      typeof label === 'string' ? label : label.name
    )

    const result: QualityCheckResult = {
      valid: true,
      score: 0,
      issues: [],
    }

    const priorityLabels = labels.filter((label) => label.startsWith('priority:'))

    if (priorityLabels.length === 0) {
      result.valid = false
      result.issues.push('優先度ラベルが設定されていません')
      return result
    }

    if (priorityLabels.length > 1) {
      result.issues.push('複数の優先度ラベルが設定されています')
      result.score = 50
    } else {
      result.score = 100
    }

    // セキュリティIssueの優先度チェック
    const hasSecurityLabel = labels.some((label) => label.includes('security'))
    const hasCriticalPriority = priorityLabels.includes('priority:critical')

    if (hasSecurityLabel && !hasCriticalPriority) {
      result.issues.push('セキュリティIssueには critical 優先度が推奨されます')
      result.score -= 25
    }

    result.score = Math.max(0, Math.min(100, result.score))
    return result
  }

  /**
   * コンポーネント分類チェック
   */
  private checkComponent(issue: GitHubIssue): QualityCheckResult {
    const labels = (issue.labels || []).map((label) =>
      typeof label === 'string' ? label : label.name
    )

    const result: QualityCheckResult = {
      valid: true,
      score: 0,
      issues: [],
    }

    const componentLabels = labels.filter(
      (label) => label.startsWith('component:') || label.startsWith('area:')
    )

    if (componentLabels.length === 0) {
      result.issues.push('コンポーネント/エリアラベルがありません')
      result.score = 30 // 完全に必須ではないが重要
    } else if (componentLabels.length > 3) {
      result.issues.push('コンポーネントラベルが多すぎます（3つ以下推奨）')
      result.score = 70
    } else {
      result.score = 100
    }

    return result
  }

  /**
   * Issue種類の検出
   */
  private detectIssueType(issue: GitHubIssue): IssueType {
    const title = (issue.title || '').toLowerCase()
    const labels = (issue.labels || [])
      .map((label) => (typeof label === 'string' ? label : label.name))
      .map((label) => label.toLowerCase())

    if (labels.includes('security') || title.includes('security')) {
      return 'security'
    } else if (labels.includes('bug') || title.includes('bug') || title.includes('error')) {
      return 'bug'
    } else if (
      labels.includes('enhancement') ||
      labels.includes('feature') ||
      title.includes('feature')
    ) {
      return 'feature'
    }

    return 'general'
  }

  /**
   * 品質スコア計算
   */
  private calculateQualityScore(checks: Record<string, QualityCheckResult>): number {
    const weights = {
      title: 0.15,
      description: 0.2,
      labels: 0.15,
      template: 0.1,
      security: 0.15,
      assignee: 0.1,
      priority: 0.1,
      component: 0.05,
    }

    let totalScore = 0
    let totalWeight = 0

    for (const [category, check] of Object.entries(checks)) {
      if ((weights as any)[category] && typeof check.score === 'number') {
        totalScore += check.score * (weights as any)[category]
        totalWeight += (weights as any)[category]
      }
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
  }

  /**
   * 改善提案生成
   */
  private generateRecommendations(
    checks: Record<string, QualityCheckResult>,
    issue: GitHubIssue
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = []

    for (const [category, check] of Object.entries(checks)) {
      if (check.issues && check.issues.length > 0) {
        recommendations.push({
          category: category as any,
          priority: this.getRecommendationPriority(category),
          issues: check.issues,
          suggestions: this.getImprovementSuggestions(category, check, issue),
        })
      }
    }

    return recommendations.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 推奨事項の優先度計算
   */
  private getRecommendationPriority(category: string): number {
    const priorities: Record<string, number> = {
      security: 100,
      priority: 90,
      labels: 80,
      title: 70,
      description: 60,
      assignee: 50,
      template: 40,
      component: 30,
    }

    return priorities[category] || 20
  }

  /**
   * 改善提案の生成
   */
  private getImprovementSuggestions(
    category: string,
    check: QualityCheckResult,
    issue: GitHubIssue
  ): string[] {
    const suggestions: Record<string, string[]> = {
      title: [
        'より具体的で説明的なタイトルを使用してください',
        '適切なタグ（[BUG], [FEATURE], [SECURITY]など）を含めてください',
        'タイトルの長さを10-200文字に調整してください',
      ],
      description: [
        'Issueテンプレートを使用して構造化された情報を提供してください',
        '問題の詳細、再現手順、期待する結果を明記してください',
        'コードブロック、リスト、ヘッダーを使用して読みやすくしてください',
      ],
      labels: [
        '優先度ラベル（priority:critical/high/medium/low）を追加してください',
        'コンポーネントラベル（component:xxx）を追加してください',
        '種類ラベル（bug/enhancement/security）を追加してください',
      ],
      security: [
        'セキュリティIssueには必要な情報をすべて含めてください',
        '機密情報の公開を避けてください',
        'priority:critical ラベルを設定してください',
      ],
      assignee: [
        '適切な担当者またはチームメンバーをアサインしてください',
        'クリティカルなIssueには必ず担当者をアサインしてください',
      ],
      priority: [
        '適切な優先度ラベルを一つだけ選択してください',
        'セキュリティIssueにはcritical優先度を推奨します',
      ],
      component: [
        '影響するコンポーネントやエリアを指定してください',
        '関連する機能モジュールのラベルを追加してください',
      ],
    }

    return suggestions[category] || ['一般的な品質向上を検討してください']
  }

  /**
   * Issue重要度評価
   */
  private assessIssueSeverity(issue: GitHubIssue): IssueSeverity {
    const labels = (issue.labels || []).map((label) =>
      typeof label === 'string' ? label : label.name
    )

    if (labels.includes('priority:critical') || labels.includes('security')) {
      return 'critical'
    } else if (labels.includes('priority:high')) {
      return 'high'
    } else if (labels.includes('priority:medium')) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  /**
   * SLA違反チェック
   */
  private checkSLACompliance(issue: GitHubIssue): SLACompliance {
    const labels = (issue.labels || []).map((label) =>
      typeof label === 'string' ? label : label.name
    )

    const createdAt = new Date(issue.created_at)
    const now = new Date()
    const hoursOpen = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    let slaHours = this.config.qualityStandards.sla['priority:low'] // デフォルト

    // 最も厳しいSLAを適用
    for (const label of labels) {
      if ((this.config.qualityStandards.sla as any)[label]) {
        slaHours = Math.min(slaHours, (this.config.qualityStandards.sla as any)[label])
      }
    }

    return {
      isViolation: hoursOpen > slaHours,
      hoursOpen: Math.round(hoursOpen),
      slaHours,
      severityLevel: hoursOpen > slaHours * 2 ? 'severe' : 'moderate',
    }
  }

  /**
   * 品質レポート生成
   */
  generateQualityReport(issue: GitHubIssue, qualityResult: ComprehensiveQualityResult): string {
    const { checks, score, recommendations, severity } = qualityResult

    let reportMd = `## 🔍 Issue品質監査結果\n\n`
    reportMd += `**品質スコア**: ${score}/100 ${score >= 80 ? '✅ 優秀' : score >= 70 ? '⚠️ 改善推奨' : '❌ 改善必要'}\n\n`

    // カテゴリ別結果
    reportMd += `### 📊 カテゴリ別評価\n\n`
    for (const [category, check] of Object.entries(checks)) {
      const emoji = check.score >= 80 ? '✅' : check.score >= 60 ? '⚠️' : '❌'
      reportMd += `- **${this.getCategoryDisplayName(category)}**: ${check.score}/100 ${emoji}\n`
    }

    // 改善提案
    if (recommendations.length > 0) {
      reportMd += `\n### 💡 改善提案（優先度順）\n\n`
      for (const rec of recommendations.slice(0, 5)) {
        // 上位5つのみ
        reportMd += `**${this.getCategoryDisplayName(rec.category)}**\n`
        for (const issue of rec.issues) {
          reportMd += `- ❌ ${issue}\n`
        }
        for (const suggestion of rec.suggestions.slice(0, 2)) {
          // 上位2つの提案
          reportMd += `  - 💡 ${suggestion}\n`
        }
        reportMd += `\n`
      }
    }

    // 次のアクション
    reportMd += `### 🎯 推奨アクション\n\n`
    if (score < 70) {
      reportMd += `- [ ] 上記の改善提案を確認し、Issueを編集してください\n`
      reportMd += `- [ ] 必要に応じて適切なラベルを追加してください\n`
      reportMd += `- [ ] チームメンバーの確認を求めてください\n`
    } else {
      reportMd += `- [ ] 高品質なIssueです！引き続き対応をお願いします\n`
    }

    if (severity === 'critical') {
      reportMd += `- [ ] ⚠️ クリティカルなIssueのため優先的な対応が必要です\n`
    }

    reportMd += `\n---\n*このレポートは自動生成されました 🤖 | 実行日時: ${new Date().toLocaleString('ja-JP')}*`

    return reportMd
  }

  /**
   * カテゴリ表示名取得
   */
  private getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      title: 'タイトル',
      description: '説明文',
      labels: 'ラベル',
      template: 'テンプレート',
      security: 'セキュリティ',
      assignee: '担当者',
      priority: '優先度',
      component: 'コンポーネント',
    }

    return displayNames[category] || category
  }

  /**
   * 複数Issue一括品質チェック
   */
  async checkMultipleIssues(issues: GitHubIssue[]): Promise<IssueQualityMetrics> {
    this.log(`Analyzing quality for ${issues.length} issues`, 'info')
    
    const results: ComprehensiveQualityResult[] = []
    
    for (const issue of issues) {
      try {
        const result = await this.checkIssueQuality(issue)
        results.push(result)
      } catch (error) {
        this.log(`Failed to analyze issue ${issue.number}: ${error}`, 'error')
      }
    }
    
    return this.aggregateQualityMetrics(results, issues)
  }

  /**
   * 品質メトリクス集計
   */
  private aggregateQualityMetrics(
    results: ComprehensiveQualityResult[],
    issues: GitHubIssue[]
  ): IssueQualityMetrics {
    const totalIssues = results.length
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalIssues
    const compliantIssues = results.filter(r => r.isCompliant).length
    const criticalIssues = results.filter(r => r.severity === 'critical').length
    
    const categoryScores: Record<string, number> = {}
    const categoryNames = ['title', 'description', 'labels', 'security', 'priority']
    
    for (const category of categoryNames) {
      const scores = results.map(r => r.checks[category]?.score || 0)
      categoryScores[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length
    }
    
    return {
      totalIssues,
      averageQualityScore: Math.round(averageScore),
      complianceRate: Math.round((compliantIssues / totalIssues) * 100),
      criticalIssuesCount: criticalIssues,
      categoryScores,
      recommendations: this.getTopRecommendations(results),
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * トップ推奨事項取得
   */
  private getTopRecommendations(results: ComprehensiveQualityResult[]): string[] {
    const allRecommendations = results.flatMap(r => r.recommendations)
    const recommendationCounts = new Map<string, number>()
    
    for (const rec of allRecommendations) {
      for (const suggestion of rec.suggestions) {
        recommendationCounts.set(suggestion, (recommendationCounts.get(suggestion) || 0) + 1)
      }
    }
    
    return Array.from(recommendationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([suggestion]) => suggestion)
  }
}

// ==================== Main Execution Function ====================

async function checkIssueQualityMain(
  issues: GitHubIssue[] | GitHubIssue,
  options: ScriptOptions = {},
  githubContext?: GitHubActionContext
): Promise<ScriptResult<IssueQualityMetrics | ComprehensiveQualityResult>> {
  const startTime = Date.now()
  
  try {
    const checker = new IssueQualityChecker(githubContext)
    
    if (options.dryRun) {
      console.log('DRY RUN MODE: Would check issue quality but no actions will be taken')
      return {
        success: true,
        data: {} as IssueQualityMetrics,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
    
    let result: IssueQualityMetrics | ComprehensiveQualityResult
    
    if (Array.isArray(issues)) {
      result = await checker.checkMultipleIssues(issues)
    } else {
      result = await checker.checkIssueQuality(issues)
    }
    
    return {
      success: true,
      data: result,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Issue quality check failed: ${errorMessage}`)
    
    return {
      success: false,
      error: errorMessage,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    }
  }
}

// ==================== CLI Execution ====================

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }
  
  // CLI usage example - would need actual issue data
  const exampleIssue: GitHubIssue = {
    id: 1,
    number: 1,
    title: 'Example issue',
    body: 'Example body',
    labels: [],
    assignees: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    state: 'open',
  }
  
  checkIssueQualityMain(exampleIssue, options)
    .then((result) => {
      if (result.success) {
        console.log('Issue quality check completed successfully')
        process.exit(0)
      } else {
        console.error('Issue quality check failed')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error(`Unexpected error: ${error}`)
      process.exit(1)
    })
}

export default IssueQualityChecker
export { IssueQualityChecker, checkIssueQualityMain, type ComprehensiveQualityResult, type QualityReportData }