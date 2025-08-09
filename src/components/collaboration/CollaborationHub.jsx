import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import SharedNotes from './SharedNotes';
import DiscussionThread from './DiscussionThread';
import StudyGroups from './StudyGroups';
import collaborationService from '../../services/collaborationService';

const CollaborationHub = () => {
  const { settings } = useTheme();
  const [activeTab, setActiveTab] = useState('notes');
  const [username, setUsername] = useState(() => 
    localStorage.getItem('username') || ''
  );
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(!username);

  // ユーザー名の設定
  const handleSetUsername = () => {
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      setShowUsernamePrompt(false);
    }
  };

  // 統計情報の取得
  const popularNotes = collaborationService.getPopularNotes(3);
  const recentDiscussions = collaborationService.getRecentDiscussions(5);
  const activeGroups = collaborationService.getActiveGroups(3);

  const tabs = [
    { id: 'notes', label: '学習ノート', icon: FileText },
    { id: 'discussions', label: 'ディスカッション', icon: MessageSquare },
    { id: 'groups', label: '学習グループ', icon: Users },
    { id: 'dashboard', label: 'ダッシュボード', icon: TrendingUp }
  ];

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* ユーザー名設定プロンプト */}
      {showUsernamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-md p-6 rounded-lg ${
            settings.darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className="text-xl font-semibold mb-4">ユーザー名を設定</h3>
            <p className={`mb-4 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              コラボレーション機能を使用するには、ユーザー名を設定してください。
            </p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
              placeholder="ユーザー名を入力"
              className={`w-full px-3 py-2 rounded-lg border ${
                settings.darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              autoFocus
            />
            <button
              onClick={handleSetUsername}
              disabled={!username.trim()}
              className={`w-full mt-4 px-4 py-2 rounded-lg font-medium ${
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
          <h1 className="text-3xl font-bold mb-2">コラボレーションハブ</h1>
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
        <div className="flex flex-wrap gap-2 mb-6 border-b dark:border-gray-700">
          {tabs.map(tab => {
            const Icon = tab.icon;
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
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* タブコンテンツ */}
        <div>
          {activeTab === 'notes' && <SharedNotes />}
          
          {activeTab === 'discussions' && (
            <div className={`p-6 rounded-lg ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className="text-xl font-semibold mb-4">全体ディスカッション</h2>
              <DiscussionThread 
                targetId="global" 
                targetType="global" 
                title="PMP学習に関する質問・議論"
              />
            </div>
          )}
          
          {activeTab === 'groups' && <StudyGroups />}
          
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 人気のノート */}
              <div className={`p-6 rounded-lg ${
                settings.darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  人気のノート
                </h3>
                <div className="space-y-3">
                  {popularNotes.length > 0 ? (
                    popularNotes.map(note => (
                      <div
                        key={note.id}
                        className={`p-3 rounded border ${
                          settings.darkMode 
                            ? 'border-gray-700 hover:bg-gray-700' 
                            : 'border-gray-200 hover:bg-gray-50'
                        } cursor-pointer transition-colors`}
                      >
                        <h4 className="font-medium mb-1">{note.title}</h4>
                        <p className={`text-sm ${
                          settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {note.author} • いいね {note.likes}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${
                      settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      まだノートがありません
                    </p>
                  )}
                </div>
              </div>

              {/* 最新のディスカッション */}
              <div className={`p-6 rounded-lg ${
                settings.darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  最新のディスカッション
                </h3>
                <div className="space-y-3">
                  {recentDiscussions.length > 0 ? (
                    recentDiscussions.map(comment => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded border ${
                          settings.darkMode 
                            ? 'border-gray-700' 
                            : 'border-gray-200'
                        }`}
                      >
                        <p className={`text-sm mb-1 ${
                          settings.darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {comment.content.length > 50 
                            ? comment.content.substring(0, 50) + '...' 
                            : comment.content}
                        </p>
                        <p className={`text-xs ${
                          settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {comment.author}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${
                      settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      まだディスカッションがありません
                    </p>
                  )}
                </div>
              </div>

              {/* アクティブなグループ */}
              <div className={`p-6 rounded-lg ${
                settings.darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  アクティブなグループ
                </h3>
                <div className="space-y-3">
                  {activeGroups.length > 0 ? (
                    activeGroups.map(group => (
                      <div
                        key={group.id}
                        className={`p-3 rounded border ${
                          settings.darkMode 
                            ? 'border-gray-700' 
                            : 'border-gray-200'
                        }`}
                      >
                        <h4 className="font-medium mb-1">{group.name}</h4>
                        <p className={`text-sm ${
                          settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          メンバー {group.members.length}名
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${
                      settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
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
          <div className={`mt-8 p-6 rounded-lg ${
            settings.darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className="text-lg font-semibold mb-4">クイックアクション</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('notes')}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  settings.darkMode 
                    ? 'border-gray-700 hover:bg-gray-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium mb-1">ノートを作成</h4>
                <p className={`text-sm ${
                  settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  学習内容をまとめて共有
                </p>
              </button>

              <button
                onClick={() => setActiveTab('discussions')}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  settings.darkMode 
                    ? 'border-gray-700 hover:bg-gray-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-medium mb-1">質問する</h4>
                <p className={`text-sm ${
                  settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  わからないことを質問
                </p>
              </button>

              <button
                onClick={() => setActiveTab('groups')}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  settings.darkMode 
                    ? 'border-gray-700 hover:bg-gray-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Users className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-medium mb-1">グループに参加</h4>
                <p className={`text-sm ${
                  settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  仲間と一緒に学習
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationHub;