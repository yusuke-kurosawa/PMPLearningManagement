import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Grid,
  Network,
  Layers,
  Home,
  Menu,
  X,
  BookOpen,
  Sparkles,
  TrendingUp,
  Brain,
  GraduationCap,
  Moon,
  Sun,
  Users,
  Database,
  ToggleLeft,
  ChevronRight,
  User,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import GlobalSearch from '../shared/GlobalSearch'
import SettingsTrigger from '../shared/SettingsTrigger'

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const location = useLocation()
  const { settings, toggleDarkMode } = useTheme()
  const {
    isAuthenticated,
    user,
    userName,
    userAvatar,
    role,
    isAdmin,
    isInstructor,
    signOut,
    loading,
  } = useAuth()
  
  const profileButtonRef = React.useRef(null)
  const profileMenuRef = React.useRef(null)

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (pathname) => {
    const breadcrumbs = [{ path: '/', label: 'ホーム' }]
    const currentItem = navItems.find((item) => item.path === pathname)
    if (currentItem && pathname !== '/') {
      breadcrumbs.push({ path: currentItem.path, label: currentItem.label })
    }
    return breadcrumbs
  }

  const navItems = [
    { path: '/', label: 'ホーム', icon: Home, category: 'main' },
    { path: '/matrix', label: 'マトリックス', icon: Grid, category: 'pmbok' },
    { path: '/network', label: 'ネットワーク図', icon: Network, category: 'pmbok' },
    { path: '/integrated', label: '統合ビュー', icon: Layers, category: 'pmbok' },
    {
      path: '/visualizations',
      label: 'ビジュアル',
      icon: Sparkles,
      isNew: true,
      category: 'pmbok',
    },
    { path: '/glossary', label: '用語集', icon: BookOpen, category: 'learning' },
    { path: '/progress', label: '学習進捗', icon: TrendingUp, isNew: true, category: 'learning' },
    {
      path: '/flashcards',
      label: 'フラッシュカード',
      icon: Brain,
      isNew: true,
      category: 'learning',
    },
    {
      path: '/mock-exam',
      label: '模擬試験',
      icon: GraduationCap,
      isNew: true,
      category: 'learning',
    },
    {
      path: '/collaboration',
      label: 'コラボレーション',
      icon: Users,
      isNew: true,
      category: 'collaboration',
    },
    {
      path: '/data-management',
      label: 'データ管理',
      icon: Database,
      isNew: true,
      category: 'collaboration',
    },
    {
      path: '/pmbok-versions',
      label: 'PMBOK版',
      icon: ToggleLeft,
      isNew: true,
      category: 'settings',
    },
  ]

  const breadcrumbs = generateBreadcrumbs(location.pathname)
  
  // Handle keyboard navigation for dropdowns
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isProfileOpen) {
          setIsProfileOpen(false)
          profileButtonRef.current?.focus()
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false)
        }
      }
    }
    
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    
    if (isProfileOpen || isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen, isMobileMenuOpen])

  return (
    <>
      <nav
        id="navigation"
        className="sticky top-0 z-50 bg-white shadow-lg transition-colors dark:bg-gray-800"
        role="navigation"
        aria-label="メインナビゲーション"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white md:text-xl">
                  PMBOK学習システム
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-1 md:flex">
              {/* Global Search */}
              <GlobalSearch />
              {navItems.map(({ path, label, icon: Icon, isNew }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`
                    relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md dark:bg-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }
                  `}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {isNew && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                        NEW
                      </span>
                    )}
                  </Link>
                )
              })}

              {/* Authentication & User Profile */}
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  /* Authenticated User Menu */
                  <div className="relative">
                    <button
                      ref={profileButtonRef}
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' && !isProfileOpen) {
                          e.preventDefault()
                          setIsProfileOpen(true)
                        }
                      }}
                      className="ml-2 flex items-center gap-2 rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="ユーザーメニュー"
                      aria-expanded={isProfileOpen}
                      aria-haspopup="true"
                      disabled={loading}
                    >
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt="Profile"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                      <span className="hidden text-sm font-medium lg:block">{userName}</span>
                      {(isAdmin || isInstructor) && (
                        <Shield
                          className="h-4 w-4 text-blue-500"
                          title="管理者・インストラクター"
                        />
                      )}
                    </button>

                    {isProfileOpen && (
                      <div 
                        ref={profileMenuRef}
                        className="absolute right-0 z-50 mt-2 w-64 rounded-md border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                        role="menu"
                        aria-orientation="vertical"
                        tabIndex={-1}
                      >
                        <div className="border-b p-4 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            {userAvatar ? (
                              <img
                                src={userAvatar}
                                alt="Profile"
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                                <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {userName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.email}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {role === 'admin'
                                  ? '管理者'
                                  : role === 'instructor'
                                    ? 'インストラクター'
                                    : '学生'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                            role="menuitem"
                          >
                            <User className="h-4 w-4" />
                            プロフィール設定
                          </Link>

                          <button
                            onClick={() => {
                              toggleDarkMode()
                              setIsProfileOpen(false)
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                            role="menuitem"
                          >
                            {settings.darkMode ? (
                              <Sun className="h-4 w-4" />
                            ) : (
                              <Moon className="h-4 w-4" />
                            )}
                            {settings.darkMode ? 'ライトモード' : 'ダークモード'}
                          </button>

                          <div onClick={() => setIsProfileOpen(false)}>
                            <SettingsTrigger className="w-full justify-start text-left" />
                          </div>

                          <div className="mt-2 border-t pt-2 dark:border-gray-700">
                            <button
                              onClick={async () => {
                                setIsProfileOpen(false)
                                await signOut()
                              }}
                              disabled={loading}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
                              role="menuitem"
                            >
                              <LogOut className="h-4 w-4" />
                              {loading ? 'サインアウト中...' : 'サインアウト'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Sign In / Sign Up Buttons */
                  <div className="flex items-center gap-2">
                    <Link
                      to="/auth?mode=login"
                      className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <LogIn className="h-4 w-4" />
                      サインイン
                    </Link>
                    <Link
                      to="/auth?mode=register"
                      className="flex items-center gap-2 rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      新規登録
                    </Link>

                    <button
                      onClick={toggleDarkMode}
                      className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label={
                        settings.darkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'
                      }
                    >
                      {settings.darkMode ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button and controls */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Mobile Global Search */}
              <GlobalSearch />

              {/* Mobile Auth Status */}
              {isAuthenticated && (
                <div className="flex items-center gap-1">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Profile"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  )}
                  {(isAdmin || isInstructor) && <Shield className="h-4 w-4 text-blue-500" />}
                </div>
              )}

              <button
                onClick={toggleDarkMode}
                className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={settings.darkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              >
                {settings.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div
              id="mobile-menu"
              className="animate-slide-in border-t bg-white py-2 dark:border-gray-700 dark:bg-gray-800 md:hidden"
              role="menu"
              aria-label="モバイルメニュー"
            >
              {/* Main Navigation Items */}
              {navItems.map(({ path, label, icon: Icon, isNew }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                    relative flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-blue-500 text-white dark:bg-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                  `}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {isNew && (
                      <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                        NEW
                      </span>
                    )}
                  </Link>
                )
              })}

              {/* Authentication Section */}
              <div className="mt-2 border-t pt-2 dark:border-gray-700">
                {isAuthenticated ? (
                  /* Authenticated User Options */
                  <>
                    <div className="border-b px-4 py-2 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt="Profile"
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                            <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {userName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {role === 'admin'
                              ? '管理者'
                              : role === 'instructor'
                                ? 'インストラクター'
                                : '学生'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <User className="h-4 w-4" />
                      プロフィール設定
                    </Link>

                    <button
                      onClick={async () => {
                        setIsMobileMenuOpen(false)
                        await signOut()
                      }}
                      disabled={loading}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" />
                      {loading ? 'サインアウト中...' : 'サインアウト'}
                    </button>
                  </>
                ) : (
                  /* Guest User Options */
                  <>
                    <Link
                      to="/auth?mode=login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <LogIn className="h-4 w-4" />
                      サインイン
                    </Link>

                    <Link
                      to="/auth?mode=register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mx-4 flex items-center gap-2 rounded-md bg-blue-500 px-4 py-3 text-sm text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                      role="menuitem"
                    >
                      <UserPlus className="h-4 w-4" />
                      新規登録
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 1 && (
        <nav
          className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
          aria-label="パンくずナビゲーション"
        >
          <div className="mx-auto max-w-7xl px-4">
            <ol className="flex items-center py-3 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.path} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="mx-2 h-4 w-4 text-gray-400" aria-hidden="true" />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-gray-900 dark:text-white" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}
    </>
  )
}

export default Navigation
