#!/usr/bin/env node

/**
 * GitHub Issuesラベル管理スクリプト
 * PMPラーニングマネジメント プロジェクト
 *
 * 使用方法:
 * node manage-labels.js <command> [options]
 *
 * コマンド:
 * - backup: 現在のラベルをバックアップ
 * - create: 新しいラベル体系を作成
 * - update: 既存ラベルを新体系に更新
 * - delete-old: 旧ラベル体系を削除
 * - reset: 完全リセット（バックアップ → 削除 → 作成）
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 設定
const REPO = 'yusuke-kurosawa/PMPLearningManagement'
const LABELS_DEFINITION = path.join(__dirname, '..', 'labels-definition.json')
const BACKUP_FILE = path.join(__dirname, '..', 'labels-backup.json')

// ユーティリティ関数
function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    })
    return result
  } catch (error) {
    if (!options.ignoreError) {
      console.error(`コマンド実行エラー: ${command}`)
      console.error(error.message)
      process.exit(1)
    }
    return null
  }
}

function loadLabelsDefinition() {
  if (!fs.existsSync(LABELS_DEFINITION)) {
    console.error(`ラベル定義ファイルが見つかりません: ${LABELS_DEFINITION}`)
    process.exit(1)
  }

  const content = fs.readFileSync(LABELS_DEFINITION, 'utf8')
  return JSON.parse(content)
}

function getAllLabelsFromDefinition(definition) {
  const allLabels = []

  for (const [categoryKey, category] of Object.entries(definition.categories)) {
    for (const label of category.labels) {
      allLabels.push({
        name: label.name,
        color: label.color,
        description: label.description,
        category: categoryKey,
      })
    }
  }

  return allLabels
}

// メインコマンド関数
function backupLabels() {
  console.log('📦 現在のラベルをバックアップしています...')

  const command = `gh label list --repo ${REPO} --limit 100 --json name,description,color`
  const result = executeCommand(command, { silent: true })

  if (result) {
    fs.writeFileSync(BACKUP_FILE, result)
    console.log(`✅ ラベルのバックアップが完了: ${BACKUP_FILE}`)

    const labels = JSON.parse(result)
    console.log(`📊 バックアップしたラベル数: ${labels.length}`)
  }
}

function createLabels() {
  console.log('🏗️  新しいラベル体系を作成しています...')

  const definition = loadLabelsDefinition()
  const newLabels = getAllLabelsFromDefinition(definition)

  let created = 0
  let skipped = 0

  for (const label of newLabels) {
    const command = `gh label create "${label.name}" --color ${label.color} --description "${label.description}" --repo ${REPO}`

    console.log(`  作成中: ${label.name}`)
    const result = executeCommand(command, { silent: true, ignoreError: true })

    if (result !== null) {
      created++
      console.log(`    ✅ 作成完了`)
    } else {
      skipped++
      console.log(`    ⏭️  スキップ（既存または失敗）`)
    }
  }

  console.log(`\n📊 ラベル作成結果:`)
  console.log(`  作成: ${created}`)
  console.log(`  スキップ: ${skipped}`)
  console.log(`  合計: ${newLabels.length}`)
}

function updateLabels() {
  console.log('🔄 既存ラベルを更新しています...')

  const definition = loadLabelsDefinition()
  const newLabels = getAllLabelsFromDefinition(definition)

  // 既存ラベル一覧を取得
  const existingResult = executeCommand(`gh label list --repo ${REPO} --limit 100 --json name`, {
    silent: true,
  })
  const existingLabels = JSON.parse(existingResult).map((l) => l.name)

  let updated = 0
  let created = 0

  for (const label of newLabels) {
    if (existingLabels.includes(label.name)) {
      // 既存ラベルの更新
      const command = `gh label edit "${label.name}" --color ${label.color} --description "${label.description}" --repo ${REPO}`
      console.log(`  更新中: ${label.name}`)
      executeCommand(command, { silent: true })
      updated++
    } else {
      // 新規ラベルの作成
      const command = `gh label create "${label.name}" --color ${label.color} --description "${label.description}" --repo ${REPO}`
      console.log(`  作成中: ${label.name}`)
      executeCommand(command, { silent: true })
      created++
    }
  }

  console.log(`\n📊 ラベル更新結果:`)
  console.log(`  更新: ${updated}`)
  console.log(`  作成: ${created}`)
  console.log(`  合計: ${newLabels.length}`)
}

function deleteOldLabels() {
  console.log('🗑️  旧ラベルを削除しています...')

  if (!fs.existsSync(BACKUP_FILE)) {
    console.log('⚠️  バックアップファイルが見つかりません。先にバックアップを実行してください。')
    return
  }

  const backupContent = fs.readFileSync(BACKUP_FILE, 'utf8')
  const oldLabels = JSON.parse(backupContent)

  const definition = loadLabelsDefinition()
  const newLabels = getAllLabelsFromDefinition(definition)
  const newLabelNames = new Set(newLabels.map((l) => l.name))

  let deleted = 0
  let kept = 0

  for (const oldLabel of oldLabels) {
    if (!newLabelNames.has(oldLabel.name)) {
      console.log(`  削除中: ${oldLabel.name}`)
      const command = `gh label delete "${oldLabel.name}" --repo ${REPO} --yes`
      executeCommand(command, { silent: true, ignoreError: true })
      deleted++
    } else {
      kept++
    }
  }

  console.log(`\n📊 ラベル削除結果:`)
  console.log(`  削除: ${deleted}`)
  console.log(`  保持: ${kept}`)
}

function resetLabels() {
  console.log('🔄 ラベル体系を完全リセットしています...')
  console.log('')

  backupLabels()
  console.log('')

  deleteOldLabels()
  console.log('')

  createLabels()
  console.log('')

  console.log('✅ ラベル体系のリセットが完了しました！')
}

function showStatus() {
  console.log('📊 現在のラベル状況:')

  const command = `gh label list --repo ${REPO} --limit 100`
  executeCommand(command)
}

function validateDefinition() {
  console.log('🔍 ラベル定義を検証しています...')

  const definition = loadLabelsDefinition()
  const allLabels = getAllLabelsFromDefinition(definition)

  const duplicateNames = []
  const namesSeen = new Set()

  for (const label of allLabels) {
    if (namesSeen.has(label.name)) {
      duplicateNames.push(label.name)
    }
    namesSeen.add(label.name)
  }

  if (duplicateNames.length > 0) {
    console.error('❌ 重複したラベル名が見つかりました:')
    duplicateNames.forEach((name) => console.error(`  - ${name}`))
    process.exit(1)
  }

  console.log('✅ ラベル定義は有効です')
  console.log(`📊 定義されたラベル数: ${allLabels.length}`)

  // カテゴリ別集計
  const categoryCounts = {}
  for (const label of allLabels) {
    categoryCounts[label.category] = (categoryCounts[label.category] || 0) + 1
  }

  console.log('\n📋 カテゴリ別集計:')
  for (const [category, count] of Object.entries(categoryCounts)) {
    console.log(`  ${category}: ${count}個`)
  }
}

// メイン処理
function main() {
  const command = process.argv[2]

  console.log('🏷️  PMPラーニングマネジメント - ラベル管理スクリプト')
  console.log('')

  switch (command) {
    case 'backup':
      backupLabels()
      break

    case 'create':
      createLabels()
      break

    case 'update':
      updateLabels()
      break

    case 'delete-old':
      deleteOldLabels()
      break

    case 'reset':
      resetLabels()
      break

    case 'status':
      showStatus()
      break

    case 'validate':
      validateDefinition()
      break

    default:
      console.log('使用方法: node manage-labels.js <command>')
      console.log('')
      console.log('利用可能なコマンド:')
      console.log('  backup      - 現在のラベルをバックアップ')
      console.log('  create      - 新しいラベルを作成')
      console.log('  update      - 既存ラベルを更新')
      console.log('  delete-old  - 旧ラベルを削除')
      console.log('  reset       - 完全リセット（推奨）')
      console.log('  status      - 現在のラベル状況を表示')
      console.log('  validate    - ラベル定義を検証')
      console.log('')
      console.log('例:')
      console.log('  node manage-labels.js reset    # 完全リセット')
      console.log('  node manage-labels.js status   # 現在の状況確認')
      break
  }
}

// 実行
if (require.main === module) {
  main()
}

module.exports = {
  backupLabels,
  createLabels,
  updateLabels,
  deleteOldLabels,
  resetLabels,
  showStatus,
  validateDefinition,
}
