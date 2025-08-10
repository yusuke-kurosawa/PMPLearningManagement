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

// 既存のissue一覧を取得
function getExistingIssues() {
  console.log('📋 既存issue一覧を取得中...');
  const result = runCommand(`gh issue list --repo ${REPO} --state all --limit 100 --json number,title,labels,state`);
  if (!result.success) {
    throw new Error(`issue一覧取得に失敗: ${result.error}`);
  }
  
  return JSON.parse(result.output);
}

// 古いラベルを新しいラベルにマッピング
function mapOldToNewLabels(oldLabels) {
  const newLabels = new Set();
  const mapping = labelDesign.oldToNewMapping;
  
  for (const oldLabel of oldLabels) {
    const newLabel = mapping[oldLabel.name];
    
    if (newLabel === null) {
      // 削除対象のラベル（何も追加しない）
      continue;
    } else if (Array.isArray(newLabel)) {
      // 複数のラベルにマッピング
      newLabel.forEach(label => newLabels.add(label));
    } else if (newLabel) {
      // 単一のラベルにマッピング
      newLabels.add(newLabel);
    } else {
      // マッピングがない場合は警告
      console.log(`   ⚠️  マッピングなし: ${oldLabel.name}`);
    }
  }
  
  return Array.from(newLabels);
}

// issueの内容からラベルを推測
function inferLabelsFromIssue(issue) {
  const inferredLabels = new Set();
  const title = issue.title.toLowerCase();
  const isEpic = title.includes('epic:');
  
  // Epicの判定
  if (isEpic) {
    inferredLabels.add('epic');
    inferredLabels.add('size:xl');
  }
  
  // タイトルからタイプを推測
  if (title.includes('[feature]') || title.includes('機能') || title.includes('add ')) {
    inferredLabels.add('type:feature');
  } else if (title.includes('[bug]') || title.includes('バグ') || title.includes('fix ')) {
    inferredLabels.add('type:bug');
  } else if (title.includes('[test]') || title.includes('テスト')) {
    inferredLabels.add('type:test');
  } else if (title.includes('[docs]') || title.includes('ドキュメント')) {
    inferredLabels.add('type:docs');
  } else if (title.includes('[spike]') || title.includes('調査') || title.includes('分析')) {
    inferredLabels.add('type:feature');
    inferredLabels.add('status:triage');
  }
  
  // 領域を推測
  if (title.includes('ui') || title.includes('ux') || title.includes('design')) {
    inferredLabels.add('area:ui');
  } else if (title.includes('mobile') || title.includes('モバイル') || title.includes('responsive')) {
    inferredLabels.add('area:mobile');
  } else if (title.includes('backend') || title.includes('api') || title.includes('database')) {
    inferredLabels.add('area:backend');
  } else if (title.includes('frontend') || title.includes('react') || title.includes('typescript')) {
    inferredLabels.add('area:frontend');
  } else if (title.includes('devops') || title.includes('ci/cd') || title.includes('deploy')) {
    inferredLabels.add('area:devops');
  } else if (title.includes('security') || title.includes('auth') || title.includes('セキュリティ')) {
    inferredLabels.add('area:security');
  } else if (title.includes('performance') || title.includes('optimization') || title.includes('最適化')) {
    inferredLabels.add('area:performance');
  } else if (title.includes('learning') || title.includes('学習') || title.includes('exam')) {
    inferredLabels.add('area:learning');
  } else if (title.includes('visualization') || title.includes('視覚化') || title.includes('chart')) {
    inferredLabels.add('area:visualization');
  }
  
  // 優先度を推測
  if (title.includes('critical') || title.includes('緊急')) {
    inferredLabels.add('priority:critical');
  } else if (title.includes('high') || title.includes('重要')) {
    inferredLabels.add('priority:high');
  } else if (title.includes('low') || title.includes('低')) {
    inferredLabels.add('priority:low');
  } else {
    inferredLabels.add('priority:medium');
  }
  
  // 状態を推測
  if (issue.state === 'closed') {
    // クローズされたissueには状態ラベルを付けない
  } else {
    // オープンなissueには適切な状態を設定
    if (title.includes('[spike]') || title.includes('調査')) {
      inferredLabels.add('status:triage');
    } else {
      inferredLabels.add('status:ready');
    }
  }
  
  // サイズを推測（Epicでない場合）
  if (!isEpic) {
    if (title.includes('small') || title.includes('fix ') || title.includes('minor')) {
      inferredLabels.add('size:s');
    } else if (title.includes('large') || title.includes('major') || title.includes('complete')) {
      inferredLabels.add('size:l');
    } else {
      inferredLabels.add('size:m');
    }
  }
  
  // 特別なラベル
  if (title.includes('help') || title.includes('support')) {
    inferredLabels.add('help-wanted');
  }
  if (title.includes('question') || title.includes('質問')) {
    inferredLabels.add('question');
  }
  
  return Array.from(inferredLabels);
}

