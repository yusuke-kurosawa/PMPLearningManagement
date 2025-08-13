#!/usr/bin/env node

// ====================================================================
// リアルタイムメトリクス収集システム
// ====================================================================
// 目的: GitHub Actions ワークフローの実行メトリクスをリアルタイムで
//      収集・分析し、パフォーマンス最適化とコスト削減を実現する
//
// 機能:
//   1. ワークフロー実行時間の計測
//   2. リソース使用量の監視
//   3. 成功率・失敗率の追跡
//   4. コスト計算とアラート
//   5. ダッシュボード用データの生成
// ====================================================================

const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');

/**
 * メトリクス収集クラス
 */
class MetricsCollector {
  constructor(options = {}) {
    this.octokit = new Octokit({
      auth: options.githubToken || process.env.GITHUB_TOKEN
    });
    this.owner = options.owner || process.env.GITHUB_REPOSITORY_OWNER;
    this.repo = options.repo || process.env.GITHUB_REPOSITORY?.split('/')[1];
    this.metricsPath = options.metricsPath || '.github/metrics';
    this.alertThresholds = options.alertThresholds || this.getDefaultThresholds();
  }

  /**
   * デフォルトのアラート閾値
   */
  getDefaultThresholds() {
    return {
      executionTime: {
        warning: 20,  // 分
        critical: 30  // 分
      },
      failureRate: {
        warning: 0.1,  // 10%
        critical: 0.2  // 20%
      },
      cost: {
        warning: 100,  // USD/月
        critical: 200  // USD/月
      }
    };
  }

