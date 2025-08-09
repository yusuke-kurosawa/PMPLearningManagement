/**
 * SLA監視・アラートシステム
 * Issue対応時間の監視とSLA違反の検出・通知
 */

const fs = require('fs').promises

class SLAMonitor {
  constructor(github, context, core) {
    this.github = github
    this.context = context
    this.core = core

    // SLA定義（時間単位）
    this.slaRules = {
      // 優先度ベース
      'priority:critical': {
        response: 1, // 1時間以内に初回対応
        resolution: 8, // 8時間以内に解決
        escalation: 2, // 2時間で自動エスカレーション
      },
      'priority:high': {
        response: 4, // 4時間以内に初回対応
        resolution: 24, // 24時間以内に解決
        escalation: 8, // 8時間で自動エスカレーション
      },
      'priority:medium': {
        response: 24, // 24時間以内に初回対応
        resolution: 72, // 72時間以内に解決
        escalation: 48, // 48時間で自動エスカレーション
      },
      'priority:low': {
        response: 72, // 72時間以内に初回対応
        resolution: 168, // 1週間以内に解決
        escalation: 120, // 5日で自動エスカレーション
      },

      // 特別カテゴリ
      security: {
        response: 0.5, // 30分以内に初回対応
        resolution: 4, // 4時間以内に解決
        escalation: 1, // 1時間で自動エスカレーション
      },
      bug: {
        response: 8, // 8時間以内に初回対応
        resolution: 48, // 48時間以内に解決
        escalation: 24, // 24時間で自動エスカレーション
      },
      production: {
        response: 2, // 2時間以内に初回対応
        resolution: 12, // 12時間以内に解決
        escalation: 4, // 4時間で自動エスカレーション
      },
    }

    // デフォルト設定
    this.defaultSLA = {
      response: 72,
      resolution: 168,
      escalation: 120,
    }

    // エスカレーション設定
    this.escalationRules = {
      levels: [
        { threshold: 1.0, action: 'comment', message: 'SLA期限に近づいています' },
        { threshold: 1.2, action: 'label', label: 'sla:at-risk' },
        { threshold: 1.5, action: 'escalate', team: 'leads' },
        { threshold: 2.0, action: 'critical-escalate', team: 'management' },
      ],
      teams: {
        leads: ['team-lead-1', 'team-lead-2'],
        management: ['manager-1', 'director-1'],
        security: ['security-lead', 'ciso'],
      },
    }
  }

  /**
   * 全Issues SLA監視実行
   */
  async runSLAMonitoring() {
    console.log('🔍 SLA監視を開始します...')

    const violations = []
    const atRiskIssues = []
    const escalationActions = []

    try {
      // 未解決Issueを取得
      const openIssues = await this.getOpenIssues()
      console.log(`📊 ${openIssues.length}件の未解決Issueをチェック中...`)

      for (const issue of openIssues) {
        const slaStatus = await this.checkIssueSLA(issue)

        if (slaStatus.isViolation) {
          violations.push({
            issue,
            slaStatus,
            severity: this.calculateViolationSeverity(slaStatus),
          })
        } else if (slaStatus.isAtRisk) {
          atRiskIssues.push({
            issue,
            slaStatus,
          })
        }

        // エスカレーション判定
        const escalation = this.checkEscalationNeeded(issue, slaStatus)
        if (escalation.needed) {
          escalationActions.push({
            issue,
            escalation,
            slaStatus,
          })
        }
      }

      // 結果の処理
      await this.processSLAResults({
        violations,
        atRiskIssues,
        escalationActions,
        totalChecked: openIssues.length,
      })

      return {
        success: true,
        summary: {
          totalChecked: openIssues.length,
          violations: violations.length,
          atRisk: atRiskIssues.length,
          escalations: escalationActions.length,
        },
        violations,
        atRiskIssues,
        escalationActions,
      }
    } catch (error) {
      console.error('❌ SLA監視中にエラーが発生:', error)
      throw error
    }
  }

  /**
   * 未解決Issues取得
   */
  async getOpenIssues() {
    const issues = await this.github.paginate(this.github.rest.issues.listForRepo, {
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      state: 'open',
      per_page: 100,
      sort: 'created',
      direction: 'asc',
    })

    return issues.filter((issue) => !issue.pull_request) // PRを除外
  }

