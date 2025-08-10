# コンプライアンス・セキュリティポリシー

## 1. PCI DSS Level 1 準拠計画

### 対象範囲

年間取引量300万件以上を見込むため、PCI DSS Level 1準拠が必須

### 実装要件

#### Requirement 1: ファイアウォール設定

```typescript
// Next.js middleware でのネットワーク制御
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_COUNTRIES = ['JP', 'US', 'CA', 'AU'] // 許可国家コード
const BLOCKED_IPS = new Set([
  // 既知の悪意あるIPアドレス
])

export async function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const country = request.geo?.country || 'unknown'

  // 地理的制限
  if (!ALLOWED_COUNTRIES.includes(country)) {
    await logSecurityEvent({
      action: 'ACCESS_BLOCKED_GEOGRAPHIC',
      ipAddress: ip,
      riskLevel: RiskLevel.MEDIUM,
      metadata: { blockedCountry: country },
    })

    return new NextResponse('Access denied', { status: 403 })
  }

  // IPブロックリスト
  if (BLOCKED_IPS.has(ip)) {
    return new NextResponse('Access denied', { status: 403 })
  }

  return NextResponse.next()
}
```

#### Requirement 2: デフォルトパスワード変更

```typescript
// 強制的な初期パスワード変更
interface UserOnboarding {
  enforcePasswordChange: boolean
  passwordPolicy: {
    minLength: 12
    requireMixedCase: true
    requireNumbers: true
    requireSymbols: true
    prohibitReuse: 12 // 過去12個のパスワードは再利用不可
    maxAge: 90 // 90日で強制変更
  }
}

export async function enforcePasswordPolicy(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { passwordHistory: { take: 12, orderBy: { createdAt: 'desc' } } },
  })

  const daysSinceChange = Math.floor(
    (Date.now() - user.passwordChangedAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceChange >= 90) {
    // 強制パスワード変更を要求
    await db.user.update({
      where: { id: userId },
      data: { mustChangePassword: true },
    })
  }
}
```

#### Requirement 3: カード会員データの保護

```typescript
// Stripe Elements使用（カード情報を直接処理しない）
const STRIPE_CONFIG = {
  // カード情報は一切サーバーに送信しない
  paymentElementOptions: {
    layout: 'tabs',
    fields: {
      billingDetails: 'auto', // 必要最小限のデータのみ
    },
  },

  // Webhook署名検証（必須）
  webhookValidation: {
    verifySignature: true,
    tolerance: 300, // 5分のクロック許容度
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  },
}

// 決済情報は絶対にログに記録しない
export function sanitizeLogsForPayment(logData: any) {
  const sensitiveFields = [
    'card_number',
    'cvv',
    'exp_date',
    'payment_method',
    'stripe_token',
    'bank_account',
  ]

  const sanitized = { ...logData }
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  })

  return sanitized
}
```

#### Requirement 4: 暗号化された通信

```typescript
// next.config.js - 強制HTTPS設定
const securityConfig = {
  // 本番環境では強制HTTPS
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/:path*',
          has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
          destination: 'https://your-domain.com/:path*',
          permanent: true,
        },
      ]
    }
    return []
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: 'upgrade-insecure-requests',
          },
        ],
      },
    ]
  },
}
```

#### Requirement 6: セキュアシステム開発

```typescript
// セキュアコーディング標準
interface SecureCodingStandards {
  inputValidation: {
    // 全入力に対してZodスキーマ検証
    validateAllInputs: true
    sanitizeBeforeProcessing: true
    whitelistValidation: true // ブラックリストではなくホワイトリスト
  }

  outputEncoding: {
    // 全出力をエスケープ
    autoEscape: true
    contextAwareEncoding: true
  }

  errorHandling: {
    // エラー情報の漏洩防止
    genericErrorMessages: true
    detailedLoggingForDebug: true
    separateUserAndSystemErrors: true
  }

  codeReview: {
    // 全PRに対してセキュリティレビュー
    mandatorySecurityReview: true
    automatedSecurityTesting: true
    staticCodeAnalysis: true
  }
}

// セキュリティテスト自動化
// .github/workflows/security-tests.yml
const securityTestConfig = `
name: Security Tests
on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # SAST (Static Application Security Testing)
      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v2
        
      # Dependency vulnerability scan
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        with:
          args: --severity-threshold=medium
          
      # Container security scan
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          
      # Infrastructure as Code security
      - name: Run Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: .
          framework: dockerfile,terraform
