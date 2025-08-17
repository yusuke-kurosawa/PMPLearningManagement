import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Brain,
  ChartBar,
  Trophy,
  Users,
  CreditCard,
  BarChart3,
  Menu,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useTheme } from 'next-themes'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: string
}

const mainNavItems: NavItem[] = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/dashboard', label: 'ダッシュボード', icon: BarChart3 },
  { href: '/pmbok/matrix', label: 'PMBOKマトリックス', icon: BookOpen },
  { href: '/visualizations', label: '視覚化', icon: Brain },
  { href: '/progress', label: '学習進捗', icon: ChartBar },
  { href: '/flashcards', label: 'フラッシュカード', icon: CreditCard },
  { href: '/exam', label: '模擬試験', icon: Trophy, badge: 'NEW' },
  { href: '/collaboration', label: 'コラボレーション', icon: Users },
]

const bottomNavItems: NavItem[] = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/pmbok/matrix', label: 'PMBOK', icon: BookOpen },
  { href: '/flashcards', label: 'カード', icon: CreditCard },
  { href: '/exam', label: '試験', icon: Trophy },
  { href: '/progress', label: '進捗', icon: ChartBar },
]

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const isActive = (href: string) => {
    if (href === '/') {return pathname === href}
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Top Navigation Bar for Mobile */}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold">PMP学習</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle>メニュー</SheetTitle>
                </SheetHeader>

                <nav className="mt-6 space-y-1">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center space-x-3 rounded-lg px-3 py-2.5
                        transition-colors duration-200
                        ${
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Settings className="h-5 w-5" />
                    <span>設定</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <User className="h-5 w-5" />
                    <span>プロフィール</span>
                  </Link>
                  <button
                    onClick={() => {
                      // Handle logout
                      setIsOpen(false)
                    }}
                    className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>ログアウト</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:hidden">
        <div className="flex h-16 items-center justify-around">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex h-full flex-1 flex-col items-center justify-center
                transition-colors duration-200
                ${
                  isActive(item.href)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }
              `}
            >
              <item.icon className="mb-1 h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}

export default MobileNavigation
