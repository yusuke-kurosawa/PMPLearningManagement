import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  Clock,
  TrendingUp,
  FileText,
  Wrench,
  ArrowRight,
  Loader2,
  Command,
} from 'lucide-react'
import searchService from '../../services/searchService'
import { useDebounce } from '../../hooks/useDebounce'
import { useTheme } from '../../contexts/ThemeContext'

const GlobalSearch = () => {
  const navigate = useNavigate()
  const { settings } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showHistory, setShowHistory] = useState(false)
  const searchInputRef = useRef(null)
  const resultsRef = useRef(null)

  const debouncedQuery = useDebounce(query, 300)

  // キーボードショートカット (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // 検索実行
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsSearching(true)
      const searchResults = searchService.search(debouncedQuery, {
        fuzzy: true,
        limit: 10,
      })
      setResults(searchResults)
      setIsSearching(false)
      setSelectedIndex(-1)
    } else if (debouncedQuery.length === 0) {
      setResults([])
      setShowHistory(true)
    }
  }, [debouncedQuery])

  // オートコンプリート候補の取得
  useEffect(() => {
    if (query.length >= 2) {
      const autocompleteSuggestions = searchService.getSuggestions(query)
      setSuggestions(autocompleteSuggestions)
    } else {
      setSuggestions([])
    }
  }, [query])

  // フォーカス管理
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // 結果アイコンの取得
  const getResultIcon = (type, subtype) => {
    if (type === 'process') return <FileText className="h-4 w-4" />
    if (type === 'itto') {
      if (subtype === 'tool') return <Wrench className="h-4 w-4" />
      return <ArrowRight className="h-4 w-4" />
    }
    if (type === 'glossary') return <FileText className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  // 結果のタイプラベル
  const getTypeLabel = (type, subtype) => {
    if (type === 'process') return 'プロセス'
    if (type === 'itto') {
      if (subtype === 'input') return 'インプット'
      if (subtype === 'tool') return 'ツールと技法'
      if (subtype === 'output') return 'アウトプット'
    }
    if (type === 'glossary') return '用語'
    if (type === 'feature') return '機能'
    return ''
  }

  // 検索結果のハイライト
  const highlightMatch = (text, query) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 font-semibold dark:bg-yellow-700">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  // 結果の選択
  const handleResultClick = (result) => {
    setIsOpen(false)
    setQuery('')
    navigate(result.url)
  }

  // キーボードナビゲーション
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : prev))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleResultClick(results[selectedIndex])
    }
  }

  // 検索履歴の取得
  const searchHistory = searchService.searchHistory
  const popularSearches = searchService.getPopularSearches()

  return (
    <>
      {/* 検索ボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center gap-2 rounded-lg px-3 py-2
          ${
            settings.darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          transition-colors
        `}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">検索...</span>
        <kbd className="hidden items-center gap-1 rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-600 md:inline-flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* 検索モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* 検索パネル */}
          <div className="relative flex min-h-screen items-start justify-center px-4 pt-16">
            <div
              className={`
              relative w-full max-w-2xl rounded-xl shadow-2xl
              ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}
              transform transition-all
            `}
            >
              {/* 検索入力 */}
              <div className="relative border-b dark:border-gray-700">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="プロセス、ITTO、用語を検索..."
                  className={`
                    w-full py-4 pl-12 pr-12 text-lg
                    ${
                      settings.darkMode
                        ? 'bg-transparent text-white placeholder-gray-400'
                        : 'bg-transparent text-gray-900 placeholder-gray-500'
                    }
                    focus:outline-none
                  `}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* オートコンプリート候補 */}
              {suggestions.length > 0 && (
                <div className="border-b px-4 py-2 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(suggestion)}
                        className={`
                          rounded-full px-3 py-1 text-sm
                          ${
                            settings.darkMode
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }
                          transition-colors
                        `}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 検索結果 */}
              <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`
                          flex w-full items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700
                          ${selectedIndex === index ? 'bg-gray-50 dark:bg-gray-700' : ''}
                          text-left transition-colors
                        `}
                      >
                        <div
                          className={`
                          rounded-lg p-2
                          ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                        `}
                        >
                          {getResultIcon(result.type, result.subtype)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium dark:text-white">
                              {highlightMatch(result.title, query)}
                            </h4>
                            <span
                              className={`
                              rounded px-2 py-1 text-xs
                              ${
                                settings.darkMode
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-200 text-gray-600'
                              }
                            `}
                            >
                              {getTypeLabel(result.type, result.subtype)}
                            </span>
                          </div>
                          {result.content && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                              {highlightMatch(result.content, query)}
                            </p>
                          )}
                          {result.parentProcess && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                              {result.parentProcess}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    「{query}」に一致する結果が見つかりませんでした
                  </div>
                ) : (
                  <div className="p-4">
                    {/* 検索履歴 */}
                    {searchHistory.length > 0 && (
                      <div className="mb-6">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Clock className="h-4 w-4" />
                            最近の検索
                          </h3>
                          <button
                            onClick={() => searchService.clearHistory()}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            クリア
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {searchHistory.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => setQuery(item)}
                              className={`
                                rounded-full px-3 py-1 text-sm
                                ${
                                  settings.darkMode
                                    ? 'bg-gray-700 hover:bg-gray-600'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }
                                transition-colors
                              `}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 人気の検索 */}
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <TrendingUp className="h-4 w-4" />
                        人気の検索
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.slice(0, 8).map((item, index) => (
                          <button
                            key={index}
                            onClick={() => setQuery(item)}
                            className={`
                              rounded-full px-3 py-1 text-sm
                              ${
                                settings.darkMode
                                  ? 'bg-gray-700 hover:bg-gray-600'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }
                              transition-colors
                            `}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* フッター */}
              <div
                className={`
                flex items-center justify-between border-t px-4 py-3 text-xs
                text-gray-500 dark:border-gray-700 dark:text-gray-400
              `}
              >
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-700">↑↓</kbd>
                    移動
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-700">Enter</kbd>
                    選択
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-700">Esc</kbd>
                    閉じる
                  </span>
                </div>
                <span>Powered by Smart Search</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GlobalSearch
