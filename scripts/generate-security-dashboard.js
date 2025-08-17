#!/usr/bin/env node
/**
 * セキュリティダッシュボード生成システム
 * 全セキュリティスキャン結果を統合した包括的ダッシュボード
 * ROI追跡、トレンド分析、アクションアイテム管理
 *
 * @author PMPLearningManagement Security Team
 * @version 1.0.0
 */

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import SecurityAuditor from './security-audit.js'
import DependencyOptimizer from './optimize-dependencies.js'
import CodeSecurityScanner from './code-security-scanner.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')

class SecurityDashboardGenerator {
  constructor() {
    this.dashboardData = {
      timestamp: new Date().toISOString(),
      summary: {
        overallRiskScore: 0,
        totalVulnerabilities: 0,
        criticalIssues: 0,
        roiMetrics: {},
        complianceStatus: {},
      },
      securityAudit: null,
      dependencyAnalysis: null,
      codeSecurityScan: null,
      trendAnalysis: {},
      actionItems: [],
      recommendations: [],
    }

    this.roiBaseline = {
      securityIncidentPrevention: 50, // 時間/年
      manualAuditReduction: 40, // 時間/年
      dependencyManagement: 30, // 時間/年
      compliancePreparation: 20, // 時間/年
      buildTimeOptimization: 10, // 時間/年
    }
  }

  /**
   * メインダッシュボード生成
   */
  async generateDashboard() {
    console.log('📊 セキュリティダッシュボード生成を開始します...')
    console.log(`📅 実行時刻: ${this.dashboardData.timestamp}`)

    try {
      // 各セキュリティスキャンを実行
      await this.runAllScans()

      // 統合分析の実行
      await this.performIntegratedAnalysis()

      // トレンド分析の実行
      await this.analyzeTrends()

      // アクションアイテムの生成
      this.generateActionItems()

      // 統合推奨事項の生成
      this.generateIntegratedRecommendations()

      // ROIメトリクスの計算
      this.calculateROIMetrics()

      // ダッシュボードファイルの生成
      await this.generateDashboardFiles()

      console.log('✅ セキュリティダッシュボード生成が完了しました')
      console.log(`📊 総合リスクスコア: ${this.dashboardData.summary.overallRiskScore}/100`)
      console.log(`🎯 推定ROI: ${this.dashboardData.summary.roiMetrics.totalROI}%`)

      return this.dashboardData
    } catch (error) {
      console.error('❌ ダッシュボード生成でエラーが発生しました:', error.message)
      throw error
    }
  }

  /**
   * 全セキュリティスキャンの実行
   */
  async runAllScans() {
    console.log('🔄 セキュリティスキャンを実行中...')

    // セキュリティ監査の実行
    console.log('1/3: セキュリティ監査実行中...')
    const auditor = new SecurityAuditor()
    this.dashboardData.securityAudit = await auditor.runAudit()

    // 依存関係最適化の実行
    console.log('2/3: 依存関係分析実行中...')
    const dependencyOptimizer = new DependencyOptimizer()
    this.dashboardData.dependencyAnalysis = await dependencyOptimizer.runOptimization()

    // コードセキュリティスキャンの実行
    console.log('3/3: コードセキュリティスキャン実行中...')
    const codeScanner = new CodeSecurityScanner()
    this.dashboardData.codeSecurityScan = await codeScanner.runScan()

    console.log('✓ 全セキュリティスキャン完了')
  }