// issueのラベルを更新
function updateIssueLabels(issueNumber, newLabels) {
  if (newLabels.length === 0) {
    console.log(`   ⚠️  Issue #${issueNumber}: 新しいラベルがありません`);
    return { success: true, output: 'No labels to update' };
  }
  
  const labelsArg = newLabels.map(label => `"${label}"`).join(',');
  const cmd = `gh issue edit ${issueNumber} --repo ${REPO} --add-label ${labelsArg}`;
  
  return runCommand(cmd);
}

// 既存issueのラベルをすべて削除
function clearIssueLabels(issueNumber, existingLabels) {
  if (existingLabels.length === 0) {
    return { success: true, output: 'No labels to remove' };
  }
  
  const labelsArg = existingLabels.map(label => `"${label.name}"`).join(',');
  const cmd = `gh issue edit ${issueNumber} --repo ${REPO} --remove-label ${labelsArg}`;
  
  return runCommand(cmd);
}

// メイン処理
async function main() {
  console.log('🚀 GitHub Issue ラベル更新処理を開始');
  console.log(`📦 対象リポジトリ: ${REPO}\n`);
  
  try {
    // 既存のissue一覧を取得
    const issues = getExistingIssues();
    console.log(`対象issue数: ${issues.length}個\n`);
    
    let updatedCount = 0;
    let errorCount = 0;
    const updateLog = [];
    
    for (const issue of issues) {
      console.log(`🔄 Processing Issue #${issue.number}: ${issue.title}`);
      
      // 既存ラベルをクリア
      const clearResult = clearIssueLabels(issue.number, issue.labels);
      if (!clearResult.success) {
        console.log(`   ❌ ラベルクリア失敗: ${clearResult.output}`);
        errorCount++;
        continue;
      }
      
      // 古いラベルを新しいラベルにマッピング
      const mappedLabels = mapOldToNewLabels(issue.labels);
      
      // issueの内容から追加ラベルを推測
      const inferredLabels = inferLabelsFromIssue(issue);
      
      // ラベルを統合（重複を除去）
      const allNewLabels = Array.from(new Set([...mappedLabels, ...inferredLabels]));
      
      console.log(`   📋 古いラベル: ${issue.labels.map(l => l.name).join(', ') || 'なし'}`);
      console.log(`   🔄 マッピング: ${mappedLabels.join(', ') || 'なし'}`);
      console.log(`   🧠 推測ラベル: ${inferredLabels.join(', ') || 'なし'}`);
      console.log(`   ✅ 新しいラベル: ${allNewLabels.join(', ') || 'なし'}`);
      
      // 新しいラベルを適用
      if (allNewLabels.length > 0) {
        const updateResult = updateIssueLabels(issue.number, allNewLabels);
        if (updateResult.success) {
          console.log(`   ✅ 更新完了`);
          updatedCount++;
        } else {
          console.log(`   ❌ 更新失敗: ${updateResult.output}`);
          errorCount++;
        }
      } else {
        console.log(`   ⚠️  ラベルなしで完了`);
        updatedCount++;
      }
      
      updateLog.push({
        issue: issue.number,
        title: issue.title,
        oldLabels: issue.labels.map(l => l.name),
        newLabels: allNewLabels,
        status: allNewLabels.length > 0 ? 'updated' : 'no-labels'
      });
      
      console.log('');
    }
    
    // 結果をログファイルに保存
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(__dirname, `issue-update-log-${timestamp}.json`);
    fs.writeFileSync(logFile, JSON.stringify(updateLog, null, 2));
    
    // 結果サマリー
    console.log('📊 処理結果サマリー');
    console.log('==================');
    console.log(`更新: ${updatedCount}個`);
    console.log(`エラー: ${errorCount}個`);
    console.log(`ログファイル: ${logFile}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Issue ラベル更新が正常に完了しました！');
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

module.exports = { getExistingIssues, mapOldToNewLabels, inferLabelsFromIssue, updateIssueLabels };