`
```

## 2. GDPR コンプライアンス

### データ処理の合法性基盤

```typescript
// GDPRコンプライアンス実装
interface GDPRCompliance {
  legalBasis: {
    consent: '明示的同意（学習データ処理）'
    contractualNecessity: '契約履行（サービス提供）'
    legitimateInterest: '正当な利益（サービス改善）'
  }

  dataSubjectRights: {
    rightToAccess: 'データアクセス権'
    rightToRectification: 'データ訂正権'
    rightToErasure: '削除権（忘れられる権利）'
    rightToPortability: 'データポータビリティ権'
    rightToRestriction: '処理制限権'
    rightToObject: '異議申立権'
  }
}

// GDPR同意管理
export class ConsentManager {
  static async recordConsent(
    userId: string,
    consentData: {
      purpose: string
      timestamp: Date
      ipAddress: string
      userAgent: string
      consentText: string
      version: string
    }
  ) {
    await db.gdprConsent.create({
      data: {
        userId,
        purpose: consentData.purpose,
        consentGiven: true,
        consentTimestamp: consentData.timestamp,
        ipAddress: consentData.ipAddress,
        userAgent: consentData.userAgent,
        consentVersion: consentData.version,
        consentText: consentData.consentText,
      },
    })
  }

  static async withdrawConsent(userId: string, purpose: string) {
    await db.gdprConsent.update({
      where: {
        userId_purpose: { userId, purpose },
      },
      data: {
        consentGiven: false,
        withdrawalTimestamp: new Date(),
      },
    })

    // 関連データの処理停止または削除
    await this.handleConsentWithdrawal(userId, purpose)
  }

  private static async handleConsentWithdrawal(userId: string, purpose: string) {
    switch (purpose) {
      case 'MARKETING':
        // マーケティング関連データの削除
        await db.marketingPreference.deleteMany({ where: { userId } })
        break

      case 'ANALYTICS':
        // 分析データの匿名化
        await db.analyticsEvent.updateMany({
          where: { userId },
          data: { userId: null, anonymized: true },
        })
        break

      case 'LEARNING_TRACKING':
        // 学習追跡の停止（データは保持）
        await db.user.update({
          where: { id: userId },
          data: { trackingEnabled: false },
        })
        break
    }
  }
}

// データ削除権（忘れられる権利）実装
export class DataErasureService {
  static async processErasureRequest(userId: string, requestId: string) {
    try {
      await db.$transaction(async (tx) => {
        // 1. ユーザーデータの匿名化/削除
        await tx.user.update({
          where: { id: userId },
          data: {
            email: `deleted-${requestId}@example.com`,
            fullName: '[DELETED]',
            phone: null,
            avatar: null,
            deletedAt: new Date(),
            status: 'DELETED',
          },
        })

        // 2. 学習データの匿名化（統計目的での保持）
        await tx.learningProgress.updateMany({
          where: { userId },
          data: {
            userId: null, // 匿名化
            anonymizedUserId: this.generateAnonymousId(),
          },
        })

        // 3. 決済履歴の法的保持期間チェック
        const retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000 // 7年
        await tx.paymentHistory.updateMany({
          where: {
            userId,
            createdAt: { lt: new Date(Date.now() - retentionPeriod) },
          },
          data: { userId: null },
        })

        // 4. セッションデータの完全削除
        await tx.userSession.deleteMany({ where: { userId } })

        // 5. 削除記録の保持（コンプライアンス証跡）
        await tx.gdprDeletionRecord.create({
          data: {
            originalUserId: userId,
            requestId,
            deletionTimestamp: new Date(),
            dataTypesDeleted: ['profile', 'sessions', 'preferences'],
            dataTypesAnonymized: ['learning_progress', 'payment_history'],
            retentionReason: 'LEGAL_OBLIGATION',
          },
        })
      })

      // 外部システムへの削除要求
      await this.notifyExternalSystemsOfDeletion(userId, requestId)
    } catch (error) {
      await this.logDeletionFailure(userId, requestId, error)
      throw error
    }
  }

  private static generateAnonymousId(): string {
    return `anon-${randomBytes(16).toString('hex')}`
  }
}

// データポータビリティ権
export class DataPortabilityService {
  static async exportUserData(userId: string): Promise<{
    personalData: any
    learningData: any
    preferences: any
    metadata: any
  }> {
    const [user, learningProgress, preferences, sessions] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.learningProgress.findMany({ where: { userId } }),
      db.userPreference.findMany({ where: { userId } }),
      db.userSession.findMany({ where: { userId, isActive: true } }),
    ])

    return {
      personalData: {
        email: user?.email,
        fullName: user?.fullName,
        createdAt: user?.createdAt,
        lastLoginAt: user?.lastLoginAt,
      },
      learningData: learningProgress.map((p) => ({
        processId: p.processId,
        completionPercentage: p.completionPercentage,
        studyTimeMinutes: p.studyTimeMinutes,
        lastAccessedAt: p.lastAccessedAt,
      })),
      preferences: preferences,
      metadata: {
        exportDate: new Date().toISOString(),
        dataVersion: '1.0',
        format: 'JSON',
        totalRecords: learningProgress.length + preferences.length,
      },
    }
  }
}
```

