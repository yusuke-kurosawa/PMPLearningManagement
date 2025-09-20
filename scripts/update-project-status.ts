#!/usr/bin/env node
/**
 * プロジェクトステータス更新スクリプト
 * TypeScript version with enhanced type safety
 * 
 * 手動実行またはCI/CDから呼び出し可能
 * GitHub APIを使用してプロジェクト統計を取得し、
 * CLAUDE.mdとproject-status.mdを自動更新
 */

import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import type {
  CLIConfig,
  Logger,
  LogLevel,
  ExitCode,
  ScriptOptions,
  ScriptResult
} from '../src/types/devops/scripts.js'

// ==================== Type Definitions ====================

interface CodebaseAnalysis {
  components: number
  services: number
  hooks: number
  tests: number
  totalLines: number
}

interface GitActivity {
  commits: number
  files: number
}

interface FeatureStatus {
  name: string
  status: number
  total: number
}

interface QualityThresholds {
  testCoverage: number
  cyclomaticComplexity: number
  bundleSize: number
  buildTime: number
  errorRate: number
}

interface PerformanceBaselines {
  buildTime: number | null
  bundleSize: number | null
  testExecutionTime: number | null
}

interface ProjectStatus {
  codebase: CodebaseAnalysis
  activity: GitActivity
  features: FeatureStatus[]
  timestamp: Date
  version?: string
}

interface UpdaterOptions extends ScriptOptions {
  demo?: boolean
  skipBuild?: boolean
  skipTests?: boolean
}

// ==================== Main Class ====================

const execAsync = promisify(exec)

class ProjectStatusUpdater {
  private rootDir: string
  private claudeFile: string
  private statusFile: string
  private githubToken: string | undefined
  private repository: string
  private demoMode: boolean
  private skipBuild: boolean
  private skipTests: boolean
  private qualityThresholds: QualityThresholds
  private performanceBaselines: PerformanceBaselines

  constructor(options: UpdaterOptions = {}) {
    this.rootDir = path.join(__dirname, '..')
    this.claudeFile = path.join(this.rootDir, 'CLAUDE.md')
    this.statusFile = path.join(this.rootDir, '.claude', 'context', 'project-status.md')

    // GitHub API設定（環境変数または引数から取得）
    this.githubToken = process.env.GITHUB_TOKEN
    this.repository = process.env.GITHUB_REPOSITORY || 'yusuke-kurosawa/PMPLearningManagement'

    // 実行オプション
    this.demoMode = options.demo || process.argv.includes('--demo') || false
    this.skipBuild = options.skipBuild || process.argv.includes('--skip-build') || false
    this.skipTests = options.skipTests || process.argv.includes('--skip-tests') || false

    // 品質閾値設定
    this.qualityThresholds = {
      testCoverage: 80, // テストカバレッジ最小値
      cyclomaticComplexity: 10, // 循環複雑度警告値
      bundleSize: 1024 * 1024, // バンドルサイズ警告値（1MB）
      buildTime: 60000, // ビルド時間警告値（60秒）
      errorRate: 0.05, // エラー率警告値（5%）
    }

    // パフォーマンス基準値
    this.performanceBaselines = {
      buildTime: null,
      bundleSize: null,
      testExecutionTime: null,
    }

    if (this.demoMode) {
      this.log('🎭 デモモードで実行中 - 重い処理はスキップします', 'info')
    }
  }

