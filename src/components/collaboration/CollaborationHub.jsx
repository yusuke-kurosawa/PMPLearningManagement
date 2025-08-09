import React, { useState } from 'react'
import { Users, FileText, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import SharedNotes from './SharedNotes'
import DiscussionThread from './DiscussionThread'
import StudyGroups from './StudyGroups'
import collaborationService from '../../services/collaborationService'

const CollaborationHub = () => {
  const { settings } = useTheme()
  const [activeTab, setActiveTab] = useState('notes')
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '')
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(!username)

  // ユーザー名の設定
  const handleSetUsername = () => {
    if (username.trim()) {
      localStorage.setItem('username', username.trim())
      setShowUsernamePrompt(false)
    }
  }

  // 統計情報の取得
  const popularNotes = collaborationService.getPopularNotes(3)
  const recentDiscussions = collaborationService.getRecentDiscussions(5)
  const activeGroups = collaborationService.getActiveGroups(3)

  const tabs = [
    { id: 'notes', label: '学習ノート', icon: FileText },
    { id: 'discussions', label: 'ディスカッション', icon: MessageSquare },
    { id: 'groups', label: '学習グループ', icon: Users },
    { id: 'dashboard', label: 'ダッシュボード', icon: TrendingUp },
  ]

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* ユーザー名設定プロンプト */}
      {showUsernamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div
            className={`w-full max-w-md rounded-lg p-6 ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 className="mb-4 text-xl font-semibold">ユーザー名を設定</h3>
            <p className={`mb-4 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              コラボレーション機能を使用するには、ユーザー名を設定してください。
            </p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
              placeholder="ユーザー名を入力"
              className={`w-full rounded-lg border px-3 py-2 ${
                settings.darkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white'
              }`}
              autoFocus
            />
            <button
              onClick={handleSetUsername}
              disabled={!username.trim()}
              className={`mt-4 w-full rounded-lg px-4 py-2 font-medium ${
                username.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : settings.darkMode
                    ? 'bg-gray-700 text-gray-500'
                    : 'bg-gray-200 text-gray-400'
              }`}
            >
              設定する
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">コラボレーションハブ</h1>
          <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            他の学習者と知識を共有し、一緒に学習を進めましょう
          </p>
          {username && (
            <p className={`mt-2 text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ログイン中: <span className="font-medium">{username}</span>
              <button
                onClick={() => setShowUsernamePrompt(true)}
                className="ml-2 text-blue-600 hover:underline"
              >
                変更
              </button>
            </p>
          )}
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6 flex flex-wrap gap-2 border-b dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : settings.darkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* タブコンテンツ */}
        <div>
          {activeTab === 'notes' && <SharedNotes />}

          {activeTab === 'discussions' && (
            <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="mb-4 text-xl font-semibold">全体ディスカッション</h2>
              <DiscussionThread
                targetId="global"
                targetType="global"
                title="PMP学習に関する質問・議論"
              />
            </div>
          )}

          {activeTab === 'groups' && <StudyGroups />}

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* 人気のノート */}
              <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                  人気のノート
                </h3>
                <div className="space-y-3">
                  {popularNotes.length > 0 ? (
                    popularNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`rounded border p-3 ${
                          settings.darkMode
                            ? 'border-gray-700 hover:bg-gray-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        } cursor-pointer transition-colors`}
                      >
                        <h4 className="mb-1 font-medium">{note.title}</h4>
                        <p
                          className={`text-sm ${
                            settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {note.author} • いいね {note.likes}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p
                      className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      まだノートがありません
                    </p>
                  )}
                </div>
              </div>

              {/* 最新のディスカッション */}
              <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  最新のディスカッション
                </h3>
                <div className="space-y-3">
                  {recentDiscussions.length > 0 ? (
                    recentDiscussions.map((comment) => (
                      <div
                        key={comment.id}
                        className={`rounded border p-3 ${
                          settings.darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <p
                          className={`mb-1 text-sm ${
                            settings.darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {comment.content.length > 50
                            ? comment.content.substring(0, 50) + '...'
                            : comment.content}
                        </p>
                        <p
                          className={`text-xs ${
                            settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {comment.author}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p
                      className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      まだディスカッションがありません
                    </p>
                  )}
                </div>
              </div>

              {/* アクティブなグループ */}
              <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5 text-green-500" />
                  アクティブなグループ
                </h3>
                <div className="space-y-3">
                  {activeGroups.length > 0 ? (
                    activeGroups.map((group) => (
                      <div
                        key={group.id}
                        className={`rounded border p-3 ${
                          settings.darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <h4 className="mb-1 font-medium">{group.name}</h4>
                        <p
                          className={`text-sm ${
                            settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          メンバー {group.members.length}名
                        </p>
                      </div>
                    ))
                  ) : (
                    <p
                      className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      まだグループがありません
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* クイックアクション */}
        {activeTab === 'dashboard' && (
          <div className={`mt-8 rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="mb-4 text-lg font-semibold">クイックアクション</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                onClick={() => setActiveTab('notes')}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  settings.darkMode
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FileText className="mb-2 h-6 w-6 text-blue-600" />
                <h4 className="mb-1 font-medium">ノートを作成</h4>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  学習内容をまとめて共有
                </p>
              </button>

              <button
                onClick={() => setActiveTab('discussions')}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  settings.darkMode
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="mb-2 h-6 w-6 text-green-600" />
                <h4 className="mb-1 font-medium">質問する</h4>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  わからないことを質問
                </p>
              </button>

              <button
                onClick={() => setActiveTab('groups')}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  settings.darkMode
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Users className="mb-2 h-6 w-6 text-purple-600" />
                <h4 className="mb-1 font-medium">グループに参加</h4>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  仲間と一緒に学習
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CollaborationHub
