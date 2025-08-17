import { logger } from './logger'

// コラボレーション機能のサービス
class CollaborationService {
  constructor() {
    this.notes = []
    this.comments = []
    this.studyGroups = []
    this.sharedLinks = new Map()
    this.loadData()
  }

  // データの読み込み
  loadData() {
    try {
      const savedNotes = localStorage.getItem('sharedNotes')
      const savedComments = localStorage.getItem('comments')
      const savedGroups = localStorage.getItem('studyGroups')

      if (savedNotes) {
        this.notes = JSON.parse(savedNotes)
      }
      if (savedComments) {
        this.comments = JSON.parse(savedComments)
      }
      if (savedGroups) {
        this.studyGroups = JSON.parse(savedGroups)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('コラボレーションデータの読み込みエラー:', error)
      }
    }
  }

  // データの保存
  saveData() {
    try {
      localStorage.setItem('sharedNotes', JSON.stringify(this.notes))
      localStorage.setItem('comments', JSON.stringify(this.comments))
      localStorage.setItem('studyGroups', JSON.stringify(this.studyGroups))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('コラボレーションデータの保存エラー:', error)
      }
    }
  }

  // === 学習ノート機能 ===

  // ノートの作成
  createNote(note) {
    const newNote = {
      id: this.generateId(),
      title: note.title,
      content: note.content,
      processId: note.processId || null,
      knowledgeArea: note.knowledgeArea || null,
      tags: note.tags || [],
      author: note.author || 'Anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: note.isPublic || false,
      likes: 0,
      views: 0,
    }

    this.notes.unshift(newNote)
    this.saveData()
    return newNote
  }

  // ノートの取得
  getNotes(filters = {}) {
    let filteredNotes = [...this.notes]

    if (filters.processId) {
      filteredNotes = filteredNotes.filter((n) => n.processId === filters.processId)
    }

    if (filters.knowledgeArea) {
      filteredNotes = filteredNotes.filter((n) => n.knowledgeArea === filters.knowledgeArea)
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredNotes = filteredNotes.filter((n) => filters.tags.some((tag) => n.tags.includes(tag)))
    }

    if (filters.author) {
      filteredNotes = filteredNotes.filter((n) => n.author === filters.author)
    }

    if (filters.isPublic !== undefined) {
      filteredNotes = filteredNotes.filter((n) => n.isPublic === filters.isPublic)
    }

    return filteredNotes
  }

  // ノートの更新
  updateNote(noteId, updates) {
    const index = this.notes.findIndex((n) => n.id === noteId)
    if (index !== -1) {
      this.notes[index] = {
        ...this.notes[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      this.saveData()
      return this.notes[index]
    }
    return null
  }

  // ノートの削除
  deleteNote(noteId) {
    this.notes = this.notes.filter((n) => n.id !== noteId)
    this.saveData()
  }

  // ノートのいいね
  likeNote(noteId) {
    const note = this.notes.find((n) => n.id === noteId)
    if (note) {
      note.likes++
      this.saveData()
      return note
    }
    return null
  }

  // === コメント・ディスカッション機能 ===

  // コメントの追加
  addComment(comment) {
    const newComment = {
      id: this.generateId(),
      targetId: comment.targetId, // ノートID、プロセスIDなど
      targetType: comment.targetType, // 'note', 'process', 'glossary'など
      content: comment.content,
      author: comment.author || 'Anonymous',
      createdAt: new Date().toISOString(),
      replies: [],
      likes: 0,
    }

    this.comments.push(newComment)
    this.saveData()
    return newComment
  }

  // コメントの取得
  getComments(targetId, targetType) {
    return this.comments.filter((c) => c.targetId === targetId && c.targetType === targetType)
  }

  // 返信の追加
  addReply(commentId, reply) {
    const comment = this.comments.find((c) => c.id === commentId)
    if (comment) {
      const newReply = {
        id: this.generateId(),
        content: reply.content,
        author: reply.author || 'Anonymous',
        createdAt: new Date().toISOString(),
        likes: 0,
      }
      comment.replies.push(newReply)
      this.saveData()
      return newReply
    }
    return null
  }

  // コメントのいいね
  likeComment(commentId) {
    const comment = this.comments.find((c) => c.id === commentId)
    if (comment) {
      comment.likes++
      this.saveData()
      return comment
    }
    return null
  }

  // === 学習グループ機能 ===

  // グループの作成
  createStudyGroup(group) {
    const newGroup = {
      id: this.generateId(),
      name: group.name,
      description: group.description,
      members: [group.creator || 'Anonymous'],
      creator: group.creator || 'Anonymous',
      createdAt: new Date().toISOString(),
      targetDate: group.targetDate || null,
      isPublic: group.isPublic || true,
      sharedProgress: {},
      announcements: [],
    }

    this.studyGroups.push(newGroup)
    this.saveData()
    return newGroup
  }

  // グループへの参加
  joinGroup(groupId, username) {
    const group = this.studyGroups.find((g) => g.id === groupId)
    if (group && !group.members.includes(username)) {
      group.members.push(username)
      this.saveData()
      return group
    }
    return null
  }

  // グループの取得
  getStudyGroups(filters = {}) {
    let filteredGroups = [...this.studyGroups]

    if (filters.member) {
      filteredGroups = filteredGroups.filter((g) => g.members.includes(filters.member))
    }

    if (filters.isPublic !== undefined) {
      filteredGroups = filteredGroups.filter((g) => g.isPublic === filters.isPublic)
    }

    return filteredGroups
  }

  // グループ内の進捗共有
  shareProgress(groupId, username, progress) {
    const group = this.studyGroups.find((g) => g.id === groupId)
    if (group) {
      if (!group.sharedProgress[username]) {
        group.sharedProgress[username] = {}
      }
      group.sharedProgress[username] = {
        ...progress,
        updatedAt: new Date().toISOString(),
      }
      this.saveData()
      return group
    }
    return null
  }

  // グループのお知らせ追加
  addAnnouncement(groupId, announcement) {
    const group = this.studyGroups.find((g) => g.id === groupId)
    if (group) {
      const newAnnouncement = {
        id: this.generateId(),
        content: announcement.content,
        author: announcement.author || 'Anonymous',
        createdAt: new Date().toISOString(),
      }
      group.announcements.unshift(newAnnouncement)
      this.saveData()
      return newAnnouncement
    }
    return null
  }

  // === 共有リンク機能 ===

  // 共有リンクの生成
  generateShareLink(data) {
    const shareId = this.generateShareId()
    const shareData = {
      id: shareId,
      type: data.type, // 'note', 'progress', 'group'など
      data: data.content,
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresIn ? new Date(Date.now() + data.expiresIn).toISOString() : null,
    }

    this.sharedLinks.set(shareId, shareData)

    // 擬似的な共有URL（実際のアプリではサーバーサイドで生成）
    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}#/share/${shareId}`
  }

  // 共有リンクからデータ取得
  getSharedData(shareId) {
    const shareData = this.sharedLinks.get(shareId)

    if (!shareData) {
      return null
    }

    // 有効期限チェック
    if (shareData.expiresAt && new Date() > new Date(shareData.expiresAt)) {
      this.sharedLinks.delete(shareId)
      return null
    }

    return shareData
  }

  // === 統計情報 ===

  // 人気のノート取得
  getPopularNotes(limit = 5) {
    return [...this.notes]
      .filter((n) => n.isPublic)
      .sort((a, b) => b.likes + b.views - (a.likes + a.views))
      .slice(0, limit)
  }

  // 最新のディスカッション取得
  getRecentDiscussions(limit = 10) {
    return [...this.comments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }

  // アクティブなグループ取得
  getActiveGroups(limit = 5) {
    return [...this.studyGroups]
      .filter((g) => g.isPublic)
      .sort((a, b) => b.members.length - a.members.length)
      .slice(0, limit)
  }

  // === ヘルパー関数 ===

  // ID生成
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 共有ID生成
  generateShareId() {
    return Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9)
  }

  // ユーザー名の検証
  validateUsername(username) {
    return username && username.trim().length >= 2 && username.trim().length <= 20
  }

  // タグの正規化
  normalizeTags(tags) {
    return tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .filter((tag, index, self) => self.indexOf(tag) === index)
  }
}

// シングルトンインスタンス
const collaborationService = new CollaborationService()

export default collaborationService
