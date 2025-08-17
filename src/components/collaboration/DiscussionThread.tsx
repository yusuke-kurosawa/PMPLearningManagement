import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Heart,
  Reply,
  User,
  // _Calendar, // TODO: Implement calendar features
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import collaborationService from '../../services/collaborationService'
import { useTheme } from '../../contexts/ThemeContext'

const DiscussionThread = ({ targetId, targetType, title = 'ディスカッション' }) => {
  const { settings } = useTheme()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [newReply, setNewReply] = useState('')
  const [expandedComments, setExpandedComments] = useState(new Set())
  const [currentUser, setCurrentUser] = useState('')

  useEffect(() => {
    loadComments()
    // ユーザー名の読み込み
    const savedUser = localStorage.getItem('username') || 'Anonymous'
    setCurrentUser(savedUser)
  }, [targetId, targetType])

  const loadComments = () => {
    const loadedComments = collaborationService.getComments(targetId, targetType)
    setComments(loadedComments)
  }

  // コメントの投稿
  const handlePostComment = () => {
    if (!newComment.trim()) {
      return
    }

    collaborationService.addComment({
      targetId,
      targetType,
      content: newComment,
      author: currentUser,
    })

    setNewComment('')
    loadComments()
  }

  // 返信の投稿
  const handlePostReply = (commentId) => {
    if (!newReply.trim()) {
      return
    }

    collaborationService.addReply(commentId, {
      content: newReply,
      author: currentUser,
    })

    setNewReply('')
    setReplyTo(null)
    loadComments()
  }

  // いいねの追加
  const handleLikeComment = (commentId) => {
    collaborationService.likeComment(commentId)
    loadComments()
  }

  // コメントの展開/折りたたみ
  const toggleCommentExpansion = (commentId) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  // 日時のフォーマット
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `${minutes}分前`
      }
      return `${hours}時間前`
    } else if (days < 7) {
      return `${days}日前`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className={`rounded-lg p-4 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
        <MessageSquare className='h-5 w-5' />
        {title}
        <span
          className={`text-sm font-normal ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          ({comments.length}件)
        </span>
      </h3>

      {/* コメント入力欄 */}
      <div className='mb-6'>
        <div className='flex gap-2'>
          <input
            aria-label='Input field'
            id='input-1754995293935-117'
            type='text'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
            placeholder='コメントを入力...'
            className={`flex-1 rounded-lg border px-3 py-2 ${
              settings.darkMode
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white'
            }`}
          />
          <button
            onClick={handlePostComment}
            disabled={!newComment.trim()}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
              newComment.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : settings.darkMode
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send className='h-4 w-4' />
            投稿
          </button>
        </div>
      </div>

      {/* コメント一覧 */}
      <div className='space-y-4'>
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`rounded-lg border p-4 ${
              settings.darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            {/* コメントヘッダー */}
            <div className='mb-2 flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  <User className='h-4 w-4' />
                </div>
                <div>
                  <div className='font-medium'>{comment.author}</div>
                  <div
                    className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center gap-1 rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  comment.likes > 0 ? 'text-red-500' : ''
                }`}
              >
                <Heart className={`h-3 w-3 ${comment.likes > 0 ? 'fill-current' : ''}`} />
                {comment.likes > 0 && comment.likes}
              </button>
            </div>

            {/* コメント本文 */}
            <p className={`mb-3 ${settings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {comment.content}
            </p>

            {/* 返信ボタン */}
            <div className='flex items-center gap-4'>
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className={`flex items-center gap-1 text-sm hover:text-blue-600 ${
                  settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Reply className='h-3 w-3' />
                返信
              </button>

              {comment.replies.length > 0 && (
                <button
                  onClick={() => toggleCommentExpansion(comment.id)}
                  className={`flex items-center gap-1 text-sm ${
                    settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {expandedComments.has(comment.id) ? (
                    <>
                      <ChevronUp className='h-3 w-3' />
                      返信を隠す ({comment.replies.length})
                    </>
                  ) : (
                    <>
                      <ChevronDown className='h-3 w-3' />
                      返信を表示 ({comment.replies.length})
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 返信入力欄 */}
            {replyTo === comment.id && (
              <div className='ml-11 mt-3'>
                <div className='flex gap-2'>
                  <input
                    aria-label='Input field'
                    id='input-1754995293936-228'
                    type='text'
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePostReply(comment.id)}
                    placeholder='返信を入力...'
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                      settings.darkMode
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                  <button
                    onClick={() => handlePostReply(comment.id)}
                    disabled={!newReply.trim()}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      newReply.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : settings.darkMode
                          ? 'bg-gray-700 text-gray-500'
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    送信
                  </button>
                </div>
              </div>
            )}

            {/* 返信一覧 */}
            {expandedComments.has(comment.id) && comment.replies.length > 0 && (
              <div className='ml-11 mt-3 space-y-3'>
                {comment.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`rounded-lg p-3 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className='mb-1 flex items-center gap-2'>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          settings.darkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <User className='h-3 w-3' />
                      </div>
                      <span className='text-sm font-medium'>{reply.author}</span>
                      <span
                        className={`text-xs ${
                          settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`ml-8 text-sm ${
                        settings.darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* コメントがない場合 */}
      {comments.length === 0 && (
        <div className='py-8 text-center'>
          <MessageSquare className='mx-auto mb-3 h-12 w-12 text-gray-400' />
          <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            まだコメントがありません
          </p>
          <p className={`mt-1 text-sm ${settings.darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            最初のコメントを投稿してディスカッションを始めましょう
          </p>
        </div>
      )}
    </div>
  )
}

export default DiscussionThread
