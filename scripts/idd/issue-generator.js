#!/usr/bin/env node

/**
 * IDD Issue Generator / IDD Issue自動生成エンジン
 *
 * Issue: #68 #4
 * Purpose: コード分析に基づくIssue自動生成
 * Author: Claude Code Actions + yusuke-kurosawa
 * Version: 1.0.0
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class IssueGenerator {
  constructor() {
    this.issues = []
    this.analysisResults = {
      bugs: [],
      security: [],
      performance: [],
      enhancement: [],
      maintenance: [],
    }
  }

  /**
   * コード全体を分析
   */
  async analyzeCode() {
    console.log('🔍 コード分析開始...\n')

    await this.analyzeBugs()
    await this.analyzeSecurity()
    await this.analyzePerformance()
    await this.analyzeEnhancements()
    await this.analyzeMaintenance()

    console.log(`\n📊 分析完了: ${this.issues.length}件のIssue候補を生成`)
  }

  /**
   * バグ・エラー検出
   */
  async analyzeBugs() {
    console.log('🐛 バグ検出分析...')

    try {
      // ESLint分析
      const eslintOutput = execSync('npx eslint . --format json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      })

      const results = JSON.parse(eslintOutput)
      let totalErrors = 0
      let totalWarnings = 0
      const errorFiles = []

      results.forEach((file) => {
        if (file.errorCount > 0) {
          totalErrors += file.errorCount
          errorFiles.push({
            path: file.filePath,
            errors: file.errorCount,
            messages: file.messages.filter((m) => m.severity === 2),
          })
        }
        totalWarnings += file.warningCount
      })

      if (totalErrors > 10) {
        this.generateBugIssue({
          severity: 'high',
          errorCount: totalErrors,
          warningCount: totalWarnings,
          files: errorFiles.slice(0, 5),
        })
      }

      console.log(`   検出: エラー ${totalErrors}件、警告 ${totalWarnings}件`)
    } catch (error) {
      // ESLintエラーも分析対象
      console.log('   ESLint実行エラー（これも分析対象）')
    }

    // console.error検出
    await this.detectConsoleErrors()

    // TODO/FIXME検出
    await this.detectTodoComments()
  }

  /**
   * console.error/console.log検出
   */
  async detectConsoleErrors() {
    const files = this.getJavaScriptFiles()
    let consoleCount = 0
    const consoleUsage = []

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        if (line.includes('console.') && !line.includes('//')) {
          consoleCount++
          consoleUsage.push({
            file: file.replace(process.cwd(), ''),
            line: index + 1,
            code: line.trim(),
          })
        }
      })
    })

    if (consoleCount > 20) {
      this.issues.push({
        title: '🧹 過剰なconsole文の削除',
        body: this.formatIssueBody({
          summary: `${consoleCount}個のconsole文が本番コードに残っています`,
          details: consoleUsage.slice(0, 10),
          actions: [
            'console文を削除またはデバッグ用ロガーに置換',
            '本番ビルドでconsole文を自動削除する設定',
            'ESLintルールで console使用を制限',
          ],
        }),
        labels: ['bug', 'code-quality', 'auto-generated'],
        priority: 'medium',
      })
    }
  }

  /**
   * TODO/FIXME コメント検出
   */
  async detectTodoComments() {
    const files = this.getAllSourceFiles()
    const todos = []
    const fixmes = []

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        if (line.includes('TODO')) {
          todos.push({
            file: file.replace(process.cwd(), ''),
            line: index + 1,
            comment: line.trim(),
          })
        }
        if (line.includes('FIXME')) {
          fixmes.push({
            file: file.replace(process.cwd(), ''),
            line: index + 1,
            comment: line.trim(),
          })
        }
      })
    })

    if (fixmes.length > 0) {
      this.issues.push({
        title: '🔧 FIXMEコメントの解決',
        body: this.formatIssueBody({
          summary: `${fixmes.length}個のFIXMEコメントが未解決です`,
          details: fixmes.slice(0, 10),
          actions: [
            'FIXMEコメントで指摘された問題を修正',
            '修正完了後、コメントを削除',
            '定期的なFIXME棚卸しプロセスの確立',
          ],
        }),
        labels: ['bug', 'technical-debt', 'auto-generated'],
        priority: 'high',
      })
    }
  }

  /**
   * セキュリティ分析
   */
  async analyzeSecurity() {
    console.log('🔒 セキュリティ分析...')

    try {
      // npm audit
      const auditOutput = execSync('npm audit --json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      })

      const audit = JSON.parse(auditOutput)
      const vulnerabilities = audit.metadata?.vulnerabilities || {}

      if (vulnerabilities.critical > 0 || vulnerabilities.high > 0) {
        this.generateSecurityIssue({
          critical: vulnerabilities.critical || 0,
          high: vulnerabilities.high || 0,
          moderate: vulnerabilities.moderate || 0,
          low: vulnerabilities.low || 0,
          info: vulnerabilities.info || 0,
        })
      }

      console.log(
        `   脆弱性: Critical ${vulnerabilities.critical || 0}, High ${vulnerabilities.high || 0}`
      )
    } catch (error) {
      console.log('   npm audit実行エラー')
    }

    // セキュリティパターン検出
    await this.detectSecurityPatterns()
  }

  /**
   * セキュリティパターン検出
   */
  async detectSecurityPatterns() {
    const patterns = [
      { pattern: /api[_-]?key/gi, type: 'APIキー露出' },
      { pattern: /password\s*=\s*["'][^"']+["']/gi, type: 'ハードコードされたパスワード' },
      { pattern: /eval\s*\(/g, type: 'eval使用' },
      { pattern: /innerHTML\s*=/g, type: 'innerHTML使用（XSSリスク）' },
      { pattern: /http:\/\//g, type: 'HTTPプロトコル使用' },
    ]

    const files = this.getJavaScriptFiles()
    const findings = []

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8')

      patterns.forEach(({ pattern, type }) => {
        const matches = content.match(pattern)
        if (matches) {
          findings.push({
            file: file.replace(process.cwd(), ''),
            type,
            count: matches.length,
          })
        }
      })
    })

    if (findings.length > 0) {
      this.issues.push({
        title: '⚠️ セキュリティパターン検証',
        body: this.formatIssueBody({
          summary: 'セキュリティリスクのあるコードパターンが検出されました',
          details: findings,
          actions: [
            '検出されたパターンを確認し、安全な実装に変更',
            '環境変数を使用してセンシティブ情報を管理',
            'セキュリティベストプラクティスの適用',
          ],
        }),
        labels: ['security', 'review-needed', 'auto-generated'],
        priority: 'high',
      })
    }
  }

  /**
   * パフォーマンス分析
   */
  async analyzePerformance() {
    console.log('⚡ パフォーマンス分析...')

    // バンドルサイズチェック
    await this.checkBundleSize()

    // 大きなファイル検出
    await this.detectLargeFiles()

    // 複雑な関数検出
    await this.detectComplexFunctions()
  }

  /**
   * バンドルサイズチェック
   */
  async checkBundleSize() {
    if (fs.existsSync('dist')) {
      const getDirectorySize = (dir) => {
        let size = 0
        const files = fs.readdirSync(dir)

        files.forEach((file) => {
          const filePath = path.join(dir, file)
          const stat = fs.statSync(filePath)

          if (stat.isDirectory()) {
            size += getDirectorySize(filePath)
          } else {
            size += stat.size
          }
        })

        return size
      }

      const sizeInBytes = getDirectorySize('dist')
      const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2)

      if (sizeInMB > 5) {
        this.generatePerformanceIssue({
          type: 'bundle-size',
          size: sizeInMB,
          threshold: 5,
        })
      }

      console.log(`   バンドルサイズ: ${sizeInMB}MB`)
    }
  }

  /**
   * 大きなファイル検出
   */
  async detectLargeFiles() {
    const files = this.getAllSourceFiles()
    const largeFiles = []

    files.forEach((file) => {
      const stat = fs.statSync(file)
      const sizeInKB = (stat.size / 1024).toFixed(2)

      if (sizeInKB > 100) {
        const lineCount = fs.readFileSync(file, 'utf-8').split('\n').length
        largeFiles.push({
          file: file.replace(process.cwd(), ''),
          size: `${sizeInKB}KB`,
          lines: lineCount,
        })
      }
    })

    if (largeFiles.length > 5) {
      this.issues.push({
        title: '📦 大きなファイルの分割推奨',
        body: this.formatIssueBody({
          summary: `${largeFiles.length}個のファイルが100KBを超えています`,
          details: largeFiles.slice(0, 10),
          actions: [
            'コンポーネントを小さく分割',
            '関連機能をモジュールに分離',
            'コード分割とLazy Loadingの実装',
          ],
        }),
        labels: ['performance', 'refactoring', 'auto-generated'],
        priority: 'medium',
      })
    }
  }

  /**
   * 複雑な関数検出
   */
  async detectComplexFunctions() {
    const files = this.getJavaScriptFiles()
    const complexFunctions = []

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      let functionStart = -1
      let braceCount = 0

      lines.forEach((line, index) => {
        // 関数定義の検出
        if (line.match(/function\s+\w+|const\s+\w+\s*=\s*\(|^\s*\w+\s*\(/)) {
          if (functionStart === -1) {
            functionStart = index
            braceCount = 0
          }
        }

        // ブレース カウント
        braceCount += (line.match(/{/g) || []).length
        braceCount -= (line.match(/}/g) || []).length

        // 関数終了
        if (functionStart !== -1 && braceCount === 0 && line.includes('}')) {
          const functionLength = index - functionStart + 1

          if (functionLength > 50) {
            complexFunctions.push({
              file: file.replace(process.cwd(), ''),
              startLine: functionStart + 1,
              endLine: index + 1,
              lines: functionLength,
            })
          }

          functionStart = -1
        }
      })
    })

    if (complexFunctions.length > 10) {
      this.issues.push({
        title: '🔄 複雑な関数のリファクタリング',
        body: this.formatIssueBody({
          summary: `${complexFunctions.length}個の関数が50行を超えています`,
          details: complexFunctions.slice(0, 10),
          actions: [
            '長い関数を小さな関数に分割',
            '単一責任の原則を適用',
            'ヘルパー関数の抽出',
            'ユニットテストの追加',
          ],
        }),
        labels: ['enhancement', 'refactoring', 'code-quality', 'auto-generated'],
        priority: 'low',
      })
    }
  }

  /**
   * 改善提案分析
   */
  async analyzeEnhancements() {
    console.log('✨ 改善提案分析...')

    // TypeScript未使用チェック
    await this.checkTypeScriptAdoption()

    // テストカバレッジチェック
    await this.checkTestCoverage()

    // ドキュメントチェック
    await this.checkDocumentation()
  }

  /**
   * TypeScript採用チェック
   */
  async checkTypeScriptAdoption() {
    const jsFiles = this.getJavaScriptFiles()
    const tsFiles = this.getTypeScriptFiles()

    const jsCount = jsFiles.length
    const tsCount = tsFiles.length
    const tsRatio = (tsCount / (jsCount + tsCount)) * 100

    if (tsRatio < 50 && jsCount > 20) {
      this.issues.push({
        title: '📘 TypeScript採用の推奨',
        body: this.formatIssueBody({
          summary: `TypeScript採用率: ${tsRatio.toFixed(1)}% (${tsCount}/${jsCount + tsCount}ファイル)`,
          details: {
            jsFiles: jsCount,
            tsFiles: tsCount,
            recommendation: 'TypeScriptへの段階的移行を推奨',
          },
          actions: [
            'tsconfig.jsonの設定',
            '新規ファイルはTypeScriptで作成',
            '既存ファイルの段階的移行',
            '型定義ファイルの追加',
          ],
        }),
        labels: ['enhancement', 'typescript', 'auto-generated'],
        priority: 'low',
      })
    }
  }

  /**
   * テストカバレッジチェック
   */
  async checkTestCoverage() {
    const testFiles = this.getTestFiles()
    const sourceFiles = this.getJavaScriptFiles().filter((f) => !f.includes('test'))

    const testRatio = testFiles.length / sourceFiles.length

    if (testRatio < 0.5) {
      this.issues.push({
        title: '🧪 テストカバレッジの向上',
        body: this.formatIssueBody({
          summary: `テストファイル比率: ${(testRatio * 100).toFixed(1)}%`,
          details: {
            sourceFiles: sourceFiles.length,
            testFiles: testFiles.length,
            missingTests: sourceFiles.length - testFiles.length,
          },
          actions: [
            'ユニットテストの追加',
            '統合テストの実装',
            'テストカバレッジ目標の設定（80%以上）',
            'CI/CDパイプラインでカバレッジチェック',
          ],
        }),
        labels: ['enhancement', 'testing', 'auto-generated'],
        priority: 'medium',
      })
    }
  }

  /**
   * ドキュメントチェック
   */
  async checkDocumentation() {
    const hasReadme = fs.existsSync('README.md')
    const hasContributing = fs.existsSync('CONTRIBUTING.md')
    const hasChangelog = fs.existsSync('CHANGELOG.md')
    const hasLicense = fs.existsSync('LICENSE')

    const missingDocs = []
    if (!hasContributing) missingDocs.push('CONTRIBUTING.md')
    if (!hasChangelog) missingDocs.push('CHANGELOG.md')
    if (!hasLicense) missingDocs.push('LICENSE')

    if (missingDocs.length > 0) {
      this.issues.push({
        title: '📚 プロジェクトドキュメントの整備',
        body: this.formatIssueBody({
          summary: '重要なプロジェクトドキュメントが不足しています',
          details: {
            missing: missingDocs,
            existing: {
              'README.md': hasReadme,
              'CONTRIBUTING.md': hasContributing,
              'CHANGELOG.md': hasChangelog,
              LICENSE: hasLicense,
            },
          },
          actions: missingDocs.map((doc) => `${doc}を作成`),
        }),
        labels: ['documentation', 'good-first-issue', 'auto-generated'],
        priority: 'low',
      })
    }
  }

  /**
   * メンテナンス分析
   */
  async analyzeMaintenance() {
    console.log('🔧 メンテナンス分析...')

    // 依存関係の更新チェック
    await this.checkDependencyUpdates()

    // 未使用コードチェック
    await this.checkUnusedCode()
  }

  /**
   * 依存関係更新チェック
   */
  async checkDependencyUpdates() {
    try {
      const outdatedOutput = execSync('npm outdated --json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      })

      if (outdatedOutput) {
        const outdated = JSON.parse(outdatedOutput)
        const packages = Object.keys(outdated)

        if (packages.length > 10) {
          this.issues.push({
            title: '📦 依存関係の更新',
            body: this.formatIssueBody({
              summary: `${packages.length}個のパッケージに更新があります`,
              details: packages.slice(0, 10).map((pkg) => ({
                package: pkg,
                current: outdated[pkg].current,
                wanted: outdated[pkg].wanted,
                latest: outdated[pkg].latest,
              })),
              actions: [
                'npm updateで互換性のある更新を適用',
                'メジャーバージョンアップの影響を確認',
                'テストの実行と動作確認',
                '定期的な依存関係更新プロセスの確立',
              ],
            }),
            labels: ['maintenance', 'dependencies', 'auto-generated'],
            priority: 'low',
          })
        }
      }
    } catch (error) {
      // outdatedコマンドは更新がある場合エラーコードを返す
    }
  }

  /**
   * 未使用コードチェック
   */
  async checkUnusedCode() {
    // 簡易的な未使用export検出
    const files = this.getJavaScriptFiles()
    const exports = []
    const imports = []

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8')

      // export検出
      const exportMatches = content.match(/export\s+(const|function|class|default)\s+(\w+)/g) || []
      exportMatches.forEach((match) => {
        const name = match.split(/\s+/).pop()
        exports.push({ name, file })
      })

      // import検出
      const importMatches = content.match(/import\s+.*\s+from/g) || []
      importMatches.forEach((match) => {
        imports.push(match)
      })
    })

    // この分析は簡易版のため、より詳細な分析が必要
    console.log(`   エクスポート: ${exports.length}個, インポート: ${imports.length}個`)
  }

  /**
   * Issue生成ヘルパー関数
   */
  generateBugIssue(data) {
    this.issues.push({
      title: '🐛 ESLintエラーの修正',
      body: this.formatIssueBody({
        summary: `${data.errorCount}個のエラーと${data.warningCount}個の警告が検出されました`,
        details: data.files,
        actions: [
          'ESLintエラーをすべて修正',
          '警告を可能な限り削減',
          'ESLint設定の見直し',
          'pre-commit hookでESLintを実行',
        ],
      }),
      labels: ['bug', 'code-quality', 'auto-generated'],
      priority: data.severity,
    })
  }

  generateSecurityIssue(data) {
    this.issues.push({
      title: '🔒 セキュリティ脆弱性の修正',
      body: this.formatIssueBody({
        summary: '依存関係にセキュリティ脆弱性が検出されました',
        details: data,
        actions: [
          'npm audit fixで自動修正を試行',
          'Critical/High脆弱性を優先的に対応',
          '依存関係の更新または代替ライブラリの検討',
          'セキュリティスキャンをCI/CDに統合',
        ],
      }),
      labels: ['security', 'dependencies', 'critical', 'auto-generated'],
      priority: 'critical',
    })
  }

  generatePerformanceIssue(data) {
    this.issues.push({
      title: '⚡ バンドルサイズの最適化',
      body: this.formatIssueBody({
        summary: `バンドルサイズが${data.size}MBで、推奨値${data.threshold}MBを超えています`,
        details: data,
        actions: [
          'コード分割の実装',
          '動的インポートの活用',
          '未使用コードの削除',
          '画像・アセットの最適化',
          'Tree Shakingの設定確認',
        ],
      }),
      labels: ['performance', 'optimization', 'auto-generated'],
      priority: 'medium',
    })
  }

  /**
   * Issue本文フォーマット
   */
  formatIssueBody({ summary, details, actions }) {
    let body = `## 📋 概要\n\n${summary}\n\n`

    if (details) {
      body += `## 📊 詳細\n\n`
      if (Array.isArray(details)) {
        details.forEach((item) => {
          if (typeof item === 'object') {
            body += `- ${JSON.stringify(item, null, 2)}\n`
          } else {
            body += `- ${item}\n`
          }
        })
      } else if (typeof details === 'object') {
        body += '```json\n' + JSON.stringify(details, null, 2) + '\n```\n'
      } else {
        body += details + '\n'
      }
      body += '\n'
    }

    if (actions && actions.length > 0) {
      body += `## ✅ 対応内容\n\n`
      actions.forEach((action) => {
        body += `- [ ] ${action}\n`
      })
      body += '\n'
    }

    body += `## 🤖 自動生成情報\n\n`
    body += `- 生成日時: ${new Date().toISOString()}\n`
    body += `- 生成元: IDD Issue Generator v1.0.0\n`
    body += `- 分析基準: コード品質・セキュリティ・パフォーマンス\n\n`
    body += `---\n`
    body += `*このIssueはコード分析により自動生成されました。必要に応じて内容を調整してください。*`

    return body
  }

  /**
   * ヘルパー関数
   */
  getJavaScriptFiles() {
    return this.findFiles('src', ['.js', '.jsx'])
  }

  getTypeScriptFiles() {
    return this.findFiles('src', ['.ts', '.tsx'])
  }

  getTestFiles() {
    return this.findFiles('src', [
      '.test.js',
      '.test.jsx',
      '.test.ts',
      '.test.tsx',
      '.spec.js',
      '.spec.jsx',
      '.spec.ts',
      '.spec.tsx',
    ])
  }

  getAllSourceFiles() {
    return [...this.getJavaScriptFiles(), ...this.getTypeScriptFiles()]
  }

  findFiles(dir, extensions) {
    const files = []

    if (!fs.existsSync(dir)) {
      return files
    }

    const walk = (currentDir) => {
      const entries = fs.readdirSync(currentDir)

      entries.forEach((entry) => {
        const fullPath = path.join(currentDir, entry)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          walk(fullPath)
        } else if (stat.isFile()) {
          const ext = path.extname(entry)
          if (extensions.some((e) => entry.endsWith(e))) {
            files.push(fullPath)
          }
        }
      })
    }

    walk(dir)
    return files
  }

  /**
   * レポート生成
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.issues.length,
        byPriority: {
          critical: this.issues.filter((i) => i.priority === 'critical').length,
          high: this.issues.filter((i) => i.priority === 'high').length,
          medium: this.issues.filter((i) => i.priority === 'medium').length,
          low: this.issues.filter((i) => i.priority === 'low').length,
        },
        byCategory: {
          bug: this.issues.filter((i) => i.labels.includes('bug')).length,
          security: this.issues.filter((i) => i.labels.includes('security')).length,
          performance: this.issues.filter((i) => i.labels.includes('performance')).length,
          enhancement: this.issues.filter((i) => i.labels.includes('enhancement')).length,
          maintenance: this.issues.filter((i) => i.labels.includes('maintenance')).length,
        },
      },
      issues: this.issues,
    }

    // JSON出力
    fs.writeFileSync('issue-generation-report.json', JSON.stringify(report, null, 2))

    // Markdown出力
    let markdown = `# 📊 Issue自動生成レポート\n\n`
    markdown += `**生成日時**: ${report.timestamp}\n\n`
    markdown += `## 📈 サマリー\n\n`
    markdown += `- **総Issue数**: ${report.summary.totalIssues}\n`
    markdown += `- **Critical**: ${report.summary.byPriority.critical}\n`
    markdown += `- **High**: ${report.summary.byPriority.high}\n`
    markdown += `- **Medium**: ${report.summary.byPriority.medium}\n`
    markdown += `- **Low**: ${report.summary.byPriority.low}\n\n`
    markdown += `## 📝 生成されたIssue\n\n`

    this.issues.forEach((issue, index) => {
      markdown += `### ${index + 1}. ${issue.title}\n`
      markdown += `- **優先度**: ${issue.priority}\n`
      markdown += `- **ラベル**: ${issue.labels.join(', ')}\n\n`
    })

    fs.writeFileSync('issue-generation-report.md', markdown)

    return report
  }

  /**
   * 実行
   */
  async run() {
    console.log('🚀 Issue自動生成エンジン起動\n')
    console.log('='.repeat(60))

    await this.analyzeCode()

    const report = this.generateReport()

    console.log('\n' + '='.repeat(60))
    console.log('📊 生成結果サマリー')
    console.log('='.repeat(60))
    console.log(`✅ ${this.issues.length}件のIssue候補を生成`)
    console.log(`   - Critical: ${report.summary.byPriority.critical}`)
    console.log(`   - High: ${report.summary.byPriority.high}`)
    console.log(`   - Medium: ${report.summary.byPriority.medium}`)
    console.log(`   - Low: ${report.summary.byPriority.low}`)
    console.log('='.repeat(60))

    console.log('\n📄 レポート出力:')
    console.log('   - issue-generation-report.json')
    console.log('   - issue-generation-report.md')

    // GitHub Actions用の出力
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::set-output name=issues::${JSON.stringify(this.issues)}`)
      console.log(`::set-output name=total::${this.issues.length}`)
    }
  }
}

// メイン実行
const generator = new IssueGenerator()
generator.run().catch(console.error)

export default IssueGenerator
