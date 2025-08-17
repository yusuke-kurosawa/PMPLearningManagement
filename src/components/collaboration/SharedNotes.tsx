import React, { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Heart,
  MessageSquare,
  Share2,
  Tag,
  User,
  Calendar,
  Eye,
  // Edit, // TODO: Use for editing
  Trash2,
  X,
} from 'lucide-react'
import collaborationService from '../../services/collaborationService'
import { useTheme } from '../../contexts/ThemeContext'

const SharedNotes = ({ processId = null, knowledgeArea = null }) => {
  const { settings } = useTheme()
  const [notes, setNotes] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [filterTag, setFilterTag] = useState('')
  const [currentUser, setCurrentUser] = useState('')

  // 新規ノートのフォーム状態
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: '',
    isPublic: true,
  })

  // ノートの読み込み
  useEffect(() => {
    loadNotes()
    // ユーザー名の読み込み（簡易実装）
    const savedUser = localStorage.getItem('username') || 'Anonymous'
    setCurrentUser(savedUser)
  }, [processId, knowledgeArea, filterTag])

  const loadNotes = () => {
    const filters = {
      processId,
      knowledgeArea,
      tags: filterTag ? [filterTag] : [],
    }
    const loadedNotes = collaborationService.getNotes(filters)
    setNotes(loadedNotes)
  }

  // ノートの作成
  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('タイトルと内容を入力してください')
      return
    }

    const tags = newNote.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const createdNote = collaborationService.createNote({
      ...newNote,
      tags,
      processId,
      knowledgeArea,
      author: currentUser,
    })

    setNotes([createdNote, ...notes])
    setNewNote({ title: '', content: '', tags: '', isPublic: true })
    setShowCreateForm(false)
  }

  // ノートのいいね
  const handleLikeNote = (noteId) => {
    collaborationService.likeNote(noteId)
    loadNotes()
  }

  // ノートの削除
  const handleDeleteNote = (noteId) => {
    if (confirm('このノートを削除しますか？')) {
      collaborationService.deleteNote(noteId)
      loadNotes()
      setSelectedNote(null)
    }
  }

  // 共有リンクの生成
  const handleShareNote = (note) => {
    const shareLink = collaborationService.generateShareLink({
      type: 'note',
      content: note,
    })

    // クリップボードにコピー
    navigator.clipboard.writeText(shareLink).then(() => {
      alert('共有リンクをクリップボードにコピーしました！')
    })
  }

  // タグの取得
  const getAllTags = () => {
    const allTags = new Set()
    notes.forEach((note) => {
      note.tags.forEach((tag) => allTags.add(tag))
    })
    return Array.from(allTags)
  }

  return (
    <div className={`p-4 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <FileText className="h-6 w-6" />
          共有ノート
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          新規ノート
        </button>
      </div>

      {/* タグフィルター */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTag('')}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              !filterTag
                ? 'bg-blue-600 text-white'
                : settings.darkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            すべて
          </button>
          {getAllTags().map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                filterTag === tag
                  ? 'bg-blue-600 text-white'
                  : settings.darkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <Tag className="mr-1 inline h-3 w-3" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ノート一覧 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`cursor-pointer rounded-lg p-4 transition-all hover:shadow-lg ${
              settings.darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}
            onClick={() => setSelectedNote(note)}
          >
            <h3 className="mb-2 font-semibold">{note.title}</h3>
            <p
              className={`mb-3 line-clamp-3 text-sm ${
                settings.darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {note.content}
            </p>

            {/* タグ */}
            <div className="mb-3 flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-2 py-1 text-xs ${
                    settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* メタ情報 */}
            <div
              className={`flex items-center justify-between text-xs ${
                settings.darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {note.author}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {note.views}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLikeNote(note.id)
                  }}
                  className="flex items-center gap-1 transition-colors hover:text-red-500"
                >
                  <Heart className={`h-3 w-3 ${note.likes > 0 ? 'fill-current' : ''}`} />
                  {note.likes}
                </button>
                <MessageSquare className="h-3 w-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ノート作成フォーム */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div
            className={`w-full max-w-2xl rounded-lg ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">新規ノート作成</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={`rounded-lg p-2 hover:bg-gray-200 dark:hover:bg-gray-700`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">タイトル</label>
                  <input
                    aria-label="Input field"
                    id="input-1754995293939-254"
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      settings.darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="ノートのタイトル"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">内容</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className={`h-32 w-full rounded-lg border px-3 py-2 ${
                      settings.darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="ノートの内容"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">タグ（カンマ区切り）</label>
                  <input
                    aria-label="Input field"
                    id="input-1754995293939-279"
                    type="text"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 ${
                      settings.darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="例: ITTO, 統合管理, 重要"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newNote.isPublic}
                    onChange={(e) => setNewNote({ ...newNote, isPublic: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm">
                    他のユーザーに公開する
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
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
                  onClick={handleCreateNote}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ノート詳細モーダル */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div
            className={`max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg ${
              settings.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 text-2xl font-semibold">{selectedNote.title}</h3>
                  <div
                    className={`flex items-center gap-4 text-sm ${
                      settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedNote.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedNote.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className={`rounded-lg p-2 hover:bg-gray-200 dark:hover:bg-gray-700`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* タグ */}
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full px-3 py-1 text-sm ${
                      settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 内容 */}
              <div
                className={`mb-6 whitespace-pre-wrap ${
                  settings.darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                {selectedNote.content}
              </div>

              {/* アクション */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikeNote(selectedNote.id)}
                    className="flex items-center gap-2 rounded-lg px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Heart
                      className={`h-4 w-4 ${selectedNote.likes > 0 ? 'fill-current text-red-500' : ''}`}
                    />
                    <span>{selectedNote.likes}</span>
                  </button>
                  <button
                    onClick={() => handleShareNote(selectedNote)}
                    className="flex items-center gap-2 rounded-lg px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Share2 className="h-4 w-4" />
                    共有
                  </button>
                </div>

                {selectedNote.author === currentUser && (
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="flex items-center gap-2 rounded-lg px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    削除
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ノートがない場合 */}
      {notes.length === 0 && (
        <div className="py-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            まだ共有ノートがありません
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 text-blue-600 hover:underline"
          >
            最初のノートを作成する
          </button>
        </div>
      )}
    </div>
  )
}

export default SharedNotes