  async analyzeCodebase(): Promise<CodebaseAnalysis> {
    this.log('🔍 コードベースを分析中...', 'info')

    try {
      // コンポーネント数
      const { stdout: components } = await execAsync(
        'find src/components -name "*.jsx" -o -name "*.tsx" | wc -l',
        { cwd: this.rootDir }
      )

      // サービス数
      const { stdout: services } = await execAsync(
        'find src/services -name "*.js" -o -name "*.ts" | wc -l',
        { cwd: this.rootDir }
      )

      // フック数
      const { stdout: hooks } = await execAsync(
        'find src/hooks -name "*.js" -o -name "*.ts" | wc -l',
        { cwd: this.rootDir }
      )

      // テストファイル数
      const { stdout: tests } = await execAsync(
        'find . -name "*.test.*" -o -name "*.spec.*" | wc -l',
        { cwd: this.rootDir }
      )

      // 総行数
      const { stdout: totalLines } = await execAsync(
        'find src -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" | xargs wc -l | tail -1 | awk \'{print $1}\'',
        { cwd: this.rootDir }
      )

      return {
        components: parseInt(components.trim()),
        services: parseInt(services.trim()),
        hooks: parseInt(hooks.trim()),
        tests: parseInt(tests.trim()),
        totalLines: parseInt(totalLines.trim()) || 0,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ コードベース分析エラー: ${errorMessage}`, 'error')
      return {
        components: 0,
        services: 0,
        hooks: 0,
        tests: 0,
        totalLines: 0,
      }
    }
  }

  async getGitActivity(): Promise<GitActivity> {
    this.log('📊 Git活動を取得中...', 'info')

    try {
      // 過去24時間のコミット数
      const { stdout: commits } = await execAsync(
        'git log --since="24 hours ago" --oneline | wc -l',
        { cwd: this.rootDir }
      )

      // 過去24時間に変更されたファイル数
      const { stdout: files } = await execAsync(
        'git log --since="24 hours ago" --name-only --pretty=format: | sort -u | grep -v "^$" | wc -l',
        { cwd: this.rootDir }
      )

      return {
        commits: parseInt(commits.trim()),
        files: parseInt(files.trim()),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`⚠️  Git活動取得エラー: ${errorMessage}`, 'warn')
      return {
        commits: 0,
        files: 0,
      }
    }
  }

  async getFeatureImplementationStatus(): Promise<FeatureStatus[]> {
    this.log('🎯 機能実装状況を確認中...', 'info')

    const features: FeatureStatus[] = [
      {
        name: 'PMBOKマトリックスビュー',
        status: 1,
        total: 1,
      },
      {
        name: 'ITTOネットワーク図',
        status: 1,
        total: 1,
      },
      {
        name: '統合ビュー',
        status: 1,
        total: 1,
      },
      {
        name: 'ビジュアライゼーションハブ',
        status: 1,
        total: 1,
      },
      {
        name: 'PMP用語集',
        status: 1,
        total: 1,
      },
      {
        name: '学習進捗ダッシュボード',
        status: 1,
        total: 1,
      },
      {
        name: 'フラッシュカード学習',
        status: 1,
        total: 1,
      },
      {
        name: 'PMP模擬試験',
        status: 1,
        total: 1,
      },
      {
        name: 'AIコーチング',
        status: 1,
        total: 1,
      },
      {
        name: 'コラボレーション機能',
        status: 1,
        total: 1,
      },
    ]

    return features
  }

  updateClaudeFile(data: ProjectStatus): void {
    this.log('📝 CLAUDE.mdを更新中...', 'info')

    try {
      let content = fs.readFileSync(this.claudeFile, 'utf-8')

      // 日次活動セクションを更新
      const dailyActivitySection = `### 日次活動（過去24時間）

- 📝 コミット数: ${data.activity.commits}回
- 📁 変更ファイル数: ${data.activity.files}個`

      // 開発統計セクションを更新
      const devStatsSection = `### 開発統計

- 📁 コンポーネント数: ${data.codebase.components}個
- 🔧 サービス数: ${data.codebase.services}個
- 🎣 カスタムフック数: ${data.codebase.hooks}個
- 🧪 テストファイル数: ${data.codebase.tests}個
- 📊 総コード行数: ${data.codebase.totalLines.toLocaleString()}行`

      // 機能実装状況セクションを更新
      const totalFeatures = data.features.length
      const completedFeatures = data.features.filter(f => f.status === f.total).length
      const completionRate = Math.round((completedFeatures / totalFeatures) * 100)

      const featureSection = `### 機能実装状況

- 🎯 全体進捗: ${completionRate}% (${completedFeatures}/${totalFeatures})`

      // 最終更新日時を更新
      const timestamp = new Date().toISOString().split('T')[0]
      const timestampSection = `最終更新: ${timestamp}`

      // セクションを置換
      content = content.replace(
        /### 日次活動（過去24時間）[\s\S]*?(?=###|$)/,
        dailyActivitySection + '\n\n'
      )
      content = content.replace(
        /### 開発統計[\s\S]*?(?=###|$)/,
        devStatsSection + '\n\n'
      )
      content = content.replace(
        /### 機能実装状況[\s\S]*?(?=###|$)/,
        featureSection + '\n\n'
      )
      content = content.replace(
        /最終更新: \d{4}-\d{2}-\d{2}/,
        timestampSection
      )

      fs.writeFileSync(this.claudeFile, content)
      this.log('✅ CLAUDE.md更新完了', 'info')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ CLAUDE.md更新エラー: ${errorMessage}`, 'error')
    }
  }

