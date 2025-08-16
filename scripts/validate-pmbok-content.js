#!/usr/bin/env node
/**
 * PMBOK準拠性検証システム
 *
 * 機能:
 * - 49プロセスの完全性検証
 * - ITTO（インプット・ツール・アウトプット）整合性チェック
 * - 知識エリアとプロセス群のバランス検証
 * - PMBOK第6版/第7版の対応関係チェック
 * - データ品質スコアの算出
 *
 * ROI: 手動チェック150時間/年 → 自動化5分/回
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// PMBOK準拠性検証ルール
const PMBOK_VALIDATION_RULES = {
  // 49プロセスの完全な構成
  REQUIRED_PROCESSES: {
    統合: 7, // 統合管理：7プロセス
    スコープ: 6, // スコープ管理：6プロセス
    スケジュール: 6, // スケジュール管理：6プロセス
    コスト: 4, // コスト管理：4プロセス
    品質: 3, // 品質管理：3プロセス
    資源: 6, // 資源管理：6プロセス
    コミュニケーション: 3, // コミュニケーション管理：3プロセス
    リスク: 7, // リスク管理：7プロセス
    調達: 3, // 調達管理：3プロセス
    ステークホルダー: 4, // ステークホルダー管理：4プロセス
  },

  // 5つのプロセス群
  PROCESS_GROUPS: {
    立ち上げ: { min: 1, max: 3 },
    計画: { min: 20, max: 25 },
    実行: { min: 8, max: 12 },
    '監視・コントロール': { min: 10, max: 15 },
    終結: { min: 1, max: 3 },
  },

  // 必須ITTO要素
  REQUIRED_ITTO_FIELDS: ['inputs', 'tools', 'outputs'],

  // 品質しきい値
  QUALITY_THRESHOLDS: {
    process_completeness: 0.95, // 95%以上のプロセス完全性
    itto_consistency: 0.9, // 90%以上のITTO整合性
    terminology_accuracy: 0.98, // 98%以上の用語正確性
    relationship_validity: 0.85, // 85%以上の関係性妥当性
  },
}

// PMI公式用語辞書（日本語）
const PMI_OFFICIAL_TERMS = {
  // プロセス群の正式名称
  processGroups: [
    '立ち上げプロセス群',
    '計画プロセス群',
    '実行プロセス群',
    '監視・コントロールプロセス群',
    '終結プロセス群',
  ],

  // 知識エリアの正式名称
  knowledgeAreas: [
    'プロジェクト統合マネジメント',
    'プロジェクトスコープマネジメント',
    'プロジェクトスケジュールマネジメント',
    'プロジェクトコストマネジメント',
    'プロジェクト品質マネジメント',
    'プロジェクト資源マネジメント',
    'プロジェクトコミュニケーションマネジメント',
    'プロジェクトリスクマネジメント',
    'プロジェクト調達マネジメント',
    'プロジェクトステークホルダーマネジメント',
  ],

  // 必須ITTO用語
  commonInputs: [
    'プロジェクト憲章',
    'プロジェクトマネジメント計画書',
    'プロジェクト文書',
    '組織体の環境要因',
    '組織のプロセス資産',
  ],

  commonTools: ['専門家の判断', 'データ収集', 'データ分析', '意思決定', '会議'],

  commonOutputs: [
    'プロジェクトマネジメント計画書更新版',
    'プロジェクト文書更新版',
    '変更要求',
    '組織のプロセス資産更新版',
  ],
}

class PMBOKValidator {
  constructor() {
    this.validationResults = {
      overall_score: 0,
      process_completeness: 0,
      itto_consistency: 0,
      terminology_accuracy: 0,
      relationship_validity: 0,
      issues: [],
      recommendations: [],
      compliance_status: 'PENDING',
    }
  }

  async validateProject() {
    console.log('🔍 PMBOK準拠性検証を開始...')

    try {
      // データファイルの読み込み
      const processData = await this.loadProcessData()
      const glossaryData = await this.loadGlossaryData()
      const pmbok7Data = await this.loadPMBOK7Data()

      // 各種検証の実行
      await this.validateProcessCompleteness(processData)
      await this.validateITTOConsistency(processData)
      await this.validateTerminologyAccuracy(processData, glossaryData)
      await this.validateRelationshipValidity(processData)
      await this.validatePMBOK7Compliance(pmbok7Data)

      // 総合スコア算出
      this.calculateOverallScore()

      // レポート生成
      const report = this.generateComplianceReport()
      await this.saveReport(report)

      console.log(
        `✅ PMBOK準拠性検証完了 - スコア: ${this.validationResults.overall_score.toFixed(2)}%`
      )
      return this.validationResults
    } catch (error) {
      console.error('❌ PMBOK準拠性検証エラー:', error)
      throw error
    }
  }

  async loadProcessData() {
    const processPath = path.join(__dirname, '../src/data/schemas/pmbok/processData.js')
    if (!fs.existsSync(processPath)) {
      throw new Error('プロセスデータファイルが見つかりません')
    }

    // Dynamic import for ES modules
    const module = await import(`file://${processPath}`)
    return module.processData || module.default
  }

  async loadGlossaryData() {
    const glossaryPath = path.join(__dirname, '../src/data/schemas/glossary/pmpGlossary.js')
    if (!fs.existsSync(glossaryPath)) {
      console.warn('⚠️  用語集データが見つかりません')
      return []
    }

    try {
      const module = await import(`file://${glossaryPath}`)
      return module.glossaryData || module.default || []
    } catch (error) {
      console.warn('⚠️  用語集データの読み込みに失敗:', error.message)
      return []
    }
  }

  async loadPMBOK7Data() {
    const pmbok7Path = path.join(__dirname, '../src/data/schemas/pmbok/pmbok7Data.js')
    if (!fs.existsSync(pmbok7Path)) {
      console.warn('⚠️  PMBOK第7版データが見つかりません')
      return null
    }

    try {
      const module = await import(`file://${pmbok7Path}`)
      return {
        principles: module.pmbok7Principles || [],
        domains: module.pmbok7PerformanceDomains || [],
        mapping: module.pmbok6to7Mapping || {},
      }
    } catch (error) {
      console.warn('⚠️  PMBOK第7版データの読み込みに失敗:', error.message)
      return null
    }
  }

  validateProcessCompleteness(processData) {
    console.log('📋 プロセス完全性を検証中...')

    if (!processData || !Array.isArray(processData)) {
      this.addIssue('CRITICAL', 'プロセスデータが無効または存在しません')
      this.validationResults.process_completeness = 0
      return
    }

    const knowledgeAreaCounts = {}
    const processGroupCounts = {}
    const missingProcesses = []

    // 知識エリア別プロセス数をカウント
    processData.forEach((process) => {
      const ka = process.knowledgeArea
      const pg = process.processGroup

      knowledgeAreaCounts[ka] = (knowledgeAreaCounts[ka] || 0) + 1
      processGroupCounts[pg] = (processGroupCounts[pg] || 0) + 1
    })

    // 期待される構成との比較
    let completenessScore = 1.0

    Object.entries(PMBOK_VALIDATION_RULES.REQUIRED_PROCESSES).forEach(([ka, expected]) => {
      const actual = knowledgeAreaCounts[ka] || 0
      if (actual !== expected) {
        const severity = actual < expected ? 'HIGH' : 'MEDIUM'
        this.addIssue(severity, `${ka}知識エリア: 期待${expected}プロセス、実際${actual}プロセス`)
        completenessScore -= 0.05 // 各不一致で5%減点
      }
    })

    // プロセス群バランスチェック
    Object.entries(PMBOK_VALIDATION_RULES.PROCESS_GROUPS).forEach(([pg, range]) => {
      const actual = processGroupCounts[pg] || 0
      if (actual < range.min || actual > range.max) {
        this.addIssue(
          'MEDIUM',
          `${pg}プロセス群: ${actual}プロセス (推奨範囲: ${range.min}-${range.max})`
        )
        completenessScore -= 0.03
      }
    })

    this.validationResults.process_completeness = Math.max(0, completenessScore)
    console.log(`✓ プロセス完全性スコア: ${(completenessScore * 100).toFixed(1)}%`)
  }

  validateITTOConsistency(processData) {
    console.log('🔗 ITTO整合性を検証中...')

    let consistencyScore = 1.0
    const ittoStats = {
      total: processData.length,
      complete: 0,
      missing_inputs: 0,
      missing_tools: 0,
      missing_outputs: 0,
    }

    processData.forEach((process, index) => {
      const itto = process.itto
      if (!itto) {
        this.addIssue('HIGH', `プロセス ${process.name}: ITTO情報が欠落`)
        consistencyScore -= 0.1
        return
      }

      // 必須フィールドの存在確認
      let processComplete = true
      PMBOK_VALIDATION_RULES.REQUIRED_ITTO_FIELDS.forEach((field) => {
        if (!itto[field] || !Array.isArray(itto[field]) || itto[field].length === 0) {
          this.addIssue('MEDIUM', `プロセス ${process.name}: ${field}が空または未定義`)
          ittoStats[`missing_${field.slice(0, -1)}`]++
          processComplete = false
          consistencyScore -= 0.02
        }
      })

      if (processComplete) ittoStats.complete++

      // 用語の一貫性チェック
      this.validateITTOTermConsistency(process, itto)
    })

    this.validationResults.itto_consistency = Math.max(0, consistencyScore)
    console.log(`✓ ITTO整合性スコア: ${(consistencyScore * 100).toFixed(1)}%`)
    console.log(`  完全なITTO: ${ittoStats.complete}/${ittoStats.total}`)
  }

  validateITTOTermConsistency(process, itto) {
    // 一般的なITTO用語の使用確認
    const hasCommonInput = itto.inputs.some((input) =>
      PMI_OFFICIAL_TERMS.commonInputs.some((common) =>
        input.toLowerCase().includes(common.toLowerCase())
      )
    )

    const hasCommonTool = itto.tools.some((tool) =>
      PMI_OFFICIAL_TERMS.commonTools.some((common) =>
        tool.toLowerCase().includes(common.toLowerCase())
      )
    )

    if (!hasCommonInput && process.processGroup !== '立ち上げ') {
      this.addIssue('LOW', `プロセス ${process.name}: 一般的なインプットが不足している可能性`)
    }

    if (!hasCommonTool) {
      this.addIssue('LOW', `プロセス ${process.name}: 一般的なツールが不足している可能性`)
    }
  }

  validateTerminologyAccuracy(processData, glossaryData) {
    console.log('📚 用語正確性を検証中...')

    let accuracyScore = 1.0
    const glossaryTerms = new Set(glossaryData.map((term) => term.term?.toLowerCase()))
    const processTerms = new Set()

    // プロセスから用語を抽出
    processData.forEach((process) => {
      // プロセス名、説明、ITTOから用語を抽出
      const allText = [
        process.name,
        process.description,
        ...(process.itto?.inputs || []),
        ...(process.itto?.tools || []),
        ...(process.itto?.outputs || []),
      ].join(' ')

      // 専門用語らしき語句を抽出（カタカナ、英数字を含む語句）
      const terms = allText.match(/[\u30A0-\u30FF\u3040-\u309F\w]+/g) || []
      terms.forEach((term) => {
        if (term.length > 2) processTerms.add(term.toLowerCase())
      })
    })

    // 用語集でカバーされていない専門用語を特定
    const uncoveredTerms = [...processTerms].filter((term) => !glossaryTerms.has(term))

    if (uncoveredTerms.length > 0) {
      const coverageRatio = 1 - uncoveredTerms.length / processTerms.size
      accuracyScore = Math.max(0.5, coverageRatio) // 最低50%は保証

      this.addRecommendation('用語集に以下の用語を追加することを推奨:')
      uncoveredTerms.slice(0, 10).forEach((term) => {
        this.addRecommendation(`  - ${term}`)
      })
    }

    this.validationResults.terminology_accuracy = accuracyScore
    console.log(`✓ 用語正確性スコア: ${(accuracyScore * 100).toFixed(1)}%`)
  }

  validateRelationshipValidity(processData) {
    console.log('🔄 関係性妥当性を検証中...')

    let validityScore = 1.0
    const processNames = new Set(processData.map((p) => p.name))
    const inputOutputMap = new Map()

    // アウトプット→インプットマッピングを構築
    processData.forEach((process) => {
      if (process.itto?.outputs) {
        process.itto.outputs.forEach((output) => {
          if (!inputOutputMap.has(output)) {
            inputOutputMap.set(output, [])
          }
          inputOutputMap.get(output).push(process.name)
        })
      }
    })

    // インプットの出所確認
    let unreferencedInputs = 0
    let totalInputs = 0

    processData.forEach((process) => {
      if (process.itto?.inputs) {
        process.itto.inputs.forEach((input) => {
          totalInputs++

          // プロジェクト外部からのインプット（組織の資産など）を除外
          const isExternalInput = [
            '組織体の環境要因',
            '組織のプロセス資産',
            'ビジネス文書',
            '合意書',
          ].some((external) => input.includes(external))

          if (!isExternalInput && !inputOutputMap.has(input)) {
            unreferencedInputs++
            this.addIssue('LOW', `プロセス ${process.name}: インプット「${input}」の出所が不明`)
          }
        })
      }
    })

    if (totalInputs > 0) {
      const referenceRatio = 1 - unreferencedInputs / totalInputs
      validityScore = Math.max(0.6, referenceRatio)
    }

    this.validationResults.relationship_validity = validityScore
    console.log(`✓ 関係性妥当性スコア: ${(validityScore * 100).toFixed(1)}%`)
  }

  validatePMBOK7Compliance(pmbok7Data) {
    if (!pmbok7Data) {
      console.log('ℹ️  PMBOK第7版データが利用できません - スキップ')
      return
    }

    console.log('🔄 PMBOK第7版準拠性を検証中...')

    // 12原則の存在確認
    if (pmbok7Data.principles && pmbok7Data.principles.length === 12) {
      this.addRecommendation('PMBOK第7版の12原則が適切に定義されています')
    } else {
      this.addIssue('MEDIUM', 'PMBOK第7版の12原則が不完全です')
    }

    // 8パフォーマンスドメインの存在確認
    if (pmbok7Data.domains && pmbok7Data.domains.length === 8) {
      this.addRecommendation('PMBOK第7版の8パフォーマンスドメインが適切に定義されています')
    } else {
      this.addIssue('MEDIUM', 'PMBOK第7版の8パフォーマンスドメインが不完全です')
    }

    // マッピング情報の確認
    if (pmbok7Data.mapping) {
      this.addRecommendation('PMBOK第6版から第7版へのマッピング情報が利用可能です')
    }
  }

  calculateOverallScore() {
    const weights = {
      process_completeness: 0.3, // 30% - プロセス完全性
      itto_consistency: 0.25, // 25% - ITTO整合性
      terminology_accuracy: 0.25, // 25% - 用語正確性
      relationship_validity: 0.2, // 20% - 関係性妥当性
    }

    this.validationResults.overall_score = Object.entries(weights).reduce(
      (total, [key, weight]) => {
        return total + this.validationResults[key] * weight * 100
      },
      0
    )

    // 準拠ステータス判定
    if (this.validationResults.overall_score >= 95) {
      this.validationResults.compliance_status = 'EXCELLENT'
    } else if (this.validationResults.overall_score >= 85) {
      this.validationResults.compliance_status = 'GOOD'
    } else if (this.validationResults.overall_score >= 70) {
      this.validationResults.compliance_status = 'ACCEPTABLE'
    } else {
      this.validationResults.compliance_status = 'NEEDS_IMPROVEMENT'
    }
  }

  generateComplianceReport() {
    const timestamp = new Date().toISOString()
    return {
      report_meta: {
        generated_at: timestamp,
        validator_version: '1.0.0',
        project: 'PMPLearningManagement',
      },
      compliance_summary: {
        overall_score: this.validationResults.overall_score,
        status: this.validationResults.compliance_status,
        meets_pmp_standards: this.validationResults.overall_score >= 85,
      },
      detailed_scores: {
        process_completeness: (this.validationResults.process_completeness * 100).toFixed(1),
        itto_consistency: (this.validationResults.itto_consistency * 100).toFixed(1),
        terminology_accuracy: (this.validationResults.terminology_accuracy * 100).toFixed(1),
        relationship_validity: (this.validationResults.relationship_validity * 100).toFixed(1),
      },
      quality_gates: {
        process_gate:
          this.validationResults.process_completeness >=
          PMBOK_VALIDATION_RULES.QUALITY_THRESHOLDS.process_completeness,
        itto_gate:
          this.validationResults.itto_consistency >=
          PMBOK_VALIDATION_RULES.QUALITY_THRESHOLDS.itto_consistency,
        terminology_gate:
          this.validationResults.terminology_accuracy >=
          PMBOK_VALIDATION_RULES.QUALITY_THRESHOLDS.terminology_accuracy,
        relationship_gate:
          this.validationResults.relationship_validity >=
          PMBOK_VALIDATION_RULES.QUALITY_THRESHOLDS.relationship_validity,
      },
      issues: this.validationResults.issues,
      recommendations: this.validationResults.recommendations,
      next_actions: this.generateNextActions(),
    }
  }

  generateNextActions() {
    const actions = []

    if (this.validationResults.process_completeness < 0.95) {
      actions.push('プロセス定義の完全性を向上させる')
    }

    if (this.validationResults.itto_consistency < 0.9) {
      actions.push('ITTO情報の整合性を改善する')
    }

    if (this.validationResults.terminology_accuracy < 0.98) {
      actions.push('用語集の充実化を図る')
    }

    if (this.validationResults.relationship_validity < 0.85) {
      actions.push('プロセス間の関係性を明確化する')
    }

    if (actions.length === 0) {
      actions.push('現在の高品質を維持し、継続的改善を実施する')
    }

    return actions
  }

  async saveReport(report) {
    const reportsDir = path.join(__dirname, '../reports/quality')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = path.join(reportsDir, `pmbok-compliance-${timestamp}.json`)

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`📊 コンプライアンスレポートを保存: ${reportPath}`)

    // サマリーファイルも生成
    const summaryPath = path.join(reportsDir, 'latest-compliance-summary.json')
    const summary = {
      last_check: report.report_meta.generated_at,
      score: report.compliance_summary.overall_score,
      status: report.compliance_summary.status,
      critical_issues: report.issues.filter((issue) => issue.severity === 'CRITICAL').length,
      high_issues: report.issues.filter((issue) => issue.severity === 'HIGH').length,
    }

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
  }

  addIssue(severity, message) {
    this.validationResults.issues.push({
      severity,
      message,
      timestamp: new Date().toISOString(),
    })
  }

  addRecommendation(message) {
    this.validationResults.recommendations.push({
      message,
      timestamp: new Date().toISOString(),
    })
  }
}

// メイン実行関数
async function main() {
  const validator = new PMBOKValidator()

  try {
    const results = await validator.validateProject()

    // 結果表示
    console.log('\n📈 PMBOK準拠性検証結果:')
    console.log(`  総合スコア: ${results.overall_score.toFixed(1)}% (${results.compliance_status})`)
    console.log(`  プロセス完全性: ${(results.process_completeness * 100).toFixed(1)}%`)
    console.log(`  ITTO整合性: ${(results.itto_consistency * 100).toFixed(1)}%`)
    console.log(`  用語正確性: ${(results.terminology_accuracy * 100).toFixed(1)}%`)
    console.log(`  関係性妥当性: ${(results.relationship_validity * 100).toFixed(1)}%`)

    if (results.issues.length > 0) {
      console.log(`\n⚠️  課題: ${results.issues.length}件`)
      results.issues.slice(0, 5).forEach((issue) => {
        console.log(`  [${issue.severity}] ${issue.message}`)
      })
    }

    // 品質ゲートチェック
    const meetsStandards = results.overall_score >= 85
    console.log(`\n🎯 PMP品質基準: ${meetsStandards ? '✅ 合格' : '❌ 不合格'}`)

    process.exit(meetsStandards ? 0 : 1)
  } catch (error) {
    console.error('❌ 検証実行エラー:', error)
    process.exit(1)
  }
}

// コマンドライン実行時の処理
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { PMBOKValidator }
