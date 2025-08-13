import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, _useLocation } from 'react-router-dom'
import {
  Command,
  Search,
  Star,
  Clock,
  Zap,
  Calculator,
  Calendar,
  FileText,
  Settings,
  Moon,
  Sun,
  Home,
  Grid,
  Network,
  Users,
  Brain,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Database,
  ArrowRight,
  ChevronRight,
  Keyboard,
  Hash,
  Terminal,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const CommandPalette = () => {
  const navigate = useNavigate()
  //   const _location = useLocation() // TODO: Will be used in future
  const { settings, toggleDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mode, setMode] = useState('search') // search, calculate, navigate, settings
  const inputRef = useRef(null)

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command palette (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setMode('search')
      }

      // Quick calculator (Cmd/Ctrl + Shift + C)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        setIsOpen(true)
        setMode('calculate')
        setQuery('= ')
      }

      // Quick navigation (Cmd/Ctrl + Shift + G)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        setIsOpen(true)
        setMode('navigate')
        setQuery('> ')
      }

      // Settings (Cmd/Ctrl + ,)
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setIsOpen(true)
        setMode('settings')
        setQuery('# ')
      }

      // Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
        setMode('search')
        setSelectedIndex(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100)
    }
  }, [isOpen])

  // Detect mode from query prefix
  useEffect(() => {
    if (query.startsWith('= ')) setMode('calculate')
    else if (query.startsWith('> ')) setMode('navigate')
    else if (query.startsWith('# ')) setMode('settings')
    else setMode('search')
  }, [query])

  // Navigation commands
  const navigationCommands = useMemo(
    () => [
      {
        id: 'home',
        label: 'ホームページ',
        path: '/',
        icon: Home,
        description: 'メインダッシュボードに移動',
      },
      {
        id: 'matrix',
        label: 'PMBOKマトリックス',
        path: '/matrix',
        icon: Grid,
        description: '49のプロセスマトリックスを表示',
      },
      {
        id: 'network',
        label: 'ネットワーク図',
        path: '/network',
        icon: Network,
        description: 'プロセス関係図を表示',
      },
      {
        id: 'visualizations',
        label: 'データ視覚化',
        path: '/visualizations',
        icon: TrendingUp,
        description: '高度な視覚化オプション',
      },
      {
        id: 'glossary',
        label: 'PMP用語集',
        path: '/glossary',
        icon: BookOpen,
        description: '重要用語の検索と学習',
      },
      {
        id: 'progress',
        label: '学習進捗',
        path: '/progress',
        icon: TrendingUp,
        description: '学習状況の確認',
      },
      {
        id: 'flashcards',
        label: 'フラッシュカード',
        path: '/flashcards',
        icon: Brain,
        description: 'ITTO学習カード',
      },
      {
        id: 'exam',
        label: '模擬試験',
        path: '/mock-exam',
        icon: GraduationCap,
        description: 'PMP模擬試験の実施',
      },
      {
        id: 'collaboration',
        label: 'コラボレーション',
        path: '/collaboration',
        icon: Users,
        description: 'チーム学習機能',
      },
      {
        id: 'data',
        label: 'データ管理',
        path: '/data-management',
        icon: Database,
        description: '学習データの管理',
      },
    ],
    []
  )

  // Settings commands
  const settingsCommands = useMemo(
    () => [
      {
        id: 'theme',
        label: `${settings.darkMode ? 'ライト' : 'ダーク'}モードに切り替え`,
        icon: settings.darkMode ? Sun : Moon,
        description: `現在: ${settings.darkMode ? 'ダーク' : 'ライト'}モード`,
        action: () => {
          toggleDarkMode()
          setIsOpen(false)
        },
      },
      {
        id: 'pmbok-version',
        label: 'PMBOK版の設定',
        path: '/pmbok-versions',
        icon: Settings,
        description: 'PMBOK版の選択と設定',
      },
    ],
    [settings.darkMode, toggleDarkMode]
  )

  // Quick actions
  const quickActions = useMemo(
    () => [
      {
        id: 'quick-exam',
        label: '模擬試験を開始',
        icon: Zap,
        description: '180問の模擬試験を即座に開始',
        action: () => {
          navigate('/mock-exam')
          setIsOpen(false)
        },
      },
      {
        id: 'random-flashcard',
        label: 'ランダム学習',
        icon: Star,
        description: 'ランダムなフラッシュカードで学習開始',
        action: () => {
          navigate('/flashcards?random=true')
          setIsOpen(false)
        },
      },
      {
        id: 'progress-reset',
        label: '進捗をリセット',
        icon: Calendar,
        description: '学習進捗データを初期化',
        confirmRequired: true,
        action: () => {
          if (confirm('学習進捗をリセットしますか？この操作は元に戻せません。')) {
            localStorage.removeItem('learningProgress')
            setIsOpen(false)
          }
        },
      },
    ],
    [navigate]
  )

  // Calculator function
  const calculateExpression = (expr) => {
    try {
      const cleanExpr = expr.replace('= ', '').trim()
      if (!cleanExpr) return ''

      // Basic math operations only for security
      const allowedChars = /^[0-9+\-*/.() ]+$/
      if (!allowedChars.test(cleanExpr)) {
        return 'エラー: 使用できない文字が含まれています'
      }

      const result = Function(`"use strict"; return (${cleanExpr})`)()
      return `= ${result}`
    } catch (error) {
      return 'エラー: 無効な式です'
    }
  }

  // Get filtered results based on mode and query
  const getFilteredResults = () => {
    const searchTerm = query.replace(/^[>=# ]/, '').toLowerCase()

    switch (mode) {
      case 'navigate':
        return navigationCommands.filter(
          (cmd) =>
            cmd.label.toLowerCase().includes(searchTerm) ||
            cmd.description.toLowerCase().includes(searchTerm)
        )

      case 'settings':
        return settingsCommands.filter(
          (cmd) =>
            cmd.label.toLowerCase().includes(searchTerm) ||
            cmd.description.toLowerCase().includes(searchTerm)
        )

      case 'calculate':
        if (searchTerm) {
          const result = calculateExpression(query)
          return [{ id: 'calc-result', label: result, icon: Calculator, isResult: true }]
        }
        return []

      default: {
        // search mode
        const allCommands = [...quickActions, ...navigationCommands, ...settingsCommands]

        if (!searchTerm) return allCommands.slice(0, 8)

        return allCommands.filter(
          (cmd) =>
            cmd.label.toLowerCase().includes(searchTerm) ||
            cmd.description?.toLowerCase().includes(searchTerm)
        )
      }
    }
  }

  const results = getFilteredResults()

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleResultClick(results[selectedIndex])
    }
  }

  // Handle result click
  const handleResultClick = (result) => {
    if (result.action) {
      result.action()
    } else if (result.path) {
      navigate(result.path)
      setIsOpen(false)
    }
    setQuery('')
    setSelectedIndex(0)
  }

  // Get mode info
  const getModeInfo = () => {
    switch (mode) {
      case 'navigate':
        return { icon: ArrowRight, label: 'ナビゲーション', placeholder: '> ページ名を入力...' }
      case 'calculate':
        return { icon: Calculator, label: '計算機', placeholder: '= 計算式を入力...' }
      case 'settings':
        return { icon: Settings, label: '設定', placeholder: '# 設定項目を検索...' }
      default:
        return { icon: Search, label: '検索', placeholder: '検索、コマンド実行...' }
    }
  }

  const modeInfo = getModeInfo()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Command palette */}
      <div className="relative flex min-h-screen items-start justify-center px-4 pt-20">
        <div className="relative w-full max-w-2xl rounded-2xl border bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="border-b px-4 py-3 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <modeInfo.icon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={modeInfo.placeholder}
                  className="w-full bg-transparent text-lg text-gray-900 placeholder-gray-500 focus:outline-none dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Mode indicators */}
          <div className="border-b bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-4 text-xs">
              <span
                className={`flex items-center gap-1 ${mode === 'search' ? 'text-blue-500' : 'text-gray-500'}`}
              >
                <Search className="h-3 w-3" /> 検索
              </span>
              <span
                className={`flex items-center gap-1 ${mode === 'navigate' ? 'text-blue-500' : 'text-gray-500'}`}
              >
                <ArrowRight className="h-3 w-3" /> ナビ
              </span>
              <span
                className={`flex items-center gap-1 ${mode === 'calculate' ? 'text-blue-500' : 'text-gray-500'}`}
              >
                <Calculator className="h-3 w-3" /> =計算
              </span>
              <span
                className={`flex items-center gap-1 ${mode === 'settings' ? 'text-blue-500' : 'text-gray-500'}`}
              >
                <Settings className="h-3 w-3" /> #設定
              </span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => {
                  const Icon = result.icon
                  const isSelected = index === selectedIndex

                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`
                        flex w-full items-center gap-3 px-4 py-3 text-left transition-colors
                        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                      `}
                    >
                      <div
                        className={`
                        rounded-lg p-2
                        ${
                          isSelected
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }
                      `}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {result.label}
                        </div>
                        {result.description && (
                          <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                            {result.description}
                          </div>
                        )}
                      </div>
                      {!result.isResult && <ChevronRight className="h-4 w-4 text-gray-400" />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                {mode === 'calculate' ? '計算式を入力してください' : '結果が見つかりません'}
              </div>
            )}
          </div>

          {/* Footer with shortcuts */}
          <div className="border-t bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-white px-1.5 py-0.5 dark:bg-gray-800">↑↓</kbd>
                  移動
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border bg-white px-1.5 py-0.5 dark:bg-gray-800">
                    Enter
                  </kbd>
                  選択
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Keyboard className="h-3 w-3" />
                <span>コマンドパレット</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
