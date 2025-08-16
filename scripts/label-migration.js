#!/usr/bin/env node

/**
 * Issue Label Migration Script
 * 全IssueのラベルをPMPLearningManagementプロジェクトの新ラベル形式に移行
 */

const { execSync } = require('child_process');
const fs = require('fs');

class IssueLabelMigrator {
  constructor() {
    this.issues = [];
    this.migrationLog = [];
    this.statistics = {
      total: 0,
      labeled: 0,
      unlabeled: 0,
      updated: 0,
      errors: 0
    };
  }

  /**
   * 全Issueの情報を取得
   */
  async loadIssues() {
    console.log('📊 Issueデータを取得中...');
    try {
      const result = execSync('gh issue list --state all --limit 200 --json number,title,labels,state,body', { encoding: 'utf8' });
      this.issues = JSON.parse(result);
      this.statistics.total = this.issues.length;
      console.log(`✅ ${this.statistics.total}件のIssueを取得しました`);
    } catch (error) {
      console.error('❌ Issueデータ取得エラー:', error.message);
      throw error;
    }
  }

  /**
   * タイトルと内容からラベルを推定
   */
  inferLabelsFromContent(issue) {
    const { title, body = '' } = issue;
    const content = (title + ' ' + body).toLowerCase();
    const labels = [];

    // 種別の推定
    if (content.includes('bug') || content.includes('バグ') || content.includes('エラー') || content.includes('修正') || content.includes('security alert')) {
      labels.push('種別:バグ修正');
    } else if (content.includes('epic') || content.includes('エピック') || title.toLowerCase().startsWith('epic:')) {
      labels.push('種別:エピック');
    } else if (content.includes('feature') || content.includes('機能') || content.includes('追加') || content.includes('実装') || content.includes('新規')) {
      labels.push('種別:機能追加');
    } else if (content.includes('refactor') || content.includes('リファクタリング') || content.includes('改善') || content.includes('最適化')) {
      labels.push('種別:リファクタリング');
    } else if (content.includes('test') || content.includes('テスト')) {
      labels.push('種別:テスト');
    } else if (content.includes('doc') || content.includes('ドキュメント') || content.includes('report') || content.includes('レポート')) {
      labels.push('種別:ドキュメント');
    } else if (content.includes('[ux]') || content.includes('[ui')) {
      labels.push('種別:改善');
    } else {
      labels.push('種別:改善'); // デフォルト
    }

    // 優先度の推定
    if (content.includes('urgent') || content.includes('緊急') || content.includes('🚨') || content.includes('security alert')) {
      labels.push('優先度:緊急');
    } else if (content.includes('priority:high') || content.includes('priority high') || content.includes('p:high')) {
      labels.push('優先度:高');
    } else if (content.includes('priority:low') || content.includes('priority low') || content.includes('p:low')) {
      labels.push('優先度:低');
    } else {
      labels.push('優先度:中'); // デフォルト
    }

    // 状態の推定
    if (issue.state === 'OPEN') {
      if (content.includes('調査') || content.includes('analysis') || content.includes('spike')) {
        labels.push('状態:調査中');
      } else {
        labels.push('状態:準備完了');
      }
    }

    // 領域の推定
    if (content.includes('devops') || content.includes('ci/cd') || content.includes('github actions') || content.includes('workflow') || content.includes('deployment')) {
      labels.push('領域:DevOps');
    } else if (content.includes('frontend') || content.includes('react') || content.includes('ui/ux') || content.includes('フロントエンド')) {
      labels.push('領域:フロントエンド');
    } else if (content.includes('backend') || content.includes('api') || content.includes('database') || content.includes('バックエンド')) {
      labels.push('領域:バックエンド');
    } else if (content.includes('security') || content.includes('セキュリティ') || content.includes('auth') || content.includes('認証')) {
      labels.push('領域:セキュリティ');
    } else if (content.includes('mobile') || content.includes('pwa') || content.includes('モバイル')) {
      labels.push('領域:モバイル');
    } else if (content.includes('performance') || content.includes('パフォーマンス') || content.includes('optimization')) {
      labels.push('領域:パフォーマンス');
    } else if (content.includes('visualization') || content.includes('視覚化') || content.includes('chart') || content.includes('graph')) {
      labels.push('領域:視覚化');
    } else if (content.includes('learning') || content.includes('学習') || content.includes('pmbok') || content.includes('pmp')) {
      labels.push('領域:学習機能');
    } else if (content.includes('ui') || content.includes('ux') || content.includes('design')) {
      labels.push('領域:UI/UX');
    } else {
      labels.push('領域:フロントエンド'); // デフォルト
    }

    // 規模の推定
    if (content.includes('epic') || content.includes('エピック') || content.includes('複数週間') || content.includes('large') || content.includes('comprehensive')) {
      labels.push('規模:XL（複数週間）');
    } else if (content.includes('週間') || content.includes('week') || content.includes('大規模')) {
      labels.push('規模:L（1週間）');
    } else if (content.includes('medium') || content.includes('中規模')) {
      labels.push('規模:M（1-2日）');
    } else if (content.includes('small') || content.includes('小規模') || content.includes('半日')) {
      labels.push('規模:S（半日）');
    } else if (content.includes('tiny') || content.includes('時間')) {
      labels.push('規模:XS（1-2時間）');
    } else {
      labels.push('規模:M（1-2日）'); // デフォルト
    }

    // PM関連ラベルの推定
    if (content.includes('統合') || content.includes('integration') || content.includes('overall') || content.includes('全体')) {
      labels.push('PM:統合管理');
    } else if (content.includes('品質') || content.includes('quality') || content.includes('test') || content.includes('テスト')) {
      labels.push('PM:品質管理');
    } else if (content.includes('risk') || content.includes('リスク') || content.includes('security') || content.includes('セキュリティ')) {
      labels.push('PM:リスク管理');
    }

    return [...new Set(labels)]; // 重複除去
  }