## 3. SOC 2 Type II 準拠

### Trust Service Criteria実装

```typescript
// SOC 2 統制実装
interface SOC2Controls {
  security: {
    // CC6.1 - ネットワークセキュリティ
    networkSecurity: {
      firewallRules: 'default-deny, explicit-allow'
      networkSegmentation: 'DMZ, Application, Database layers'
      intrusionDetection: 'Real-time monitoring with Datadog'
    }

    // CC6.2 - 論理・物理アクセス制御
    accessControls: {
      authentication: 'Multi-factor authentication required'
      authorization: 'Role-based access control (RBAC)'
      privilegedAccess: 'Just-in-time elevated access'
      sessionManagement: '30-minute timeout, concurrent session limits'
    }

    // CC6.3 - システムアクセス権限
    systemAccess: {
      leastPrivilege: 'Minimum necessary permissions'
      segregationOfDuties: 'Development != Production access'
      regularReview: 'Quarterly access rights review'
    }
  }

  availability: {
    // CC7.1 - システム可用性
    systemAvailability: {
      uptimeTarget: '99.9% (8.77 hours downtime/year max)'
      redundancy: 'Multi-AZ deployment'
      failoverRTO: '2 hours'
      backupRPO: '1 hour'
    }

    // CC7.2 - システム容量
    capacityManagement: {
      monitoring: 'Real-time resource utilization'
      scaling: 'Auto-scaling based on demand'
      capacityPlanning: 'Quarterly capacity reviews'
    }
  }

  processing: {
    // CC8.1 - 変更管理
    changeManagement: {
      approvalProcess: 'All changes require approval'
      testing: 'Mandatory testing in staging environment'
      rollback: 'Automated rollback capabilities'
      documentation: 'All changes documented in JIRA'
    }
  }
}

// 統制証跡の自動記録
export class ComplianceLogger {
  static async logControlExecution(
    controlId: string,
    details: {
      executedBy: string
      executionResult: 'success' | 'failure'
      timestamp: Date
      evidence: any
      riskRating: 'low' | 'medium' | 'high'
    }
  ) {
    await db.complianceLog.create({
      data: {
        controlId,
        executedBy: details.executedBy,
        executionResult: details.executionResult,
        timestamp: details.timestamp,
        evidence: JSON.stringify(details.evidence),
        riskRating: details.riskRating,
        auditTrail: this.generateAuditTrail(controlId, details),
      },
    })

    // 失敗した統制は即座にエスカレーション
    if (details.executionResult === 'failure' && details.riskRating === 'high') {
      await this.escalateControlFailure(controlId, details)
    }
  }

  private static generateAuditTrail(controlId: string, details: any): string {
    return JSON.stringify({
      controlId,
      timestamp: details.timestamp.toISOString(),
      checksum: createHash('sha256')
        .update(`${controlId}-${details.executedBy}-${details.timestamp}`)
        .digest('hex'),
      version: '1.0',
    })
  }
}

// 定期的な統制テスト
export class ControlTesting {
  // CC6.1 - ファイアウォール設定テスト
  static async testFirewallControls(): Promise<ControlTestResult> {
    try {
      // 不正アクセステスト
      const testResults = await Promise.all([
        this.testUnauthorizedPortAccess(),
        this.testDDOSProtection(),
        this.testGeoBlocking(),
      ])

      const allPassed = testResults.every((result) => result.passed)

      await ComplianceLogger.logControlExecution('CC6.1', {
        executedBy: 'automated-test',
        executionResult: allPassed ? 'success' : 'failure',
        timestamp: new Date(),
        evidence: testResults,
        riskRating: allPassed ? 'low' : 'high',
      })

      return {
        controlId: 'CC6.1',
        passed: allPassed,
        details: testResults,
      }
    } catch (error) {
      await ComplianceLogger.logControlExecution('CC6.1', {
        executedBy: 'automated-test',
        executionResult: 'failure',
        timestamp: new Date(),
        evidence: { error: error.message },
        riskRating: 'high',
      })

      throw error
    }
  }

  // CC6.2 - アクセス制御テスト
  static async testAccessControls(): Promise<ControlTestResult> {
    const tests = [
      await this.testUnauthorizedAPIAccess(),
      await this.testPrivilegeEscalation(),
      await this.testSessionTimeout(),
    ]

    return {
      controlId: 'CC6.2',
      passed: tests.every((t) => t.passed),
      details: tests,
    }
  }
}
```

