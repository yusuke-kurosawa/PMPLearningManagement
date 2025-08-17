#!/usr/bin/env node
/**
 * セキュリティ監査・脆弱性スキャンシステム - TypeScript Edition
 * OWASP Top 10 準拠のセキュリティ分析を実行
 * ROI 430% 達成のための包括的セキュリティ監査
 *
 * @author PMPLearningManagement Security Team
 * @version 2.0.0
 */

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawn } from 'child_process'
import crypto from 'crypto'
import type {
  CLIConfig,
  Logger,
  LogLevel,
  ExitCode,
  CLIException
} from '../src/types/scripts/node-cli.js'
import type {
  SecurityAudit,
  SecurityFinding,
  SecuritySeverity,
  SecurityCategory,
  SecurityRemediation,
  SecuritySummary
} from '../src/types/scripts/devops.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')

// Type Definitions
interface SecurityAuditResults {
  timestamp: string
  summary: SecurityAuditSummary
  vulnerabilities: SecurityVulnerability[]
  recommendations: SecurityRecommendation[]
  owaspAnalysis: OWASPAnalysis
  riskScore: number
  compliance: ComplianceStatus
}

interface SecurityAuditSummary {
  dependencies?: {
    total: number
    vulnerabilities: number
    devDependencies: number
    totalDependencies: number
  }
}

interface SecurityVulnerability {
  type: 'dependency' | 'secret' | 'code-security' | 'docker-security' | 'environment'
  package?: string
  file?: string
  pattern?: string
  line?: number
  severity: SecuritySeverity
  title?: string
  description: string
  recommendation?: string
  cwe?: string
  cvss?: number
  range?: string
  fixAvailable?: boolean
}

interface SecurityRecommendation {
  priority: SecuritySeverity
  title: string
  description: string
  impact: string
}

interface OWASPAnalysis {
  [key: string]: OWASPCheck
}

interface OWASPCheck {
  status: 'pass' | 'fail' | 'warn' | 'manual'
  description: string
  details: string
  recommendation?: string | null
}

interface ComplianceStatus {
  [key: string]: unknown
}

interface SecretPattern {
  name: string
  pattern: RegExp
  severity: SecuritySeverity
}

interface DangerousPattern {
  pattern: RegExp
  severity: SecuritySeverity
  description: string
  cwe: string
}

interface DockerSecurityPattern {
  pattern: RegExp
  severity: SecuritySeverity
  description: string
  recommendation: string
}

// CLI Exception class
class CLIException extends Error {
  constructor(
    message: string,
    public readonly exitCode: ExitCode = 1,
    public readonly details?: Record<string, unknown>,
    public readonly suggestion?: string
  ) {
    super(message)
    this.name = 'CLIException'
  }
}

// Logger implementation
const logger: Logger = {
  debug: (message: string) => console.log(`🔍 ${message}`),
  info: (message: string) => console.log(`ℹ️  ${message}`),
  warn: (message: string) => console.log(`⚠️  ${message}`),
  error: (message: string | Error) => {
    const msg = message instanceof Error ? message.message : message
    console.error(`❌ ${msg}`)
  },
  success: (message: string) => console.log(`✅ ${message}`)
}

