#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 楽しいラベル設計を読み込み
const funLabelDesign = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fun-label-system-design.json'), 'utf8')
)

const REPO = 'yusuke-kurosawa/PMPLearningManagement'

// カラフルなログメッセージ用の関数
function logWithEmoji(emoji, message) {
  console.log(`${emoji} ${message}`)
}

function logSuccess(message) {
  logWithEmoji('✅', message)
}

function logError(message) {
  logWithEmoji('❌', message)
}

function logInfo(message) {
  logWithEmoji('💡', message)
}

function logWarning(message) {
  logWithEmoji('⚠️', message)
}

// コマンド実行用のヘルパー関数
function runCommand(cmd) {
  try {
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
    return { success: true, output: result }
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || error.stderr }
  }
}

// 現在のラベル一覧を取得
function getCurrentLabels() {
  logInfo('現在のラベル一覧を取得中...')
  const result = runCommand(
    `gh label list --repo ${REPO} --limit 100 --json name,description,color`
  )
  if (!result.success) {
    throw new Error(`ラベル一覧取得に失敗: ${result.error}`)
  }

  const labels = JSON.parse(result.output)
  logInfo(`発見！現在のラベル数: ${labels.length}個`)
  return labels
}

// バックアップを作成
function createBackup(currentLabels) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = path.join(__dirname, `fun-label-backup-${timestamp}.json`)

  logWithEmoji('💾', `ラベルバックアップを作成: ${backupFile}`)
  fs.writeFileSync(backupFile, JSON.stringify(currentLabels, null, 2))
  return backupFile
}

// 楽しいラベルを作成
function createFunLabels() {
  logWithEmoji('🎨', '楽しいラベルシステムを構築中...')
  let createdCount = 0
  let errorCount = 0

  // 各カテゴリの楽しいラベルを作成
  for (const [categoryName, category] of Object.entries(funLabelDesign.labelCategories)) {
    logWithEmoji('🎯', `カテゴリ: ${categoryName}`)

    for (const label of category.labels) {
      // GitHub APIでは色コードから#を除去する必要がある
      const colorCode = label.color.replace('#', '')
      const cmd = `gh label create "${label.name}" --description "${label.description}" --color "${colorCode}" --repo ${REPO}`
      const result = runCommand(cmd)

      if (result.success) {
        logSuccess(`作成: ${label.name}`)
        createdCount++
      } else {
        // ラベルが既に存在する場合は更新を試みる
        if (result.output.includes('already exists')) {
          const updateCmd = `gh label edit "${label.name}" --description "${label.description}" --color "${colorCode}" --repo ${REPO}`
          const updateResult = runCommand(updateCmd)
          if (updateResult.success) {
            logWithEmoji('🔄', `更新: ${label.name}`)
            createdCount++
          } else {
            logError(`更新失敗: ${label.name} - ${updateResult.output}`)
            errorCount++
          }
        } else {
          logError(`作成失敗: ${label.name} - ${result.output}`)
          errorCount++
        }
      }
    }
  }

  logWithEmoji('📊', `作成結果: 成功 ${createdCount}個, 失敗 ${errorCount}個`)
  return { created: createdCount, errors: errorCount }
}

// 古いラベルのマイグレーション（オプション）
function migrateOldLabels() {
  logWithEmoji('🔄', '古いラベルのマイグレーション処理...')

  const migrationRules = funLabelDesign.migrationRules.mappings
  let migratedCount = 0
  let errorCount = 0

  for (const [oldLabel, newLabel] of Object.entries(migrationRules)) {
    // 古いラベルが存在するかチェック
    const checkResult = runCommand(`gh api repos/${REPO}/labels/${encodeURIComponent(oldLabel)}`)
    if (checkResult.success) {
      // 古いラベルを新しいラベルに置き換え
      logInfo(`マイグレーション: ${oldLabel} → ${newLabel}`)

      // 古いラベルが付いているissueを検索して新しいラベルに置き換える処理
      // (実際の運用では、issueの検索と更新も必要)

      // 古いラベルを削除
      const deleteResult = runCommand(`gh label delete "${oldLabel}" --repo ${REPO} --yes`)
      if (deleteResult.success) {
        logSuccess(`削除: ${oldLabel}`)
        migratedCount++
      } else {
        logWarning(`削除に失敗（すでに削除済みの可能性）: ${oldLabel}`)
      }
    }
  }

  logWithEmoji('📊', `マイグレーション結果: 処理 ${migratedCount}個, エラー ${errorCount}個`)
  return { migrated: migratedCount, errors: errorCount }
}