  /**
   * ワークフロー実行データを収集
   */
  async collectWorkflowRuns(workflowId, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
      const { data } = await this.octokit.actions.listWorkflowRuns({
        owner: this.owner,
        repo: this.repo,
        workflow_id: workflowId,
        created: `>=${since.toISOString()}`
      });

      return data.workflow_runs.map(run => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
        runStartedAt: run.run_started_at,
        duration: this.calculateDuration(run),
        billableTime: run.timing?.billable || {},
        runNumber: run.run_number,
        event: run.event,
        branch: run.head_branch,
        commit: run.head_sha,
        actor: run.actor?.login
      }));
    } catch (error) {
      console.error(`ワークフロー実行データの収集に失敗: ${error.message}`);
      return [];
    }
  }

  /**
   * 実行時間を計算
   */
  calculateDuration(run) {
    if (!run.run_started_at || !run.updated_at) {
      return null;
    }
    const start = new Date(run.run_started_at);
    const end = new Date(run.updated_at);
    return Math.round((end - start) / 1000); // 秒単位
  }

  /**
   * ワークフローメトリクスを計算
   */
  async calculateWorkflowMetrics(workflowId) {
    const runs = await this.collectWorkflowRuns(workflowId);
    
    if (runs.length === 0) {
      return null;
    }

    const completedRuns = runs.filter(r => r.conclusion);
    const successfulRuns = completedRuns.filter(r => r.conclusion === 'success');
    const failedRuns = completedRuns.filter(r => r.conclusion === 'failure');

    const durations = completedRuns
      .map(r => r.duration)
      .filter(d => d !== null);

    const metrics = {
      workflowId,
      timestamp: new Date().toISOString(),
      summary: {
        totalRuns: runs.length,
        completedRuns: completedRuns.length,
        successfulRuns: successfulRuns.length,
        failedRuns: failedRuns.length,
        cancelledRuns: completedRuns.filter(r => r.conclusion === 'cancelled').length,
        pendingRuns: runs.filter(r => !r.conclusion).length
      },
      performance: {
        averageDuration: this.calculateAverage(durations),
        medianDuration: this.calculateMedian(durations),
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        p95Duration: this.calculatePercentile(durations, 95),
        p99Duration: this.calculatePercentile(durations, 99)
      },
      reliability: {
        successRate: successfulRuns.length / completedRuns.length,
        failureRate: failedRuns.length / completedRuns.length,
        mttr: this.calculateMTTR(runs), // Mean Time To Recovery
        mtbf: this.calculateMTBF(runs)  // Mean Time Between Failures
      },
      cost: this.calculateCost(runs),
      trends: this.calculateTrends(runs),
      alerts: this.checkAlerts(metrics)
    };

    return metrics;
  }

  /**
   * 平均値を計算
   */
  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * 中央値を計算
   */
  calculateMedian(values) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * パーセンタイル値を計算
   */
  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * MTTR（平均復旧時間）を計算
   */
  calculateMTTR(runs) {
    const failures = [];
    let lastFailure = null;

    runs.forEach(run => {
      if (run.conclusion === 'failure') {
        lastFailure = run;
      } else if (run.conclusion === 'success' && lastFailure) {
        const recoveryTime = new Date(run.updatedAt) - new Date(lastFailure.updatedAt);
        failures.push(recoveryTime / 1000 / 60); // 分単位
        lastFailure = null;
      }
    });

    return failures.length > 0 ? this.calculateAverage(failures) : 0;
  }

  /**
   * MTBF（平均故障間隔）を計算
   */
  calculateMTBF(runs) {
    const failures = runs.filter(r => r.conclusion === 'failure');
    if (failures.length <= 1) return Infinity;

    const intervals = [];
    for (let i = 1; i < failures.length; i++) {
      const interval = new Date(failures[i].createdAt) - new Date(failures[i - 1].createdAt);
      intervals.push(interval / 1000 / 60 / 60); // 時間単位
    }

    return this.calculateAverage(intervals);
  }

  /**
   * コストを計算
   */
  calculateCost(runs) {
    // GitHub Actions の料金体系に基づく計算
    // 無料枠: 2000分/月（Linuxランナー）
    // 超過分: $0.008/分（Linuxランナー）
    
    const billableMinutes = runs.reduce((total, run) => {
      const minutes = Object.values(run.billableTime).reduce((sum, os) => {
        return sum + (os.total_ms || 0) / 1000 / 60;
      }, 0);
      return total + minutes;
    }, 0);

    const freeMinutes = 2000;
    const chargeableMinutes = Math.max(0, billableMinutes - freeMinutes);
    const costPerMinute = 0.008;
    
    return {
      totalMinutes: Math.round(billableMinutes),
      freeMinutes: freeMinutes,
      chargeableMinutes: Math.round(chargeableMinutes),
      estimatedCost: (chargeableMinutes * costPerMinute).toFixed(2),
      currency: 'USD',
      period: '7 days',
      projectedMonthlyCost: ((chargeableMinutes * costPerMinute) * (30 / 7)).toFixed(2)
    };
  }

  /**
   * トレンドを計算
   */
  calculateTrends(runs) {
    const dailyStats = {};
    
    runs.forEach(run => {
      const date = new Date(run.createdAt).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          total: 0,
          success: 0,
          failure: 0,
          totalDuration: 0,
          count: 0
        };
      }
      
      dailyStats[date].total++;
      if (run.conclusion === 'success') dailyStats[date].success++;
      if (run.conclusion === 'failure') dailyStats[date].failure++;
      if (run.duration) {
        dailyStats[date].totalDuration += run.duration;
        dailyStats[date].count++;
      }
    });

    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      totalRuns: stats.total,
      successRate: stats.success / stats.total,
      averageDuration: stats.count > 0 ? stats.totalDuration / stats.count : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * アラートをチェック
   */
  checkAlerts(metrics) {
    const alerts = [];

    // 実行時間のチェック
    if (metrics?.performance?.averageDuration) {
      const avgMinutes = metrics.performance.averageDuration / 60;
      if (avgMinutes > this.alertThresholds.executionTime.critical) {
        alerts.push({
          level: 'critical',
          type: 'execution_time',
          message: `平均実行時間が閾値を超えています: ${avgMinutes.toFixed(1)}分`,
          value: avgMinutes,
          threshold: this.alertThresholds.executionTime.critical
        });
      } else if (avgMinutes > this.alertThresholds.executionTime.warning) {
        alerts.push({
          level: 'warning',
          type: 'execution_time',
          message: `平均実行時間が警告閾値に近づいています: ${avgMinutes.toFixed(1)}分`,
          value: avgMinutes,
          threshold: this.alertThresholds.executionTime.warning
        });
      }
    }

    // 失敗率のチェック
    if (metrics?.reliability?.failureRate !== undefined) {
      if (metrics.reliability.failureRate > this.alertThresholds.failureRate.critical) {
        alerts.push({
          level: 'critical',
          type: 'failure_rate',
          message: `失敗率が閾値を超えています: ${(metrics.reliability.failureRate * 100).toFixed(1)}%`,
          value: metrics.reliability.failureRate,
          threshold: this.alertThresholds.failureRate.critical
        });
      } else if (metrics.reliability.failureRate > this.alertThresholds.failureRate.warning) {
        alerts.push({
          level: 'warning',
          type: 'failure_rate',
          message: `失敗率が警告閾値に近づいています: ${(metrics.reliability.failureRate * 100).toFixed(1)}%`,
          value: metrics.reliability.failureRate,
          threshold: this.alertThresholds.failureRate.warning
        });
      }
    }

    // コストのチェック
    if (metrics?.cost?.projectedMonthlyCost) {
      const monthlyCost = parseFloat(metrics.cost.projectedMonthlyCost);
      if (monthlyCost > this.alertThresholds.cost.critical) {
        alerts.push({
          level: 'critical',
          type: 'cost',
          message: `予測月額コストが閾値を超えています: $${monthlyCost}`,
          value: monthlyCost,
          threshold: this.alertThresholds.cost.critical
        });
      } else if (monthlyCost > this.alertThresholds.cost.warning) {
        alerts.push({
          level: 'warning',
          type: 'cost',
          message: `予測月額コストが警告閾値に近づいています: $${monthlyCost}`,
          value: monthlyCost,
          threshold: this.alertThresholds.cost.warning
        });
      }
    }

    return alerts;
  }

  /**
   * 全ワークフローのメトリクスを収集
   */
  async collectAllWorkflowMetrics() {
    try {
      const { data } = await this.octokit.actions.listRepoWorkflows({
        owner: this.owner,
        repo: this.repo
      });

      const allMetrics = [];
      
      for (const workflow of data.workflows) {
        console.log(`📊 ${workflow.name} のメトリクスを収集中...`);
        const metrics = await this.calculateWorkflowMetrics(workflow.id);
        if (metrics) {
          allMetrics.push({
            ...metrics,
            workflowName: workflow.name,
            workflowPath: workflow.path,
            workflowState: workflow.state
          });
        }
      }

      return {
        repository: `${this.owner}/${this.repo}`,
        timestamp: new Date().toISOString(),
        workflows: allMetrics,
        summary: this.calculateOverallSummary(allMetrics)
      };
    } catch (error) {
      console.error(`メトリクス収集エラー: ${error.message}`);
      return null;
    }
  }

  /**
   * 全体サマリーを計算
   */
  calculateOverallSummary(allMetrics) {
    const totalRuns = allMetrics.reduce((sum, m) => sum + m.summary.totalRuns, 0);
    const totalSuccess = allMetrics.reduce((sum, m) => sum + m.summary.successfulRuns, 0);
    const totalFailed = allMetrics.reduce((sum, m) => sum + m.summary.failedRuns, 0);
    const totalCost = allMetrics.reduce((sum, m) => sum + parseFloat(m.cost.projectedMonthlyCost), 0);
    
    const allAlerts = allMetrics.flatMap(m => m.alerts || []);
    const criticalAlerts = allAlerts.filter(a => a.level === 'critical');
    const warningAlerts = allAlerts.filter(a => a.level === 'warning');

    return {
      totalWorkflows: allMetrics.length,
      totalRuns,
      overallSuccessRate: totalSuccess / (totalSuccess + totalFailed),
      projectedMonthlyCost: totalCost.toFixed(2),
      alerts: {
        critical: criticalAlerts.length,
        warning: warningAlerts.length,
        details: allAlerts
      },
      topPerformers: allMetrics
        .sort((a, b) => b.reliability.successRate - a.reliability.successRate)
        .slice(0, 3)
        .map(m => ({ name: m.workflowName, successRate: m.reliability.successRate })),
      bottomPerformers: allMetrics
        .sort((a, b) => a.reliability.successRate - b.reliability.successRate)
        .slice(0, 3)
        .map(m => ({ name: m.workflowName, successRate: m.reliability.successRate }))
    };
  }

  /**
   * メトリクスをファイルに保存
   */
  async saveMetrics(metrics) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `metrics-${timestamp}.json`;
    const filePath = path.join(this.metricsPath, fileName);
    
    // ディレクトリが存在しない場合は作成
    await fs.mkdir(this.metricsPath, { recursive: true });
    
    // メトリクスを保存
    await fs.writeFile(filePath, JSON.stringify(metrics, null, 2));
    
    // 最新のメトリクスへのシンボリックリンクを作成
    const latestPath = path.join(this.metricsPath, 'latest.json');
    try {
      await fs.unlink(latestPath);
    } catch {}
    await fs.writeFile(latestPath, JSON.stringify(metrics, null, 2));
    
    console.log(`✅ メトリクス保存完了: ${filePath}`);
    
    return filePath;
  }

  /**
   * メトリクスレポートを生成
   */
  generateReport(metrics) {
    const report = [`
# 📊 GitHub Actions メトリクスレポート

生成日時: ${new Date().toLocaleString('ja-JP')}
リポジトリ: ${metrics.repository}

## 📈 全体サマリー

- **総ワークフロー数**: ${metrics.summary.totalWorkflows}
- **総実行回数**: ${metrics.summary.totalRuns}
- **全体成功率**: ${(metrics.summary.overallSuccessRate * 100).toFixed(1)}%
- **予測月額コスト**: $${metrics.summary.projectedMonthlyCost}

## 🚨 アラート

- **クリティカル**: ${metrics.summary.alerts.critical}件
- **警告**: ${metrics.summary.alerts.warning}件
`];

    if (metrics.summary.alerts.details.length > 0) {
      report.push('\n### アラート詳細\n');
      metrics.summary.alerts.details.forEach(alert => {
        const icon = alert.level === 'critical' ? '🔴' : '⚠️';
        report.push(`${icon} **${alert.message}**`);
      });
    }

    report.push(`
## 🏆 パフォーマンス上位

${metrics.summary.topPerformers.map((w, i) => 
  `${i + 1}. ${w.name}: ${(w.successRate * 100).toFixed(1)}%`
).join('\n')}

## ⚠️ 改善が必要なワークフロー

${metrics.summary.bottomPerformers.map((w, i) => 
  `${i + 1}. ${w.name}: ${(w.successRate * 100).toFixed(1)}%`
).join('\n')}
`);

    return report.join('\n');
  }
}

// CLI実行
if (require.main === module) {
  const collector = new MetricsCollector();
  
  collector.collectAllWorkflowMetrics().then(async metrics => {
    if (metrics) {
      await collector.saveMetrics(metrics);
      const report = collector.generateReport(metrics);
      console.log(report);
    }
  }).catch(console.error);
}

module.exports = MetricsCollector;