  /**
   * 単一Issueのラベルを更新
   */
  async updateIssueLabels(issue, newLabels) {
    const issueNumber = issue.number;
    const currentLabelNames = issue.labels.map(l => l.name);
    
    // 新ラベル形式（カテゴリ:ラベル名）のラベルのみを更新対象とする
    const currentNewFormatLabels = currentLabelNames.filter(name => name.includes(':'));
    const allLabels = [...new Set([...currentNewFormatLabels, ...newLabels])];
    
    if (allLabels.length === 0) return false;

    try {
      const labelsString = allLabels.map(label => `"${label}"`).join(',');
      const command = `gh issue edit ${issueNumber} --add-label ${labelsString}`;
      
      console.log(`🏷️ Issue #${issueNumber}: ${allLabels.join(', ')}`);
      execSync(command, { encoding: 'utf8' });
      
      this.migrationLog.push({
        issue: issueNumber,
        title: issue.title,
        previousLabels: currentLabelNames,
        newLabels: allLabels,
        status: 'success'
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Issue #${issueNumber} ラベル更新エラー:`, error.message);
      this.migrationLog.push({
        issue: issueNumber,
        title: issue.title,
        error: error.message,
        status: 'error'
      });
      this.statistics.errors++;
      return false;
    }
  }

  /**
   * 全Issueの移行処理
   */
  async migrateAllIssues() {
    console.log('\n🚀 ラベル移行処理を開始します...\n');
    
    for (const issue of this.issues) {
      const hasLabels = issue.labels && issue.labels.length > 0;
      
      if (hasLabels) {
        this.statistics.labeled++;
        // 既にラベルがある場合は、新ラベル形式かチェック
        const hasNewFormatLabels = issue.labels.some(label => label.name.includes(':'));
        if (hasNewFormatLabels) {
          console.log(`⏭️ Issue #${issue.number}: 新ラベル形式済み`);
          continue;
        }
      } else {
        this.statistics.unlabeled++;
      }

      // ラベルを推定・適用
      const inferredLabels = this.inferLabelsFromContent(issue);
      const success = await this.updateIssueLabels(issue, inferredLabels);
      
      if (success) {
        this.statistics.updated++;
      }

      // API制限対策で少し待機
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * 結果レポートを生成
   */
  generateReport() {
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        statistics: this.statistics,
        migrationRate: Math.round((this.statistics.updated / this.statistics.total) * 100)
      },
      migrations: this.migrationLog,
      recommendations: this.generateRecommendations()
    };

    // ファイルに保存
    const reportPath = '.github/issue-label-migration-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // コンソールサマリー
    console.log('\n📊 ラベル移行結果サマリー');
    console.log('================================');
    console.log(`📁 総Issue数: ${this.statistics.total}`);
    console.log(`🏷️ 既存ラベル付きIssue: ${this.statistics.labeled}`);
    console.log(`📝 ラベル未設定Issue: ${this.statistics.unlabeled}`);
    console.log(`✅ 更新成功: ${this.statistics.updated}`);
    console.log(`❌ 更新失敗: ${this.statistics.errors}`);
    console.log(`📈 移行率: ${report.summary.migrationRate}%`);
    console.log(`📄 詳細レポート: ${reportPath}`);

    return report;
  }

  /**
   * 推奨事項を生成
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.statistics.errors > 0) {
      recommendations.push('一部のIssueでラベル更新エラーが発生しました。手動で確認してください。');
    }
    
    if (this.statistics.unlabeled > this.statistics.total * 0.2) {
      recommendations.push('20%以上のIssueにラベルが設定されていませんでした。継続的なラベル付けプロセスの検討をお勧めします。');
    }
    
    return recommendations;
  }
}

// メイン実行
async function main() {
  console.log('🚀 PMPLearningManagement Issue Label Migration');
  console.log('==============================================\n');
  
  const migrator = new IssueLabelMigrator();
  
  try {
    await migrator.loadIssues();
    await migrator.migrateAllIssues();
    const report = migrator.generateReport();
    
    console.log('\n✅ ラベル移行が完了しました！');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ラベル移行中にエラーが発生しました:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}