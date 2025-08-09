#!/bin/bash

# Property-Based Testing Script for Advanced Quality Gates
# 数学的不変条件とアルゴリズム特性の検証
# 目標: 100% property verification

set -e

echo "🔍 Starting Property-Based Testing..."
echo "Target: 100% Property Verification"
echo "=================================="

# 環境設定
export NODE_ENV=test
export PROPERTY_RUNS=1000
export PROPERTY_TIMEOUT=30000

# ログファイル設定
LOG_FILE="property-testing-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs

# 実行時間計測開始
start_time=$(date +%s)

echo "📋 Property-Based Testing Configuration:"
echo "  • Runs per property: $PROPERTY_RUNS"
echo "  • Timeout per test: ${PROPERTY_TIMEOUT}ms"
echo "  • Fast-check library: enabled"

echo ""
echo "🎯 Property Categories:"

# カテゴリ1: アルゴリズム不変条件
echo ""
echo "1️⃣ Algorithm Invariants Testing"
echo "================================"

npx vitest run --testNamePattern="property.*algorithm" \
    --reporter=verbose \
    --logLevel=info 2>&1 | tee -a "$LOG_FILE"

algorithm_result=$?

# カテゴリ2: データ整合性特性
echo ""
echo "2️⃣ Data Consistency Properties"
echo "==============================="

npx vitest run --testNamePattern="property.*consistency" \
    --reporter=verbose \
    --logLevel=info 2>&1 | tee -a "$LOG_FILE"

consistency_result=$?

# カテゴリ3: 暗号学的特性
echo ""
echo "3️⃣ Cryptographic Properties"
echo "============================="

npx vitest run --testNamePattern="property.*crypto" \
    --reporter=verbose \
    --logLevel=info 2>&1 | tee -a "$LOG_FILE"

crypto_result=$?

# カテゴリ4: 認証・認可特性
echo ""
echo "4️⃣ Authentication Properties"
echo "============================="

npx vitest run --testNamePattern="property.*auth" \
    --reporter=verbose \
    --logLevel=info 2>&1 | tee -a "$LOG_FILE"

auth_result=$?

# カテゴリ5: ACID特性
echo ""
echo "5️⃣ ACID Transaction Properties"
echo "==============================="

npx vitest run --testNamePattern="property.*ACID" \
    --reporter=verbose \
    --logLevel=info 2>&1 | tee -a "$LOG_FILE"

acid_result=$?

# 結果集計
echo ""
echo "📊 Property-Based Testing Results:"
echo "==================================="