class SecurityAuditor {
  private results: SecurityAuditResults
  private readonly severityWeights: Record<SecuritySeverity, number>

  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {},
      vulnerabilities: [],
      recommendations: [],
      owaspAnalysis: {},
      riskScore: 0,
      compliance: {},
    }
    this.severityWeights = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 1,
    }
  }

  /**
   * メインの監査実行
   */
  async runAudit(): Promise<SecurityAuditResults> {
    try {
      logger.info('セキュリティ監査を開始します...')
      logger.info(`実行時刻: ${this.results.timestamp}`)

      // 複数のセキュリティチェックを並行実行
      await Promise.all([
        this.auditNpmDependencies(),
        this.scanSecrets(),
        this.checkOWASPCompliance(),
        this.analyzeCodeSecurity(),
        this.checkDockerSecurity(),
        this.validateEnvironmentSecurity(),
      ])

      // リスクスコア計算
      this.calculateRiskScore()

      // レポート生成
      await this.generateReport()

      logger.success('セキュリティ監査が完了しました')
      logger.info(`リスクスコア: ${this.results.riskScore}/100`)

      return this.results
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      logger.error(`セキュリティ監査でエラーが発生しました: ${msg}`)
      throw new CLIException(msg, 1)
    }
  }

  /**
   * npm依存関係の脆弱性スキャン
   */
  private async auditNpmDependencies(): Promise<void> {
    logger.info('npm依存関係の脆弱性をスキャン中...')

    try {
      // npm audit実行
      const auditResult = execSync('npm audit --json --audit-level=info', {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
      })

      const auditData = JSON.parse(auditResult)

      // 脆弱性の分析
      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(([packageName, vulnData]: [string, any]) => {
          this.results.vulnerabilities.push({
            type: 'dependency',
            package: packageName,
            severity: this.mapNpmSeverity(vulnData.severity),
            title: vulnData.title,
            description: vulnData.description,
            recommendation: vulnData.recommendation,
            cwe: vulnData.cwe,
            cvss: vulnData.cvss,
            range: vulnData.range,
            fixAvailable: vulnData.fixAvailable,
          })
        })
      }

      // 統計情報
      this.results.summary.dependencies = {
        total: auditData.metadata?.dependencies || 0,
        vulnerabilities: auditData.metadata?.vulnerabilities || 0,
        devDependencies: auditData.metadata?.devDependencies || 0,
        totalDependencies: auditData.metadata?.totalDependencies || 0,
      }

      logger.success(`${this.results.summary.dependencies.vulnerabilities} の脆弱性を検出`)
    } catch (error: any) {
      logger.warn(`npm audit実行中にエラー: ${error.message}`)
      // audit でエラーが出ても処理を続行（脆弱性がある場合にexit codeが0以外になるため）
      if (error.stdout) {
        try {
          const auditData = JSON.parse(error.stdout)
          if (auditData.vulnerabilities) {
            // エラーでも結果が取得できた場合は処理を続行
            Object.entries(auditData.vulnerabilities).forEach(([packageName, vulnData]: [string, any]) => {
              this.results.vulnerabilities.push({
                type: 'dependency',
                package: packageName,
                severity: this.mapNpmSeverity(vulnData.severity),
                title: vulnData.title,
                description: vulnData.description,
              })
            })
          }
        } catch (parseError) {
          logger.warn('audit結果のパースに失敗')
        }
      }
    }
  }

  /**
   * npm severity を SecuritySeverity にマップ
   */
  private mapNpmSeverity(npmSeverity: string): SecuritySeverity {
    switch (npmSeverity) {
      case 'critical': return 'critical'
      case 'high': return 'high'
      case 'moderate': return 'medium'
      case 'low': return 'low'
      default: return 'low'
    }
  }

  /**
   * 機密情報漏洩スキャン
   */
  private async scanSecrets(): Promise<void> {
    logger.info('機密情報漏洩スキャン中...')

    const secretPatterns: SecretPattern[] = [
      {
        name: 'API Key',
        pattern: /(?:api[_\-]?key|apikey)[\s]*[=:][\s]*['"]?([a-zA-Z0-9_\-]{16,})['"]?/gi,
        severity: 'high',
      },
      {
        name: 'Secret Token',
        pattern: /(?:secret[_\-]?token|token)[\s]*[=:][\s]*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi,
        severity: 'high',
      },
      {
        name: 'Database Password',
        pattern: /(?:db[_\-]?password|database[_\-]?password)[\s]*[=:][\s]*['"]?([^\s'"]{8,})['"]?/gi,
        severity: 'critical',
      },
      {
        name: 'Private Key',
        pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
        severity: 'critical',
      },
      {
        name: 'AWS Access Key',
        pattern: /AKIA[0-9A-Z]{16}/gi,
        severity: 'high',
      },
      {
        name: 'JWT Token',
        pattern: /eyJ[A-Za-z0-9_\-]*\.eyJ[A-Za-z0-9_\-]*\.[A-Za-z0-9_\-]*/gi,
        severity: 'medium',
      },
    ]

    const excludePaths = ['node_modules', '.git', 'dist', 'build', '.cache', 'coverage']

    await this.scanDirectory(PROJECT_ROOT, secretPatterns, excludePaths)

    logger.success(
      `${this.results.vulnerabilities.filter((v) => v.type === 'secret').length} の機密情報パターンを検出`
    )
  }

  /**
   * ディレクトリをスキャンして機密情報を検出
   */
  private async scanDirectory(dirPath: string, patterns: SecretPattern[], excludePaths: string[]): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        const relativePath = path.relative(PROJECT_ROOT, fullPath)

        // 除外パスのチェック
        if (excludePaths.some((excluded) => relativePath.startsWith(excluded))) {
          continue
        }

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, patterns, excludePaths)
        } else if (entry.isFile()) {
          await this.scanFile(fullPath, patterns)
        }
      }
    } catch (error) {
      logger.warn(`ディレクトリスキャンエラー: ${dirPath}`)
    }
  }

  /**
   * ファイル内容をスキャンして機密情報を検出
   */
  private async scanFile(filePath: string, patterns: SecretPattern[]): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const relativePath = path.relative(PROJECT_ROOT, filePath)

      for (const pattern of patterns) {
        const matches = content.match(pattern.pattern)
        if (matches) {
          matches.forEach((match) => {
            this.results.vulnerabilities.push({
              type: 'secret',
              file: relativePath,
              pattern: pattern.name,
              severity: pattern.severity,
              description: `機密情報の可能性: ${pattern.name}`,
              recommendation: 'この機密情報を環境変数またはシークレット管理システムに移行してください',
              line: this.getLineNumber(content, match),
            })
          })
        }
      }
    } catch (error: any) {
      // バイナリファイルや読み取りエラーは無視
      if (error.code !== 'ENOENT') {
        logger.debug(`ファイルスキャンスキップ: ${filePath}`)
      }
    }
  }

  /**
   * マッチした内容の行番号を取得
   */
  private getLineNumber(content: string, match: string): number {
    const index = content.indexOf(match)
    if (index === -1) return 0

    return content.substring(0, index).split('\n').length
  }

  /**
   * OWASP Top 10 準拠チェック
   */
  private async checkOWASPCompliance(): Promise<void> {
    logger.info('OWASP Top 10 準拠チェック中...')

    const owaspChecks: OWASPAnalysis = {
      'A01:2021-Broken Access Control': await this.checkAccessControl(),
      'A02:2021-Cryptographic Failures': await this.checkCryptographicFailures(),
      'A03:2021-Injection': await this.checkInjection(),
      'A04:2021-Insecure Design': await this.checkInsecureDesign(),
      'A05:2021-Security Misconfiguration': await this.checkSecurityMisconfiguration(),
      'A06:2021-Vulnerable and Outdated Components': await this.checkOutdatedComponents(),
      'A07:2021-Identification and Authentication Failures': await this.checkAuthenticationFailures(),
      'A08:2021-Software and Data Integrity Failures': await this.checkIntegrityFailures(),
      'A09:2021-Security Logging and Monitoring Failures': await this.checkLoggingFailures(),
      'A10:2021-Server-Side Request Forgery': await this.checkSSRF(),
    }

    this.results.owaspAnalysis = owaspChecks

    const passedChecks = Object.values(owaspChecks).filter(
      (check) => check.status === 'pass'
    ).length
    logger.success(`OWASP Top 10: ${passedChecks}/10 項目が準拠`)
  }

  /**
   * OWASP A01: アクセス制御の確認
   */
  private async checkAccessControl(): Promise<OWASPCheck> {
    // 認証・認可に関するコードパターンをチェック
    const authPatterns = [
      /authentication|authorization|auth/gi,
      /login|logout|signin|signout/gi,
      /jwt|token|session/gi,
      /role|permission|rbac/gi,
    ]

    let authImplemented = false
    try {
      const files = await this.getSourceFiles()
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8')
        if (authPatterns.some((pattern) => pattern.test(content))) {
          authImplemented = true
          break
        }
      }
    } catch (error) {
      logger.warn('アクセス制御チェック中にエラー')
    }

    return {
      status: authImplemented ? 'pass' : 'warn',
      description: 'アクセス制御の実装確認',
      details: authImplemented ? '認証・認可の実装を検出' : '明示的なアクセス制御が見つかりません',
      recommendation: authImplemented ? null : '適切な認証・認可機構の実装を検討してください',
    }
  }

  /**
   * OWASP A02: 暗号化の失敗確認
   */
  private async checkCryptographicFailures(): Promise<OWASPCheck> {
    const weakCryptoPatterns = [
      /md5|sha1/gi,
      /des|3des/gi,
      /rc4/gi,
      /crypto\.createHash\(['"]md5['"]|crypto\.createHash\(['"]sha1['"])/gi,
    ]

    let weakCryptoFound = false
    const issues: string[] = []

    try {
      const files = await this.getSourceFiles()
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8')
        for (const pattern of weakCryptoPatterns) {
          if (pattern.test(content)) {
            weakCryptoFound = true
            issues.push(`弱い暗号化アルゴリズムが検出: ${file}`)
          }
        }
      }
    } catch (error) {
      logger.warn('暗号化チェック中にエラー')
    }

    return {
      status: weakCryptoFound ? 'fail' : 'pass',
      description: '弱い暗号化アルゴリズムの検出',
      details: issues.join(', ') || '弱い暗号化アルゴリズムは検出されませんでした',
      recommendation: weakCryptoFound
        ? 'SHA-256以上の安全な暗号化アルゴリズムを使用してください'
        : null,
    }
  }

  /**
   * OWASP A03: インジェクション攻撃の確認
   */
  private async checkInjection(): Promise<OWASPCheck> {
    const injectionPatterns = [
      /eval\s*\(/gi,
      /innerHTML\s*=/gi,
      /document\.write\s*\(/gi,
      /dangerouslySetInnerHTML/gi,
    ]

    let injectionRisk = false
    const issues: string[] = []

    try {
      const files = await this.getSourceFiles()
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8')
        for (const pattern of injectionPatterns) {
          if (pattern.test(content)) {
            injectionRisk = true
            issues.push(`インジェクションリスクを検出: ${file}`)
          }
        }
      }
    } catch (error) {
      logger.warn('インジェクションチェック中にエラー')
    }

    return {
      status: injectionRisk ? 'warn' : 'pass',
      description: 'インジェクション攻撃の脆弱性確認',
      details: issues.join(', ') || 'インジェクションリスクは検出されませんでした',
      recommendation: injectionRisk
        ? 'ユーザー入力の適切なサニタイズとバリデーションを実装してください'
        : null,
    }
  }

  // その他のOWASPチェック関数の実装は簡略化
  private async checkInsecureDesign(): Promise<OWASPCheck> {
    return {
      status: 'manual',
      description: '不安全な設計パターンの確認',
      details: '設計レビューが必要です',
      recommendation: 'セキュリティ設計レビューを実施してください',
    }
  }

  private async checkSecurityMisconfiguration(): Promise<OWASPCheck> {
    const issues: string[] = []

    try {
      const packageJsonContent = await fs.readFile(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
      const packageJson = JSON.parse(packageJsonContent)

      if (!packageJson.engines) {
        issues.push('Node.js バージョン指定が不明')
      }

      if (!packageJson.scripts || !packageJson.scripts['security:audit']) {
        issues.push('セキュリティ監査スクリプトが未設定')
      }
    } catch (error) {
      issues.push('package.json の確認に失敗')
    }

    return {
      status: issues.length > 0 ? 'warn' : 'pass',
      description: 'セキュリティ設定の確認',
      details: issues.join(', ') || 'セキュリティ設定は適切です',
      recommendation: issues.length > 0 ? 'セキュリティ設定の見直しを行ってください' : null,
    }
  }

  private async checkOutdatedComponents(): Promise<OWASPCheck> {
    const outdatedCount = this.results.vulnerabilities.filter((v) => v.type === 'dependency').length

    return {
      status: outdatedCount > 0 ? 'fail' : 'pass',
      description: '古いコンポーネントの確認',
      details: `${outdatedCount} の脆弱な依存関係を検出`,
      recommendation: outdatedCount > 0 ? '依存関係を最新版に更新してください' : null,
    }
  }

  private async checkAuthenticationFailures(): Promise<OWASPCheck> {
    return {
      status: 'manual',
      description: '認証・認証システムの確認',
      details: '認証システムの手動レビューが必要',
      recommendation: '認証フローの安全性を確認してください',
    }
  }

  private async checkIntegrityFailures(): Promise<OWASPCheck> {
    let hasIntegrityChecks = false

    try {
      const packageJsonContent = await fs.readFile(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
      const packageJson = JSON.parse(packageJsonContent)
      if (
        packageJson.scripts &&
        (packageJson.scripts.test || packageJson.scripts['test:coverage'])
      ) {
        hasIntegrityChecks = true
      }
    } catch (error) {
      logger.warn('完全性チェック中にエラー')
    }

    return {
      status: hasIntegrityChecks ? 'pass' : 'warn',
      description: 'データ完全性の確認',
      details: hasIntegrityChecks ? 'テストスクリプトを検出' : 'データ完全性チェックが不十分',
      recommendation: hasIntegrityChecks ? null : '適切なテストとデータ検証を実装してください',
    }
  }

  private async checkLoggingFailures(): Promise<OWASPCheck> {
    let hasLogging = false

    try {
      const files = await this.getSourceFiles()
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8')
        if (/console\.(log|warn|error)|logging|logger/gi.test(content)) {
          hasLogging = true
          break
        }
      }
    } catch (error) {
      logger.warn('ロギングチェック中にエラー')
    }

    return {
      status: hasLogging ? 'pass' : 'warn',
      description: 'セキュリティログの確認',
      details: hasLogging ? 'ログ機能を検出' : 'セキュリティログが不十分',
      recommendation: hasLogging ? null : '適切なセキュリティログと監視を実装してください',
    }
  }

  private async checkSSRF(): Promise<OWASPCheck> {
    const ssrfPatterns = [
      /fetch\s*\(\s*[^)]*\$\{/gi,
      /axios\.[^(]*\([^)]*\$\{/gi,
      /request\s*\([^)]*\$\{/gi,
    ]

    let ssrfRisk = false
    const issues: string[] = []

    try {
      const files = await this.getSourceFiles()
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8')
        for (const pattern of ssrfPatterns) {
          if (pattern.test(content)) {
            ssrfRisk = true
            issues.push(`SSRFリスクを検出: ${file}`)
          }
        }
      }
    } catch (error) {
      logger.warn('SSRFチェック中にエラー')
    }

    return {
      status: ssrfRisk ? 'warn' : 'pass',
      description: 'SSRF攻撃の脆弱性確認',
      details: issues.join(', ') || 'SSRFリスクは検出されませんでした',
      recommendation: ssrfRisk ? '外部リクエストのURL検証を実装してください' : null,
    }
  }

  /**
   * コードセキュリティ分析
   */
  private async analyzeCodeSecurity(): Promise<void> {
    logger.info('コードセキュリティ分析中...')

    const securityIssues: SecurityVulnerability[] = []
    const files = await this.getSourceFiles()

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8')
        const issues = await this.analyzeFileForSecurity(file, content)
        securityIssues.push(...issues)
      } catch (error) {
        logger.warn(`ファイル分析エラー: ${file}`)
      }
    }

    this.results.vulnerabilities.push(...securityIssues)
    logger.success(`${securityIssues.length} のコードセキュリティ問題を検出`)
  }

  /**
   * ファイルのセキュリティ分析
   */
  private async analyzeFileForSecurity(filePath: string, content: string): Promise<SecurityVulnerability[]> {
    const issues: SecurityVulnerability[] = []
    const relativePath = path.relative(PROJECT_ROOT, filePath)

    // 危険な関数やパターンの検出
    const dangerousPatterns: DangerousPattern[] = [
      {
        pattern: /setTimeout\s*\(\s*[^,)]*eval/gi,
        severity: 'high',
        description: 'eval()を使用したsetTimeoutが検出されました',
        cwe: 'CWE-95',
      },
      {
        pattern: /new\s+Function\s*\(/gi,
        severity: 'medium',
        description: 'Function コンストラクタの使用が検出されました',
        cwe: 'CWE-95',
      },
      {
        pattern: /Math\.random\(\)/gi,
        severity: 'low',
        description: '暗号学的に安全でない乱数生成が検出されました',
        cwe: 'CWE-338',
      },
    ]

    for (const dangerousPattern of dangerousPatterns) {
      if (dangerousPattern.pattern.test(content)) {
        issues.push({
          type: 'code-security',
          file: relativePath,
          severity: dangerousPattern.severity,
          description: dangerousPattern.description,
          cwe: dangerousPattern.cwe,
          recommendation: this.getRecommendationForCWE(dangerousPattern.cwe),
        })
      }
    }

    return issues
  }

  /**
   * CWEに基づく推奨事項の取得
   */
  private getRecommendationForCWE(cwe: string): string {
    const recommendations: Record<string, string> = {
      'CWE-95': 'eval()や動的コード実行を避け、安全な代替手段を使用してください',
      'CWE-338': 'crypto.randomBytes()などの暗号学的に安全な乱数生成を使用してください',
      'CWE-922': '機密データはサーバーサイドで管理し、適切な暗号化を実施してください',
    }

    return recommendations[cwe] || 'セキュリティベストプラクティスに従ってください'
  }

  /**
   * Dockerセキュリティチェック
   */
  private async checkDockerSecurity(): Promise<void> {
    logger.info('Dockerセキュリティチェック中...')

    const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml']
    let dockerSecurityIssues: SecurityVulnerability[] = []

    for (const dockerFile of dockerFiles) {
      const dockerPath = path.join(PROJECT_ROOT, dockerFile)
      try {
        await fs.access(dockerPath)
        const content = await fs.readFile(dockerPath, 'utf8')
        const issues = await this.analyzeDockerfile(dockerFile, content)
        dockerSecurityIssues.push(...issues)
      } catch (error) {
        // ファイルが存在しない場合は無視
      }
    }

    this.results.vulnerabilities.push(...dockerSecurityIssues)
    logger.success(`Docker: ${dockerSecurityIssues.length} のセキュリティ問題を検出`)
  }

  /**
   * Dockerファイルのセキュリティ分析
   */
  private async analyzeDockerfile(filename: string, content: string): Promise<SecurityVulnerability[]> {
    const issues: SecurityVulnerability[] = []

    const dockerSecurityPatterns: DockerSecurityPattern[] = [
      {
        pattern: /USER\s+root/gi,
        severity: 'medium',
        description: 'rootユーザーでの実行が検出されました',
        recommendation: '非特権ユーザーでコンテナを実行してください',
      },
      {
        pattern: /--privileged/gi,
        severity: 'high',
        description: '特権モードでの実行が検出されました',
        recommendation: '最小権限の原則に従ってください',
      },
      {
        pattern: /ADD\s+http/gi,
        severity: 'low',
        description: 'HTTPでのファイル追加が検出されました',
        recommendation: 'HTTPSを使用するか、COPYコマンドを使用してください',
      },
    ]

    for (const pattern of dockerSecurityPatterns) {
      if (pattern.pattern.test(content)) {
        issues.push({
          type: 'docker-security',
          file: filename,
          severity: pattern.severity,
          description: pattern.description,
          recommendation: pattern.recommendation,
        })
      }
    }

    return issues
  }

  /**
   * 環境セキュリティの検証
   */
  private async validateEnvironmentSecurity(): Promise<void> {
    logger.info('環境セキュリティ検証中...')

    const envIssues: SecurityVulnerability[] = []

    // .env ファイルの確認
    const envFiles = ['.env', '.env.local', '.env.development', '.env.production']

    for (const envFile of envFiles) {
      const envPath = path.join(PROJECT_ROOT, envFile)
      try {
        await fs.access(envPath)
        envIssues.push({
          type: 'environment',
          file: envFile,
          severity: 'medium',
          description: '環境変数ファイルが検出されました',
          recommendation: '.gitignoreで除外し、機密情報が含まれていないか確認してください',
        })
      } catch (error) {
        // ファイルが存在しない場合は正常
      }
    }

    this.results.vulnerabilities.push(...envIssues)
    logger.success(`環境: ${envIssues.length} のセキュリティ問題を検出`)
  }

  /**
   * ソースファイル一覧取得
   */
  private async getSourceFiles(): Promise<string[]> {
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json']
    const excludePaths = ['node_modules', 'dist', 'build', '.git', 'coverage']

    return await this.getFilesRecursively(PROJECT_ROOT, extensions, excludePaths)
  }

  /**
   * 再帰的にファイル一覧を取得
   */
  private async getFilesRecursively(dirPath: string, extensions: string[], excludePaths: string[]): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        const relativePath = path.relative(PROJECT_ROOT, fullPath)

        if (excludePaths.some((excluded) => relativePath.startsWith(excluded))) {
          continue
        }

        if (entry.isDirectory()) {
          const subFiles = await this.getFilesRecursively(fullPath, extensions, excludePaths)
          files.push(...subFiles)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name)
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      logger.warn(`ディレクトリ読み込みエラー: ${dirPath}`)
    }

    return files
  }

  /**
   * リスクスコア計算
   */
  private calculateRiskScore(): void {
    let totalScore = 0
    let maxPossibleScore = 0

    // 脆弱性ベースのスコア計算
    this.results.vulnerabilities.forEach((vuln) => {
      const weight = this.severityWeights[vuln.severity] || 1
      totalScore += weight
      maxPossibleScore += 10 // 最大重み
    })

    // OWASP準拠スコア
    const owaspTotal = Object.values(this.results.owaspAnalysis).length
    const owaspPassed = Object.values(this.results.owaspAnalysis).filter(
      (check) => check.status === 'pass'
    ).length

    const owaspScore = owaspTotal > 0 ? (owaspPassed / owaspTotal) * 30 : 0

    // 全体リスクスコア (0-100)
    // 低いほど安全、高いほど危険
    const vulnerabilityScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 70 : 0
    const complianceScore = 30 - owaspScore

    this.results.riskScore = Math.min(100, Math.round(vulnerabilityScore + complianceScore))

    // 推奨事項の生成
    this.generateRecommendations()
  }

  /**
   * 推奨事項の生成
   */
  private generateRecommendations(): void {
    const recommendations: SecurityRecommendation[] = []

    // 重要度別の推奨事項
    const criticalVulns = this.results.vulnerabilities.filter((v) => v.severity === 'critical')
    const highVulns = this.results.vulnerabilities.filter((v) => v.severity === 'high')
    const moderateVulns = this.results.vulnerabilities.filter((v) => v.severity === 'medium')

    if (criticalVulns.length > 0) {
      recommendations.push({
        priority: 'critical',
        title: '緊急: クリティカルな脆弱性を修正',
        description: `${criticalVulns.length}件のクリティカルな脆弱性を即座に修正してください`,
        impact: 'システムの安全性に重大な影響',
      })
    }

    if (highVulns.length > 0) {
      recommendations.push({
        priority: 'high',
        title: '高優先度: 重要な脆弱性を修正',
        description: `${highVulns.length}件の重要な脆弱性を修正してください`,
        impact: 'セキュリティリスクが高い',
      })
    }

    if (moderateVulns.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: '中優先度: 脆弱性の修正',
        description: `${moderateVulns.length}件の脆弱性を修正してください`,
        impact: 'セキュリティリスクがある',
      })
    }

    this.results.recommendations = recommendations
  }

  /**
   * レポート生成
   */
  private async generateReport(): Promise<void> {
    logger.info('セキュリティレポート生成中...')

    const reportDir = path.join(PROJECT_ROOT, 'reports', 'security')
    await fs.mkdir(reportDir, { recursive: true })

    // JSON詳細レポート
    const jsonReportPath = path.join(reportDir, `security-audit-${Date.now()}.json`)
    await fs.writeFile(jsonReportPath, JSON.stringify(this.results, null, 2))

    // サマリーレポート
    const summaryPath = path.join(reportDir, 'security-summary.md')
    const summary = this.generateSummaryReport()
    await fs.writeFile(summaryPath, summary)

    logger.success('レポート生成完了:')
    logger.info(`JSON: ${jsonReportPath}`)
    logger.info(`Summary: ${summaryPath}`)
  }

  /**
   * サマリーレポート生成
   */
  private generateSummaryReport(): string {
    const severityStats = this.calculateSeverityStats()
    const owaspPassed = Object.values(this.results.owaspAnalysis).filter(
      (check) => check.status === 'pass'
    ).length
    const owaspTotal = Object.values(this.results.owaspAnalysis).length

    return `# セキュリティ監査サマリー

## 📊 概要
- **実行日時**: ${this.results.timestamp}
- **総合リスクスコア**: ${this.results.riskScore}/100 (${this.results.riskScore <= 30 ? '低リスク' : this.results.riskScore <= 60 ? '中リスク' : '高リスク'})
- **検出された脆弱性**: ${this.results.vulnerabilities.length}件

## 🚨 重要度別脆弱性
- **クリティカル**: ${severityStats.critical}件
- **高**: ${severityStats.high}件
- **中**: ${severityStats.medium}件
- **低**: ${severityStats.low}件

## 🛡️ OWASP Top 10 準拠
- **準拠項目**: ${owaspPassed}/${owaspTotal}
- **準拠率**: ${Math.round((owaspPassed / owaspTotal) * 100)}%

---
*PMPLearningManagement セキュリティ最適化システム v2.0.0*
`
  }

  /**
   * 重要度別統計計算
   */
  private calculateSeverityStats(): Record<SecuritySeverity, number> {
    const stats: Record<SecuritySeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    this.results.vulnerabilities.forEach((vuln) => {
      if (stats.hasOwnProperty(vuln.severity)) {
        stats[vuln.severity]++
      }
    })
    return stats
  }
}

/**
 * メイン実行関数
 */
async function runSecurityAudit(): Promise<void> {
  try {
    const auditor = new SecurityAuditor()
    const results = await auditor.runAudit()

    logger.success('セキュリティ監査完了!')
    logger.info(`総合リスクスコア: ${results.riskScore}/100`)
    logger.info(`検出された脆弱性: ${results.vulnerabilities.length}件`)

    // 緊急対応が必要な場合は終了コード1
    const criticalIssues = results.vulnerabilities.filter((v) => v.severity === 'critical')
    if (criticalIssues.length > 0) {
      logger.warn(`緊急対応が必要なクリティカル脆弱性: ${criticalIssues.length}件`)
      process.exit(1)
    }

    process.exit(0)
  } catch (error) {
    if (error instanceof CLIException) {
      logger.error(error.message)
      if (error.suggestion) {
        logger.info(`💡 Suggestion: ${error.suggestion}`)
      }
      process.exit(error.exitCode)
    } else {
      logger.error(error instanceof Error ? error : new Error(String(error)))
      process.exit(1)
    }
  }
}

// スクリプト実行部分
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityAudit()
}

export { SecurityAuditor, runSecurityAudit }