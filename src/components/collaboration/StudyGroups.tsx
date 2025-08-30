import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  // _Calendar, // TODO: Use for scheduling
  Target,
  Bell,
  // UserPlus, // TODO: Use for adding users
  Lock,
  Globe,
  TrendingUp,
  // MessageSquare, // TODO: Use for messages
  Share2,
  LogOut,
} from 'lucide-react'
import collaborationService from '../../services/collaborationService'
import { useTheme } from '../../contexts/ThemeContext'

const StudyGroups = () => {
  const { settings } = useTheme()
  const [groups, setGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [publicGroups, setPublicGroups] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [currentUser, setCurrentUser] = useState('')
  const [userProgress, setUserProgress] = useState(null)

  // 新規グループのフォーム状態
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    targetDate: '',
    isPublic: true,
  })

  // お知らせの入力状態
  const [newAnnouncement, setNewAnnouncement] = useState('')

  useEffect(() => {
    loadGroups()
    // ユーザー名の読み込み
    const savedUser = localStorage.getItem('username') || 'Anonymous'
    setCurrentUser(savedUser)
    // ユーザーの進捗情報を読み込み（実際の実装では進捗サービスから取得）
    loadUserProgress()
  }, [])

  const loadGroups = () => {
    // 自分が参加しているグループ
    const myGroupsList = collaborationService.getStudyGroups({ member: currentUser })
    setMyGroups(myGroupsList)

    // 公開グループ
    const publicGroupsList = collaborationService.getStudyGroups({ isPublic: true })
    setPublicGroups(publicGroupsList.filter((g) => !g.members.includes(currentUser)))

    setGroups([...myGroupsList, ...publicGroupsList])
  }

  const loadUserProgress = () => {
    // 実際の実装では進捗サービスから取得
    const mockProgress = {
      completedProcesses: 25,
      totalProcesses: 49,
      knowledgeAreaProgress: {
        統合: 80,
        スコープ: 70,
        スケジュール: 60,
        コスト: 50,
        リスク: 40,
      },
      lastStudied: new Date().toISOString(),
    }
    setUserProgress(mockProgress)
  }

  // グループの作成
  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) {
      alert('グループ名を入力してください')
      return
    }

    const createdGroup = collaborationService.createStudyGroup({
      ...newGroup,
      creator: currentUser,
    })

    setMyGroups([createdGroup, ...myGroups])
    setNewGroup({ name: '', description: '', targetDate: '', isPublic: true })
    setShowCreateForm(false)
  }

  // グループへの参加
  const handleJoinGroup = (groupId) => {
    collaborationService.joinGroup(groupId, currentUser)
    loadGroups()
  }

  // グループから退出
  const handleLeaveGroup = (groupId) => {
    if (confirm('このグループから退出しますか？')) {
      const group = groups.find((g) => g.id === groupId)
      if (group) {
        group.members = group.members.filter((m) => m !== currentUser)
        collaborationService.saveData()
        loadGroups()
        setSelectedGroup(null)
      }
    }
  }

  // 進捗の共有
  const handleShareProgress = (groupId) => {
    if (!userProgress) {
      return
    }

    collaborationService.shareProgress(groupId, currentUser, userProgress)
    alert('進捗を共有しました！')

    // 選択中のグループを更新
    if (selectedGroup && selectedGroup.id === groupId) {
      const updatedGroup = collaborationService.getStudyGroups().find((g) => g.id === groupId)
      setSelectedGroup(updatedGroup)
    }
  }

  // お知らせの投稿
  const handlePostAnnouncement = () => {
    if (!newAnnouncement.trim() || !selectedGroup) {
      return
    }

    collaborationService.addAnnouncement(selectedGroup.id, {
      content: newAnnouncement,
      author: currentUser,
    })

    setNewAnnouncement('')
    // グループ情報を再読み込み
    const updatedGroup = collaborationService
      .getStudyGroups()
      .find((g) => g.id === selectedGroup.id)
    setSelectedGroup(updatedGroup)
  }

  // 共有リンクの生成
  const handleShareGroup = (group) => {
    const shareLink = collaborationService.generateShareLink({
      type: 'group',
      content: {
        id: group.id,
        name: group.name,
        description: group.description,
      },
    })

    navigator.clipboard.writeText(shareLink).then(() => {
      alert('グループの共有リンクをクリップボードにコピーしました！')
    })
  }

  // 進捗率の計算
  const calculateProgressPercentage = (progress) => {
    if (!progress || !progress.totalProcesses) {
      return 0
    }
    return Math.round((progress.completedProcesses / progress.totalProcesses) * 100)
  }

  return (
    <div className={`p-4 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* ヘッダー */}
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-2xl font-bold'>
          <Users className='h-6 w-6' />
          学習グループ
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
        >
          <Plus className='h-4 w-4' />
          新規グループ作成
        </button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* グループリスト */}
        <div className='space-y-6 lg:col-span-2'>
          {/* 参加中のグループ */}
          {myGroups.length > 0 && (
            <div>
              <h3 className='mb-3 text-lg font-semibold'>参加中のグループ</h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {myGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`cursor-pointer rounded-lg p-4 transition-all hover:shadow-lg ${
                      settings.darkMode
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-white hover:shadow-md'
                    } ${selectedGroup?.id === group.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className='mb-2 flex items-start justify-between'>
                      <h4 className='font-semibold'>{group.name}</h4>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          group.isPublic
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {group.isPublic ? (
                          <Globe className='inline h-3 w-3' />
                        ) : (
                          <Lock className='inline h-3 w-3' />
                        )}
                        {group.isPublic ? ' 公開' : ' 非公開'}
                      </span>
                    </div>

                    <p
                      className={`mb-3 text-sm ${
                        settings.darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {group.description || 'グループの説明なし'}
                    </p>

                    <div
                      className={`flex items-center justify-between text-xs ${
                        settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <span className='flex items-center gap-1'>
                        <Users className='h-3 w-3' />
                        {group.members.length}名
                      </span>
                      {group.targetDate && (
                        <span className='flex items-center gap-1'>
                          <Target className='h-3 w-3' />
                          {new Date(group.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* 共有進捗のプレビュー */}
                    {Object.keys(group.sharedProgress || {}).length > 0 && (
                      <div className='mt-3 border-t pt-3 dark:border-gray-700'>
                        <div className='flex -space-x-2'>
                          {Object.entries(group.sharedProgress)
                            .slice(0, 5)
                            .map(([username, progress]) => (
                              <div
                                key={username}
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                                  settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                }`}
                                title={`${username}: ${calculateProgressPercentage(progress)}%`}
                              >
                                {username.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          {Object.keys(group.sharedProgress).length > 5 && (
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                                settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
                              }`}
                            >
                              +{Object.keys(group.sharedProgress).length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 公開グループ */}
          {publicGroups.length > 0 && (
            <div>
              <h3 className='mb-3 text-lg font-semibold'>参加可能なグループ</h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {publicGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`rounded-lg p-4 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}
                  >
                    <h4 className='mb-2 font-semibold'>{group.name}</h4>
                    <p
                      className={`mb-3 text-sm ${
                        settings.darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {group.description || 'グループの説明なし'}
                    </p>

                    <div className='flex items-center justify-between'>
                      <span
                        className={`flex items-center gap-1 text-xs ${
                          settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        <Users className='h-3 w-3' />
                        {group.members.length}名
                      </span>
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className='rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700'
                      >
                        参加する
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* グループがない場合 */}
          {myGroups.length === 0 && publicGroups.length === 0 && (
            <div className='py-12 text-center'>
              <Users className='mx-auto mb-4 h-12 w-12 text-gray-400' />
              <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                まだ学習グループがありません
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className='mt-4 text-blue-600 hover:underline'
              >
                最初のグループを作成する
              </button>
            </div>
          )}
        </div>

        {/* グループ詳細パネル */}
        {selectedGroup && (
          <div
            className={`rounded-lg p-4 lg:col-span-1 ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>{selectedGroup.name}</h3>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handleShareGroup(selectedGroup)}
                  className='rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700'
                  title='共有'
                >
                  <Share2 className='h-4 w-4' />
                </button>
                {selectedGroup.members.includes(currentUser) && (
                  <button
                    onClick={() => handleLeaveGroup(selectedGroup.id)}
                    className='rounded p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
                    title='退出'
                  >
                    <LogOut className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>

            {/* メンバーリスト */}
            <div className='mb-6'>
              <h4 className='mb-2 font-medium'>メンバー ({selectedGroup.members.length}名)</h4>
              <div className='space-y-2'>
                {selectedGroup.members.map((member) => (
                  <div
                    key={member}
                    className={`flex items-center justify-between rounded p-2 ${
                      settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <span className='flex items-center gap-2'>
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          settings.darkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        {member.charAt(0).toUpperCase()}
                      </div>
                      {member}
                      {member === selectedGroup.creator && (
                        <span className='text-xs text-blue-600'>管理者</span>
                      )}
                    </span>
                    {selectedGroup.sharedProgress?.[member] && (
                      <span className='text-xs'>
                        {calculateProgressPercentage(selectedGroup.sharedProgress[member])}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 進捗共有ボタン */}
            {selectedGroup.members.includes(currentUser) && (
              <button
                onClick={() => handleShareProgress(selectedGroup.id)}
                className='mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700'
              >
                <TrendingUp className='h-4 w-4' />
                自分の進捗を共有
              </button>
            )}

            {/* お知らせ */}
            <div>
              <h4 className='mb-2 flex items-center gap-2 font-medium'>
                <Bell className='h-4 w-4' />
                お知らせ
              </h4>

              {selectedGroup.members.includes(currentUser) && (
                <div className='mb-3'>
                  <div className='flex gap-2'>
                    <input
                      aria-label='Input field'
                      id='input-1754995293941-421'
                      type='text'
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePostAnnouncement()}
                      placeholder='お知らせを入力...'
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                        settings.darkMode
                          ? 'border-gray-600 bg-gray-700'
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                    <button
                      onClick={handlePostAnnouncement}
                      disabled={!newAnnouncement.trim()}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        newAnnouncement.trim()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : settings.darkMode
                            ? 'bg-gray-700 text-gray-500'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      投稿
                    </button>
                  </div>
                </div>
              )}

              <div className='max-h-60 space-y-2 overflow-y-auto'>
                {selectedGroup.announcements.length > 0 ? (
                  selectedGroup.announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`rounded-lg p-3 text-sm ${
                        settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <div className='mb-1 flex items-center justify-between'>
                        <span className='font-medium'>{announcement.author}</span>
                        <span
                          className={`text-xs ${
                            settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p>{announcement.content}</p>
                    </div>
                  ))
                ) : (
                  <p
                    className={`py-4 text-center text-sm ${
                      settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    まだお知らせはありません
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* グループ作成フォーム */}
      {showCreateForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div
            className={`w-full max-w-md rounded-lg ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className='p-6'>
              <h3 className='mb-4 text-xl font-semibold'>新規グループ作成</h3>

              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='input-1754995293941-501'
                    className='mb-1 block text-sm font-medium'
                  >
                    グループ名
                  </label>
                  <input
                    aria-label='Input field'
                    id='input-1754995293941-501'
                    type='text'
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      settings.darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                    placeholder='PMP試験対策グループ'
                  />
                </div>

                <div>
                  <label htmlFor='-input' className='mb-1 block text-sm font-medium'>
                    説明
                  </label>
                  <textarea
                    id='-input'
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className={`h-24 w-full rounded-lg border px-3 py-2 ${
                      settings.darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                    placeholder='グループの目的や学習計画など'
                  />
                </div>

                <div>
                  <label htmlFor='-input' className='mb-1 block text-sm font-medium'>
                    目標試験日
                  </label>
                  <input
                    id='-input'
                    type='date'
                    value={newGroup.targetDate}
                    onChange={(e) => setNewGroup({ ...newGroup, targetDate: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      settings.darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                  />
                </div>

                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='isPublic'
                    checked={newGroup.isPublic}
                    onChange={(e) => setNewGroup({ ...newGroup, isPublic: e.target.checked })}
                    className='rounded'
                  />
                  <label htmlFor='isPublic' className='text-sm'>
                    他のユーザーが参加できるようにする
                  </label>
                </div>
              </div>

              <div className='mt-6 flex justify-end gap-3'>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={`rounded-lg px-4 py-2 ${
                    settings.darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateGroup}
                  className='rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyGroups
