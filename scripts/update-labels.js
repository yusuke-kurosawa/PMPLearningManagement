#!/usr/bin/env node

/**
 * 🎯 PMPラーニングプロジェクト - ラベル管理スクリプト
 *
 * 目的：GitHubリポジトリのラベルを整理・統一する
 * - 古い不要なラベルを削除
 * - 新しい楽しい日本語ラベル体系を適用
 * - テンプレートと連携したラベル自動設定
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 推奨される新しいラベル設定
const RECOMMENDED_LABELS = [
  // TYPE: イシューの種類
  {
    name: '🐛 バグハンター',
    color: 'd73a4a',
    description: 'バグを退治して、学習体験をより良くしよう！勇敢なハンターを募集中',
  },
  {
    name: '✨ アイデアマジシャン',
    color: 'a2eeef',
    description: '新機能のアイデアを魔法のように実現！クリエイティブな提案を歓迎',
  },
  {
    name: '🚀 スピードスター',
    color: '0075ca',
    description: '既存機能の改善でパフォーマンスアップ！より速く、より使いやすく',
  },
  {
    name: '📚 知識の伝道師',
    color: '7057ff',
    description: '学習コンテンツの充実！PMBOK情報や教材の改善提案',
  },
  {
    name: '📄 ドキュメントの芸術家',
    color: '0e8a16',
    description: 'わかりやすい説明文を作成！新しい学習者の道しるべ',
  },
  {
    name: '❓ サポートヒーロー',
    color: 'd876e3',
    description: '質問・サポート対応！みんなで助け合って成長しよう',
  },

  // PRIORITY: 優先度
  {
    name: '🚨 優先度:緊急',
    color: 'b60205',
    description: '本番停止・重大な機能障害！すぐに対応が必要',
  },
  {
    name: '🔥 優先度:高い',
    color: 'd93f0b',
    description: 'ユーザー体験に大きく影響！優先的に取り組むべき課題',
  },
  {
    name: '📋 優先度:中',
    color: 'fbca04',
    description: 'バランスの取れた重要度！計画的に取り組んで着実に前進',
  },
  {
    name: '🌱 優先度:低い',
    color: '0e8a16',
    description: '時間があるときにじっくりと！リラックスして取り組める改善',
  },

  // AREA: 機能エリア
  {
    name: '📊 視覚化機能',
    color: '006b75',
    description: 'PMBOK図表・グラフ・ネットワーク表示の改善',
  },
  { name: '🎓 学習機能', color: '1d76db', description: 'フラッシュカード・模擬試験・進捗管理' },
  {
    name: '📱 モバイル対応',
    color: '0366d6',
    description: 'スマホ・タブレット・PWA・タッチ操作の改善',
  },
  { name: '🎨 UI/UX', color: 'f9d0c4', description: 'デザイン・操作性・ユーザビリティの向上' },
  {
    name: '⚡ パフォーマンス',
    color: 'ffd33d',
    description: '速度・レスポンス・メモリ使用量の最適化',
  },
  {
    name: '🔐 セキュリティ',
    color: 'd1f2a5',
    description: '認証・認可・データ保護・セキュリティ対策',
  },

  // STATUS: 作業状況
  {
    name: '🔍 調査フェーズ：謎解き中',
    color: 'ededed',
    description: '情報収集と分析の段階！問題の本質を探る探偵のような作業',
  },
  {
    name: '⚡ 開発中：クリエイティブタイム',
    color: 'c5def5',
    description: 'コーディングに集中中！創造力を発揮してアイデアを形にしよう',
  },
  {
    name: '👀 レビュー待ち：最終チェック',
    color: 'f9c513',
    description: '品質確認の段階！みんなでコードを見て、さらに良くしよう',
  },

  // LEVEL: 難易度
  {
    name: '🌟 レベル1：初心者への贈り物',
    color: 'bfdbfe',
    description: 'プログラミング初心者も歓迎！優しく学べる最初の一歩',
  },
  {
    name: '⭐ レベル2：駆け出し冒険者',
    color: '93c5fd',
    description: '基礎を身につけた君に！少しチャレンジングだけど楽しめる',
  },
  {
    name: '🔥 レベル3：熟練者の挑戦',
    color: '3b82f6',
    description: 'スキルを試す本格チャレンジ！経験豊富な開発者向け',
  },

  // COMMUNITY: コミュニティ
  {
    name: '🌟 みんなで挑戦：チーム・クエスト',
    color: '84cc16',
    description: '複数人でのコラボレーション歓迎！知識を共有し、一緒に成長',
  },
  {
    name: '🎓 メンター募集：教えて先輩',
    color: 'f97316',
    description: '経験豊富な開発者の知恵を借りたい！アドバイスとサポートを募集',
  },
  {
    name: '💡 アイデア・インキュベーター',
    color: '8b5cf6',
    description: '将来への投資！長期的な視点で考える革新的なアイデアや実験',
  },

  // SPECIAL: 特別な状況
  {
    name: '🚫 今回は見送り：将来への期待',
    color: '6b7280',
    description: '素晴らしいアイデアだけど今はタイミングではない！将来実現するかも',
  },
  {
    name: '🔄 重複問題：すでに議論済み',
    color: '9ca3af',
    description: '似たような話題を発見！過去の議論を参考に効率的に解決しよう',
  },
]

// テンプレートとラベルのマッピング
const TEMPLATE_LABEL_MAPPING = {
  bug_report: ['🐛 バグハンター', '📋 優先度:中', '🔍 調査フェーズ：謎解き中'],
  feature_request: ['✨ アイデアマジシャン', '🌱 優先度:低い', '💡 アイデア・インキュベーター'],
  improvement: ['🚀 スピードスター', '📋 優先度:中', '🔍 調査フェーズ：謎解き中'],
  learning_content: ['📚 知識の伝道師', '🎓 学習機能', '📋 優先度:中'],
  documentation: ['📄 ドキュメントの芸術家', '📋 優先度:中', '🔍 調査フェーズ：謎解き中'],
  question_support: ['❓ サポートヒーロー', '🌟 みんなで挑戦：チーム・クエスト', '📋 優先度:中'],
}

console.log('🎯 PMPラーニング - ラベル管理システム')
console.log('=====================================')

function showCurrentLabels() {
  console.log('\n📊 現在のラベル状況を確認中...')
  try {
    const result = execSync('gh label list --limit 100 --json name,description,color', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    })
    const labels = JSON.parse(result)
    console.log(`現在のラベル数: ${labels.length}個`)

    if (labels.length > 30) {
      console.log('⚠️  ラベルが多すぎます！整理が推奨されます。')
    }

    return labels
  } catch (error) {
    console.error('❌ ラベル情報の取得に失敗しました:', error.message)
    return []
  }
}

function cleanupOldLabels(currentLabels) {
  console.log('\n🧹 古いラベルのクリーンアップ...')

  const recommendedNames = RECOMMENDED_LABELS.map((l) => l.name)
  const toDelete = currentLabels.filter((label) => !recommendedNames.includes(label.name))

  console.log(`削除対象: ${toDelete.length}個のラベル`)

  if (toDelete.length > 0) {
    console.log('削除するラベル:')
    toDelete.forEach((label) => console.log(`  - ${label.name}`))

    // 実際の削除は手動確認後に実行
    console.log('\n⚠️  削除を実行するには以下のコマンドを手動で実行してください:')
    toDelete.forEach((label) => {
      console.log(`gh label delete "${label.name}" --confirm`)
    })
  }
}

function createNewLabels(currentLabels) {
  console.log('\n✨ 新しいラベル体系の適用...')

  const currentNames = currentLabels.map((l) => l.name)
  const toCreate = RECOMMENDED_LABELS.filter((label) => !currentNames.includes(label.name))

  console.log(`作成対象: ${toCreate.length}個の新しいラベル`)

  if (toCreate.length > 0) {
    console.log('作成するラベル:')
    toCreate.forEach((label) => console.log(`  - ${label.name}`))

    console.log('\n🚀 新しいラベルを作成中...')
    toCreate.forEach((label) => {
      try {
        execSync(
          `gh label create "${label.name}" --color "${label.color}" --description "${label.description}"`,
          { stdio: 'inherit', cwd: process.cwd() }
        )
        console.log(`✅ 作成完了: ${label.name}`)
      } catch (error) {
        console.error(`❌ 作成失敗: ${label.name} - ${error.message}`)
      }
    })
  }
}

function updateExistingLabels(currentLabels) {
  console.log('\n🔄 既存ラベルの更新...')

  const currentMap = {}
  currentLabels.forEach((label) => {
    currentMap[label.name] = label
  })

  let updatedCount = 0

  RECOMMENDED_LABELS.forEach((newLabel) => {
    const existing = currentMap[newLabel.name]
    if (
      existing &&
      (existing.color !== newLabel.color || existing.description !== newLabel.description)
    ) {
      try {
        execSync(
          `gh label edit "${newLabel.name}" --color "${newLabel.color}" --description "${newLabel.description}"`,
          { stdio: 'inherit', cwd: process.cwd() }
        )
        console.log(`✅ 更新完了: ${newLabel.name}`)
        updatedCount++
      } catch (error) {
        console.error(`❌ 更新失敗: ${newLabel.name} - ${error.message}`)
      }
    }
  })

  if (updatedCount === 0) {
    console.log('🎉 すべてのラベルが最新の状態です！')
  }
}

function showTemplateMapping() {
  console.log('\n🎯 テンプレートとラベルのマッピング:')
  console.log('=====================================')

  Object.entries(TEMPLATE_LABEL_MAPPING).forEach(([template, labels]) => {
    console.log(`\n📝 ${template}:`)
    labels.forEach((label) => console.log(`  - ${label}`))
  })
}

function generateUsageGuide() {
  console.log('\n📖 使用方法ガイドを生成中...')

  const guide = `# 🎯 Issueテンプレート & ラベル使用ガイド

## 📝 新しいIssueテンプレート

以下の6つのテンプレートが利用可能です：

### 1. 🐛 バグハンター：問題を退治しよう！
- **用途**: バグ・不具合の報告
- **自動ラベル**: \`🐛 バグハンター\`, \`📋 優先度:中\`, \`🔍 調査フェーズ：謎解き中\`
- **記入内容**: 再現手順、期待動作、実際の動作、スクリーンショット

### 2. ✨ アイデアマジシャン：新しい魔法を提案！
- **用途**: 新機能の提案
- **自動ラベル**: \`✨ アイデアマジシャン\`, \`🌱 優先度:低い\`, \`💡 アイデア・インキュベーター\`
- **記入内容**: 機能概要、解決する問題、ユーザーストーリー

### 3. 🚀 スピードスター：改善提案！
- **用途**: 既存機能の改善
- **自動ラベル**: \`🚀 スピードスター\`, \`📋 優先度:中\`, \`🔍 調査フェーズ：謎解き中\`
- **記入内容**: 現在の問題、理想的な状態、具体的な改善案

### 4. 📚 知識の伝道師：学習コンテンツ提案！
- **用途**: PMBOK学習コンテンツの改善
- **自動ラベル**: \`📚 知識の伝道師\`, \`🎓 学習機能\`, \`📋 優先度:中\`
- **記入内容**: コンテンツタイプ、対象学習者、具体例

### 5. 📄 ドキュメントの芸術家：説明文改善！
- **用途**: ドキュメント・ガイドの改善
- **自動ラベル**: \`📄 ドキュメントの芸術家\`, \`📋 優先度:中\`, \`🔍 調査フェーズ：謎解き中\`
- **記入内容**: 現在の問題点、対象読者、改善アイデア

### 6. ❓ サポートヒーロー：質問・相談！
- **用途**: 質問・サポート依頼
- **自動ラベル**: \`❓ サポートヒーロー\`, \`🌟 みんなで挑戦：チーム・クエスト\`, \`📋 優先度:中\`
- **記入内容**: 質問内容、学習レベル、試行したこと

## 🏷️ ラベル体系（25個に整理）

### 📝 タイプ別ラベル（必須）
- 🐛 バグハンター
- ✨ アイデアマジシャン
- 🚀 スピードスター
- 📚 知識の伝道師
- 📄 ドキュメントの芸術家
- ❓ サポートヒーロー

### 🎯 優先度ラベル（必須）
- 🚨 優先度:緊急
- 🔥 優先度:高い
- 📋 優先度:中
- 🌱 優先度:低い

### 🏷️ エリアラベル（推奨）
- 📊 視覚化機能
- 🎓 学習機能
- 📱 モバイル対応
- 🎨 UI/UX
- ⚡ パフォーマンス
- 🔐 セキュリティ

### 📊 状況ラベル（自動設定）
- 🔍 調査フェーズ：謎解き中
- ⚡ 開発中：クリエイティブタイム
- 👀 レビュー待ち：最終チェック

### 🎮 レベルラベル（貢献者向け）
- 🌟 レベル1：初心者への贈り物
- ⭐ レベル2：駆け出し冒険者
- 🔥 レベル3：熟練者の挑戦

### 🤝 コミュニティラベル（特別）
- 🌟 みんなで挑戦：チーム・クエスト
- 🎓 メンター募集：教えて先輩
- 💡 アイデア・インキュベーター

### 🏆 管理用ラベル
- 🚫 今回は見送り：将来への期待
- 🔄 重複問題：すでに議論済み

## 🎯 ラベル運用のコツ

1. **必須ラベル**: タイプと優先度は必ず設定
2. **推奨ラベル**: 該当するエリアがあれば追加
3. **自動設定**: テンプレートから作成したIssueは自動でラベルが設定される
4. **後から調整**: 状況に応じてラベルは柔軟に変更・追加可能

## 🚀 運用開始方法

1. 新しいIssueは必ずテンプレートを使用
2. ラベルは自動設定されるので、必要に応じて追加・調整
3. コミュニティで活発な議論を促進
4. 定期的にラベルの使用状況をレビュー

---

**🎉 楽しく、わかりやすく、効率的なプロジェクト管理を実現しましょう！**
`

  fs.writeFileSync(path.join(process.cwd(), '.github', 'ISSUE_TEMPLATE_GUIDE.md'), guide, 'utf8')

  console.log('✅ ガイドファイルを作成しました: .github/ISSUE_TEMPLATE_GUIDE.md')
}

// メイン処理の実行
function main() {
  console.log('🎯 ラベル管理システムを開始します...\n')

  // 現在の状況確認
  const currentLabels = showCurrentLabels()

  // 古いラベルの整理提案
  cleanupOldLabels(currentLabels)

  // 新しいラベルの作成
  createNewLabels(currentLabels)

  // 既存ラベルの更新
  updateExistingLabels(currentLabels)

  // テンプレートマッピング表示
  showTemplateMapping()

  // 使用ガイド生成
  generateUsageGuide()

  console.log('\n🎉 ラベル管理システムの処理が完了しました！')
  console.log('\n📖 次のステップ:')
  console.log('1. .github/ISSUE_TEMPLATE_GUIDE.md を確認')
  console.log('2. 不要なラベルがある場合は手動で削除')
  console.log('3. 新しいテンプレートでIssueを作成してテスト')
  console.log('4. コミュニティに新しい運用方法を告知')
}

// スクリプトが直接実行された場合のみmainを実行
if (require.main === module) {
  main()
}

module.exports = {
  RECOMMENDED_LABELS,
  TEMPLATE_LABEL_MAPPING,
  main,
}
