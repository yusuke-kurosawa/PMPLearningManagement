/**
 * テストケース実装
 * Developer 8: 品質保証エンジニア
 * テストタイプ: {test_type}
 * 対象: {target}
 * 最終更新: {updated}
 */
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup requests interception using the given handlers
export const server = setupServer(...handlers)