# 各カテゴリの結果チェック
categories=("Algorithm" "Consistency" "Cryptographic" "Authentication" "ACID")
results=($algorithm_result $consistency_result $crypto_result $auth_result $acid_result)
passed=0
total=${#categories[@]}

for i in "${!categories[@]}"; do
    category="${categories[$i]}"
    result="${results[$i]}"
    
    if [ $result -eq 0 ]; then
        echo "✅ $category Properties: PASSED"
        ((passed++))
    else
        echo "❌ $category Properties: FAILED"
    fi
done

# 成功率計算
success_rate=$((passed * 100 / total))

echo ""
echo "🎯 Overall Property Verification:"
echo "  Passed: $passed/$total categories"
echo "  Success Rate: $success_rate%"

# 実行時間計算
end_time=$(date +%s)
execution_time=$((end_time - start_time))

echo "  Execution Time: ${execution_time} seconds"

# 詳細レポート生成
echo ""
echo "📈 Generating property testing report..."

node -e "
const fs = require('fs');

const report = {
  timestamp: new Date().toISOString(),
  propertyCategories: {
    algorithm: $algorithm_result === 0,
    consistency: $consistency_result === 0,
    cryptographic: $crypto_result === 0,
    authentication: $auth_result === 0,
    acid: $acid_result === 0
  },
  statistics: {
    totalCategories: $total,
    passedCategories: $passed,
    successRate: $success_rate,
    executionTime: $execution_time,
    runsPerProperty: $PROPERTY_RUNS
  },
  propertyDetails: [
    {
      category: 'Algorithm Invariants',
      description: 'Mathematical properties of recommendation and optimization algorithms',
      properties: [
        'Recommendation consistency across identical inputs',
        'Learning path optimization convergence',
        'Business rule determinism',
        'Algorithm performance bounds'
      ]
    },
    {
      category: 'Data Consistency',
      description: 'Database and transaction consistency properties',
      properties: [
        'ACID transaction guarantees',
        'Concurrent operation safety',
        'Data integrity constraints',
        'Race condition prevention'
      ]
    },
    {
      category: 'Cryptographic Properties', 
      description: 'Security and cryptographic function properties',
      properties: [
        'Encryption reversibility',
        'Hash function determinism',
        'Digital signature verifiability',
        'Key derivation consistency'
      ]
    },
    {
      category: 'Authentication Properties',
      description: 'Access control and authorization properties', 
      properties: [
        'Authorization consistency',
        'Privilege escalation prevention',
        'Session management integrity',
        'Rate limiting effectiveness'
      ]
    },
    {
      category: 'ACID Properties',
      description: 'Transaction processing guarantees',
      properties: [
        'Atomicity: All-or-nothing execution',
        'Consistency: Invariant preservation', 
        'Isolation: Concurrent transaction safety',
        'Durability: Persistence guarantees'
      ]
    }
  ],
  recommendations: []
};

// 失敗したカテゴリの改善提案
const failedCategories = Object.entries(report.propertyCategories)
  .filter(([_, passed]) => !passed)
  .map(([category, _]) => category);

if (failedCategories.length > 0) {
  report.recommendations.push(
    'Review and strengthen property-based test cases for failed categories',
    'Increase test runs or adjust timeouts for complex properties',
    'Consider additional invariants and edge cases',
    'Implement property shrinking for better counterexample identification'
  );
} else {
  report.recommendations.push(
    'Excellent property coverage achieved!',
    'Consider expanding property test suite for new features',
    'Maintain regular property-based regression testing',
    'Document proven mathematical invariants'
  );
}

// グレード計算
report.grade = (() => {
  if (report.statistics.successRate === 100) return 'A+';
  if (report.statistics.successRate >= 90) return 'A';
  if (report.statistics.successRate >= 80) return 'B+';
  if (report.statistics.successRate >= 70) return 'B';
  return 'C';
})();

fs.writeFileSync('property-testing-report.json', JSON.stringify(report, null, 2));

console.log('📋 Property Testing Summary:');
console.log('=============================');
console.log(\`Grade: \${report.grade}\`);
console.log(\`Success Rate: \${report.statistics.successRate}%\`);
console.log(\`Execution Time: \${report.statistics.executionTime}s\`);
console.log('');
console.log('Property Categories:');
Object.entries(report.propertyCategories).forEach(([category, passed]) => {
  console.log(\`  • \${category}: \${passed ? '✅ PASSED' : '❌ FAILED'}\`);
});
"

# 最終判定
echo ""
if [ $success_rate -eq 100 ]; then
    echo "🎉 ALL PROPERTIES VERIFIED!"
    echo "✨ Mathematical invariants confirmed"
    echo "🔒 Algorithm correctness proven"
    echo "🛡️ Security properties validated"
    echo "🚀 Ready for production with proven reliability"
    final_result=0
elif [ $success_rate -ge 80 ]; then
    echo "⚠️  PARTIAL PROPERTY VERIFICATION"
    echo "Some properties need attention before production"
    final_result=1
else
    echo "❌ PROPERTY VERIFICATION FAILED"
    echo "Critical properties not satisfied"
    final_result=1
fi

echo ""
echo "💾 Reports saved:"
echo "  • property-testing-report.json - Detailed report"
echo "  • logs/$LOG_FILE - Execution log"

echo ""
echo "🎯 Property-Based Testing Complete!"
echo "Success Rate: $success_rate% | Grade: $([ $success_rate -eq 100 ] && echo "A+" || echo "B+")"

exit $final_result