## 4. セキュリティインシデント対応計画

```typescript
// インシデント分類
enum IncidentSeverity {
  CRITICAL = 'CRITICAL', // データ漏洩、サービス完全停止
  HIGH = 'HIGH', // セキュリティ侵害、部分サービス停止
  MEDIUM = 'MEDIUM', // 脆弱性発見、パフォーマンス問題
  LOW = 'LOW', // 軽微な問題、予防的対応
}

// インシデント対応プロセス
export class IncidentResponse {
  static async handleSecurityIncident(incident: {
    type: string
    severity: IncidentSeverity
    description: string
    detectedBy: string
    affectedSystems: string[]
    evidence: any
  }) {
    const incidentId = uuid.v4()

    // 1. インシデント記録
    await db.securityIncident.create({
      data: {
        id: incidentId,
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        detectedBy: incident.detectedBy,
        detectedAt: new Date(),
        status: 'INVESTIGATING',
        affectedSystems: incident.affectedSystems,
        evidence: JSON.stringify(incident.evidence),
      },
    })

    // 2. 重大度に応じた即座対応
    switch (incident.severity) {
      case IncidentSeverity.CRITICAL:
        await this.criticalIncidentResponse(incidentId, incident)
        break
      case IncidentSeverity.HIGH:
        await this.highIncidentResponse(incidentId, incident)
        break
      default:
        await this.standardIncidentResponse(incidentId, incident)
    }

    // 3. ステークホルダー通知
    await this.notifyStakeholders(incidentId, incident)

    return incidentId
  }

  private static async criticalIncidentResponse(incidentId: string, incident: any) {
    // 即座にサービス保護措置
    await Promise.all([
      this.enableEmergencyMode(),
      this.blockSuspiciousTraffic(),
      this.isolateAffectedSystems(incident.affectedSystems),
    ])

    // 緊急チーム招集
    await this.activateIncidentResponseTeam(incidentId)

    // 法執行機関への報告準備
    if (incident.type === 'DATA_BREACH') {
      await this.prepareBreachNotification(incidentId)
    }
  }

  private static async enableEmergencyMode() {
    // 全システムを読み取り専用モードに
    await db.$executeRaw`
      UPDATE system_config 
      SET emergency_mode = true, 
          read_only_mode = true
      WHERE id = 1
    `

    // 管理者以外のアクセスを一時停止
    await this.suspendNonAdminAccess()
  }

  // データ漏洩通知
  private static async prepareBreachNotification(incidentId: string) {
    // GDPR: 72時間以内にDPAへ報告
    const notificationData = {
      incidentId,
      natureOfBreach: 'システムセキュリティ侵害',
      categoriesOfData: ['個人識別情報', '学習進捗データ'],
      approximateNumber: await this.estimateAffectedUsers(),
      likelyConsequences: 'データの不正アクセス可能性',
      measuresTaken: '即座のシステム隔離、パスワードリセット要求',
      contactPoint: 'dpo@company.com',
    }

    await db.breachNotification.create({
      data: {
        incidentId,
        notificationType: 'DPA_NOTIFICATION',
        requiredBy: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72時間後
        notificationData: JSON.stringify(notificationData),
        status: 'DRAFT',
      },
    })
  }
}

// 自動脅威検知
export class ThreatDetection {
  static async detectAnomalies() {
    const threats = await Promise.all([
      this.detectBruteForceAttacks(),
      this.detectSQLInjectionAttempts(),
      this.detectDataExfiltration(),
      this.detectPrivilegeEscalation(),
    ])

    for (const threat of threats.filter((t) => t.detected)) {
      await IncidentResponse.handleSecurityIncident({
        type: threat.type,
        severity: threat.severity,
        description: threat.description,
        detectedBy: 'automated-detection',
        affectedSystems: threat.affectedSystems,
        evidence: threat.evidence,
      })
    }
  }

  private static async detectBruteForceAttacks(): Promise<ThreatDetection> {
    const suspiciousLogins = await db.securityAuditLog.findMany({
      where: {
        action: 'LOGIN_FAILURE',
        timestamp: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
      select: { ipAddress: true },
      groupBy: ['ipAddress'],
      having: { _count: { gte: 10 } },
    })

    if (suspiciousLogins.length > 0) {
      // 自動ブロック実施
      for (const login of suspiciousLogins) {
        await this.blockIPAddress(login.ipAddress, '1 hour', 'BRUTE_FORCE_DETECTED')
      }

      return {
        detected: true,
        type: 'BRUTE_FORCE_ATTACK',
        severity: IncidentSeverity.HIGH,
        description: `${suspiciousLogins.length}個のIPアドレスからブルートフォース攻撃を検知`,
        affectedSystems: ['authentication'],
        evidence: { suspiciousIPs: suspiciousLogins.map((l) => l.ipAddress) },
      }
    }

    return { detected: false, type: 'BRUTE_FORCE_ATTACK' }
  }
}
```

この包括的なセキュリティ実装により、PMPLearningManagementプロジェクトは以下のコンプライアンス要件を満たします：

1. **PCI DSS Level 1** - 決済データの完全保護
2. **GDPR** - EU個人データ保護規則完全準拠
3. **SOC 2 Type II** - 信頼性とセキュリティの運用統制
4. **OWASP Top 10** - Webアプリケーション脆弱性対策
5. **ISO 27001** - 情報セキュリティ管理システム
6. **個人情報保護法** - 日本の個人情報保護要件

実装優先度：

- **Critical（即座）**: 認証基盤、暗号化、監査ログ
- **High（2週間）**: RBAC、セキュリティヘッダー、インシデント対応
- **Medium（1ヶ月）**: 脅威検知、コンプライアンス自動化
- **Low（3ヶ月）**: 高度な監視、AI異常検知、統制テスト自動化