  /**
   * 統合分析の実行
   */
  async performIntegratedAnalysis() {
    console.log('🔬 統合セキュリティ分析を実行中...')

    const audit = this.dashboardData.securityAudit
    const deps = this.dashboardData.dependencyAnalysis
    const code = this.dashboardData.codeSecurityScan

    // 総合リスクスコアの計算（重み付き平均）
    const auditWeight = 0.4
    const depsWeight = 0.3
    const codeWeight = 0.3

    this.dashboardData.summary.overallRiskScore = Math.round(
      audit.riskScore * auditWeight +
        this.mapDependencyRisk(deps) * depsWeight +
        code.summary.riskScore * codeWeight
    )

    // 脆弱性の統合集計
    this.dashboardData.summary.totalVulnerabilities =
      (audit.vulnerabilities?.length || 0) +
      (deps.unusedDependencies?.length || 0) +
      (deps.outdatedDependencies?.length || 0) +
      (code.summary?.issuesFound || 0)

    // クリティカル問題の集計
    this.dashboardData.summary.criticalIssues =
      (audit.vulnerabilities?.filter((v) => v.severity === 'critical').length || 0) +
      (deps.outdatedDependencies?.filter((d) => d.securityRisk === 'high').length || 0) +
      (code.codeQuality?.severityBreakdown?.critical || 0)

    // コンプライアンス状況の統合
    this.dashboardData.summary.complianceStatus = this.calculateComplianceStatus(audit)

    console.log('✓ 統合分析完了')
  }

  /**
   * 依存関係リスクをスコアにマップ
   */
  mapDependencyRisk(deps) {
    const unused = deps.unusedDependencies?.length || 0
    const outdated = deps.outdatedDependencies?.length || 0
    const highRisk = deps.outdatedDependencies?.filter((d) => d.securityRisk === 'high').length || 0

    // リスクファクターの計算
    const riskFactor = unused * 0.5 + outdated * 2 + highRisk * 5

    // 0-100スケールにマップ
    return Math.min(100, Math.round(riskFactor))
  }

  /**
   * コンプライアンス状況の計算
   */
  calculateComplianceStatus(audit) {
    const owaspAnalysis = audit.owaspAnalysis || {}
    const total = Object.keys(owaspAnalysis).length
    const passed = Object.values(owaspAnalysis).filter((check) => check.status === 'pass').length

    return {
      owaspCompliance: total > 0 ? Math.round((passed / total) * 100) : 0,
      passedChecks: passed,
      totalChecks: total,
      status: passed / total >= 0.8 ? 'good' : passed / total >= 0.6 ? 'moderate' : 'poor',
    }
  }

  /**
   * トレンド分析の実行
   */
  async analyzeTrends() {
    console.log('📈 セキュリティトレンド分析中...')

    try {
      // 過去のレポートからトレンドデータを収集
      const historicalData = await this.loadHistoricalData()

      if (historicalData.length > 1) {
        this.dashboardData.trendAnalysis = {
          riskScoreTrend: this.calculateTrend(historicalData, 'riskScore'),
          vulnerabilityTrend: this.calculateTrend(historicalData, 'vulnerabilities'),
          complianceTrend: this.calculateTrend(historicalData, 'compliance'),
          improvementRate: this.calculateImprovementRate(historicalData),
        }
      } else {
        this.dashboardData.trendAnalysis = {
          riskScoreTrend: 'insufficient_data',
          vulnerabilityTrend: 'insufficient_data',
          complianceTrend: 'insufficient_data',
          improvementRate: 0,
        }
      }

      console.log('✓ トレンド分析完了')
    } catch (error) {
      console.warn('⚠️ トレンド分析中にエラー:', error.message)
      this.dashboardData.trendAnalysis = { error: error.message }
    }
  }

