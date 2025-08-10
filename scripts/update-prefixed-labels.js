#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// プレフィックス付きラベル設計を読み込み
const prefixedLabelDesign = JSON.parse(fs.readFileSync(path.join(__dirname, 'prefixed-fun-label-system-design.json'), 'utf8'));

const REPO = 'yusuke-kurosawa/PMPLearningManagement';

// カラフルなログメッセージ用の関数
function logWithEmoji(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function logSuccess(message) {
  logWithEmoji('✅', message);
}

function logError(message) {
  logWithEmoji('❌', message);
}

function logInfo(message) {
  logWithEmoji('💡', message);
}

function logWarning(message) {
  logWithEmoji('⚠️', message);
}

// コマンド実行用のヘルパー関数
function runCommand(cmd) {
  try {
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
}

// 現在のラベル一覧を取得
function getCurrentLabels() {
  logInfo('現在のラベル一覧を取得中...');
  const result = runCommand(`gh label list --repo ${REPO} --limit 100 --json name,description,color`);
  if (!result.success) {
    throw new Error(`ラベル一覧取得に失敗: ${result.error}`);
  }
  
  const labels = JSON.parse(result.output);
  logInfo(`発見！現在のラベル数: ${labels.length}個`);
  return labels;
}

// バックアップを作成
function createBackup(currentLabels) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(__dirname, `prefixed-label-backup-${timestamp}.json`);
  
  logWithEmoji('💾', `ラベルバックアップを作成: ${backupFile}`);
  fs.writeFileSync(backupFile, JSON.stringify(currentLabels, null, 2));
  return backupFile;
}

// 既存ラベルをプレフィックス付きラベルに移行
function migrateToPrefixedLabels() {
  logWithEmoji('🔄', '既存ラベルをプレフィックス付きラベルに移行中...');
  
  const migrationRules = prefixedLabelDesign.migrationRules.mappings;
  let migratedCount = 0;
  let createdCount = 0;
  let errorCount = 0;

  // まず、新しいプレフィックス付きラベルを作成
  for (const [categoryName, category] of Object.entries(prefixedLabelDesign.labelCategories)) {
    logWithEmoji('🎯', `カテゴリ: ${categoryName} (${category.prefix})`);
    
    for (const label of category.labels) {
      // GitHub APIでは色コードから#を除去する必要がある
      const colorCode = label.color.replace('#', '');
      const cmd = `gh label create "${label.name}" --description "${label.description}" --color "${colorCode}" --repo ${REPO}`;
      const result = runCommand(cmd);
      
      if (result.success) {
        logSuccess(`作成: ${label.name}`);
        createdCount++;
      } else {
        // ラベルが既に存在する場合は更新を試みる
        if (result.output.includes('already exists')) {
          const updateCmd = `gh label edit "${label.name}" --description "${label.description}" --color "${colorCode}" --repo ${REPO}`;
          const updateResult = runCommand(updateCmd);
          if (updateResult.success) {
            logWithEmoji('🔄', `更新: ${label.name}`);
            createdCount++;
          } else {
            logError(`更新失敗: ${label.name} - ${updateResult.output}`);
            errorCount++;
          }
        } else {
          logError(`作成失敗: ${label.name} - ${result.output}`);
          errorCount++;
        }
      }
    }
  }

  // 古いラベルから新しいラベルへの移行を実行
  logWithEmoji('🔀', 'ラベル移行処理を開始...');
  for (const [oldLabel, newLabel] of Object.entries(migrationRules)) {
    // 古いラベルが存在するかチェック
    const checkResult = runCommand(`gh api repos/${REPO}/labels/${encodeURIComponent(oldLabel)} 2>/dev/null`);
    if (checkResult.success) {
      logInfo(`移行対象発見: ${oldLabel} → ${newLabel}`);
      
      // 古いラベルが付いているissueを検索
      const searchResult = runCommand(`gh issue list --repo ${REPO} --label "${oldLabel}" --limit 100 --json number`);
      if (searchResult.success) {
        const issues = JSON.parse(searchResult.output);
        
        // 各issueの古いラベルを新しいラベルに置き換え
        for (const issue of issues) {
          const removeResult = runCommand(`gh issue edit ${issue.number} --remove-label "${oldLabel}" --repo ${REPO}`);
          const addResult = runCommand(`gh issue edit ${issue.number} --add-label "${newLabel}" --repo ${REPO}`);
          
          if (removeResult.success && addResult.success) {
            logWithEmoji('🔄', `Issue #${issue.number}: ${oldLabel} → ${newLabel}`);
          } else {
            logWarning(`Issue #${issue.number}のラベル更新に失敗`);
          }
        }
        
        logInfo(`${issues.length}個のissueのラベルを更新しました`);
      }
      
      // 古いラベルを削除
      const deleteResult = runCommand(`gh label delete "${oldLabel}" --repo ${REPO} --yes`);
      if (deleteResult.success) {
        logSuccess(`削除: ${oldLabel}`);
        migratedCount++;
      } else {
        logWarning(`削除に失敗: ${oldLabel} - ${deleteResult.output}`);
      }
    }
  }
  
  logWithEmoji('📊', `移行結果: 作成/更新 ${createdCount}個, 移行 ${migratedCount}個, エラー ${errorCount}個`);
  return { created: createdCount, migrated: migratedCount, errors: errorCount };
}

// 使用状況の統計を表示
function showPrefixedLabelStatistics() {
  logWithEmoji('📈', 'プレフィックス付きラベル統計情報:');
  
  const totalLabels = Object.values(prefixedLabelDesign.labelCategories)
    .reduce((sum, category) => sum + category.labels.length, 0);
  
  console.log(`\n🎯 カテゴリ別ラベル数:`);
  for (const [categoryName, category] of Object.entries(prefixedLabelDesign.labelCategories)) {
    console.log(`   ${category.prefix} ${categoryName}: ${category.labels.length}個`);
  }
  
  console.log(`\n📊 総ラベル数: ${totalLabels}個`);
  console.log(`🌟 プレフィックスの効果:`);
  console.log(`   📋 Issue作成時の視認性向上`);
  console.log(`   🔍 ラベル選択の効率化`);
  console.log(`   📚 カテゴリごとの整理された表示`);
  
  console.log(`\n🎨 期待される表示順序（Suggestions）:`);
  const sampleOrder = prefixedLabelDesign.expected_sorting.sample_order;
  sampleOrder.slice(0, 10).forEach(label => {
    console.log(`   🏷️  ${label}`);
  });
  console.log(`   ... など全${totalLabels}個`);
}

// プレビューモード - プレフィックス付きラベル一覧を表示
function previewPrefixedLabels() {
  logWithEmoji('👀', 'プレフィックス付きラベルシステム - プレビューモード');
  
  console.log('\n🎨 作成予定のプレフィックス付きラベル一覧:\n');
  
  for (const [categoryName, category] of Object.entries(prefixedLabelDesign.labelCategories)) {
    console.log(`\n${category.prefix} ${categoryName.toUpperCase()}`);
    console.log('─'.repeat(50));
    
    for (const label of category.labels) {
      console.log(`🏷️  ${label.name}`);
      console.log(`   📝 ${label.description}`);
      console.log(`   🎨 カラー: ${label.color}`);
      console.log('');
    }
  }
  
  showPrefixedLabelStatistics();
}

// Issueテンプレートの自動ラベル設定を更新
function updateIssueTemplates() {
  logWithEmoji('📝', 'Issueテンプレートの自動ラベル設定を更新中...');
  
  const issueTemplateDir = path.join(__dirname, '..', '.github', 'ISSUE_TEMPLATE');
  
  // テンプレートファイルとそのラベル設定のマッピング
  const templateMappings = [
    {
      file: '01_bug_report.yml',
      labels: '["T:🐛 バグハンター", "P:🔥 高優先度", "S:🔍 調査中"]',
      description: 'バグハンター用テンプレート'
    },
    {
      file: '02_feature_request.yml', 
      labels: '["T:✨ 新機能の魔法使い", "P:💡 アイデア", "S:🔍 調査中"]',
      description: '新機能提案用テンプレート'
    },
    {
      file: '03_improvement.yml',
      labels: '["T:🚀 パフォーマンス・スピードスター", "P:⭐ 標準", "S:🔍 調査中"]',
      description: '改善提案用テンプレート'
    },
    {
      file: '04_learning_content.yml',
      labels: '["T:📚 知識の伝道師", "A:📚 ナレッジシェア", "P:⭐ 標準"]',
      description: '学習コンテンツ用テンプレート'
    },
    {
      file: '05_documentation.yml',
      labels: '["T:📚 知識の伝道師", "TM:📚 ナレッジシェア", "P:🌱 低優先度"]',
      description: 'ドキュメント用テンプレート'
    },
    {
      file: '06_question_support.yml',
      labels: '["TM:💬 ディスカッション", "TM:🎓 メンター募集", "P:⭐ 標準"]',
      description: '質問・サポート用テンプレート'
    }
  ];
  
  let updatedCount = 0;
  
  templateMappings.forEach(mapping => {
    const templatePath = path.join(issueTemplateDir, mapping.file);
    if (fs.existsSync(templatePath)) {
      let content = fs.readFileSync(templatePath, 'utf8');
      
      // labels行を新しいプレフィックス付きラベルに置き換え
      const updatedContent = content.replace(
        /^labels:\s*\[.*?\]$/m,
        `labels: ${mapping.labels}`
      );
      
      if (content !== updatedContent) {
        fs.writeFileSync(templatePath, updatedContent);
        logSuccess(`更新: ${mapping.file} (${mapping.description})`);
        updatedCount++;
      } else {
        logInfo(`変更なし: ${mapping.file}`);
      }
    } else {
      logWarning(`テンプレートファイルが見つかりません: ${mapping.file}`);
    }
  });
  
  logWithEmoji('📊', `テンプレート更新結果: ${updatedCount}個のファイルを更新`);
  return updatedCount;
}

// メイン処理
async function main() {
  logWithEmoji('🚀', 'PMP学習プラットフォーム - プレフィックス付きラベルシステム構築開始！');
  logWithEmoji('🏗️', `対象リポジトリ: ${REPO}\n`);
  
  try {
    // 統計情報を表示
    showPrefixedLabelStatistics();
    
    // 現在のラベルを取得
    const currentLabels = getCurrentLabels();
    
    // バックアップを作成
    const backupFile = createBackup(currentLabels);
    logSuccess(`バックアップ完了: ${backupFile}`);
    
    logWithEmoji('⚡', '自動実行モード');
    
    // プレフィックス付きラベルへの移行を実行
    const migrateResult = migrateToPrefixedLabels();
    
    // Issueテンプレートの更新
    const templateUpdateCount = updateIssueTemplates();
    
    // 結果サマリー
    logWithEmoji('🎉', '処理結果サマリー');
    console.log('='.repeat(40));
    console.log(`✨ 作成/更新: ${migrateResult.created}個`);
    console.log(`🔄 移行: ${migrateResult.migrated}個`);
    console.log(`📝 テンプレート更新: ${templateUpdateCount}個`);
    console.log(`❌ エラー: ${migrateResult.errors}個`);
    console.log(`💾 バックアップ: ${backupFile}`);
    
    if (migrateResult.errors === 0) {
      logWithEmoji('🌟', 'プレフィックス付きラベルシステムが正常に構築されました！');
      logWithEmoji('📋', 'Issue作成時のSuggestionsで見やすく表示されます');
      logWithEmoji('🔍', 'カテゴリプレフィックスにより効率的なラベル選択が可能に');
      logWithEmoji('🎯', 'チーム全体での統一されたラベル使用を促進します');
    } else {
      logWarning('一部エラーが発生しました。詳細を確認してください。');
    }
    
    // 今後の使用方法を案内
    console.log(`\n📚 使用方法:`);
    console.log(`   🐛 バグ報告: "T:🐛 バグハンター" + "P:🔥 高優先度"`);
    console.log(`   ✨ 新機能: "T:✨ 新機能の魔法使い" + "L:⚡ 駆け出し冒険者"`);
    console.log(`   👥 チーム作業: "TM:🌟 チーム・クエスト"`);
    console.log(`   📋 進捗管理: "S:⚡ 開発中" → "S:👀 レビュー待ち"`);
    
  } catch (error) {
    logError('処理中にエラーが発生しました:');
    console.error(error.message);
    process.exit(1);
  }
}

// コマンドライン引数をチェック
const args = process.argv.slice(2);
if (args.includes('--preview') || args.includes('-p')) {
  previewPrefixedLabels();
} else if (require.main === module) {
  main();
}

module.exports = { 
  getCurrentLabels, 
  createBackup, 
  migrateToPrefixedLabels,
  updateIssueTemplates,
  showPrefixedLabelStatistics,
  previewPrefixedLabels
};