  /**
   * 個別Issue SLAチェック
   */
  async checkIssueSLA(issue) {
    const sla = this.getApplicableSLA(issue)
    const times = this.calculateIssueTimelines(issue)
    const comments = await this.getIssueComments(issue.number)

    const status = {
      issue: issue.number,
      title: issue.title,
      url: issue.html_url,
      createdAt: issue.created_at,
      labels: issue.labels.map((l) => l.name),
      assignees: issue.assignees.map((a) => a.login),

      // SLA設定
      appliedSLA: sla,

      // 時間情報
      hoursOpen: times.hoursOpen,
      hoursWithoutResponse: times.hoursWithoutResponse,
      hoursWithoutUpdate: times.hoursWithoutUpdate,

      // SLA違反状況
      responseViolation: times.hoursWithoutResponse > sla.response,
      resolutionViolation: times.hoursOpen > sla.resolution,
      escalationDue: times.hoursOpen > sla.escalation,

      // リスク状況
      isAtRisk: this.calculateRiskLevel(times, sla) > 0.8,
      riskLevel: this.calculateRiskLevel(times, sla),

      // 総合判定
      isViolation: false,
      severity: 'low',

      // 追加情報
      lastActivity: this.getLastActivityTime(issue, comments),
      hasResponse: comments.length > 0,
      responseTime: comments.length > 0 ? this.calculateResponseTime(issue, comments[0]) : null,
    }

    // 違反判定
    status.isViolation = status.responseViolation || status.resolutionViolation
    status.severity = this.calculateViolationSeverity(status)

    return status
  }

  /**
   * Issue適用SLA取得
   */
  getApplicableSLA(issue) {
    const labels = issue.labels.map((l) => l.name)
    let applicableSLA = { ...this.defaultSLA }

    // 最も厳しいSLAを適用（複数ラベルの場合）
    for (const label of labels) {
      if (this.slaRules[label]) {
        const ruleSLA = this.slaRules[label]
        applicableSLA = {
          response: Math.min(applicableSLA.response, ruleSLA.response),
          resolution: Math.min(applicableSLA.resolution, ruleSLA.resolution),
          escalation: Math.min(applicableSLA.escalation, ruleSLA.escalation),
        }
      }
    }

    return applicableSLA
  }

  /**
   * Issue時間計算
   */
  calculateIssueTimelines(issue) {
    const now = new Date()
    const createdAt = new Date(issue.created_at)
    const updatedAt = new Date(issue.updated_at)

    return {
      hoursOpen: (now - createdAt) / (1000 * 60 * 60),
      hoursWithoutResponse: (now - createdAt) / (1000 * 60 * 60), // コメントで修正
      hoursWithoutUpdate: (now - updatedAt) / (1000 * 60 * 60),
    }
  }

  /**
   * Issueコメント取得
   */
  async getIssueComments(issueNumber) {
    try {
      const comments = await this.github.rest.issues.listComments({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        issue_number: issueNumber,
      })

      return comments.data.filter(
        (comment) => !comment.user.login.includes('[bot]') // ボットコメントを除外
      )
    } catch (error) {
      console.warn(`⚠️ Issue #${issueNumber} のコメント取得に失敗:`, error.message)
      return []
    }
  }

  /**
   * 初回応答時間計算
   */
  calculateResponseTime(issue, firstComment) {
    const createdAt = new Date(issue.created_at)
    const responseAt = new Date(firstComment.created_at)
    return (responseAt - createdAt) / (1000 * 60 * 60) // 時間単位
  }

  /**
   * 最終活動時刻取得
   */
  getLastActivityTime(issue, comments) {
    const times = [
      new Date(issue.created_at),
      new Date(issue.updated_at),
      ...comments.map((c) => new Date(c.created_at)),
    ]

    return new Date(Math.max(...times))
  }

  /**
   * リスクレベル計算
   */
  calculateRiskLevel(times, sla) {
    const responseRisk = times.hoursWithoutResponse / sla.response
    const resolutionRisk = times.hoursOpen / sla.resolution

    return Math.max(responseRisk, resolutionRisk)
  }

  /**
   * 違反重要度計算
   */
  calculateViolationSeverity(slaStatus) {
    const { responseViolation, resolutionViolation, riskLevel } = slaStatus

    if (riskLevel >= 2.0) return 'critical'
    if (riskLevel >= 1.5) return 'high'
    if (responseViolation || resolutionViolation) return 'medium'
    if (riskLevel >= 0.8) return 'warning'

    return 'low'
  }

