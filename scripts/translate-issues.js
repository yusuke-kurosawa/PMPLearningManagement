#!/usr/bin/env node

/**
 * GitHub Issues 日本語翻訳スクリプト
 *
 * このスクリプトは、GitHub Issuesを日本語に翻訳するための
 * バッチ処理ツールです。
 */

const { Octokit } = require('@octokit/rest')
const fs = require('fs').promises
const path = require('path')

// 設定
const CONFIG = {
  owner: 'yusuke-kurosawa',
  repo: 'PMPLearningManagement',
  token: process.env.GITHUB_TOKEN,
  translationGuide: path.join(__dirname, '../docs/ISSUE_TRANSLATION_GUIDE.md'),
  outputDir: path.join(__dirname, '../docs/translated_issues'),
  batchSize: 5, // 同時処理数
  delay: 2000, // API呼び出し間の遅延（ミリ秒）
}

// Issueタイトルの翻訳マッピング
const TITLE_TRANSLATIONS = {
  // Epic Issues
  'Epic: UI/UX改善とレイアウトコンポーネント強化':
    '[UI/UX] 包括的なUI/UX改善とレイアウトコンポーネントの強化',
  'Epic: 監視・ヘルスチェック・メトリクス実装':
    '[バックエンド] 包括的な監視システムとヘルスチェック機能の実装',
  'Epic: セキュリティ強化とコンプライアンス実装':
    '[セキュリティ] エンタープライズセキュリティ強化とコンプライアンス対応',
  'Epic: パフォーマンス最適化とバンドルサイズ削減':
    '[パフォーマンス] フロントエンドパフォーマンスの最適化とバンドルサイズの削減',
  'Epic: CI/CDパイプラインとインフラ自動化':
    '[インフラ] 完全自動化されたCI/CDパイプラインとインフラストラクチャ',
  'Epic: 包括的テストフレームワークの実装':
    '[テスト] エンドツーエンドの包括的テスト自動化フレームワーク',
  'Epic: モバイル・PWA最適化とレスポンシブデザイン実装':
    '[モバイル] プログレッシブWebアプリ（PWA）とモバイル最適化の完全実装',
  'Epic: 認証・認可システムの完全実装':
    '[セキュリティ] エンタープライズグレードの認証・認可システム実装',

  // Feature Issues
  '[Accessibility] Voice Reading & Audio Learning Features':
    '[アクセシビリティ] 音声読み上げとオーディオ学習機能',
  '[Feature] Gamification System - Learning Motivation & Engagement':
    '[学習機能] 学習モチベーション向上のためのゲーミフィケーションシステム',
  '[Feature] Advanced Data Visualization Suite - Interactive Analytics':
    '[機能] インタラクティブ分析のための高度なデータ視覚化スイート',
  '[Feature] Real-time Sync Functionality - Multi-device Experience':
    '[機能] マルチデバイス体験のためのリアルタイム同期機能',
  '[Infrastructure] API Backend Implementation - Scalable Data Architecture':
    '[インフラ] スケーラブルデータアーキテクチャのAPIバックエンド実装',
  '[Tech] State Management Library Integration - Zustand Implementation':
    '[技術] 状態管理ライブラリ統合 - Zustand実装',
  '[Tech Debt] TypeScript Migration - Comprehensive Type Safety Implementation':
    '[技術的負債] TypeScriptへの完全移行と型安全性の実装',
  '[Feature] Continuous Learning Dashboard - Post-Certification Value Tracking':
    '[学習機能] 認定後の価値追跡のための継続学習ダッシュボード',
  '[Feature] PMBOK 7th Edition Support - Principles-Based Framework':
    '[学習機能] PMBOK第7版の原則ベースフレームワーク対応',
  '[Feature] Career Services Integration - Job Matching & Salary Tools':
    '[機能] キャリアサービス統合 - ジョブマッチングと給与ツール',

  // UX Issues
  '[UX] Advanced User Settings and Personalization Options':
    '[UX] 高度なユーザー設定とパーソナライゼーションオプション',
  '[UX] Intelligent Notification System with Preferences':
    '[UX] ユーザー設定に基づくインテリジェント通知システム',
  '[UX] Dark Mode Theme Implementation with System Preference':
    '[UI] システム設定と連携したダークモードテーマの実装',
  '[UX] Comprehensive Accessibility Improvements (WCAG 2.1 AA)':
    '[アクセシビリティ] WCAG 2.1 AA準拠の包括的なアクセシビリティ改善',
  '[UX] Enhanced Onboarding Experience with Interactive Tutorial':
    '[UX] インタラクティブチュートリアル付き強化オンボーディング体験',

  // Feature Issues
  '[Feature] Customizable Learning Dashboard with Widgets':
    '[学習機能] ウィジェット付きカスタマイズ可能な学習ダッシュボード',
  '[Feature] Multi-language Support and Internationalization':
    '[国際化] 完全な多言語対応と国際化（i18n）実装',
  '[Feature] Native Mobile App Development (iOS/Android)':
    '[モバイル] ネイティブモバイルアプリ開発（iOS/Android）',
  '[Feature] Complete Offline Mode with Background Sync':
    '[PWA] バックグラウンド同期付き完全オフラインモード',

  // Performance Issues
  '[Performance] Database Query Optimization and Indexing':
    '[パフォーマンス] データベースクエリの最適化とインデックス戦略',
  '[Performance] Bundle Size Reduction and Optimization':
    '[パフォーマンス] バンドルサイズの削減と最適化',
  '[Performance] Comprehensive Image Optimization Pipeline':
    '[パフォーマンス] 自動画像最適化パイプラインの構築',
  '[Performance] Initial Load Time Optimization (<1s target)':
    '[パフォーマンス] 初期読み込み時間1秒以下を目標とした最適化',

  // AI Issues
  '[AI] Intelligent Study Assistant Chatbot Integration':
    '[AI] AIを活用したインテリジェント学習支援チャットボットの統合',
  '[AI] Predictive Exam Score Modeling and Success Probability':
    '[AI] 予測試験スコアモデリングと成功確率分析',
  '[AI] Intelligent Weakness Analysis and Improvement System':
    '[AI] インテリジェント弱点分析と改善システム',
  '[AI] Personalized Content Recommendations Engine':
    '[AI] パーソナライズされたコンテンツレコメンデーションエンジン',
  '[AI] Adaptive Learning Path Generation with Machine Learning':
    '[AI] 機械学習を活用した個別最適化学習パスの自動生成',

  // Security Issues
  '[Security] Fine-grained Access Control and RBAC Enhancement':
    '[セキュリティ] きめ細かいアクセス制御とRBAC強化',
  '[Security] Comprehensive Audit Logging System': '[セキュリティ] 包括的な監査ログシステム',
  '[Security] Extended Data Encryption Implementation': '[セキュリティ] 拡張データ暗号化の実装',
  '[Security] Implement Two-Factor Authentication (2FA)':
    '[セキュリティ] 二要素認証（2FA）システムの実装',

  // Closed Issues
  コラボレーション機能の追加: '[機能] チームコラボレーション機能の実装',
  PWAオフラインサポートの実装: '[PWA] 完全オフライン対応のService Worker実装',
  ダークモードとカスタマイズ機能: '[UI] ダークモードとUIカスタマイズ機能',
  スマート検索機能の実装: '[検索] AIを活用したスマート検索機能',
  視覚化オプションの強化: '[視覚化] 高度な視覚化オプションの追加',
  PMBOK第7版への対応: '[学習] PMBOK第7版完全対応',
  'データのインポート/エクスポート機能': '[データ] インポート/エクスポート機能の実装',
  PMP模擬試験機能の実装: '[試験] PMP模擬試験システムの構築',
  フラッシュカードによるインタラクティブ学習モード: '[学習] インタラクティブフラッシュカード学習',
  学習進捗トラッキング機能の実装: '[学習] 詳細な学習進捗トラッキングシステム',
}

