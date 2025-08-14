import { logger } from './services/logger'

// Phase 1 DevOps基盤安定化改善の動作検証テストファイル
// このファイルは以下の改善が実際に動作するかをテストします：

// logger.debug('🚀 Phase 1 Verification Test Starting')

// 1. 改良版PRレビューシステムのテスト
export function testEnhancedPRReview() {
  // 意図的なコード品質問題（PR review shouldアドバイスする）
  const globalVariable = 'This should be const' // ESLint warning

  // セキュリティ問題（Claude should detect）
  // eslint-disable-next-line no-eval
  eval('logger.debug("Security issue")') // Security vulnerability

  // パフォーマンス問題
  for (let i = 0; i < 100000; i++) {
    document.getElementById('nonexistent') // Performance issue
  }

  return globalVariable
}

// 2. 未使用変数（コード品質検出テスト）
const _unusedVariable = 'This variable is never used'

// 3. エラーハンドリング不足
function riskyFunction(data) {
  return data.property.nested // No null checks
}

// 4. 非効率なアルゴリズム
function inefficientSort(array) {
  // Bubble sort - inefficient O(n²)
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (array[j] > array[j + 1]) {
        let temp = array[j]
        array[j] = array[j + 1]
        array[j + 1] = temp
      }
    }
  }
  return array
}

// 5. React関連の改善提案テスト
export function TestComponent(props) {
  // Missing key in map
  return props.items.map((item) => <div key={item.id || item.name}>{item.name}</div>)
}

// 6. 型安全性の問題
function typeUnsafeFunction(param) {
  return param.toString().toUpperCase().split('') // No type checking
}

// logger.debug('📊 Test scenarios prepared for:')
// logger.debug('- Code quality detection')
// logger.debug('- Security vulnerability scanning')
// logger.debug('- Performance issue identification')
// logger.debug('- React best practices validation')
// logger.debug('- Error handling improvements')
// logger.debug('- Algorithm optimization suggestions')

export { riskyFunction, inefficientSort, typeUnsafeFunction }
