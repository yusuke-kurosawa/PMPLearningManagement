#!/bin/bash

# Mutation Testing Script for Advanced Quality Gates
# チーム専用Mutation Testing実行スクリプト
# 目標: Mutation score 85%+

set -e

echo "🧬 Starting Advanced Mutation Testing..."
echo "Target: Mutation Score 85%+"
echo "=================================="

# 環境設定
export NODE_ENV=test
export MUTATION_THRESHOLD=85

# ログファイル設定
LOG_FILE="mutation-testing-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs

# 実行時間計測開始
start_time=$(date +%s)

echo "📋 Pre-mutation validation..."

# 基本テストが通ることを確認
echo "Running basic test suite..."
npm run test:run > "$LOG_FILE" 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Basic tests failed. Fix tests before mutation testing."
    exit 1
fi

echo "✅ Basic tests passed. Proceeding with mutation testing."

# チーム別Mutation Testing
echo ""
echo "👥 Team-based Mutation Testing Execution:"

# チーム1: コアロジック・アルゴリズム
echo "🧠 Team 1: Core Logic & Algorithms"
npx stryker run --mutate "src/server/services/learningService.ts,src/server/services/recommendationEngine.ts" \
    --testRunner vitest \
    --coverageAnalysis perTest \
    --reporters html,json,clear-text \
    --logLevel info \
    --concurrency 2 \
    --timeoutMS 30000 | tee -a "$LOG_FILE"

# チーム2: データ整合性
echo "🗄️ Team 2: Data Integrity & Transactions"  
npx stryker run --mutate "src/lib/db/**/*.ts,src/lib/cache/**/*.ts" \
    --testRunner vitest \
    --coverageAnalysis perTest \
    --reporters html,json,clear-text \
    --logLevel info \
    --concurrency 1 \
    --timeoutMS 45000 | tee -a "$LOG_FILE"

# チーム3: セキュリティ・認証
echo "🔒 Team 3: Security & Authentication"
npx stryker run --mutate "src/lib/security/**/*.ts,src/server/auth/**/*.ts" \
    --testRunner vitest \
    --coverageAnalysis perTest \
    --reporters html,json,clear-text \
    --logLevel info \
    --concurrency 1 \
    --timeoutMS 40000 | tee -a "$LOG_FILE"

# 結果集計
echo ""
echo "📊 Mutation Testing Results Analysis:"
echo "====================================="

# JSON結果ファイルの存在確認
if [ ! -f "mutation-results.json" ]; then
    echo "❌ Mutation results file not found!"
    exit 1
fi

# Mutation Scoreの取得と検証
mutation_score=$(node -p "JSON.parse(require('fs').readFileSync('mutation-results.json')).mutationScore")

echo "🧬 Overall Mutation Score: $mutation_score%"
echo "🎯 Required Threshold: $MUTATION_THRESHOLD%"

# 閾値チェック
if (( $(echo "$mutation_score < $MUTATION_THRESHOLD" | bc -l) )); then
    echo "❌ Mutation score ($mutation_score%) below threshold ($MUTATION_THRESHOLD%)"
    echo ""
    echo "🔍 Areas for improvement:"
    
    # 低いスコアのファイルを特定
    node -e "
    const results = JSON.parse(require('fs').readFileSync('mutation-results.json'));
    const files = results.files || {};
    
    Object.entries(files)
      .filter(([file, data]) => data.mutationScore < $MUTATION_THRESHOLD)
      .sort((a, b) => a[1].mutationScore - b[1].mutationScore)
      .forEach(([file, data]) => {
        console.log(\`  • \${file}: \${data.mutationScore}%\`);
      });
    "
    
    exit 1
else
    echo "✅ Mutation score threshold met!"
fi

# 実行時間計算
end_time=$(date +%s)
execution_time=$((end_time - start_time))

echo ""
echo "⏱️ Mutation Testing Completed:"
echo "  Duration: ${execution_time} seconds"
echo "  Score: $mutation_score%"
echo "  Status: $([ $mutation_score -ge $MUTATION_THRESHOLD ] && echo "PASSED" || echo "FAILED")"

# 詳細レポート生成
echo ""
echo "📈 Generating detailed mutation report..."

node -e "
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('mutation-results.json'));

const report = {
  timestamp: new Date().toISOString(),
  overallScore: results.mutationScore,
  threshold: $MUTATION_THRESHOLD,
  passed: results.mutationScore >= $MUTATION_THRESHOLD,
  executionTime: $execution_time,
  statistics: {
    totalMutants: results.totalMutants || 0,
    killed: results.killed || 0,
    survived: results.survived || 0,
    timeout: results.timeout || 0,
    noCoverage: results.noCoverage || 0
  },
  teamBreakdown: {
    'core-logic': 'Core algorithms and business rules mutation testing',
    'data-integrity': 'Database and transaction mutation testing', 
    'security': 'Cryptographic and authentication mutation testing'
  }
};

// 詳細レポート出力
console.log('📋 Mutation Testing Summary:');
console.log('============================');
console.log(\`Total Mutants: \${report.statistics.totalMutants}\`);
console.log(\`Killed: \${report.statistics.killed}\`);
console.log(\`Survived: \${report.statistics.survived}\`);
console.log(\`Timeout: \${report.statistics.timeout}\`);
console.log(\`No Coverage: \${report.statistics.noCoverage}\`);
console.log('');
console.log(\`Mutation Score: \${report.overallScore}%\`);
console.log(\`Quality Grade: \${report.overallScore >= 95 ? 'A+' : report.overallScore >= 90 ? 'A' : report.overallScore >= 85 ? 'B+' : 'B'}\`);

fs.writeFileSync('mutation-summary.json', JSON.stringify(report, null, 2));
"

echo "💾 Reports saved:"
echo "  • mutation-results.json - Raw results"
echo "  • mutation-summary.json - Summary report"
echo "  • mutation-report/ - HTML report"
echo "  • logs/$LOG_FILE - Execution log"

# HTMLレポートの場所を表示
if [ -d "mutation-report" ]; then
    echo ""
    echo "🌐 View detailed HTML report at: file://$(pwd)/mutation-report/index.html"
fi

echo ""
echo "🎉 Mutation Testing Complete!"
echo "Ready for production deployment with $mutation_score% mutation score."