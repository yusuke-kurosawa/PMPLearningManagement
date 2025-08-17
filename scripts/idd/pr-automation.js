#!/usr/bin/env node

/**
 * IDD PR Automation / IDD PR自動化
 *
 * Issue: #68 #4
 * Purpose: Issue駆動のPR自動化
 * Author: Claude Code Actions + yusuke-kurosawa
 * Version: 1.0.0
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class PRAutomation {
  constructor() {
    this.currentBranch = ''
    this.issueNumber = null
    this.issueTitle = ''
  }

  /**
   * 現在のブランチ情報取得
   */
  getCurrentBranch() {
    try {
      this.currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim()
      console.log(`📍 現在のブランチ: ${this.currentBranch}`)
      return this.currentBranch
    } catch (error) {
      console.error('❌ ブランチ情報の取得に失敗しました')
      throw error
    }
  }

  /**
   * Issue番号をブランチ名から抽出
   */
  extractIssueNumber() {
    const match = this.currentBranch.match(/issue-(\d+)/)
    if (match) {
      this.issueNumber = match[1]
      console.log(`📋 Issue番号: #${this.issueNumber}`)
      return this.issueNumber
    }

    console.warn('⚠️ ブランチ名からIssue番号を抽出できませんでした')
    return null
  }

  /**
   * Issueからブランチを作成
   */
  createBranchFromIssue(issueNumber, issueTitle) {
    console.log(`🌿 Issue #${issueNumber}からブランチを作成します...`)

    // タイトルからブランチ名を生成
    const branchType = this.detectBranchType(issueTitle)
    const safeName = this.sanitizeBranchName(issueTitle)
    const branchName = `${branchType}/issue-${issueNumber}-${safeName}`

    try {
      // メインブランチから最新を取得
      execSync('git checkout main', { stdio: 'inherit' })
      execSync('git pull origin main', { stdio: 'inherit' })

      // 新しいブランチを作成
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' })

      // メタデータファイルを作成
      this.createIssueMetadata(issueNumber, issueTitle, branchName)

      // 初期コミット
      execSync('git add .', { stdio: 'inherit' })
      execSync(`git commit -m "chore: Issue #${issueNumber}用ブランチ初期化"`, { stdio: 'inherit' })

      // リモートにプッシュ
      execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' })

      console.log(`✅ ブランチ '${branchName}' を作成しました`)
      return branchName
    } catch (error) {
      console.error('❌ ブランチ作成に失敗しました:', error.message)
      throw error
    }
  }

  /**
   * ブランチタイプを判定
   */
  detectBranchType(title) {
    const lowerTitle = title.toLowerCase()

    if (lowerTitle.includes('bug') || lowerTitle.includes('fix') || lowerTitle.includes('修正')) {
      return 'fix'
    } else if (lowerTitle.includes('hotfix') || lowerTitle.includes('緊急')) {
      return 'hotfix'
    } else if (lowerTitle.includes('release')) {
      return 'release'
    } else {
      return 'feature'
    }
  }

  /**
   * ブランチ名をサニタイズ
   */
  sanitizeBranchName(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)
  }

  /**
   * Issueメタデータファイル作成
   */
  createIssueMetadata(issueNumber, issueTitle, branchName) {
    const metadata = {
      issueNumber,
      issueTitle,
      branchName,
      createdAt: new Date().toISOString(),
      author: this.getGitUser(),
    }

    const content = `# Issue #${issueNumber}

## 概要
${issueTitle}

## ブランチ情報
- ブランチ名: ${branchName}
- 作成日時: ${metadata.createdAt}
- 作成者: ${metadata.author}

## 作業内容
- [ ] 実装
- [ ] テスト
- [ ] ドキュメント更新
- [ ] レビュー

## メモ
（作業中のメモを記載）
`

    fs.writeFileSync('.issue-metadata.md', content)
    console.log('📄 Issueメタデータファイルを作成しました')
  }

  /**
   * Gitユーザー情報取得
   */
  getGitUser() {
    try {
      const name = execSync('git config user.name', { encoding: 'utf-8' }).trim()
      const email = execSync('git config user.email', { encoding: 'utf-8' }).trim()
      return `${name} <${email}>`
    } catch (error) {
      return 'Unknown'
    }
  }

  /**
   * ブランチからPRを作成
   */
  createPRFromBranch() {
    if (!this.issueNumber) {
      this.extractIssueNumber()
    }

    if (!this.issueNumber) {
      console.error('❌ Issue番号が見つかりません')
      return
    }

    console.log(`📝 PR作成準備中...`)

    // コミットをプッシュ
    try {
      execSync('git push -u origin HEAD', { stdio: 'inherit' })
    } catch (error) {
      console.log('ℹ️ 既にプッシュ済みです')
    }

    // PR作成（GitHub CLIが必要）
    if (this.hasGitHubCLI()) {
      this.createPRWithGitHubCLI()
    } else {
      this.generatePRTemplate()
    }
  }

  /**
   * GitHub CLIの存在確認
   */
  hasGitHubCLI() {
    try {
      execSync('gh --version', { stdio: 'ignore' })
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * GitHub CLIでPR作成
   */
  createPRWithGitHubCLI() {
    console.log('🚀 GitHub CLIでPRを作成します...')

    const prTitle = `[#${this.issueNumber}] ${this.issueTitle || 'タイトル'}`
    const prBody = this.generatePRBody()

    try {
      // PRを作成
      const result = execSync(`gh pr create --title "${prTitle}" --body "${prBody}" --draft`, {
        encoding: 'utf-8',
      })

      console.log('✅ PRを作成しました:')
      console.log(result)
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ PRは既に存在します')

        // 既存のPRを表示
        try {
          const prList = execSync('gh pr list --head $(git branch --show-current)', {
            encoding: 'utf-8',
          })
          console.log('📋 既存のPR:')
          console.log(prList)
        } catch (e) {
          // エラーを無視
        }
      } else {
        console.error('❌ PR作成に失敗しました:', error.message)
      }
    }
  }

  /**
   * PR本文生成
   */
  generatePRBody() {
    return `## 📋 関連Issue
    
Closes #${this.issueNumber}

## 📝 変更内容

（変更内容を記載）

## ✅ チェックリスト

- [ ] コードがIDD準拠（Issue番号含む）
- [ ] テストを追加/更新
- [ ] ドキュメントを更新
- [ ] レビュー準備完了

## 🧪 テスト方法

（テスト方法を記載）

## 📸 スクリーンショット

（必要に応じて）

---
*このPRはIDD PR Automationにより生成されました*`
  }

  /**
   * PRテンプレート生成（GitHub CLI不在時）
   */
  generatePRTemplate() {
    console.log('📄 PRテンプレートを生成します...')

    const template = `# Pull Request Template

## Title
[#${this.issueNumber}] ${this.issueTitle || 'タイトル'}

## Body
${this.generatePRBody()}

## Instructions
1. 上記の内容をコピー
2. GitHubでPRを作成
3. タイトルと本文に貼り付け
4. ドラフトPRとして作成

## Branch Info
- Current Branch: ${this.currentBranch}
- Base Branch: main
`

    fs.writeFileSync('PR_TEMPLATE.md', template)
    console.log('✅ PRテンプレートを PR_TEMPLATE.md に生成しました')
    console.log('📋 GitHubでPRを手動作成してください')

    // URLを表示
    try {
      const remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim()
      const repoUrl = remote.replace('.git', '').replace('git@github.com:', 'https://github.com/')
      console.log(`🔗 PR作成URL: ${repoUrl}/compare/${this.currentBranch}?expand=1`)
    } catch (error) {
      // エラーを無視
    }
  }

  /**
   * IssueとPRをリンク
   */
  linkIssueAndPR(issueNumber, prNumber) {
    console.log(`🔗 Issue #${issueNumber} と PR #${prNumber} をリンクします...`)

    if (this.hasGitHubCLI()) {
      try {
        // PRのbodyを更新してIssueをリンク
        execSync(`gh pr edit ${prNumber} --add-label "linked-issue"`, { stdio: 'inherit' })
        console.log('✅ IssueとPRをリンクしました')
      } catch (error) {
        console.error('❌ リンクに失敗しました:', error.message)
      }
    } else {
      console.log('ℹ️ GitHub CLIが必要です。手動でリンクしてください。')
    }
  }

  /**
   * PR準拠チェック
   */
  checkPRCompliance() {
    console.log('🔍 PR準拠チェック...')

    const checks = {
      branchNaming: false,
      issueReference: false,
      commitMessages: false,
    }

    // ブランチ名チェック
    if (this.currentBranch.match(/^(feature|fix|hotfix)\/issue-\d+-/)) {
      checks.branchNaming = true
      console.log('✅ ブランチ名がIDD規則に準拠')
    } else {
      console.log('❌ ブランチ名がIDD規則に非準拠')
    }

    // Issue参照チェック
    if (this.issueNumber) {
      checks.issueReference = true
      console.log('✅ Issue参照あり')
    } else {
      console.log('❌ Issue参照なし')
    }

    // コミットメッセージチェック
    try {
      const commits = execSync('git log --oneline origin/main..HEAD', { encoding: 'utf-8' })
        .trim()
        .split('\n')

      let compliantCommits = 0
      commits.forEach((commit) => {
        if (commit.includes('#')) {
          compliantCommits++
        }
      })

      if (compliantCommits === commits.length) {
        checks.commitMessages = true
        console.log('✅ すべてのコミットがIDD準拠')
      } else {
        console.log(`⚠️ ${commits.length}中${compliantCommits}個のコミットがIDD準拠`)
      }
    } catch (error) {
      console.log('ℹ️ コミット履歴を確認できません')
    }

    // 総合判定
    const allCompliant = Object.values(checks).every((v) => v)
    if (allCompliant) {
      console.log('\n✅ PR完全準拠！')
    } else {
      console.log('\n⚠️ 一部準拠していない項目があります')
    }

    return checks
  }

  /**
   * インタラクティブモード
   */
  async runInteractive() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const question = (prompt) =>
      new Promise((resolve) => {
        rl.question(prompt, resolve)
      })

    console.log('🤖 IDD PR自動化ツール\n')
    console.log('選択してください:')
    console.log('1. Issueからブランチ作成')
    console.log('2. 現在のブランチからPR作成')
    console.log('3. PR準拠チェック')
    console.log('4. 終了')

    const choice = await question('\n選択 (1-4): ')

    switch (choice) {
      case '1':
        const issueNum = await question('Issue番号: ')
        const issueTitle = await question('Issueタイトル: ')
        this.createBranchFromIssue(issueNum, issueTitle)
        break

      case '2':
        this.getCurrentBranch()
        this.createPRFromBranch()
        break

      case '3':
        this.getCurrentBranch()
        this.checkPRCompliance()
        break

      case '4':
        console.log('👋 終了します')
        break

      default:
        console.log('❌ 無効な選択です')
    }

    rl.close()
  }

  /**
   * CLIモード実行
   */
  run(args) {
    const command = args[0]

    switch (command) {
      case 'create-branch':
        if (args[1] && args[2]) {
          this.createBranchFromIssue(args[1], args[2])
        } else {
          console.error('使用方法: pr-automation.js create-branch <issue-number> <issue-title>')
        }
        break

      case 'create-pr':
        this.getCurrentBranch()
        this.createPRFromBranch()
        break

      case 'check':
        this.getCurrentBranch()
        this.checkPRCompliance()
        break

      case 'link':
        if (args[1] && args[2]) {
          this.linkIssueAndPR(args[1], args[2])
        } else {
          console.error('使用方法: pr-automation.js link <issue-number> <pr-number>')
        }
        break

      default:
        this.runInteractive()
    }
  }
}

// メイン実行
const automation = new PRAutomation()
const args = process.argv.slice(2)

if (args.length === 0) {
  automation.runInteractive().catch(console.error)
} else {
  automation.run(args)
}

export default PRAutomation