// 使用状況の統計を表示
function showLabelStatistics() {
  logWithEmoji('📈', 'ラベル統計情報:')

  const totalLabels = Object.values(funLabelDesign.labelCategories).reduce(
    (sum, category) => sum + category.labels.length,
    0
  )

  console.log(`\n🎯 カテゴリ別ラベル数:`)
  for (const [categoryName, category] of Object.entries(funLabelDesign.labelCategories)) {
    console.log(`   ${category.prefix} ${categoryName}: ${category.labels.length}個`)
  }

  console.log(`\n📊 総ラベル数: ${totalLabels}個`)
  console.log(
    `🌟 ゲーミフィケーション要素: ${Object.keys(funLabelDesign.gamification.features).length}種類`
  )
  console.log(
    `🤝 コミュニティ原則: ${Object.keys(funLabelDesign.community_guidelines.principles).length}項目`
  )
}

// インタラクティブな確認プロンプト
function askConfirmation() {
  return new Promise((resolve) => {
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    console.log(`\n🎉 楽しいラベルシステムへようこそ！`)
    console.log(`このスクリプトは、開発者のモチベーションを向上させる`)
    console.log(`魅力的なラベルシステムを構築します。\n`)

    console.log(`✨ 特徴:`)
    console.log(`   🎮 ゲーミフィケーション要素`)
    console.log(`   🤝 コミュニティ協働促進`)
    console.log(`   📚 PMP学習ドメイン反映`)
    console.log(`   🌟 達成感と成長の可視化\n`)

    rl.question('🚀 新しいラベルシステムを適用しますか？ (yes/no): ', (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y')
    })
  })
}

// メイン処理
async function main() {
  logWithEmoji('🚀', 'PMP学習プラットフォーム - 楽しいラベルシステム構築開始！')
  logWithEmoji('🏗️', `対象リポジトリ: ${REPO}\n`)

  try {
    // 統計情報を表示
    showLabelStatistics()

    // 現在のラベルを取得
    const currentLabels = getCurrentLabels()

    // バックアップを作成
    const backupFile = createBackup(currentLabels)
    logSuccess(`バックアップ完了: ${backupFile}`)

    // 確認プロンプト（コメントアウト済み - テスト用）
    // const confirmed = await askConfirmation();
    // if (!confirmed) {
    //   logWithEmoji('👋', '処理を中止しました。またいつでも挑戦してください！');
    //   return;
    // }

    logWithEmoji('⚡', '自動実行モード（テスト用）')

    // 楽しいラベルを作成
    const createResult = createFunLabels()

    // マイグレーション処理（オプション）
    // const migrateResult = migrateOldLabels();

    // 結果サマリー
    logWithEmoji('🎉', '処理結果サマリー')
    console.log('='.repeat(40))
    console.log(`✨ 作成/更新: ${createResult.created}個 (失敗: ${createResult.errors}個)`)
    // console.log(`🔄 マイグレーション: ${migrateResult.migrated}個 (失敗: ${migrateResult.errors}個)`);
    console.log(`💾 バックアップ: ${backupFile}`)

    if (createResult.errors === 0) {
      logWithEmoji('🌟', '楽しいラベルシステムが正常に構築されました！')
      logWithEmoji('🎯', '開発者のモチベーション向上と学習促進に貢献します')
      logWithEmoji('🤝', 'コミュニティでの協働と成長を楽しんでください！')
    } else {
      logWarning('一部エラーが発生しました。詳細を確認してください。')
    }
  } catch (error) {
    logError('処理中にエラーが発生しました:')
    console.error(error.message)
    process.exit(1)
  }
}

// プレビューモード - ラベル一覧のみを表示
function previewMode() {
  logWithEmoji('👀', '楽しいラベルシステム - プレビューモード')

  console.log('\n🎨 作成予定のラベル一覧:\n')

  for (const [categoryName, category] of Object.entries(funLabelDesign.labelCategories)) {
    console.log(`\n${category.prefix} ${categoryName.toUpperCase()}`)
    console.log('─'.repeat(50))

    for (const label of category.labels) {
      console.log(`🏷️  ${label.name}`)
      console.log(`   📝 ${label.description}`)
      console.log(`   🎨 カラー: ${label.color}`)
      console.log('')
    }
  }

  showLabelStatistics()
}

// コマンドライン引数をチェック
const args = process.argv.slice(2)
if (args.includes('--preview') || args.includes('-p')) {
  previewMode()
} else if (require.main === module) {
  main()
}

module.exports = {
  getCurrentLabels,
  createBackup,
  createFunLabels,
  migrateOldLabels,
  showLabelStatistics,
  previewMode,
}