  /**
   * エスカレーション必要性チェック
   */
  checkEscalationNeeded(issue, slaStatus) {
    const labels = issue.labels.map((l) => l.name)
    const result = {
      needed: false,
      level: null,
      action: null,
      team: null,
      reason: '',
    }

    // セキュリティIssueの特別処理
    if (labels.includes('security') && slaStatus.hoursOpen > 1) {
      result.needed = true
      result.level = 'critical'
      result.action = 'security-escalate'
      result.team = 'security'
      result.reason = 'セキュリティIssueのSLA違反'
      return result
    }

    // リスクレベルベースのエスカレーション
    for (const rule of this.escalationRules.levels) {
      if (slaStatus.riskLevel >= rule.threshold) {
        result.needed = true
        result.level = rule.action
        result.action = rule.action
        result.team = rule.team
        result.reason = `SLAリスクレベル ${Math.round(slaStatus.riskLevel * 100)}% (閾値: ${rule.threshold * 100}%)`

        // 最新の該当ルールのみ適用
        break
      }
    }

    return result
  }

  /**
   * SLA結果処理
   */
  async processSLAResults(results) {
    const { violations, atRiskIssues, escalationActions, totalChecked } = results

    console.log(`\n📊 SLA監視結果:`)
    console.log(`- 総チェック数: ${totalChecked}`)
    console.log(`- SLA違反: ${violations.length}`)
    console.log(`- リスクあり: ${atRiskIssues.length}`)
    console.log(`- エスカレーション: ${escalationActions.length}\n`)

    // 1. 違反Issueの処理
    for (const violation of violations) {
      await this.handleSLAViolation(violation)
    }

    // 2. リスクIssueの処理
    for (const atRisk of atRiskIssues) {
      await this.handleAtRiskIssue(atRisk)
    }

    // 3. エスカレーションの実行
    for (const escalation of escalationActions) {
      await this.executeEscalation(escalation)
    }

    // 4. サマリーレポート生成
    await this.generateSLAReport(results)

    // 5. 通知送信
    if (violations.length > 0 || escalationActions.length > 0) {
      await this.sendSLAAlerts(results)
    }
  }

  /**
   * SLA違反Issue処理
   */
  async handleSLAViolation(violation) {
    const { issue, slaStatus, severity } = violation

    try {
      // 違反ラベル追加
      const violationLabels = ['sla:violation']
      if (severity === 'critical') violationLabels.push('sla:critical-violation')

      await this.github.rest.issues.addLabels({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        issue_number: issue.number,
        labels: violationLabels,
      })

      // 違反コメント追加
      const comment = this.generateSLAViolationComment(slaStatus, severity)
      await this.github.rest.issues.createComment({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        issue_number: issue.number,
        body: comment,
      })

      console.log(`⚠️ Issue #${issue.number}: SLA違反処理完了 (${severity})`)
    } catch (error) {
      console.error(`❌ Issue #${issue.number} のSLA違反処理に失敗:`, error.message)
    }
  }

  /**
   * リスクIssue処理
   */
  async handleAtRiskIssue(atRisk) {
    const { issue, slaStatus } = atRisk

    try {
      // リスクラベル追加
      await this.github.rest.issues.addLabels({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        issue_number: issue.number,
        labels: ['sla:at-risk'],
      })

      // 担当者がいる場合はメンション、いない場合はアサイン促進
      if (issue.assignees.length === 0) {
        const comment =
          `## ⏰ SLA期限通知\n\nこのIssueはSLA期限に近づいています。担当者のアサインをお願いします。\n\n` +
          `**期限まで**: あと ${Math.round((slaStatus.appliedSLA.response - slaStatus.hoursWithoutResponse) * 60)} 分\n\n` +
          `*自動通知システム 🤖*`

        await this.github.rest.issues.createComment({
          owner: this.context.repo.owner,
          repo: this.context.repo.repo,
          issue_number: issue.number,
          body: comment,
        })
      }

      console.log(`⚠️ Issue #${issue.number}: リスクあり処理完了`)
    } catch (error) {
      console.error(`❌ Issue #${issue.number} のリスク処理に失敗:`, error.message)
    }
  }

