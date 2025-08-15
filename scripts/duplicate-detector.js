/**
 * 重複Issue検出システム
 * 高度なアルゴリズムによる類似Issue検出と自動処理
 */

const fs = require('fs').promises

class DuplicateDetector {
  constructor(github, context, core) {
    this.github = github
    this.context = context
    this.core = core

    // 検出設定
    this.detectionConfig = {
      // 類似度閾値
      thresholds: {
        title: 0.7, // タイトル類似度
        body: 0.6, // 本文類似度
        overall: 0.65, // 総合類似度
        labels: 0.4, // ラベル類似度
        semantic: 0.8, // セマンティック類似度
      },

      // 重み設定
      weights: {
        title: 0.4,
        body: 0.3,
        labels: 0.2,
        metadata: 0.1,
      },

      // 検索対象期間（日）
      searchPeriod: 180,

      // 処理対象の最大Issue数
      maxIssuesCheck: 500,
    }

    // 除外設定
    this.exclusionRules = {
      skipLabels: ['duplicate:confirmed', 'duplicate:false-positive'],
      skipStates: ['closed'],
      skipUsers: ['dependabot[bot]', 'github-actions[bot]'],
      minTitleLength: 10,
      minBodyLength: 20,
    }

    // キーワード辞書
    this.keywords = {
      technical: ['bug', 'error', 'issue', 'problem', 'fail', 'crash', 'broken'],
      feature: ['feature', 'enhancement', 'improve', 'add', 'support', 'implement'],
      ui: ['ui', 'interface', 'design', 'layout', 'style', 'css', 'responsive'],
      performance: ['slow', 'performance', 'speed', 'optimize', 'lag', 'memory'],
      security: ['security', 'vulnerability', 'auth', 'permission', 'xss', 'csrf'],
    }
  }

  /**
   * メイン重複検出処理
   */
  async detectDuplicates(targetIssue = null, mode = 'comprehensive') {
    console.log('🔍 重複Issue検出を開始...')

    try {
      const issues = await this.getTargetIssues(targetIssue)
      console.log(`📊 ${issues.length}件のIssueを分析中...`)

      const results = {
        duplicatePairs: [],
        potentialDuplicates: [],
        processedIssues: issues.length,
        mode,
        executedAt: new Date(),
      }

      if (targetIssue) {
        // 単一Issue対象モード
        results.duplicatePairs = await this.findDuplicatesForIssue(targetIssue, issues)
      } else {
        // 全Issue分析モード
        results.duplicatePairs = await this.findAllDuplicatePairs(issues, mode)
      }

      // 潜在的重複の検出
      results.potentialDuplicates = this.identifyPotentialDuplicates(results.duplicatePairs)

      // 結果処理
      await this.processDuplicateResults(results)

      console.log(`✅ 重複検出完了: ${results.duplicatePairs.length}組の重複ペア検出`)
      return results
    } catch (error) {
      console.error('❌ 重複検出中にエラー:', error)
      throw error
    }
  }

  /**
   * 検出対象Issues取得
   */
  async getTargetIssues(targetIssue) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.detectionConfig.searchPeriod)

    let issues

    if (targetIssue) {
      // 特定Issue向けの検索（既存のオープンIssueをチェック）
      issues = await this.github.paginate(this.github.rest.issues.listForRepo, {
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        state: 'open',
        per_page: 100,
      })
    } else {
      // 全体検索
      issues = await this.github.paginate(this.github.rest.issues.listForRepo, {
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        state: 'all',
        since: cutoffDate.toISOString(),
        per_page: 100,
        sort: 'created',
        direction: 'desc',
      })
    }

    // フィルタリング
    const filteredIssues = issues
      .filter((issue) => !issue.pull_request) // PR除外
      .filter((issue) => !this.exclusionRules.skipUsers.includes(issue.user.login))
      .filter((issue) => !this.hasSkipLabel(issue))
      .filter((issue) => (issue.title || '').length >= this.exclusionRules.minTitleLength)
      .filter((issue) => (issue.body || '').length >= this.exclusionRules.minBodyLength)
      .slice(0, this.detectionConfig.maxIssuesCheck)

    return filteredIssues
  }

  /**
   * 単一Issue向け重複検索
   */
  async findDuplicatesForIssue(targetIssue, candidateIssues) {
    const duplicates = []

    for (const candidate of candidateIssues) {
      if (candidate.number === targetIssue.number) continue

      const similarity = await this.calculateSimilarity(targetIssue, candidate)

      if (similarity.overall >= this.detectionConfig.thresholds.overall) {
        duplicates.push({
          issue1: targetIssue,
          issue2: candidate,
          similarity,
          confidence: this.calculateConfidence(similarity),
          recommendedAction: this.getRecommendedAction(similarity, targetIssue, candidate),
        })
      }
    }

    return duplicates.sort((a, b) => b.similarity.overall - a.similarity.overall)
  }

  /**
   * 全Issue重複検索
   */
  async findAllDuplicatePairs(issues, mode) {
    const duplicatePairs = []
    const processed = new Set()

    for (let i = 0; i < issues.length; i++) {
      if (processed.has(issues[i].number)) continue

      const currentIssue = issues[i]

      for (let j = i + 1; j < issues.length; j++) {
        if (processed.has(issues[j].number)) continue

        const compareIssue = issues[j]
        const similarity = await this.calculateSimilarity(currentIssue, compareIssue)

        if (similarity.overall >= this.detectionConfig.thresholds.overall) {
          duplicatePairs.push({
            issue1: currentIssue,
            issue2: compareIssue,
            similarity,
            confidence: this.calculateConfidence(similarity),
            recommendedAction: this.getRecommendedAction(similarity, currentIssue, compareIssue),
          })

          // より新しいIssueを重複としてマーク
          const newerIssue =
            new Date(currentIssue.created_at) > new Date(compareIssue.created_at)
              ? currentIssue
              : compareIssue
          processed.add(newerIssue.number)
        }

        // 進捗表示
        if ((i * issues.length + j) % 100 === 0) {
          console.log(
            `📊 進捗: ${Math.round(((i * issues.length + j) / (issues.length * issues.length)) * 100)}%`
          )
        }
      }
    }

    return duplicatePairs.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 類似度計算（総合）
   */
  async calculateSimilarity(issue1, issue2) {
    const titleSim = this.calculateTextSimilarity(
      this.normalizeText(issue1.title || ''),
      this.normalizeText(issue2.title || '')
    )

    const bodySim = this.calculateTextSimilarity(
      this.normalizeText(issue1.body || ''),
      this.normalizeText(issue2.body || '')
    )

    const labelSim = this.calculateLabelSimilarity(issue1.labels, issue2.labels)

    const metadataSim = this.calculateMetadataSimilarity(issue1, issue2)

    const semanticSim = this.calculateSemanticSimilarity(issue1, issue2)

    const overallSim =
      titleSim * this.detectionConfig.weights.title +
      bodySim * this.detectionConfig.weights.body +
      labelSim * this.detectionConfig.weights.labels +
      metadataSim * this.detectionConfig.weights.metadata

    return {
      title: titleSim,
      body: bodySim,
      labels: labelSim,
      metadata: metadataSim,
      semantic: semanticSim,
      overall: Math.max(overallSim, semanticSim), // セマンティック類似度を考慮
    }
  }

  /**
   * テキスト類似度計算（Jaccard + Edit Distance）
   */
  calculateTextSimilarity(text1, text2) {
    if (!text1 && !text2) return 1.0
    if (!text1 || !text2) return 0.0

    // Jaccard類似度
    const words1 = new Set(text1.split(/\s+/).filter((w) => w.length > 2))
    const words2 = new Set(text2.split(/\s+/).filter((w) => w.length > 2))

    const intersection = new Set([...words1].filter((w) => words2.has(w)))
    const union = new Set([...words1, ...words2])

    const jaccardSim = union.size > 0 ? intersection.size / union.size : 0

    // Edit Distance（正規化）
    const editDist = this.calculateEditDistance(text1, text2)
    const maxLen = Math.max(text1.length, text2.length)
    const editSim = maxLen > 0 ? 1 - editDist / maxLen : 1

    // N-gram類似度
    const ngramSim = this.calculateNGramSimilarity(text1, text2, 3)

    // 重み付き平均
    return jaccardSim * 0.4 + editSim * 0.3 + ngramSim * 0.3
  }

  /**
   * ラベル類似度計算
   */
  calculateLabelSimilarity(labels1, labels2) {
    const labelNames1 = new Set((labels1 || []).map((l) => l.name))
    const labelNames2 = new Set((labels2 || []).map((l) => l.name))

    if (labelNames1.size === 0 && labelNames2.size === 0) return 1.0
    if (labelNames1.size === 0 || labelNames2.size === 0) return 0.0

    const intersection = new Set([...labelNames1].filter((l) => labelNames2.has(l)))
    const union = new Set([...labelNames1, ...labelNames2])

    return intersection.size / union.size
  }

  /**
   * メタデータ類似度計算
   */
  calculateMetadataSimilarity(issue1, issue2) {
    let similarity = 0
    let factors = 0

    // 作成者類似度
    if (issue1.user.login === issue2.user.login) {
      similarity += 1
    }
    factors++

    // マイルストーン類似度
    if (issue1.milestone && issue2.milestone) {
      if (issue1.milestone.id === issue2.milestone.id) {
        similarity += 1
      }
    } else if (!issue1.milestone && !issue2.milestone) {
      similarity += 0.5
    }
    factors++

    // 担当者類似度
    const assignees1 = (issue1.assignees || []).map((a) => a.login)
    const assignees2 = (issue2.assignees || []).map((a) => a.login)
    const commonAssignees = assignees1.filter((a) => assignees2.includes(a))

    if (assignees1.length > 0 || assignees2.length > 0) {
      const totalAssignees = new Set([...assignees1, ...assignees2]).size
      similarity += commonAssignees.length / totalAssignees
    } else {
      similarity += 0.5
    }
    factors++

    return factors > 0 ? similarity / factors : 0
  }

  /**
   * セマンティック類似度計算
   */
  calculateSemanticSimilarity(issue1, issue2) {
    // キーワードベースのセマンティック類似度
    const text1 = `${issue1.title} ${issue1.body}`.toLowerCase()
    const text2 = `${issue2.title} ${issue2.body}`.toLowerCase()

    let totalScore = 0
    let categories = 0

    for (const [category, keywords] of Object.entries(this.keywords)) {
      const score1 = keywords.filter((kw) => text1.includes(kw)).length
      const score2 = keywords.filter((kw) => text2.includes(kw)).length

      if (score1 > 0 || score2 > 0) {
        const similarity = Math.min(score1, score2) / Math.max(score1, score2, 1)
        totalScore += similarity
        categories++
      }
    }

    return categories > 0 ? totalScore / categories : 0
  }

  /**
   * Edit Distance計算
   */
  calculateEditDistance(str1, str2) {
    const matrix = []
    const len1 = str1.length
    const len2 = str2.length

    // 初期化
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j
    }

    // 動的計画法
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // 削除
          matrix[i][j - 1] + 1, // 挿入
          matrix[i - 1][j - 1] + cost // 置換
        )
      }
    }

    return matrix[len1][len2]
  }

  /**
   * N-gram類似度計算
   */
  calculateNGramSimilarity(text1, text2, n) {
    const ngrams1 = this.generateNGrams(text1, n)
    const ngrams2 = this.generateNGrams(text2, n)

    if (ngrams1.size === 0 && ngrams2.size === 0) return 1.0
    if (ngrams1.size === 0 || ngrams2.size === 0) return 0.0

    const intersection = new Set([...ngrams1].filter((ng) => ngrams2.has(ng)))
    const union = new Set([...ngrams1, ...ngrams2])

    return intersection.size / union.size
  }

  /**
   * N-gram生成
   */
  generateNGrams(text, n) {
    const ngrams = new Set()
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ')

    for (let i = 0; i <= cleanText.length - n; i++) {
      ngrams.add(cleanText.slice(i, i + n))
    }

    return ngrams
  }

  /**
   * テキスト正規化
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // 記号除去
      .replace(/\s+/g, ' ') // 連続空白を単一空白に
      .trim()
  }

  /**
   * 信頼度計算
   */
  calculateConfidence(similarity) {
    // 複数の類似度指標を組み合わせて信頼度を計算
    const weights = [
      similarity.title * 0.3,
      similarity.body * 0.25,
      similarity.labels * 0.2,
      similarity.semantic * 0.15,
      similarity.metadata * 0.1,
    ]

    const baseConfidence = weights.reduce((sum, w) => sum + w, 0)

    // ボーナス要素
    let bonus = 0
    if (similarity.title > 0.8) bonus += 0.1 // 高いタイトル類似度
    if (similarity.semantic > 0.7) bonus += 0.05 // 高いセマンティック類似度
    if (similarity.labels > 0.6) bonus += 0.05 // 高いラベル類似度

    return Math.min(1.0, baseConfidence + bonus)
  }

  /**
   * 推奨アクション決定
   */
  getRecommendedAction(similarity, issue1, issue2) {
    const confidence = this.calculateConfidence(similarity)

    if (confidence >= 0.9) {
      return {
        action: 'auto_close',
        reason: '高い信頼度で重複と判定',
        confidence: 'very_high',
      }
    } else if (confidence >= 0.75) {
      return {
        action: 'manual_review',
        reason: '重複の可能性が高い - 手動確認推奨',
        confidence: 'high',
      }
    } else if (confidence >= 0.6) {
      return {
        action: 'flag_duplicate',
        reason: '重複の可能性あり - 確認が必要',
        confidence: 'medium',
      }
    } else {
      return {
        action: 'monitor',
        reason: '低い類似度 - 監視継続',
        confidence: 'low',
      }
    }
  }

  /**
   * 潜在的重複の特定
   */
  identifyPotentialDuplicates(duplicatePairs) {
    return duplicatePairs.filter((pair) => pair.confidence >= 0.5 && pair.confidence < 0.75)
  }

  /**
   * 重複検出結果の処理
   */
  async processDuplicateResults(results) {
    console.log('🔄 重複検出結果を処理中...')

    for (const duplicatePair of results.duplicatePairs) {
      await this.handleDuplicatePair(duplicatePair)
    }

    // サマリーレポート生成
    const report = await this.generateDuplicateReport(results)
    await this.saveDuplicateReport(report)

    // GitHub Outputsに結果設定
    this.core.setOutput('duplicates_found', results.duplicatePairs.length)
    this.core.setOutput('potential_duplicates', results.potentialDuplicates.length)
    this.core.setOutput('duplicate_report', JSON.stringify(results))

    console.log(`📊 処理完了: ${results.duplicatePairs.length}組の重複ペア処理`)
  }

  /**
   * 重複ペアの処理
   */
  async handleDuplicatePair(duplicatePair) {
    const { issue1, issue2, similarity, confidence, recommendedAction } = duplicatePair

    try {
      // より新しいIssueを重複対象とする
      const newerIssue = new Date(issue1.created_at) > new Date(issue2.created_at) ? issue1 : issue2
      const olderIssue = newerIssue === issue1 ? issue2 : issue1

      switch (recommendedAction.action) {
        case 'auto_close':
          await this.autoCloseDuplicate(newerIssue, olderIssue, similarity, confidence)
          break

        case 'manual_review':
          await this.flagForManualReview(newerIssue, olderIssue, similarity, confidence)
          break

        case 'flag_duplicate':
          await this.flagAsPotentialDuplicate(newerIssue, olderIssue, similarity)
          break

        case 'monitor':
          // 監視のみ - アクションなし
          console.log(`👁️  監視継続: Issue #${newerIssue.number} と #${olderIssue.number}`)
          break
      }
    } catch (error) {
      console.error(
        `❌ 重複ペア処理エラー (Issues #${issue1.number}, #${issue2.number}):`,
        error.message
      )
    }
  }

  /**
   * 自動クローズ処理
   */
  async autoCloseDuplicate(duplicateIssue, originalIssue, similarity, confidence) {
    // 重複ラベル追加
    await this.github.rest.issues.addLabels({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      issue_number: duplicateIssue.number,
      labels: ['duplicate:confirmed', 'auto-closed'],
    })

    // 重複コメント追加
    const comment = this.generateDuplicateComment(
      duplicateIssue,
      originalIssue,
      similarity,
      confidence,
      'auto-closed'
    )
    await this.github.rest.issues.createComment({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      issue_number: duplicateIssue.number,
      body: comment,
    })

    // Issueをクローズ
    await this.github.rest.issues.update({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      issue_number: duplicateIssue.number,
      state: 'closed',
    })

    console.log(`🔒 自動クローズ: Issue #${duplicateIssue.number} (重複: #${originalIssue.number})`)
  }

  /**
   * 手動レビュー用フラグ設定
   */
  async flagForManualReview(duplicateIssue, originalIssue, similarity, confidence) {
    // レビューラベル追加
    await this.github.rest.issues.addLabels({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      issue_number: duplicateIssue.number,
      labels: ['duplicate:needs-review', 'needs:manual-review'],
    })

    // レビューコメント追加
    const comment = this.generateDuplicateComment(
      duplicateIssue,
      originalIssue,
      similarity,
      confidence,
      'manual-review'
    )
    await this.github.rest.issues.createComment({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      issue_number: duplicateIssue.number,
      body: comment,
    })

    console.log(
      `🔍 手動レビュー要求: Issue #${duplicateIssue.number} (類似: #${originalIssue.number})`
    )
  }

  /**
   * 潜在的重複フラグ設定
   */
  async flagAsPotentialDuplicate(duplicateIssue, originalIssue, similarity) {
    // 潜在的重複ラベル追加
    await this.github.rest.issues.addLabels({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      issue_number: duplicateIssue.number,
      labels: ['duplicate:possible'],
    })

    // 潜在的重複コメント追加
    const comment = this.generateDuplicateComment(
      duplicateIssue,
      originalIssue,
      similarity,
      null,
      'potential'
    )
    await this.github.rest.issues.createComment({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      issue_number: duplicateIssue.number,
      body: comment,
    })

    console.log(
      `⚠️  潜在的重複フラグ: Issue #${duplicateIssue.number} (類似: #${originalIssue.number})`
    )
  }

  /**
   * 重複コメント生成
   */
  generateDuplicateComment(duplicateIssue, originalIssue, similarity, confidence, action) {
    let comment = `## 🔍 重複Issue検出\n\n`

    if (action === 'auto-closed') {
      comment += `このIssueは重複として自動的にクローズされました。\n\n`
    } else if (action === 'manual-review') {
      comment += `このIssueは重複の可能性が高いため、手動レビューが必要です。\n\n`
    } else {
      comment += `このIssueは既存のIssueと類似している可能性があります。\n\n`
    }

    comment += `**類似Issue**: #${originalIssue.number} - [${originalIssue.title}](${originalIssue.html_url})\n\n`

    comment += `**類似度分析**:\n`
    comment += `- タイトル類似度: ${Math.round(similarity.title * 100)}%\n`
    comment += `- 内容類似度: ${Math.round(similarity.body * 100)}%\n`
    comment += `- ラベル類似度: ${Math.round(similarity.labels * 100)}%\n`
    comment += `- 総合類似度: ${Math.round(similarity.overall * 100)}%\n`

    if (confidence) {
      comment += `- 信頼度: ${Math.round(confidence * 100)}%\n`
    }

    comment += `\n**推奨アクション**:\n`

    if (action === 'auto-closed') {
      comment += `- このIssueは自動的にクローズされました\n`
      comment += `- 引き続き議論が必要な場合は、元のIssue #${originalIssue.number} でコメントしてください\n`
    } else if (action === 'manual-review') {
      comment += `- [ ] 重複かどうか確認してください\n`
      comment += `- [ ] 重複の場合は、このIssueをクローズして元のIssueで議論を継続してください\n`
      comment += `- [ ] 重複でない場合は、\`duplicate:false-positive\` ラベルを追加してください\n`
    } else {
      comment += `- [ ] 既存のIssueと重複していないか確認してください\n`
      comment += `- [ ] 重複の場合は、このIssueをクローズしてください\n`
    }

    comment += `\n---\n*重複検出システム v2.0による自動分析 🤖*`

    return comment
  }

  /**
   * 重複レポート生成
   */
  async generateDuplicateReport(results) {
    const timestamp = new Date().toLocaleString('ja-JP')

    let report = `# 🔍 重複Issue検出レポート - ${timestamp}\n\n`

    report += `## 📊 検出サマリー\n`
    report += `- **処理対象Issues**: ${results.processedIssues}件\n`
    report += `- **重複ペア検出**: ${results.duplicatePairs.length}組\n`
    report += `- **潜在的重複**: ${results.potentialDuplicates.length}件\n`
    report += `- **実行モード**: ${results.mode}\n\n`

    if (results.duplicatePairs.length > 0) {
      report += `## 🚨 検出された重複Issues\n\n`

      for (const pair of results.duplicatePairs.slice(0, 20)) {
        // 上位20件
        const { issue1, issue2, similarity, confidence, recommendedAction } = pair
        const actionEmoji =
          {
            auto_close: '🔒',
            manual_review: '🔍',
            flag_duplicate: '⚠️',
            monitor: '👁️',
          }[recommendedAction.action] || '❓'

        report += `### ${actionEmoji} Issues #${issue1.number} & #${issue2.number}\n`
        report += `- **Issue #${issue1.number}**: [${issue1.title}](${issue1.html_url})\n`
        report += `- **Issue #${issue2.number}**: [${issue2.title}](${issue2.html_url})\n`
        report += `- **類似度**: ${Math.round(similarity.overall * 100)}% (信頼度: ${Math.round(confidence * 100)}%)\n`
        report += `- **推奨アクション**: ${recommendedAction.reason}\n\n`
      }
    }

    if (results.potentialDuplicates.length > 0) {
      report += `## ⚠️  要確認: 潜在的重複Issues\n\n`

      for (const pair of results.potentialDuplicates.slice(0, 10)) {
        report += `- **#${pair.issue1.number}** & **#${pair.issue2.number}** (類似度: ${Math.round(pair.similarity.overall * 100)}%)\n`
      }
    }

    report += `\n## 📋 次のアクション\n`
    report += `- [ ] 手動レビューが必要なIssueの確認\n`
    report += `- [ ] 自動クローズされたIssueの妥当性確認\n`
    report += `- [ ] 重複検出アルゴリズムの精度評価\n`
    report += `- [ ] 検出パラメータの調整検討\n\n`

    report += `---\n*自動生成レポート | 実行時刻: ${timestamp} 🤖*`

    return report
  }

  /**
   * レポート保存
   */
  async saveDuplicateReport(report) {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `duplicate-detection-report-${timestamp}.md`
    const filepath = `/tmp/${filename}`

    await fs.writeFile(filepath, report)

    this.core.setOutput('duplicate_report_path', filepath)
    console.log(`💾 重複検出レポート保存: ${filepath}`)
  }

  /**
   * スキップラベルチェック
   */
  hasSkipLabel(issue) {
    const labels = (issue.labels || []).map((l) => l.name)
    return this.exclusionRules.skipLabels.some((skipLabel) => labels.includes(skipLabel))
  }
}

module.exports = { DuplicateDetector }
