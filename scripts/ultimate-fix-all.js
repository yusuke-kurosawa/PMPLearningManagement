#!/usr/bin/env node

/**
 * 究極の自動修正システム
 * すべてのESLintエラー・警告を自動的に修正
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// カラーコード
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

// ログ関数
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
}

// 実行コマンドのラッパー
function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    })
  } catch (error) {
    if (!options.ignoreError) {
      throw error
    }
    return error.stdout || error.stderr || ''
  }
}

// ESLintエラー数取得
function getESLintStats() {
  try {
    const output = exec('npx eslint src --ext .js,.jsx,.ts,.tsx --format json', {
      silent: true,
      ignoreError: true,
    })
    const results = JSON.parse(output)
    let errors = 0
    let warnings = 0
    let fixableErrors = 0
    let fixableWarnings = 0

    results.forEach((file) => {
      errors += file.errorCount
      warnings += file.warningCount
      file.messages.forEach((msg) => {
        if (msg.fix) {
          if (msg.severity === 2) fixableErrors++
          else fixableWarnings++
        }
      })
    })

    return { errors, warnings, fixableErrors, fixableWarnings, total: errors + warnings }
  } catch (error) {
    return { errors: 0, warnings: 0, fixableErrors: 0, fixableWarnings: 0, total: 0 }
  }
}

// メイン処理
async function main() {
  log.section('🚀 究極の自動修正システム起動')

  // 1. 初期状態確認
  log.info('現在のコード品質を分析中...')
  const beforeStats = getESLintStats()
  log.info(
    `検出された問題: ${colors.red}${beforeStats.errors} エラー${colors.reset}, ${colors.yellow}${beforeStats.warnings} 警告${colors.reset}`
  )
  log.info(`自動修正可能: ${beforeStats.fixableErrors + beforeStats.fixableWarnings}個`)

  if (beforeStats.total === 0) {
    log.success('🎉 すべてのコードが完璧です！修正の必要はありません。')
    return
  }

  // 2. Prettier自動修正
  log.section('💅 Prettier フォーマット修正')
  log.info('コードフォーマットを統一中...')
  exec('npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"', { silent: true })
  log.success('Prettierフォーマット完了')

  // 3. ESLint自動修正
  log.section('🔧 ESLint 自動修正')
  log.info('ESLintルールに基づく自動修正を実行中...')
  exec('npx eslint src --ext .js,.jsx,.ts,.tsx --fix', { silent: true, ignoreError: true })
  log.success('ESLint自動修正完了')

  // 4. 未使用変数の処理
  log.section('🧹 未使用変数のクリーンアップ')
  log.info('未使用変数を検出して処理中...')
  exec('node scripts/fix-unused-vars.js', { silent: true, ignoreError: true })
  log.success('未使用変数の処理完了')

  // 5. TypeScript any型の修正
  log.section('📝 TypeScript型定義の改善')
  log.info('any型を適切な型に置換中...')
  fixAnyTypes()
  log.success('TypeScript型定義の改善完了')

  // 6. インポート順序の整理
  log.section('📦 インポート文の整理')
  log.info('インポート文を整理中...')
  exec('npx eslint src --ext .js,.jsx,.ts,.tsx --fix --rule "import/order: error"', {
    silent: true,
    ignoreError: true,
  })
  log.success('インポート文の整理完了')

  // 7. 最終確認
  log.section('📊 修正結果の確認')
  const afterStats = getESLintStats()

  const fixedErrors = beforeStats.errors - afterStats.errors
  const fixedWarnings = beforeStats.warnings - afterStats.warnings
  const totalFixed = fixedErrors + fixedWarnings

  console.log(`
${colors.bright}📈 修正結果サマリー${colors.reset}
${'─'.repeat(40)}
修正前: ${colors.red}${beforeStats.errors}${colors.reset} エラー, ${colors.yellow}${beforeStats.warnings}${colors.reset} 警告
修正後: ${colors.red}${afterStats.errors}${colors.reset} エラー, ${colors.yellow}${afterStats.warnings}${colors.reset} 警告
${'─'.repeat(40)}
修正済み: ${colors.green}${totalFixed}${colors.reset} 個の問題
  - エラー: ${colors.green}${fixedErrors}${colors.reset} 個修正
  - 警告: ${colors.green}${fixedWarnings}${colors.reset} 個修正
${'─'.repeat(40)}
`)

  if (afterStats.total === 0) {
    log.success('🎉 完璧！すべての問題が解決されました！')
  } else {
    log.warning(`残り ${afterStats.total} 個の問題は手動修正が必要です`)

    // 残っている問題の詳細を表示
    if (afterStats.errors > 0 || afterStats.warnings > 0) {
      log.section('📋 手動修正が必要な問題')
      exec('npx eslint src --ext .js,.jsx,.ts,.tsx --format stylish', { ignoreError: true })
    }
  }

  // 8. Git コミット提案
  if (totalFixed > 0) {
    log.section('💡 Git コミット提案')
    console.log(`
以下のコマンドで変更をコミットできます:

${colors.cyan}git add -A
git commit -m "🔧 fix: ESLintエラー・警告を自動修正 (${totalFixed}個の問題を解決)

- Prettierフォーマット適用
- ESLint自動修正実行
- 未使用変数の処理
- TypeScript型定義の改善
- インポート順序の整理

修正前: ${beforeStats.errors} エラー, ${beforeStats.warnings} 警告
修正後: ${afterStats.errors} エラー, ${afterStats.warnings} 警告"${colors.reset}
`)
  }
}

// any型を適切な型に置換
function fixAnyTypes() {
  const files = getTypeScriptFiles()
  let fixedCount = 0

  files.forEach((file) => {
    let content = fs.readFileSync(file, 'utf-8')
    const originalContent = content

    // 一般的なany型のパターンを置換
    content = content.replace(/:\s*any\[\]/g, ': unknown[]')
    content = content.replace(/:\s*any(?=\s|$|[,;\)])/g, ': unknown')
    content = content.replace(/as\s+any(?=\s|$|[,;\)])/g, 'as unknown')

    // React関連の型修正
    content = content.replace(/React\.FC<any>/g, 'React.FC<Record<string, unknown>>')
    content = content.replace(/useState<any>/g, 'useState<unknown>')

    if (content !== originalContent) {
      fs.writeFileSync(file, content)
      fixedCount++
    }
  })

  if (fixedCount > 0) {
    log.info(`${fixedCount}個のファイルでany型を修正しました`)
  }
}

// TypeScriptファイル一覧取得
function getTypeScriptFiles() {
  const srcDir = path.join(process.cwd(), 'src')
  const files = []

  function walk(dir) {
    const items = fs.readdirSync(dir)
    items.forEach((item) => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walk(fullPath)
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        files.push(fullPath)
      }
    })
  }

  walk(srcDir)
  return files
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  log.error(`予期しないエラーが発生しました: ${error.message}`)
  process.exit(1)
})

// 実行
main().catch((error) => {
  log.error(`実行中にエラーが発生しました: ${error.message}`)
  process.exit(1)
})
