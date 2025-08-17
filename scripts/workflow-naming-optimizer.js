#!/usr/bin/env node

/**
 * GitHub Actions ワークフロー命名規則最適化スクリプト
 *
 * 機能:
 * 1. カテゴリ別の命名規則統一
 * 2. 使用頻度に基づくアーカイブ判定
 * 3. 重複機能の統合提案
 * 4. パフォーマンス最適化
 */

const fs = require('fs')
const path = require('path')

const WORKFLOWS_DIR = './.github/workflows'
const ARCHIVE_DIR = './.github/workflows/archive'

// 新しい命名規則（カテゴリベース）
const NAMING_RULES = {
  // CI関連
  ci: {
    prefix: 'ci-',
    emoji: '🔍',
    description: 'CI関連（テスト、品質チェック、ビルド）',
    files: ['01-core-ci-cd.yml', 'pr-validation.yml', 'test-data-management.yml'],
  },

  // CD関連
  cd: {
    prefix: 'cd-',
    emoji: '🚀',
    description: 'CD関連（デプロイメント、リリース）',
    files: ['deploy.yml'],
  },

  // セキュリティ関連
  security: {
    prefix: 'security-',
    emoji: '🔒',
    description: 'セキュリティ関連（監査、脆弱性チェック）',
    files: [
      '03-security-scan.yml',
      'dependency-health-check.yml',
      'infrastructure-security.yml',
      'compliance-audit.yml',
    ],
  },

  // IDD関連
  idd: {
    prefix: 'idd-',
    emoji: '📋',
    description: 'IDD関連（Issue管理、準拠チェック）',
    files: [
      'idd-compliance.yml',
      'issue-driven-development.yml',
      'idd-metrics-collector.yml',
      'issue-automation.yml',
    ],
  },

  // AI関連
  ai: {
    prefix: 'ai-',
    emoji: '🤖',
    description: 'AI支援（Claude、自動化）',
    files: [
      'claude-pr-review.yml',
      '06-claude-pr-review.yml',
      'claude-pr-review-enhanced.yml',
      'claude-docs-sync.yml',
      'claude-assistant.yml',
      'claude-ai-weekly-monitoring.yml',
      'claude-issue-handler.yml',
      'ai-assisted-review.yml',
    ],
  },

  // メンテナンス関連
  maintenance: {
    prefix: 'maintenance-',
    emoji: '🔧',
    description: 'メンテナンス（依存関係、監視）',
    files: [
      'dependabot-auto-merge.yml',
      'dependency-roadmap.yml',
      'performance-monitoring.yml',
      'monitoring-setup.yml',
      'observability.yml',
    ],
  },

  // 自動化関連
  automation: {
    prefix: 'automation-',
    emoji: '⚡',
    description: '自動化（プロジェクト管理、通知）',
    files: [
      'daily-status-update.yml',
      'project-board-automation.yml',
      'feature-management.yml',
      'notifications.yml',
      'translate-issues.yml',
    ],
  },

  // ガバナンス関連
  governance: {
    prefix: 'governance-',
    emoji: '🏛️',
    description: 'ガバナンス（コンプライアンス、品質管理）',
    files: [
      'compliance-governance-automation.yml',
      'stakeholder-validation.yml',
      'developer-experience.yml',
    ],
  },
}

/**
 * 現在のワークフローファイルを分析
 */
function analyzeCurrentWorkflows() {
  console.log('📊 現在のワークフロー分析中...\n')

  const files = fs
    .readdirSync(WORKFLOWS_DIR)
    .filter((f) => f.endsWith('.yml') && !fs.statSync(path.join(WORKFLOWS_DIR, f)).isDirectory())

  console.log(`発見されたワークフロー: ${files.length}個\n`)

  // カテゴリ別に分類
  const categorizedFiles = {}
  const uncategorizedFiles = []

  Object.entries(NAMING_RULES).forEach(([category, rule]) => {
    categorizedFiles[category] = []
    rule.files.forEach((file) => {
      if (files.includes(file)) {
        categorizedFiles[category].push(file)
      }
    })
  })

  // 未分類ファイルを特定
  files.forEach((file) => {
    let isClassified = false
    Object.values(NAMING_RULES).forEach((rule) => {
      if (rule.files.includes(file)) {
        isClassified = true
      }
    })
    if (!isClassified) {
      uncategorizedFiles.push(file)
    }
  })

  console.log('📂 カテゴリ別分類:')
  Object.entries(categorizedFiles).forEach(([category, categoryFiles]) => {
    if (categoryFiles.length > 0) {
      const rule = NAMING_RULES[category]
      console.log(`${rule.emoji} ${category} (${categoryFiles.length}個):`)
      categoryFiles.forEach((file) => {
        console.log(`   - ${file}`)
      })
    }
  })

  if (uncategorizedFiles.length > 0) {
    console.log(`❓ 未分類 (${uncategorizedFiles.length}個):`)
    uncategorizedFiles.forEach((file) => {
      console.log(`   - ${file}`)
    })
  }

  return { categorizedFiles, uncategorizedFiles, totalFiles: files.length }
}

