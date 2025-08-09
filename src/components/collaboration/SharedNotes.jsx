import React, { useState, useEffect } from 'react';
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
  Edit,
  Trash2,
  X
} from 'lucide-react';
import collaborationService from '../../services/collaborationService';
import { useTheme } from '../../contexts/ThemeContext';

const SharedNotes = ({ processId = null, knowledgeArea = null }) => {
  const { settings } = useTheme();
  const [notes, setNotes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [filterTag, setFilterTag] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  
  // 新規ノートのフォーム状態
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: '',
    isPublic: true
  });

  // ノートの読み込み
  useEffect(() => {
    loadNotes();
    // ユーザー名の読み込み（簡易実装）
    const savedUser = localStorage.getItem('username') || 'Anonymous';
    setCurrentUser(savedUser);
  }, [processId, knowledgeArea, filterTag]);

  const loadNotes = () => {
    const filters = {
      processId,
      knowledgeArea,
      tags: filterTag ? [filterTag] : []
    };
    const loadedNotes = collaborationService.getNotes(filters);
    setNotes(loadedNotes);
  };

  // ノートの作成
  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('タイトルと内容を入力してください');
      return;
    }

    const tags = newNote.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const createdNote = collaborationService.createNote({
      ...newNote,
      tags,
      processId,
      knowledgeArea,
      author: currentUser
    });

    setNotes([createdNote, ...notes]);
    setNewNote({ title: '', content: '', tags: '', isPublic: true });
    setShowCreateForm(false);
  };

  // ノートのいいね
  const handleLikeNote = (noteId) => {
    collaborationService.likeNote(noteId);
    loadNotes();
  };

  // ノートの削除
  const handleDeleteNote = (noteId) => {
    if (confirm('このノートを削除しますか？')) {
      collaborationService.deleteNote(noteId);
      loadNotes();
      setSelectedNote(null);
    }
  };

  // 共有リンクの生成
  const handleShareNote = (note) => {
    const shareLink = collaborationService.generateShareLink({
      type: 'note',
      content: note
    });
    
    // クリップボードにコピー
    navigator.clipboard.writeText(shareLink).then(() => {
      alert('共有リンクをクリップボードにコピーしました！');
    });
  };

  // タグの取得
  const getAllTags = () => {
    const allTags = new Set();
    notes.forEach(note => {
      note.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  };

  return (
    <div className={`p-4 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          共有ノート
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規ノート
        </button>
      </div>

      {/* タグフィルター */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTag('')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !filterTag 
                ? 'bg-blue-600 text-white' 
                : settings.darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            すべて
          </button>
          {getAllTags().map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filterTag === tag 
                  ? 'bg-blue-600 text-white' 
                  : settings.darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <Tag className="w-3 h-3 inline mr-1" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ノート一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <div
            key={note.id}
            className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
              settings.darkMode 
                ? 'bg-gray-800 hover:bg-gray-700' 
                : 'bg-white hover:shadow-md'
            }`}
            onClick={() => setSelectedNote(note)}
          >
            <h3 className="font-semibold mb-2">{note.title}</h3>
            <p className={`text-sm mb-3 line-clamp-3 ${
              settings.darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {note.content}
            </p>
            
            {/* タグ */}
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.map(tag => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-1 rounded-full ${
                    settings.darkMode 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* メタ情報 */}
            <div className={`flex items-center justify-between text-xs ${
              settings.darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {note.author}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {note.views}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeNote(note.id);
                  }}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-3 h-3 ${note.likes > 0 ? 'fill-current' : ''}`} />
                  {note.likes}
                </button>
                <MessageSquare className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ノート作成フォーム */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-2xl rounded-lg ${
            settings.darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">新規ノート作成</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">タイトル</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      settings.darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="ノートのタイトル"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">内容</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border h-32 ${
                      settings.darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="ノートの内容"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">タグ（カンマ区切り）</label>
                  <input
                    type="text"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      settings.darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
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

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    settings.darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-3xl rounded-lg max-h-[90vh] overflow-y-auto ${
            settings.darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2">{selectedNote.title}</h3>
                  <div className={`flex items-center gap-4 text-sm ${
                    settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedNote.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedNote.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* タグ */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedNote.tags.map(tag => (
                  <span
                    key={tag}
                    className={`text-sm px-3 py-1 rounded-full ${
                      settings.darkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 内容 */}
              <div className={`mb-6 whitespace-pre-wrap ${
                settings.darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {selectedNote.content}
              </div>

              {/* アクション */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikeNote(selectedNote.id)}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Heart className={`w-4 h-4 ${selectedNote.likes > 0 ? 'fill-current text-red-500' : ''}`} />
                    <span>{selectedNote.likes}</span>
                  </button>
                  <button
                    onClick={() => handleShareNote(selectedNote)}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Share2 className="w-4 h-4" />
                    共有
                  </button>
                </div>
                
                {selectedNote.author === currentUser && (
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="flex items-center gap-2 px-3 py-1 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
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
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
  );
};

export default SharedNotes;