// ラベルの翻訳マッピング
const LABEL_TRANSLATIONS = {
  // Type labels
  bug: '🐛 バグ',
  enhancement: '✨ 機能強化',
  'type:feature': '✨ 新機能',
  'type:security': '🔒 セキュリティ',
  'type:performance': '⚡ パフォーマンス',
  'type:test': '🧪 テスト',
  documentation: '📝 ドキュメント',

  // Priority labels
  'priority:critical': '🔴 緊急',
  'priority:high': '🟠 優先度:高',
  'priority:medium': '🟡 優先度:中',
  'priority:low': '🟢 優先度:低',

  // Area labels
  'area:ui': '🎨 UI/UX',
  'area:backend': '⚙️ バックエンド',
  'area:mobile': '📱 モバイル',
  'area:learning': '📚 学習機能',
  'area:ai': '🤖 AI/ML',

  // Status labels
  'status:triage': '🔍 トリアージ中',
  'status:in-progress': '🏃 作業中',
  'status:review': '👀 レビュー中',
  'status:blocked': '🚫 ブロック中',
}

class IssueTranslator {
  constructor(config) {
    this.config = config
    this.octokit = new Octokit({
      auth: config.token,
    })
    this.translatedIssues = []
  }

  /**
   * メイン処理
   */
  async run() {
    try {
      console.log('🚀 GitHub Issues翻訳処理を開始します...\n')

      // 出力ディレクトリの作成
      await this.ensureOutputDir()

      // Issueの取得
      const issues = await this.fetchAllIssues()
      console.log(`📊 取得したIssue数: ${issues.length}\n`)

      // バッチ処理で翻訳
      await this.translateIssuesBatch(issues)

      // 結果の保存
      await this.saveTranslations()

      // レポートの生成
      await this.generateReport()

      console.log('\n✅ 翻訳処理が完了しました！')
      console.log(`📁 結果は ${this.config.outputDir} に保存されました`)
    } catch (error) {
      console.error('❌ エラーが発生しました:', error)
      process.exit(1)
    }
  }