/**
 * 命名規則の提案を生成
 */
function generateNamingProposals(analysis) {
  console.log('\n💡 命名規則最適化提案:\n')

  const proposals = []

  Object.entries(analysis.categorizedFiles).forEach(([category, files]) => {
    const rule = NAMING_RULES[category]

    files.forEach((file) => {
      // 既に正しい命名規則に従っているかチェック
      if (!file.startsWith(rule.prefix) && !file.match(/^\d+-/)) {
        let newName

        // 特殊なケース処理
        if (file === 'deploy.yml') {
          newName = 'cd-production-deploy.yml'
        } else if (file === 'claude-pr-review.yml' || file === '06-claude-pr-review.yml') {
          newName = 'ai-claude-pr-review.yml'
        } else if (file === 'dependabot-auto-merge.yml') {
          newName = 'maintenance-dependabot-auto-merge.yml'
        } else {
          // 一般的な変換
          const baseName = file.replace(/\.yml$/, '')
          newName = `${rule.prefix}${baseName}.yml`
        }

        proposals.push({
          category,
          currentName: file,
          proposedName: newName,
          reason: `${category}カテゴリの命名規則統一`,
        })
      }
    })
  })

  // 未分類ファイルの処理提案
  analysis.uncategorizedFiles.forEach((file) => {
    // ファイル名から推測されるカテゴリ
    let suggestedCategory = 'automation'
    let suggestedPrefix = 'automation-'

    if (file.includes('test')) {
      suggestedCategory = 'ci'
      suggestedPrefix = 'ci-'
    } else if (file.includes('security') || file.includes('compliance')) {
      suggestedCategory = 'security'
      suggestedPrefix = 'security-'
    } else if (file.includes('deploy')) {
      suggestedCategory = 'cd'
      suggestedPrefix = 'cd-'
    }

    proposals.push({
      category: suggestedCategory,
      currentName: file,
      proposedName: `${suggestedPrefix}${file}`,
      reason: `推測カテゴリ (${suggestedCategory}) による命名規則適用`,
    })
  })

  proposals.forEach((proposal, index) => {
    console.log(
      `${index + 1}. ${NAMING_RULES[proposal.category]?.emoji || '⚪'} ${proposal.currentName} → ${proposal.proposedName}`
    )
    console.log(`   理由: ${proposal.reason}`)
  })

  return proposals
}

/**
 * アーカイブ対象の提案
 */
function generateArchiveProposals(analysis) {
  console.log('\n📦 アーカイブ対象提案:\n')

  // 重複・使用頻度の低いワークフローを特定
  const archiveCandidates = [
    // 重複するClaude関連
    {
      files: ['claude-pr-review.yml', '06-claude-pr-review.yml', 'claude-pr-review-enhanced.yml'],
      keepFile: 'ai-claude-pr-review.yml',
      reason: 'Claude PR レビュー機能の重複。統合版を保持し他をアーカイブ',
    },

    // 重複する監視系
    {
      files: [
        'claude-ai-weekly-monitoring.yml',
        'performance-monitoring.yml',
        'monitoring-setup.yml',
      ],
      keepFile: 'maintenance-monitoring.yml',
      reason: '監視機能の重複。統合監視ワークフローを作成し既存をアーカイブ',
    },

    // 使用頻度が低い実験的機能
    {
      files: ['stakeholder-validation.yml', 'developer-experience.yml'],
      keepFile: null,
      reason: '実験的機能。必要時に復元可能',
    },
  ]

  archiveCandidates.forEach((candidate, index) => {
    console.log(`${index + 1}. 📦 ${candidate.reason}`)
    console.log(`   対象ファイル: ${candidate.files.join(', ')}`)
    if (candidate.keepFile) {
      console.log(`   保持ファイル: ${candidate.keepFile}`)
    }
    console.log()
  })

  return archiveCandidates
}

/**
 * 最適化の実行
 */
