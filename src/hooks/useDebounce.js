/**
 * フロントエンドサービス・状態管理実装
 * Developer 9: React専門・状態管理
 * 技術スタック: React Context, Zustand, Custom Hooks
 * セキュリティレベル: Medium
 * 最終更新: {updated}
 */
import { useState, useEffect } from 'react'

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