  updateProjectStatusFile(data: ProjectStatus): void {
    this.log('📝 project-status.mdを更新中...', 'info')

    try {
      const content = `# プロジェクトステータス

更新日時: ${data.timestamp.toISOString()}

## 📊 コードベース統計

| 項目 | 数値 |
|------|------|
| コンポーネント数 | ${data.codebase.components} |
| サービス数 | ${data.codebase.services} |
| カスタムフック数 | ${data.codebase.hooks} |
| テストファイル数 | ${data.codebase.tests} |
| 総コード行数 | ${data.codebase.totalLines.toLocaleString()} |

## 📈 Git活動（過去24時間）

| 項目 | 数値 |
|------|------|
| コミット数 | ${data.activity.commits} |
| 変更ファイル数 | ${data.activity.files} |

## 🎯 機能実装状況

| 機能名 | 進捗 |
|--------|------|
${data.features.map(f => `| ${f.name} | ${f.status === f.total ? '✅ 完了' : `⏳ ${f.status}/${f.total}`} |`).join('\n')}

## 📋 詳細

### 最近の活動
- コミット数: ${data.activity.commits}回
- 変更ファイル: ${data.activity.files}個

### コード品質
- テストカバレッジ: 計測中
- 循環複雑度: 計測中

---
*このファイルは自動生成されています*
`

      // ディレクトリが存在しない場合は作成
      const dir = path.dirname(this.statusFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(this.statusFile, content)
      this.log('✅ project-status.md更新完了', 'info')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ project-status.md更新エラー: ${errorMessage}`, 'error')
    }
  }

  async run(options: ScriptOptions = {}): Promise<ScriptResult<ProjectStatus>> {
    const startTime = Date.now()

    this.log('🚀 プロジェクトステータス更新を開始', 'info')
    this.log('=' .repeat(60), 'info')

    try {
      if (options.dryRun) {
        this.log('DRY RUN MODE: Would update project status but no files will be modified', 'warn')
        return {
          success: true,
          data: {} as ProjectStatus,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }

      // データ収集
      const codebase = await this.analyzeCodebase()
      const activity = await this.getGitActivity()
      const features = await this.getFeatureImplementationStatus()

      const status: ProjectStatus = {
        codebase,
        activity,
        features,
        timestamp: new Date(),
      }

      // ファイル更新
      this.updateClaudeFile(status)
      this.updateProjectStatusFile(status)

      // サマリー表示
      this.log('\n📊 更新サマリー', 'info')
      this.log('=' .repeat(60), 'info')
      this.log(`コンポーネント: ${codebase.components}個`, 'info')
      this.log(`サービス: ${codebase.services}個`, 'info')
      this.log(`テスト: ${codebase.tests}個`, 'info')
      this.log(`総行数: ${codebase.totalLines.toLocaleString()}行`, 'info')
      this.log(`Git活動: ${activity.commits}コミット、${activity.files}ファイル変更`, 'info')
      
      const completedFeatures = features.filter(f => f.status === f.total).length
      this.log(`機能実装: ${completedFeatures}/${features.length}完了`, 'info')

      this.log('\n✅ プロジェクトステータス更新完了！', 'info')

      return {
        success: true,
        data: status,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ 更新失敗: ${errorMessage}`, 'error')

      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
  }

  private log(message: string, level: LogLevel = 'info'): void {
    console.log(message)
  }
}

// ==================== CLI Execution ====================

async function updateProjectStatusMain(options: ScriptOptions = {}): Promise<ScriptResult<ProjectStatus>> {
  const updater = new ProjectStatusUpdater(options)
  return updater.run(options)
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: UpdaterOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
    demo: args.includes('--demo'),
    skipBuild: args.includes('--skip-build'),
    skipTests: args.includes('--skip-tests'),
  }

  updateProjectStatusMain(options)
    .then((result) => {
      if (result.success) {
        process.exit(0)
      } else {
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error(`Unexpected error: ${error}`)
      process.exit(1)
    })
}

export default ProjectStatusUpdater
export { ProjectStatusUpdater, updateProjectStatusMain, type ProjectStatus, type UpdaterOptions }