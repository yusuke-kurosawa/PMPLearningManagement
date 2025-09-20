import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Grid,
  Brain,
  GraduationCap,
  TrendingUp,
  Menu,
  BookOpen,
  Network,
  Users,
  ChevronUp,
  X,
  Zap,
  GitBranch,
  Settings,
  BarChart3,
} from 'lucide-react'

const MobileBottomNavigation = () => {
  const [showOverflowMenu, setShowOverflowMenu] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const location = useLocation()

  // Auto-hide on scroll
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollThreshold = 10

      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100)
        setLastScrollY(currentScrollY)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Main navigation items (always visible)
  const mainNavItems = [
    { path: '/', label: 'ホーム', icon: Home },
    { path: '/matrix', label: 'マトリックス', icon: Grid },
    { path: '/flashcards', label: 'カード', icon: Brain },
    { path: '/mock-exam', label: '試験', icon: GraduationCap },
  ]

  // Overflow menu items
  const overflowItems = [
    { path: '/network', label: 'ネットワーク図', icon: Network },
    { path: '/visualizations', label: 'ビジュアル', icon: BookOpen },
    { path: '/glossary', label: '用語集', icon: BookOpen },
    { path: '/progress', label: '学習進捗', icon: TrendingUp },
    { path: '/collaboration', label: 'コラボ', icon: Users },
    { path: '/data-management', label: 'データ', icon: Users },
  ]

  // Agile learning items
  const agileItems = [
    { path: '/agile-manifesto', label: 'アジャイル宣言', icon: Zap, isNew: true },
    { path: '/agile-principles', label: 'アジャイル原則', icon: GitBranch, isNew: true },
    { path: '/agile-practices', label: 'アジャイル実践', icon: Settings, isNew: true },
    { path: '/agile-values', label: 'アジャイル価値比較', icon: BarChart3, isNew: true },
  ]

  return (
    <>
      {/* Overlay for overflow menu */}
      {showOverflowMenu && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50'
          onClick={() => setShowOverflowMenu(false)}
        />
      )}

      {/* Overflow Menu */}
      {showOverflowMenu && (
        <div className='animate-slide-up fixed bottom-20 left-4 right-4 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800'>
          <div className='p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>その他の機能</h3>
              <button
                onClick={() => setShowOverflowMenu(false)}
                className='rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
                aria-label='メニューを閉じる'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Core Features */}
            <div className='mb-4'>
              <h4 className='mb-2 text-sm font-medium text-gray-500 dark:text-gray-400'>
                主要機能
              </h4>
              <div className='grid grid-cols-2 gap-3'>
                {overflowItems.map(({ path, label, icon: Icon }) => {
                  const isActive = location.pathname === path
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setShowOverflowMenu(false)}
                      className={`
                        flex flex-col items-center gap-2 rounded-xl p-4 transition-all
                        ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-600 hover:bg-gray-50 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className='h-6 w-6' />
                      <span className='text-center text-xs font-medium'>{label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Agile Learning Section */}
            <div>
              <div className='mb-2 flex items-center gap-2'>
                <Zap className='h-4 w-4 text-amber-500' />
                <h4 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  アジャイル学習
                </h4>
                <span className='rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white'>
                  NEW
                </span>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                {agileItems.map(({ path, label, icon: Icon, isNew }) => {
                  const isActive = location.pathname === path
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setShowOverflowMenu(false)}
                      className={`
                        relative flex flex-col items-center gap-2 rounded-xl p-4 transition-all
                        ${
                          isActive
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'text-gray-600 hover:bg-amber-50 active:scale-95 dark:text-gray-400 dark:hover:bg-amber-900/20'
                        }
                      `}
                    >
                      <Icon className='h-6 w-6' />
                      <span className='text-center text-xs font-medium'>{label}</span>
                      {isNew && (
                        <span className='absolute -right-1 -top-1 rounded-full bg-red-500 px-1 py-0.5 text-xs text-white'>
                          NEW
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className={`
          fixed bottom-0 left-0 right-0 z-30 border-t bg-white transition-transform duration-300
          ease-in-out dark:border-gray-700 dark:bg-gray-800
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
        role='navigation'
        aria-label='モバイルナビゲーション'
      >
        <div className='grid h-16 grid-cols-5'>
          {/* Main Navigation Items */}
          {mainNavItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex flex-col items-center justify-center gap-1 transition-all active:scale-95
                  ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className='text-xs font-medium'>{label}</span>
                {isActive && (
                  <div className='absolute top-0 h-0.5 w-8 rounded-b-full bg-blue-600 dark:bg-blue-400' />
                )}
              </Link>
            )
          })}

          {/* More Menu Button */}
          <button
            onClick={() => setShowOverflowMenu(!showOverflowMenu)}
            className={`
              flex flex-col items-center justify-center gap-1 transition-all active:scale-95
              ${
                showOverflowMenu
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }
            `}
            aria-label='その他のメニュー'
            aria-expanded={showOverflowMenu}
          >
            {showOverflowMenu ? <ChevronUp className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            <span className='text-xs font-medium'>その他</span>
            {showOverflowMenu && (
              <div className='absolute top-0 h-0.5 w-8 rounded-b-full bg-blue-600 dark:bg-blue-400' />
            )}
          </button>
        </div>

        {/* Safe area padding for devices with home indicator */}
        <div className='h-safe-area-inset-bottom' />
      </nav>

      {/* Content padding to prevent overlap with bottom nav */}
      <div className='h-20' />
    </>
  )
}

export default MobileBottomNavigation