  /**
   * エスカレーション実行
   */
  async executeEscalation(escalation) {
    const { issue, escalation: escalationInfo, slaStatus } = escalation

    try {
      switch (escalationInfo.action) {
        case 'comment':
          await this.addEscalationComment(issue, escalationInfo, slaStatus)
          break
        case 'label':
          await this.addEscalationLabel(issue, escalationInfo)
          break
        case 'escalate':
        case 'critical-escalate':
        case 'security-escalate':
          await this.performTeamEscalation(issue, escalationInfo, slaStatus)
          break
      }

      console.log(`🚨 Issue #${issue.number}: エスカレーション実行 (${escalationInfo.action})`)
    } catch (error) {
      console.error(`❌ Issue #${issue.number} のエスカレーション処理に失敗:`, error.message)
    }
  }

  /**
   * チームエスカレーション実行
   */
  async performTeamEscalation(issue, escalationInfo, slaStatus) {
    const teamMembers = this.escalationRules.teams[escalationInfo.team] || []

    if (teamMembers.length > 0) {
      // チームメンバーをアサイン
      await this.github.rest.issues.addAssignees({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        issue_number: issue.number,
        assignees: teamMembers,
      })
    }

    // エスカレーションラベル追加
    await this.github.rest.issues.addLabels({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      issue_number: issue.number,
      labels: [`escalated:${escalationInfo.team}`, 'sla:escalated'],
    })

    // エスカレーションコメント
    const comment =
      `## 🚨 ESCALATION ALERT\n\n` +
      `このIssueは**${escalationInfo.team}**チームにエスカレーションされました。\n\n` +
      `**理由**: ${escalationInfo.reason}\n` +
      `**経過時間**: ${Math.round(slaStatus.hoursOpen)} 時間\n` +
      `**SLA期限**: ${slaStatus.appliedSLA.response} 時間（初回対応）\n` +
      `**優先対応**: ${escalationInfo.action === 'critical-escalate' ? '❗ YES' : 'No'}\n\n` +
      `${teamMembers.length > 0 ? `@${teamMembers.join(' @')}\n\n` : ''}` +
      `即座の対応をお願いします。\n\n*自動エスカレーションシステム 🤖*`

    await this.github.rest.issues.createComment({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      issue_number: issue.number,
      body: comment,
    })
  }

  /**
   * SLA違反コメント生成
   */
  generateSLAViolationComment(slaStatus, severity) {
    const urgencyEmoji = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : '📋'

    let comment = `## ${urgencyEmoji} SLA違反通知\n\n`
    comment += `このIssueはSLA（サービス品質保証）に違反しています。\n\n`

    comment += `**詳細情報**:\n`
    comment += `- **経過時間**: ${Math.round(slaStatus.hoursOpen)} 時間\n`
    comment += `- **初回対応期限**: ${slaStatus.appliedSLA.response} 時間 ${slaStatus.responseViolation ? '❌ 超過' : '✅ 満たす'}\n`
    comment += `- **解決期限**: ${slaStatus.appliedSLA.resolution} 時間 ${slaStatus.resolutionViolation ? '❌ 超過' : '✅ 満たす'}\n`
    comment += `- **リスクレベル**: ${Math.round(slaStatus.riskLevel * 100)}%\n\n`

    if (severity === 'critical') {
      comment += `⚠️ **CRITICAL**: このIssueは緊急対応が必要です。\n`
    }

    comment += `**必要なアクション**:\n`
    comment += `- [ ] 担当者の確認とアサイン\n`
    comment += `- [ ] 現在の状況更新\n`
    comment += `- [ ] 対応計画の共有\n`

    if (slaStatus.labels.includes('security')) {
      comment += `- [ ] セキュリティチームへの報告\n`
    }

    comment += `\n*SLA監視システムからの自動通知 🤖 | 確認日時: ${new Date().toLocaleString('ja-JP')}*`

    return comment
  }

  /**
   * SLAレポート生成
   */
  async generateSLAReport(results) {
    const { violations, atRiskIssues, escalationActions, totalChecked } = results
    const timestamp = new Date().toLocaleString('ja-JP')

    let report = `# 📊 SLA監視レポート - ${timestamp}\n\n`

    // サマリー
    report += `## 📈 実行サマリー\n`
    report += `- **総チェック数**: ${totalChecked} Issues\n`
    report += `- **SLA違反**: ${violations.length} Issues\n`
    report += `- **リスクあり**: ${atRiskIssues.length} Issues\n`
    report += `- **エスカレーション**: ${escalationActions.length} Issues\n\n`

    // 違反詳細
    if (violations.length > 0) {
      report += `## 🚨 SLA違反Issues\n\n`
      for (const violation of violations) {
        const { issue, slaStatus, severity } = violation
        const severityEmoji = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : '🟡'

        report += `### ${severityEmoji} Issue #${issue.number}\n`
        report += `- **タイトル**: ${issue.title}\n`
        report += `- **URL**: [${issue.html_url}](${issue.html_url})\n`
        report += `- **経過**: ${Math.round(slaStatus.hoursOpen)} 時間\n`
        report += `- **期限**: 対応 ${slaStatus.appliedSLA.response}h, 解決 ${slaStatus.appliedSLA.resolution}h\n`
        report += `- **重要度**: ${severity}\n\n`
      }
    }

    // リスクあり詳細
    if (atRiskIssues.length > 0) {
      report += `## ⚠️ リスクありIssues\n\n`
      atRiskIssues.forEach((atRisk) => {
        const { issue, slaStatus } = atRisk
        report += `- **#${issue.number}**: ${issue.title} (リスクレベル: ${Math.round(slaStatus.riskLevel * 100)}%)\n`
      })
      report += `\n`
    }

    // 推奨アクション
    report += `## 🎯 推奨アクション\n\n`
    if (violations.length > 0) {
      report += `- [ ] SLA違反Issueの優先対応実施\n`
      report += `- [ ] 担当者アサインの確認と補強\n`
    }
    if (atRiskIssues.length > 0) {
      report += `- [ ] リスクありIssueの進捗確認\n`
    }
    if (escalationActions.length > 0) {
      report += `- [ ] エスカレーションされたIssueの状況確認\n`
    }
    if (violations.length === 0 && atRiskIssues.length === 0) {
      report += `- [x] 現在SLA違反はありません。継続的な監視を実施中です。\n`
    }

    report += `\n---\n*自動生成レポート | 実行時刻: ${timestamp} 🤖*`

    // レポートをファイルに保存
    const reportPath = `/tmp/sla-report-${Date.now()}.md`
    await fs.writeFile(reportPath, report)

    this.core.setOutput('report_path', reportPath)
    this.core.setOutput('report_content', report)

    console.log(`📝 SLAレポートを生成しました: ${reportPath}`)
    return report
  }

  /**
   * SLAアラート送信
   */
  async sendSLAAlerts(results) {
    const { violations, escalationActions } = results

    // Slack通知用のペイロード生成
    const alertPayload = {
      text: '🚨 SLA監視アラート',
      attachments: [],
    }

    if (violations.length > 0) {
      const criticalViolations = violations.filter((v) => v.severity === 'critical')
      const highViolations = violations.filter((v) => v.severity === 'high')

      alertPayload.attachments.push({
        color: 'danger',
        title: `SLA違反検出: ${violations.length}件`,
        fields: [
          {
            title: 'Critical',
            value: criticalViolations.length,
            short: true,
          },
          {
            title: 'High',
            value: highViolations.length,
            short: true,
          },
          {
            title: 'リポジトリ',
            value: `${this.context.repo.owner}/${this.context.repo.repo}`,
            short: false,
          },
        ],
      })

      // 最も重要な違反Issueの詳細
      if (criticalViolations.length > 0) {
        const topViolation = criticalViolations[0]
        alertPayload.attachments.push({
          color: '#ff0000',
          title: `🔴 Critical Issue #${topViolation.issue.number}`,
          title_link: topViolation.issue.html_url,
          text: `${topViolation.issue.title}\n経過: ${Math.round(topViolation.slaStatus.hoursOpen)}時間`,
          footer: '即座の対応が必要です',
        })
      }
    }

    if (escalationActions.length > 0) {
      alertPayload.attachments.push({
        color: 'warning',
        title: `エスカレーション実行: ${escalationActions.length}件`,
        text: 'チームリーダーまたは管理者の確認が必要です',
      })
    }

    // GitHub Outputに設定
    this.core.setOutput('slack_payload', JSON.stringify(alertPayload))

    console.log('📢 SLAアラート情報をセットしました')
  }
}

module.exports = { SLAMonitor }
