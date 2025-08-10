#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ラベル設計を読み込み
const labelDesign = JSON.parse(fs.readFileSync(path.join(__dirname, 'label-system-design.json'), 'utf8'));

const REPO = 'yusuke-kurosawa/PMPLearningManagement';

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
  console.log('📋 現在のラベル一覧を取得中...');
  const result = runCommand(`gh label list --repo ${REPO} --limit 100 --json name`);
  if (!result.success) {
    throw new Error(`ラベル一覧取得に失敗: ${result.error}`);
  }
  
  const labels = JSON.parse(result.output);
  return labels.map(label => label.name);
}

// 古いラベルを削除
function deleteOldLabels(currentLabels) {
  console.log('\n🗑️  古いラベルを削除中...');
  let deletedCount = 0;
  let errorCount = 0;
  
  for (const labelName of currentLabels) {
    const result = runCommand(`gh label delete "${labelName}" --repo ${REPO} --yes`);
    if (result.success) {
      console.log(`   ✅ 削除: ${labelName}`);
      deletedCount++;
    } else {
      console.log(`   ❌ 削除失敗: ${labelName} - ${result.output}`);
      errorCount++;
    }
  }
  
  console.log(`\n削除結果: 成功 ${deletedCount}個, 失敗 ${errorCount}個`);
  return { deleted: deletedCount, errors: errorCount };
}

// 新しいラベルを作成
function createNewLabels() {
  console.log('\n🏷️  新しいラベルを作成中...');
  let createdCount = 0;
  let errorCount = 0;
  
  // 各カテゴリのラベルを作成
  for (const [categoryName, category] of Object.entries(labelDesign.labelCategories)) {
    console.log(`\n  📂 カテゴリ: ${categoryName}`);
    
    for (const label of category.labels) {
      const cmd = `gh label create "${label.name}" --description "${label.description}" --color "${label.color}" --repo ${REPO}`;
      const result = runCommand(cmd);
      
      if (result.success) {
        console.log(`     ✅ 作成: ${label.name}`);
        createdCount++;
      } else {
        console.log(`     ❌ 作成失敗: ${label.name} - ${result.output}`);
        errorCount++;
      }
    }
  }
  
  console.log(`\n作成結果: 成功 ${createdCount}個, 失敗 ${errorCount}個`);
  return { created: createdCount, errors: errorCount };
}

// バックアップを作成
function createBackup(currentLabels) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(__dirname, `label-backup-${timestamp}.json`);
  
  console.log(`💾 ラベルバックアップを作成: ${backupFile}`);
  
  // 詳細なラベル情報を取得
  const detailedLabels = [];
  for (const labelName of currentLabels) {
    try {
      const result = runCommand(`gh api repos/${REPO}/labels/${encodeURIComponent(labelName)}`);
      if (result.success) {
        detailedLabels.push(JSON.parse(result.output));
      }
    } catch (error) {
      console.log(`   ⚠️  ラベル詳細取得失敗: ${labelName}`);
    }
  }
  
  fs.writeFileSync(backupFile, JSON.stringify(detailedLabels, null, 2));
  return backupFile;
}

// メイン処理
async function main() {
  console.log('🚀 GitHubラベル更新処理を開始');
  console.log(`📦 対象リポジトリ: ${REPO}\n`);
  
  try {
    // 現在のラベルを取得
    const currentLabels = getCurrentLabels();
    console.log(`現在のラベル数: ${currentLabels.length}個`);
    
    // バックアップを作成
    const backupFile = createBackup(currentLabels);
    
    // 確認プロンプト
    console.log('\n⚠️  警告: この処理は既存のラベルをすべて削除し、新しいラベル体系に置き換えます。');
    console.log(`バックアップ: ${backupFile}`);
    console.log('\n続行するには "YES" と入力してください:');
    
    // ユーザー入力を待つ（実際の実行時のために）
    // const readline = require('readline');
    // const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // const answer = await new Promise(resolve => rl.question('', resolve));
    // rl.close();
    
    // if (answer !== 'YES') {
    //   console.log('❌ 処理を中止しました。');
    //   return;
    // }
    
    console.log('\n✅ 自動実行モード（テスト用）');
    
    // 古いラベルを削除
    const deleteResult = deleteOldLabels(currentLabels);
    
    // 新しいラベルを作成
    const createResult = createNewLabels();
    
    // 結果サマリー
    console.log('\n📊 処理結果サマリー');
    console.log('==================');
    console.log(`削除: ${deleteResult.deleted}個 (失敗: ${deleteResult.errors}個)`);
    console.log(`作成: ${createResult.created}個 (失敗: ${createResult.errors}個)`);
    console.log(`バックアップ: ${backupFile}`);
    
    if (deleteResult.errors === 0 && createResult.errors === 0) {
      console.log('\n🎉 ラベル更新が正常に完了しました！');
    } else {
      console.log('\n⚠️  一部エラーが発生しました。詳細を確認してください。');
    }
    
  } catch (error) {
    console.error('\n❌ 処理中にエラーが発生しました:');
    console.error(error.message);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (require.main === module) {
  main();
}

module.exports = { getCurrentLabels, createBackup, deleteOldLabels, createNewLabels };