  /**
   * 過去データの読み込み
   */
  async loadHistoricalData() {
    const reportsDir = path.join(PROJECT_ROOT, 'reports', 'security')
    const historicalData = []

    try {
      const files = await fs.readdir(reportsDir)
      const jsonFiles = files
        .filter((file) => file.startsWith('security-audit-') && file.endsWith('.json'))
        .sort()
        .slice(-5) // 最新5件

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(reportsDir, file)
          const data = JSON.parse(await fs.readFile(filePath, 'utf8'))

          historicalData.push({
            timestamp: data.timestamp,
            riskScore: data.riskScore,
            vulnerabilities: data.vulnerabilities?.length || 0,
            compliance: this.calculateComplianceScore(data.owaspAnalysis),
          })
        } catch (error) {
          console.debug(`履歴ファイル読み込みスキップ: ${file}`)
        }
      }
    } catch (error) {
      console.debug('履歴データディレクトリが存在しません')
    }

    return historicalData
  }

  /**
   * コンプライアンススコアの計算
   */
  calculateComplianceScore(owaspAnalysis) {
    if (!owaspAnalysis) return 0

    const total = Object.keys(owaspAnalysis).length
    const passed = Object.values(owaspAnalysis).filter((check) => check.status === 'pass').length

    return total > 0 ? (passed / total) * 100 : 0
  }

  /**
   * トレンドの計算
   */
  calculateTrend(data, metric) {
    if (data.length < 2) return 'stable'

    const latest = data[data.length - 1][metric]
    const previous = data[data.length - 2][metric]

    if (latest > previous * 1.1) return 'worsening'
    if (latest < previous * 0.9) return 'improving'
    return 'stable'
  }

  /**
   * 改善率の計算
   */
  calculateImprovementRate(data) {
    if (data.length < 2) return 0

    const oldest = data[0]
    const latest = data[data.length - 1]

    // リスクスコアの改善率（低いほど良い）
    const riskImprovement = ((oldest.riskScore - latest.riskScore) / oldest.riskScore) * 100

    // コンプライアンスの改善率（高いほど良い）
    const complianceImprovement =
      ((latest.compliance - oldest.compliance) / Math.max(oldest.compliance, 1)) * 100

    return Math.round((riskImprovement + complianceImprovement) / 2)
  }

  /**
   * アクションアイテムの生成
   */
  generateActionItems() {
    console.log('📋 アクションアイテム生成中...')

    const actionItems = []
    const audit = this.dashboardData.securityAudit
    const deps = this.dashboardData.dependencyAnalysis
    const code = this.dashboardData.codeSecurityScan

    // クリティカル脆弱性への対応
    const criticalAuditIssues =
      audit.vulnerabilities?.filter((v) => v.severity === 'critical') || []
    if (criticalAuditIssues.length > 0) {
      actionItems.push({
        id: 'critical-vulnerabilities',
        title: 'クリティカル脆弱性の即座修正',
        priority: 'critical',
        dueDate: this.addDays(new Date(), 1),
        description: `${criticalAuditIssues.length}件のクリティカル脆弱性を即座に修正`,
        assignee: 'security-team',
        effort: '4-8時間',
        impact: 'システムの安全性確保',
      })
    }

    // 高リスク依存関係の更新
    const highRiskDeps = deps.outdatedDependencies?.filter((d) => d.securityRisk === 'high') || []
    if (highRiskDeps.length > 0) {
      actionItems.push({
        id: 'high-risk-dependencies',
        title: '高リスク依存関係の更新',
        priority: 'high',
        dueDate: this.addDays(new Date(), 3),
        description: `${highRiskDeps.length}件の高リスク依存関係を更新`,
        assignee: 'dev-team',
        effort: '2-4時間',
        impact: 'セキュリティリスク軽減',
      })
    }

    // コードセキュリティ問題の修正
    const criticalCodeIssues = code.codeQuality?.severityBreakdown?.critical || 0
    if (criticalCodeIssues > 0) {
      actionItems.push({
        id: 'critical-code-issues',
        title: 'クリティカルコードセキュリティ問題の修正',
        priority: 'high',
        dueDate: this.addDays(new Date(), 2),
        description: `${criticalCodeIssues}件のクリティカルコード問題を修正`,
        assignee: 'dev-team',
        effort: '6-12時間',
        impact: 'コードセキュリティ向上',
      })
    }

    // 未使用依存関係のクリーンアップ
    const unusedDeps = deps.unusedDependencies?.length || 0
    if (unusedDeps > 5) {
      actionItems.push({
        id: 'unused-dependencies-cleanup',
        title: '未使用依存関係のクリーンアップ',
        priority: 'moderate',
        dueDate: this.addDays(new Date(), 7),
        description: `${unusedDeps}件の未使用依存関係を削除`,
        assignee: 'dev-team',
        effort: '1-2時間',
        impact: `${this.formatBytes(deps.potentialSavings?.diskSpace || 0)} の容量節約`,
      })
    }

    // OWASP コンプライアンス改善
    const owaspCompliance = this.dashboardData.summary.complianceStatus.owaspCompliance
    if (owaspCompliance < 80) {
      actionItems.push({
        id: 'owasp-compliance-improvement',
        title: 'OWASP Top 10 準拠改善',
        priority: 'moderate',
        dueDate: this.addDays(new Date(), 14),
        description: `OWASP準拠率を${owaspCompliance}%から90%以上に改善`,
        assignee: 'security-team',
        effort: '8-16時間',
        impact: 'セキュリティ標準準拠',
      })
    }

    this.dashboardData.actionItems = actionItems
    console.log(`✓ ${actionItems.length} のアクションアイテムを生成`)
  }

  /**
   * 統合推奨事項の生成
   */
  generateIntegratedRecommendations() {
    console.log('💡 統合推奨事項生成中...')

    const recommendations = []
    const overallRiskScore = this.dashboardData.summary.overallRiskScore

    // リスクスコアベースの推奨事項
    if (overallRiskScore > 70) {
      recommendations.push({
        category: 'immediate',
        title: '緊急セキュリティ対応計画の実行',
        description: '高リスクスコアのため、緊急のセキュリティ対応が必要です',
        actions: [
          'クリティカル・高重要度の脆弱性を即座に修正',
          '外部からのアクセスを一時制限',
          'セキュリティチームによる緊急レビュー実施',
        ],
        timeline: '24-48時間',
        impact: 'critical',
      })
    }

    // 予防的セキュリティ施策
    recommendations.push({
      category: 'preventive',
      title: 'セキュリティ開発ライフサイクル（SDLC）の強化',
      description: 'セキュリティを開発プロセスに組み込んだ継続的改善',
      actions: [
        'CI/CDパイプラインへの自動セキュリティスキャン統合',
        'コードレビュー時のセキュリティチェックリスト導入',
        '定期的なセキュリティ研修の実施',
        'セキュアコーディング標準の策定',
      ],
      timeline: '1-3ヶ月',
      impact: 'high',
    })

    // 継続的改善
    recommendations.push({
      category: 'continuous',
      title: '継続的セキュリティ監視体制の構築',
      description: 'セキュリティ状態の継続的監視と自動化',
      actions: [
        '週次自動セキュリティスキャンのスケジューリング',
        'セキュリティメトリクスダッシュボードの日次更新',
        'アラート機能の実装',
        '外部脅威情報との連携',
      ],
      timeline: '継続的',
      impact: 'moderate',
    })

    // ROI最適化
    recommendations.push({
      category: 'optimization',
      title: 'セキュリティROI最適化施策',
      description: 'コストパフォーマンスの高いセキュリティ施策の実装',
      actions: [
        '自動化によるセキュリティ運用コスト削減',
        '重複する依存関係の統合',
        'セキュリティツールの統合管理',
        'セキュリティ投資効果の可視化',
      ],
      timeline: '2-6ヶ月',
      impact: 'moderate',
    })

    this.dashboardData.recommendations = recommendations
    console.log(`✓ ${recommendations.length} の統合推奨事項を生成`)
  }

  /**
   * ROIメトリクスの計算
   */
  calculateROIMetrics() {
    console.log('💰 ROIメトリクス計算中...')

    const audit = this.dashboardData.securityAudit
    const deps = this.dashboardData.dependencyAnalysis
    const code = this.dashboardData.codeSecurityScan

    // 潜在的時間節約の計算
    const timeSavings = {
      // セキュリティインシデント予防
      incidentPrevention: this.calculateIncidentPreventionSavings(audit, code),

      // 手動監査作業削減
      manualAuditSavings: this.roiBaseline.manualAuditReduction,

      // 依存関係管理効率化
      dependencyManagement: this.calculateDependencyManagementSavings(deps),

      // コンプライアンス準備時間削減
      compliancePreparation: this.calculateComplianceSavings(audit),

      // ビルド時間最適化
      buildOptimization: deps.potentialSavings?.buildTime || 0,
    }

    // 総時間節約（時間/年）
    const totalTimeSavings = Object.values(timeSavings).reduce((sum, value) => sum + value, 0)

    // コスト換算（時間単価 ¥5,000/時間 と仮定）
    const hourlyRate = 5000
    const totalCostSavings = totalTimeSavings * hourlyRate

    // 実装コスト（推定）
    const implementationCost = 200000 // ¥200,000

    // ROI計算
    const roi =
      totalCostSavings > 0
        ? ((totalCostSavings - implementationCost) / implementationCost) * 100
        : 0

    this.dashboardData.summary.roiMetrics = {
      totalTimeSavings: Math.round(totalTimeSavings),
      totalCostSavings: Math.round(totalCostSavings),
      implementationCost: implementationCost,
      totalROI: Math.round(roi),
      timeSavingsBreakdown: timeSavings,
      paybackPeriod:
        totalCostSavings > implementationCost
          ? Math.round((implementationCost / (totalCostSavings / 12)) * 10) / 10
          : null, // 月
    }

    console.log(`✓ 推定ROI: ${Math.round(roi)}% (年間${Math.round(totalTimeSavings)}時間節約)`)
  }

  /**
   * インシデント予防による節約効果の計算
   */
  calculateIncidentPreventionSavings(audit, code) {
    const criticalVulns =
      (audit.vulnerabilities?.filter((v) => v.severity === 'critical').length || 0) +
      (code.codeQuality?.severityBreakdown?.critical || 0)

    // 1つのクリティカル脆弱性につき年間10時間の予防効果と仮定
    return Math.min(this.roiBaseline.securityIncidentPrevention, criticalVulns * 10)
  }

  /**
   * 依存関係管理による節約効果の計算
   */
  calculateDependencyManagementSavings(deps) {
    const unusedCount = deps.unusedDependencies?.length || 0
    const outdatedCount = deps.outdatedDependencies?.length || 0

    // 管理する依存関係数に基づく節約効果
    const managementSavings = (unusedCount + outdatedCount) * 0.5 // 1パッケージにつき0.5時間/年

    return Math.min(this.roiBaseline.dependencyManagement, managementSavings)
  }

  /**
   * コンプライアンス準備による節約効果の計算
   */
  calculateComplianceSavings(audit) {
    const owaspCompliance = this.calculateComplianceScore(audit.owaspAnalysis)

    // コンプライアンス率に基づく節約効果
    const complianceFactor = owaspCompliance / 100

    return Math.round(this.roiBaseline.compliancePreparation * complianceFactor)
  }

  /**
   * ダッシュボードファイルの生成
   */
  async generateDashboardFiles() {
    console.log('📄 ダッシュボードファイル生成中...')

    const dashboardDir = path.join(PROJECT_ROOT, 'reports', 'security-dashboard')
    await fs.mkdir(dashboardDir, { recursive: true })

    // メインHTMLダッシュボード
    const htmlDashboard = await this.generateHTMLDashboard()
    const htmlPath = path.join(dashboardDir, `security-dashboard-${Date.now()}.html`)
    await fs.writeFile(htmlPath, htmlDashboard)

    // JSON データ
    const jsonPath = path.join(dashboardDir, `dashboard-data-${Date.now()}.json`)
    await fs.writeFile(jsonPath, JSON.stringify(this.dashboardData, null, 2))

    // エグゼクティブサマリー
    const summaryPath = path.join(dashboardDir, 'executive-summary.md')
    const executiveSummary = this.generateExecutiveSummary()
    await fs.writeFile(summaryPath, executiveSummary)

    // 最新ダッシュボードへのリンク
    const latestPath = path.join(dashboardDir, 'latest-dashboard.html')
    await fs.writeFile(latestPath, htmlDashboard)

    console.log(`✅ ダッシュボード生成完了:`)
    console.log(`   HTML: ${htmlPath}`)
    console.log(`   JSON: ${jsonPath}`)
    console.log(`   Summary: ${summaryPath}`)
    console.log(`   Latest: ${latestPath}`)
  }

  /**
   * HTMLダッシュボードの生成
   */
  async generateHTMLDashboard() {
    const riskScore = this.dashboardData.summary.overallRiskScore
    const roiMetrics = this.dashboardData.summary.roiMetrics
    const complianceStatus = this.dashboardData.summary.complianceStatus

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>セキュリティダッシュボード - PMPLearningManagement</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; color: #333; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header .subtitle { opacity: 0.9; font-size: 1.1em; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .card h3 { margin-bottom: 15px; color: #333; font-size: 1.2em; }
        .metric { text-align: center; padding: 20px; }
        .metric-value { font-size: 3em; font-weight: bold; margin-bottom: 10px; }
        .metric-label { font-size: 1em; color: #666; }
        .risk-score { color: ${riskScore > 70 ? '#e74c3c' : riskScore > 40 ? '#f39c12' : '#27ae60'}; }
        .roi-positive { color: #27ae60; }
        .roi-negative { color: #e74c3c; }
        .compliance-good { color: #27ae60; }
        .compliance-moderate { color: #f39c12; }
        .compliance-poor { color: #e74c3c; }
        .progress-bar { width: 100%; height: 20px; background-color: #ecf0f1; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .action-items { margin-top: 30px; }
        .action-item { background: white; border-radius: 8px; padding: 20px; margin: 10px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-left: 4px solid #3498db; }
        .action-item.critical { border-left-color: #e74c3c; }
        .action-item.high { border-left-color: #e67e22; }
        .action-item.moderate { border-left-color: #f39c12; }
        .priority { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; }
        .priority.critical { background: #e74c3c; color: white; }
        .priority.high { background: #e67e22; color: white; }
        .priority.moderate { background: #f39c12; color: white; }
        .recommendations { margin-top: 30px; }
        .recommendation { background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .trend { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 10px; }
        .trend.improving { background: #d5f4e6; color: #27ae60; }
        .trend.worsening { background: #ffeaea; color: #e74c3c; }
        .trend.stable { background: #e8f4fd; color: #3498db; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; color: #666; }
        .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        @media (max-width: 768px) {
            .dashboard-grid { grid-template-columns: 1fr; }
            .charts { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ セキュリティダッシュボード</h1>
            <div class="subtitle">PMPLearningManagement - ${this.dashboardData.timestamp}</div>
        </div>

        <div class="dashboard-grid">
            <div class="card">
                <div class="metric">
                    <div class="metric-value risk-score">${riskScore}</div>
                    <div class="metric-label">総合リスクスコア / 100</div>
                    ${
                      this.dashboardData.trendAnalysis.riskScoreTrend !== 'insufficient_data'
                        ? `<span class="trend ${this.dashboardData.trendAnalysis.riskScoreTrend}">${this.getTrendLabel(this.dashboardData.trendAnalysis.riskScoreTrend)}</span>`
                        : ''
                    }
                </div>
            </div>

            <div class="card">
                <div class="metric">
                    <div class="metric-value roi-${roiMetrics.totalROI > 0 ? 'positive' : 'negative'}">${roiMetrics.totalROI}%</div>
                    <div class="metric-label">推定ROI</div>
                    <div style="font-size: 0.9em; color: #666; margin-top: 10px;">
                        年間 ${roiMetrics.totalTimeSavings}時間節約
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="metric">
                    <div class="metric-value">${this.dashboardData.summary.totalVulnerabilities}</div>
                    <div class="metric-label">総脆弱性数</div>
                    <div style="font-size: 0.9em; color: #e74c3c; margin-top: 5px;">
                        クリティカル: ${this.dashboardData.summary.criticalIssues}件
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="metric">
                    <div class="metric-value compliance-${complianceStatus.status}">${complianceStatus.owaspCompliance}%</div>
                    <div class="metric-label">OWASP Top 10 準拠率</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${complianceStatus.owaspCompliance}%; background-color: ${complianceStatus.status === 'good' ? '#27ae60' : complianceStatus.status === 'moderate' ? '#f39c12' : '#e74c3c'};"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="charts">
            <div class="card">
                <h3>ROI内訳</h3>
                <div style="padding: 10px;">
                    ${Object.entries(roiMetrics.timeSavingsBreakdown)
                      .map(
                        ([key, value]) => `
                        <div style="margin: 10px 0;">
                            <span style="display: inline-block; width: 200px;">${this.getROILabel(key)}:</span>
                            <span style="font-weight: bold;">${value}時間/年</span>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>

            <div class="card">
                <h3>セキュリティ分析結果</h3>
                <div style="padding: 10px;">
                    <div style="margin: 10px 0;">
                        <span style="display: inline-block; width: 120px;">監査問題:</span>
                        <span style="font-weight: bold;">${this.dashboardData.securityAudit?.vulnerabilities?.length || 0}件</span>
                    </div>
                    <div style="margin: 10px 0;">
                        <span style="display: inline-block; width: 120px;">依存関係問題:</span>
                        <span style="font-weight: bold;">${(this.dashboardData.dependencyAnalysis?.unusedDependencies?.length || 0) + (this.dashboardData.dependencyAnalysis?.outdatedDependencies?.length || 0)}件</span>
                    </div>
                    <div style="margin: 10px 0;">
                        <span style="display: inline-block; width: 120px;">コード問題:</span>
                        <span style="font-weight: bold;">${this.dashboardData.codeSecurityScan?.summary?.issuesFound || 0}件</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="action-items">
            <h2>🎯 アクションアイテム</h2>
            ${this.dashboardData.actionItems
              .map(
                (item) => `
                <div class="action-item ${item.priority}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4>${item.title}</h4>
                        <span class="priority ${item.priority}">${item.priority}</span>
                    </div>
                    <p>${item.description}</p>
                    <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                        <span><strong>期限:</strong> ${new Date(item.dueDate).toLocaleDateString('ja-JP')}</span> |
                        <span><strong>担当:</strong> ${item.assignee}</span> |
                        <span><strong>工数:</strong> ${item.effort}</span> |
                        <span><strong>効果:</strong> ${item.impact}</span>
                    </div>
                </div>
            `
              )
              .join('')}
        </div>

        <div class="recommendations">
            <h2>💡 統合推奨事項</h2>
            ${this.dashboardData.recommendations
              .map(
                (rec) => `
                <div class="recommendation">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <div style="margin: 10px 0;">
                        <strong>アクション:</strong>
                        <ul style="margin-left: 20px; margin-top: 5px;">
                            ${rec.actions.map((action) => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                    <div style="font-size: 0.9em; color: #666;">
                        <span><strong>タイムライン:</strong> ${rec.timeline}</span> |
                        <span><strong>影響度:</strong> ${rec.impact}</span>
                    </div>
                </div>
            `
              )
              .join('')}
        </div>

        <div class="footer">
            PMPLearningManagement スマートセキュリティ最適化システム v1.0.0<br>
            ROI 430% 達成のための統合セキュリティダッシュボード
        </div>
    </div>

    <script>
        // 自動リフレッシュ（5分間隔）
        setTimeout(() => {
            location.reload();
        }, 300000);

        // ツールチップ機能
        document.querySelectorAll('[title]').forEach(element => {
            element.style.cursor = 'help';
        });
    </script>
</body>
</html>
    `
  }

  /**
   * エグゼクティブサマリーの生成
   */
  generateExecutiveSummary() {
    const riskScore = this.dashboardData.summary.overallRiskScore
    const roiMetrics = this.dashboardData.summary.roiMetrics
    const criticalIssues = this.dashboardData.summary.criticalIssues

    return `# セキュリティダッシュボード - エグゼクティブサマリー

## 📊 現在の状況
- **実行日時**: ${this.dashboardData.timestamp}
- **総合リスクスコア**: ${riskScore}/100 (${riskScore <= 30 ? '低リスク' : riskScore <= 60 ? '中リスク' : '高リスク'})
- **検出された脆弱性**: ${this.dashboardData.summary.totalVulnerabilities} 件
- **緊急対応必要**: ${criticalIssues} 件

## 💰 ROI分析
- **推定ROI**: ${roiMetrics.totalROI}%
- **年間時間節約**: ${roiMetrics.totalTimeSavings} 時間
- **年間コスト節約**: ¥${roiMetrics.totalCostSavings.toLocaleString()}
- **投資回収期間**: ${roiMetrics.paybackPeriod ? `${roiMetrics.paybackPeriod}ヶ月` : '算出不可'}

## 🎯 緊急アクション（次の48時間）
${this.dashboardData.actionItems
  .filter((item) => item.priority === 'critical')
  .map((item) => `- **${item.title}**: ${item.description}`)
  .join('\n')}

## 📈 セキュリティトレンド
- **リスクスコア推移**: ${this.getTrendLabel(this.dashboardData.trendAnalysis.riskScoreTrend)}
- **脆弱性推移**: ${this.getTrendLabel(this.dashboardData.trendAnalysis.vulnerabilityTrend)}
- **コンプライアンス推移**: ${this.getTrendLabel(this.dashboardData.trendAnalysis.complianceTrend)}
- **全体改善率**: ${this.dashboardData.trendAnalysis.improvementRate}%

## 🛡️ OWASP Top 10 準拠状況
- **準拠率**: ${this.dashboardData.summary.complianceStatus.owaspCompliance}%
- **合格項目**: ${this.dashboardData.summary.complianceStatus.passedChecks}/${this.dashboardData.summary.complianceStatus.totalChecks}
- **ステータス**: ${this.getComplianceStatusLabel(this.dashboardData.summary.complianceStatus.status)}

## 💡 戦略的推奨事項

### 短期（1-4週間）
${this.dashboardData.recommendations
  .filter((rec) => rec.category === 'immediate')
  .map((rec) => `- **${rec.title}**: ${rec.description}`)
  .join('\n')}

### 中期（1-3ヶ月）
${this.dashboardData.recommendations
  .filter((rec) => rec.category === 'preventive')
  .map((rec) => `- **${rec.title}**: ${rec.description}`)
  .join('\n')}

### 長期（継続的）
${this.dashboardData.recommendations
  .filter((rec) => rec.category === 'continuous')
  .map((rec) => `- **${rec.title}**: ${rec.description}`)
  .join('\n')}

## 📊 投資効果の内訳
${Object.entries(roiMetrics.timeSavingsBreakdown)
  .map(([key, value]) => `- **${this.getROILabel(key)}**: ${value}時間/年`)
  .join('\n')}

## 🚨 リスク評価
${
  riskScore > 70
    ? '**高リスク**: 即座の対応が必要です。セキュリティチームによる緊急対応を推奨します。'
    : riskScore > 40
      ? '**中リスク**: 計画的な改善が必要です。定期的な監視を継続してください。'
      : '**低リスク**: 現在の状態は良好です。予防的施策の継続を推奨します。'
}

## 📋 次回レビュー予定
- **日程**: ${this.addDays(new Date(), 7).toLocaleDateString('ja-JP')}
- **重点項目**: ${criticalIssues > 0 ? 'クリティカル問題の解決状況確認' : 'セキュリティ向上施策の進捗確認'}

---
*PMPLearningManagement スマートセキュリティ最適化システム v1.0.0*
*目標ROI 430% 達成のための統合セキュリティ管理*
`
  }

  /**
   * ヘルパー関数群
   */
  addDays(date, days) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getTrendLabel(trend) {
    const labels = {
      improving: '改善中',
      worsening: '悪化中',
      stable: '安定',
      insufficient_data: 'データ不足',
    }
    return labels[trend] || '不明'
  }

  getComplianceStatusLabel(status) {
    const labels = {
      good: '良好',
      moderate: '要改善',
      poor: '不良',
    }
    return labels[status] || '不明'
  }

  getROILabel(key) {
    const labels = {
      incidentPrevention: 'インシデント予防',
      manualAuditSavings: '手動監査削減',
      dependencyManagement: '依存関係管理',
      compliancePreparation: 'コンプライアンス準備',
      buildOptimization: 'ビルド時間最適化',
    }
    return labels[key] || key
  }
}

// スクリプト実行部分
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboardGenerator = new SecurityDashboardGenerator()

  dashboardGenerator
    .generateDashboard()
    .then((results) => {
      console.log('\n🎉 セキュリティダッシュボード生成完了!')
      console.log(`📊 総合リスクスコア: ${results.summary.overallRiskScore}/100`)
      console.log(`💰 推定ROI: ${results.summary.roiMetrics.totalROI}%`)
      console.log(`⏱️ 年間時間節約: ${results.summary.roiMetrics.totalTimeSavings}時間`)
      console.log(`🎯 アクションアイテム: ${results.actionItems.length}件`)

      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ セキュリティダッシュボード生成に失敗しました:', error.message)
      process.exit(1)
    })
}

export default SecurityDashboardGenerator