  /**
   * 出力ディレクトリの作成
   */
  async ensureOutputDir() {
    try {
      await fs.mkdir(this.config.outputDir, { recursive: true })
    } catch (error) {
      console.error('ディレクトリ作成エラー:', error)
    }
  }

  /**
   * すべてのIssueを取得
   */
  async fetchAllIssues() {
    const issues = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await this.octokit.issues.listForRepo({
        owner: this.config.owner,
        repo: this.config.repo,
        state: 'all',
        per_page: 100,
        page: page,
      })

      issues.push(...response.data)
      hasMore = response.data.length === 100
      page++
    }

    return issues
  }

  /**
   * Issueをバッチで翻訳
   */
  async translateIssuesBatch(issues) {
    const batches = this.createBatches(issues, this.config.batchSize)

    for (let i = 0; i < batches.length; i++) {
      console.log(`📝 バッチ ${i + 1}/${batches.length} を処理中...`)

      const batch = batches[i]
      const translations = await Promise.all(batch.map((issue) => this.translateIssue(issue)))

      this.translatedIssues.push(...translations)

      // API制限を避けるための遅延
      if (i < batches.length - 1) {
        await this.delay(this.config.delay)
      }
    }
  }

  /**
   * 個別のIssueを翻訳
   */
  async translateIssue(issue) {
    const translatedTitle = TITLE_TRANSLATIONS[issue.title] || this.autoTranslateTitle(issue.title)
    const translatedLabels = this.translateLabels(issue.labels)

    return {
      number: issue.number,
      original_title: issue.title,
      translated_title: translatedTitle,
      state: issue.state,
      original_labels: issue.labels.map((l) => l.name),
      translated_labels: translatedLabels,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      url: issue.html_url,
    }
  }

  /**
   * タイトルの自動翻訳
   */
  autoTranslateTitle(title) {
    // 基本的なパターンマッチングによる翻訳
    let translated = title

    // 一般的なパターンの置換
    const patterns = [
      { from: /\[Bug\]/i, to: '[バグ]' },
      { from: /\[Feature\]/i, to: '[機能]' },
      { from: /\[Security\]/i, to: '[セキュリティ]' },
      { from: /\[Performance\]/i, to: '[パフォーマンス]' },
      { from: /\[UI\]/i, to: '[UI]' },
      { from: /\[UX\]/i, to: '[UX]' },
      { from: /\[Backend\]/i, to: '[バックエンド]' },
      { from: /\[Test\]/i, to: '[テスト]' },
      { from: /\[AI\]/i, to: '[AI]' },
      { from: /Epic:/i, to: 'エピック:' },
    ]

    patterns.forEach((pattern) => {
      translated = translated.replace(pattern.from, pattern.to)
    })

    return translated
  }

  /**
   * ラベルの翻訳
   */
  translateLabels(labels) {
    return labels.map((label) => {
      return LABEL_TRANSLATIONS[label.name] || label.name
    })
  }

  /**
   * 配列をバッチに分割
   */
  createBatches(array, batchSize) {
    const batches = []
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * 遅延処理
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 翻訳結果の保存
   */
  async saveTranslations() {
    const outputFile = path.join(this.config.outputDir, 'translated_issues.json')
    await fs.writeFile(outputFile, JSON.stringify(this.translatedIssues, null, 2), 'utf8')

    // CSV形式でも保存
    const csvFile = path.join(this.config.outputDir, 'translated_issues.csv')
    const csvContent = this.convertToCSV(this.translatedIssues)
    await fs.writeFile(csvFile, csvContent, 'utf8')
  }

  /**
   * CSV形式に変換
   */
  convertToCSV(issues) {
    const headers = [
      'Issue番号',
      '状態',
      '元のタイトル',
      '翻訳後のタイトル',
      '元のラベル',
      '翻訳後のラベル',
      '作成日',
      'URL',
    ]

    const rows = issues.map((issue) => [
      issue.number,
      issue.state,
      `"${issue.original_title}"`,
      `"${issue.translated_title}"`,
      `"${issue.original_labels.join(', ')}"`,
      `"${issue.translated_labels.join(', ')}"`,
      issue.created_at,
      issue.url,
    ])

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  }

  /**
   * レポートの生成
   */
  async generateReport() {
    const reportFile = path.join(this.config.outputDir, 'translation_report.md')

    const openIssues = this.translatedIssues.filter((i) => i.state === 'open')
    const closedIssues = this.translatedIssues.filter((i) => i.state === 'closed')

    const report = `# GitHub Issues 翻訳レポート

## 📊 統計情報
- **総Issue数**: ${this.translatedIssues.length}
- **Open Issues**: ${openIssues.length}
- **Closed Issues**: ${closedIssues.length}
- **翻訳日時**: ${new Date().toLocaleString('ja-JP')}

## 📝 Open Issues 一覧

${openIssues
  .map(
    (issue) => `### #${issue.number}: ${issue.translated_title}
- **元のタイトル**: ${issue.original_title}
- **状態**: ${issue.state}
- **ラベル**: ${issue.translated_labels.join(', ')}
- **URL**: ${issue.url}
`
  )
  .join('\n')}

## ✅ Closed Issues 一覧

${closedIssues
  .map(
    (issue) => `### #${issue.number}: ${issue.translated_title}
- **元のタイトル**: ${issue.original_title}
- **状態**: ${issue.state}
- **ラベル**: ${issue.translated_labels.join(', ')}
- **URL**: ${issue.url}
`
  )
  .join('\n')}

---
*Generated by Issue Translation Script*
`

    await fs.writeFile(reportFile, report, 'utf8')
  }
}

// スクリプトの実行
if (require.main === module) {
  // GitHub Tokenの確認
  if (!CONFIG.token) {
    console.error('❌ GITHUB_TOKENが設定されていません')
    console.log('環境変数にGITHUB_TOKENを設定してください:')
    console.log('export GITHUB_TOKEN=your_token_here')
    process.exit(1)
  }

  const translator = new IssueTranslator(CONFIG)
  translator.run()
}

module.exports = IssueTranslator
