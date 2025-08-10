import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Grid,
  Network,
  Layers,
  Home,
  BookOpen,
  Sparkles,
  TrendingUp,
  Brain,
  GraduationCap,
  Users,
  Database,
  ToggleLeft,
  ChevronDown,
  ChevronRight,
  PanelLeft,
  PanelLeftClose,
  Star,
  Clock,
  Bookmark,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState(['pmbok', 'learning'])
  const [recentPages, setRecentPages] = useState([])
  const [favorites, setFavorites] = useState(['/matrix', '/mock-exam'])
  const location = useLocation()
  const { settings } = useTheme()

  // Track recent pages
  useEffect(() => {
    const currentPath = location.pathname
    setRecentPages((prev) => {
      const filtered = prev.filter((path) => path !== currentPath)
      return [currentPath, ...filtered.slice(0, 4)]
    })
  }, [location.pathname])

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState')
    if (savedState) {
      const { collapsed, expanded, favs } = JSON.parse(savedState)
      setIsCollapsed(collapsed || false)
      setExpandedSections(expanded || ['pmbok', 'learning'])
      setFavorites(favs || ['/matrix', '/mock-exam'])
    }
  }, [])

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem(
      'sidebarState',
      JSON.stringify({
        collapsed: isCollapsed,
        expanded: expandedSections,
        favs: favorites,
      })
    )
  }, [isCollapsed, expandedSections, favorites])

  const menuSections = {
    main: {
      label: 'メイン',
      icon: Home,
      items: [{ path: '/', label: 'ホーム', icon: Home }],
    },
    pmbok: {
      label: 'PMBOK学習',
      icon: Grid,
      items: [
        { path: '/matrix', label: 'マトリックス', icon: Grid },
        { path: '/network', label: 'ネットワーク図', icon: Network },
        { path: '/integrated', label: '統合ビュー', icon: Layers },
        { path: '/visualizations', label: 'ビジュアル', icon: Sparkles, isNew: true },
      ],
    },
    learning: {
      label: '学習ツール',
      icon: Brain,
      items: [
        { path: '/glossary', label: '用語集', icon: BookOpen },
        { path: '/progress', label: '学習進捗', icon: TrendingUp, isNew: true },
        { path: '/flashcards', label: 'フラッシュカード', icon: Brain, isNew: true },
        { path: '/mock-exam', label: '模擬試験', icon: GraduationCap, isNew: true },
      ],
    },
    collaboration: {
      label: 'コラボレーション',
      icon: Users,
      items: [
        { path: '/collaboration', label: 'コラボレーション', icon: Users, isNew: true },
        { path: '/data-management', label: 'データ管理', icon: Database, isNew: true },
      ],
    },
    settings: {
      label: '設定',
      icon: ToggleLeft,
      items: [{ path: '/pmbok-versions', label: 'PMBOK版', icon: ToggleLeft, isNew: true }],
    },
  }

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) =>
      prev.includes(sectionKey) ? prev.filter((key) => key !== sectionKey) : [...prev, sectionKey]
    )
  }

  const toggleFavorite = (path) => {
    setFavorites((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]))
  }

  const getItemByPath = (path) => {
    for (const section of Object.values(menuSections)) {
      const item = section.items.find((item) => item.path === path)
      if (item) return item
    }
    return null
  }

  return (
    <aside
      className={`
        fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
      role="navigation"
      aria-label="サイドナビゲーション"
    >
      {/* Toggle Button */}
      <div className="flex justify-end border-b p-2 dark:border-gray-700">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
        >
          {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <div className="h-full overflow-y-auto pb-16">
        {/* Favorites Section */}
        {!isCollapsed && favorites.length > 0 && (
          <div className="border-b p-4 dark:border-gray-700">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Star className="h-3 w-3" />
              お気に入り
            </h3>
            <div className="space-y-1">
              {favorites.map((path) => {
                const item = getItemByPath(path)
                if (!item) return null
                const isActive = location.pathname === path
                const Icon = item.icon
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                      ${
                        isActive
                          ? 'border-r-2 border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(path)
                      }}
                      className="ml-auto opacity-60 hover:opacity-100"
                      aria-label="お気に入りから削除"
                    >
                      <Star className="h-3 w-3 fill-current" />
                    </button>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Pages */}
        {!isCollapsed && recentPages.length > 0 && (
          <div className="border-b p-4 dark:border-gray-700">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              最近のページ
            </h3>
            <div className="space-y-1">
              {recentPages.slice(0, 5).map((path) => {
                const item = getItemByPath(path)
                if (!item) return null
                const isActive = location.pathname === path
                const Icon = item.icon
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Main Navigation Sections */}
        <div className="p-4">
          {Object.entries(menuSections).map(([sectionKey, section]) => {
            const isExpanded = expandedSections.includes(sectionKey) || isCollapsed
            const SectionIcon = section.icon

            return (
              <div key={sectionKey} className="mb-6">
                {/* Section Header */}
                <button
                  onClick={() => !isCollapsed && toggleSection(sectionKey)}
                  className={`
                    flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
                    ${
                      isCollapsed
                        ? 'justify-center'
                        : 'justify-between hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    text-gray-900 dark:text-white
                  `}
                  aria-expanded={isExpanded}
                  disabled={isCollapsed}
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{section.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className={`mt-2 space-y-1 ${isCollapsed ? '' : 'ml-8'}`}>
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path
                      const ItemIcon = item.icon
                      const isFavorite = favorites.includes(item.path)

                      return (
                        <div key={item.path} className="group relative">
                          <Link
                            to={item.path}
                            className={`
                              flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all
                              ${
                                isActive
                                  ? 'border-r-2 border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                              }
                              ${isCollapsed ? 'justify-center' : ''}
                            `}
                            aria-current={isActive ? 'page' : undefined}
                            title={isCollapsed ? item.label : undefined}
                          >
                            <ItemIcon className="h-4 w-4 flex-shrink-0" />
                            {!isCollapsed && (
                              <>
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.isNew && (
                                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                                    NEW
                                  </span>
                                )}
                              </>
                            )}
                          </Link>

                          {/* Favorite Toggle */}
                          {!isCollapsed && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                toggleFavorite(item.path)
                              }}
                              className={`
                                absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 
                                transition-all hover:scale-110 group-hover:opacity-100
                                ${isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}
                              `}
                              aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                            >
                              <Star className={`h-3 w-3 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