function executeOptimization(proposals, archiveProposals, dryRun = true) {
  console.log(`\n${dryRun ? '🧪 ドライラン:' : '🔧 実行:'} 最適化の適用\n`)

  let renamedCount = 0
  let archivedCount = 0

  // 命名規則の適用
  proposals.forEach((proposal) => {
    const oldPath = path.join(WORKFLOWS_DIR, proposal.currentName)
    const newPath = path.join(WORKFLOWS_DIR, proposal.proposedName)

    console.log(`📝 リネーム: ${proposal.currentName} → ${proposal.proposedName}`)

    if (!dryRun && fs.existsSync(oldPath)) {
      try {
        fs.renameSync(oldPath, newPath)
        renamedCount++
        console.log(`   ✅ 完了`)
      } catch (error) {
        console.log(`   ❌ エラー: ${error.message}`)
      }
    } else if (!dryRun) {
      console.log(`   ⚠️  ファイルが見つかりません`)
    }
  })

  // アーカイブの実行
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true })
  }

  archiveProposals.forEach((candidate) => {
    candidate.files.forEach((file) => {
      const srcPath = path.join(WORKFLOWS_DIR, file)
      const archivePath = path.join(ARCHIVE_DIR, file)

      if (fs.existsSync(srcPath)) {
        console.log(`📦 アーカイブ: ${file}`)

        if (!dryRun) {
          try {
            fs.renameSync(srcPath, archivePath)
            archivedCount++
            console.log(`   ✅ 完了`)
          } catch (error) {
            console.log(`   ❌ エラー: ${error.message}`)
          }
        }
      }
    })
  })

  console.log(`\n📊 実行サマリー:`)
  console.log(`   - リネーム: ${dryRun ? proposals.length : renamedCount}個`)
  console.log(
    `   - アーカイブ: ${dryRun ? archiveProposals.reduce((acc, c) => acc + c.files.length, 0) : archivedCount}個`
  )

  return { renamedCount, archivedCount }
}

/**
 * 最適化レポートの生成
 */
function generateOptimizationReport(analysis, proposals, archiveProposals) {
  const reportContent = `# GitHub Actions ワークフロー命名規則最適化レポート

## 📊 現在の状況

- **総ワークフロー数**: ${analysis.totalFiles}個
- **分類済み**: ${Object.values(analysis.categorizedFiles).flat().length}個
- **未分類**: ${analysis.uncategorizedFiles.length}個

## 📂 カテゴリ別分類

${Object.entries(analysis.categorizedFiles)
  .map(([category, files]) => {
    if (files.length === 0) return ''
    const rule = NAMING_RULES[category]
    return `### ${rule.emoji} ${category} - ${rule.description}
- **ファイル数**: ${files.length}個
- **命名規則**: \`${rule.prefix}*.yml\`
- **ファイル**: ${files.map((f) => `\`${f}\``).join(', ')}
`
  })
  .filter(Boolean)
  .join('\n')}

## 💡 最適化提案

### 命名規則統一 (${proposals.length}個)

${proposals
  .map(
    (p, i) => `${i + 1}. **${p.currentName}** → **${p.proposedName}**
   - 理由: ${p.reason}`
  )
  .join('\n\n')}

### アーカイブ対象 (${archiveProposals.reduce((acc, c) => acc + c.files.length, 0)}個)

${archiveProposals
  .map(
    (c, i) => `${i + 1}. **${c.reason}**
   - 対象: ${c.files.map((f) => `\`${f}\``).join(', ')}
   ${c.keepFile ? `- 保持: \`${c.keepFile}\`` : ''}`
  )
  .join('\n\n')}

## 🎯 期待される効果

1. **可読性の向上**: カテゴリベースの命名規則により、目的が明確化
2. **管理性の向上**: 類似機能のワークフローがグループ化
3. **パフォーマンス向上**: 不要なワークフローの削除により実行時間短縮
4. **メンテナンス性向上**: 重複機能の統合により保守コスト削減

## 📋 推奨アクション

1. \`npm run workflow:optimize\` で最適化を実行
2. 統合後のワークフローをテスト
3. 不要になったワークフローをアーカイブ
4. ドキュメントの更新

---
生成日時: ${new Date().toLocaleString('ja-JP')}
`

  const reportPath = path.join(WORKFLOWS_DIR, 'WORKFLOW_NAMING_OPTIMIZATION.md')
  fs.writeFileSync(reportPath, reportContent)
  console.log(`\n📄 最適化レポート生成: ${reportPath}`)
}

/**
 * メイン実行
 */
function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--apply')

  console.log('🚀 GitHub Actions ワークフロー命名規則最適化ツール\n')

  const analysis = analyzeCurrentWorkflows()
  const proposals = generateNamingProposals(analysis)
  const archiveProposals = generateArchiveProposals(analysis)

  executeOptimization(proposals, archiveProposals, dryRun)
  generateOptimizationReport(analysis, proposals, archiveProposals)

  if (dryRun) {
    console.log('\n💡 実際に最適化を実行するには --apply フラグを使用してください:')
    console.log('   node scripts/workflow-naming-optimizer.js --apply')
  }

  console.log('\n🎉 ワークフロー命名規則最適化分析完了!')
}

if (require.main === module) {
  main()
}

module.exports = {
  analyzeCurrentWorkflows,
  generateNamingProposals,
  generateArchiveProposals,
}
