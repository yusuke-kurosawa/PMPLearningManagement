import React from 'react'
import { Link } from 'react-router-dom'
import { Github, ExternalLink, Heart, BookOpen, Users, TrendingUp } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = {
    learning: {
      title: '学習リソース',
      links: [
        { to: '/matrix', label: 'PMBOKマトリックス', icon: BookOpen },
        { to: '/flashcards', label: 'フラッシュカード', icon: TrendingUp },
        { to: '/mock-exam', label: '模擬試験', icon: Users },
        { to: '/glossary', label: 'PMP用語集', icon: BookOpen },
      ],
    },
    tools: {
      title: 'ツール',
      links: [
        { to: '/visualizations', label: 'データ視覚化', icon: TrendingUp },
        { to: '/progress', label: '学習進捗', icon: TrendingUp },
        { to: '/collaboration', label: 'コラボレーション', icon: Users },
        { to: '/data-management', label: 'データ管理', icon: BookOpen },
      ],
    },
    support: {
      title: 'サポート',
      links: [
        { to: '/pmbok-versions', label: '設定', icon: BookOpen },
        {
          href: 'https://github.com/yusuke-kurosawa/PMPLearningManagement',
          label: 'GitHub',
          icon: Github,
          external: true,
        },
        {
          href: 'https://www.pmi.org/',
          label: 'PMI公式サイト',
          icon: ExternalLink,
          external: true,
        },
      ],
    },
  }

  return (
    <footer className="mt-auto border-t bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">PMBOK学習システム</h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              PMP資格取得を目指す方のための包括的な学習プラットフォーム。
              PMBOKガイドの内容を効率的に学習し、実践的なスキルを身につけることができます。
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/yusuke-kurosawa/PMPLearningManagement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="GitHub リポジトリ"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, index) => {
                  const Icon = link.icon
                  const linkContent = (
                    <span className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                      <Icon className="h-4 w-4" />
                      {link.label}
                      {link.external && <ExternalLink className="ml-auto h-3 w-3" />}
                    </span>
                  )

                  return (
                    <li key={index}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {linkContent}
                        </a>
                      ) : (
                        <Link to={link.to} className="block">
                          {linkContent}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} PMBOK学習システム. All rights reserved.
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 fill-current text-red-500" />
              <span>for PMP learners</span>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-500">
              PMI, PMBOK, and PMP are registered trademarks of Project Management Institute, Inc.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
