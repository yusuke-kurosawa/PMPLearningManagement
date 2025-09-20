import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  Clock,
  Plus,
  X,
  Edit3,
  Grip,
  Home,
  Grid,
  Brain,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Users,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react'

interface QuickShortcutsProps {
  className?: string
}

const QuickShortcuts: React.FC<QuickShortcutsProps> = ({ className = '' }) => {
  const [shortcuts, setShortcuts] = useState([])
  const [recentItems, setRecentItems] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(true)

  // Default shortcuts
  const defaultShortcuts = [
    { id: 'matrix', label: 'マトリックス', path: '/matrix', icon: Grid, color: 'bg-blue-500' },
    {
      id: 'exam',
      label: '模擬試験',
      path: '/mock-exam',
      icon: GraduationCap,
      color: 'bg-green-500',
    },
    {
      id: 'flashcards',
      label: 'カード学習',
      path: '/flashcards',
      icon: Brain,
      color: 'bg-purple-500',
    },
    {
      id: 'progress',
      label: '進捗確認',
      path: '/progress',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  // Available shortcuts to add
  const availableShortcuts = [
    { id: 'home', label: 'ホーム', path: '/', icon: Home, color: 'bg-gray-500' },
    {
      id: 'network',
      label: 'ネットワーク図',
      path: '/network',
      icon: Grid,
      color: 'bg-indigo-500',
    },
    {
      id: 'visualizations',
      label: 'データ視覚化',
      path: '/visualizations',
      icon: TrendingUp,
      color: 'bg-pink-500',
    },
    {
      id: 'glossary',
      label: 'PMP用語集',
      path: '/glossary',
      icon: BookOpen,
      color: 'bg-yellow-500',
    },
    {
      id: 'collaboration',
      label: 'コラボ',
      path: '/collaboration',
      icon: Users,
      color: 'bg-teal-500',
    },
    {
      id: 'settings',
      label: '設定',
      path: '/pmbok-versions',
      icon: Settings,
      color: 'bg-gray-600',
    },
  ]

  // Load shortcuts from localStorage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const saved = localStorage.getItem('quickShortcuts')
    const savedRecent = localStorage.getItem('recentItems')
    const savedVisibility = localStorage.getItem('shortcutsVisible')

    if (saved) {
      try {
        setShortcuts(JSON.parse(saved))
      } catch (_e) {
        setShortcuts(defaultShortcuts)
      }
    } else {
      setShortcuts(defaultShortcuts)
    }

    if (savedRecent) {
      try {
        setRecentItems(JSON.parse(savedRecent))
      } catch (_e) {
        setRecentItems([])
      }
    }

    if (savedVisibility !== null) {
      setShowShortcuts(JSON.parse(savedVisibility))
    }
  }, [])

  // Save shortcuts to localStorage
  useEffect(() => {
    localStorage.setItem('quickShortcuts', JSON.stringify(shortcuts))
  }, [shortcuts])

  useEffect(() => {
    localStorage.setItem('recentItems', JSON.stringify(recentItems))
  }, [recentItems])

  useEffect(() => {
    localStorage.setItem('shortcutsVisible', JSON.stringify(showShortcuts))
  }, [showShortcuts])

  // Track page visits for recent items
  useEffect(() => {
    const currentPath = window.location.hash.replace('#', '') || '/'
    const currentItem = [...defaultShortcuts, ...availableShortcuts].find(
      (item) => item.path === currentPath
    )

    if (currentItem && !recentItems.find((item) => item.id === currentItem.id)) {
      const newRecentItems = [{ ...currentItem, visitedAt: Date.now() }, ...recentItems.slice(0, 4)]
      setRecentItems(newRecentItems)
    }
  }, [])

  // Add shortcut
  const addShortcut = (shortcut) => {
    if (!shortcuts.find((s) => s.id === shortcut.id)) {
      setShortcuts([...shortcuts, shortcut])
    }
  }

  // Remove shortcut
  const removeShortcut = (id) => {
    setShortcuts(shortcuts.filter((s) => s.id !== id))
  }

  // Reorder shortcuts (simplified drag and drop)
  // const moveShortcut = (fromIndex, toIndex) => { // TODO: Will be used in future
  //   const newShortcuts = [...shortcuts]
  //   const [moved] = newShortcuts.splice(fromIndex, 1)
  //   newShortcuts.splice(toIndex, 0, moved)
  //   setShortcuts(newShortcuts)
  // }

  if (!showShortcuts) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowShortcuts(true)}
          className='flex items-center gap-2 px-3 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        >
          <Eye className='h-4 w-4' />
          クイックショートカットを表示
        </button>
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Zap className='h-5 w-5 text-yellow-500' />
          <h3 className='font-semibold text-gray-900 dark:text-white'>クイックアクセス</h3>
        </div>
        <div className='flex items-center gap-2'>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className='rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
              aria-label='編集'
            >
              <Edit3 className='h-4 w-4 text-gray-500' />
            </button>
          )}
          <button
            onClick={() => setShowShortcuts(false)}
            className='rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            aria-label='非表示'
          >
            <EyeOff className='h-4 w-4 text-gray-500' />
          </button>
        </div>
      </div>

      {/* Shortcuts Grid */}
      <div className='mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {shortcuts.map((shortcut, _index) => {
          const Icon = shortcut.icon
          return (
            <div key={shortcut.id} className='group relative'>
              {isEditing && (
                <>
                  <button
                    onClick={() => removeShortcut(shortcut.id)}
                    className='absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'
                  >
                    <X className='h-3 w-3' />
                  </button>
                  <div className='absolute -left-2 -top-2 z-10 flex h-6 w-6 cursor-move items-center justify-center rounded-full bg-gray-400 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                    <Grip className='h-3 w-3' />
                  </div>
                </>
              )}
              <Link
                to={shortcut.path}
                className='block transform rounded-xl bg-gray-50 p-3 transition-all hover:scale-105 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'
              >
                <div
                  className={`h-8 w-8 ${shortcut.color} mx-auto mb-2 flex items-center justify-center rounded-lg`}
                >
                  <Icon className='h-4 w-4 text-white' />
                </div>
                <div className='truncate text-center text-xs font-medium text-gray-900 dark:text-white'>
                  {shortcut.label}
                </div>
              </Link>
            </div>
          )
        })}

        {/* Add shortcut button */}
        {isEditing && shortcuts.length < 8 && (
          <div className='group relative'>
            <button
              onClick={() => {
                const available = availableShortcuts.filter(
                  (a) => !shortcuts.find((s) => s.id === a.id)
                )
                if (available.length > 0) {
                  addShortcut(available[0])
                }
              }}
              className='w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3 transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'
            >
              <div className='mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-300 dark:bg-gray-600'>
                <Plus className='h-4 w-4 text-gray-600 dark:text-gray-300' />
              </div>
              <div className='text-center text-xs font-medium text-gray-600 dark:text-gray-300'>
                追加
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Edit mode controls */}
      {isEditing && (
        <div className='flex items-center justify-between border-t pt-3 dark:border-gray-700'>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            ショートカットをカスタマイズ
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => setShortcuts(defaultShortcuts)}
              className='px-3 py-1 text-xs text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            >
              リセット
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className='rounded bg-blue-500 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-600'
            >
              完了
            </button>
          </div>
        </div>
      )}

      {/* Recent items */}
      {recentItems.length > 0 && !isEditing && (
        <div className='mt-6'>
          <div className='mb-3 flex items-center gap-2'>
            <Clock className='h-4 w-4 text-gray-400' />
            <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>最近のアクセス</h4>
          </div>
          <div className='flex gap-2 overflow-x-auto pb-2'>
            {recentItems.slice(0, 5).map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className='flex flex-shrink-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'
                >
                  <div className={`h-6 w-6 ${item.color} flex items-center justify-center rounded`}>
                    <Icon className='h-3 w-3 text-white' />
                  </div>
                  <span className='whitespace-nowrap text-sm text-gray-700 dark:text-gray-300'>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {!isEditing && (
        <div className='mt-4 border-t pt-3 dark:border-gray-700'>
          <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400'>
            <span className='flex items-center gap-1'>
              <kbd className='rounded bg-gray-200 px-1.5 py-0.5 text-[10px] dark:bg-gray-700'>
                ⌘K
              </kbd>
              コマンドパレット
            </span>
            <span className='flex items-center gap-1'>
              <kbd className='rounded bg-gray-200 px-1.5 py-0.5 text-[10px] dark:bg-gray-700'>
                ⌘/
              </kbd>
              検索
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickShortcuts
