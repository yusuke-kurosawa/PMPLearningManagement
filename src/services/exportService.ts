import { logger } from './logger'

// データエクスポートサービス
class ExportService {
  constructor() {
    this.version = '1.0.0'
  }

  // 全データを収集
  collectAllData() {
    const data = {
      version: this.version,
      exportDate: new Date().toISOString(),
      metadata: {
        appVersion: '1.0.0',
        browser: navigator.userAgent,
        language: navigator.language,
      },
      data: {},
    }

    // 学習進捗データ
    try {
      const progressData = localStorage.getItem('learningProgress')
      if (progressData) {
        data.data.progress = JSON.parse(progressData)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('進捗データの収集エラー:', error)
      }
    }

    // カスタマイズ設定
    try {
      const themeSettings = localStorage.getItem('themeSettings')
      if (themeSettings) {
        data.data.settings = JSON.parse(themeSettings)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('設定データの収集エラー:', error)
      }
    }

    // コラボレーションデータ
    try {
      const sharedNotes = localStorage.getItem('sharedNotes')
      const comments = localStorage.getItem('comments')
      const studyGroups = localStorage.getItem('studyGroups')

      data.data.collaboration = {
        notes: sharedNotes ? JSON.parse(sharedNotes) : [],
        comments: comments ? JSON.parse(comments) : [],
        groups: studyGroups ? JSON.parse(studyGroups) : [],
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('コラボレーションデータの収集エラー:', error)
      }
    }

    // 検索履歴
    try {
      const searchHistory = localStorage.getItem('searchHistory')
      if (searchHistory) {
        data.data.searchHistory = JSON.parse(searchHistory)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('検索履歴の収集エラー:', error)
      }
    }

    // ユーザー情報
    const username = localStorage.getItem('username')
    if (username) {
      data.data.user = { username }
    }

    return data
  }

  // JSON形式でエクスポート
  exportAsJSON(data = null) {
    const exportData = data || this.collectAllData()
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const filename: string = `pmp-learning-backup-${this.getDateString()}.json`

    this.downloadFile(blob, filename)
    return { success: true, filename }
  }

  // CSV形式で進捗データをエクスポート
  exportProgressAsCSV() {
    const progressData = this.getProgressData()
    if (!progressData) {
      return { success: false, error: '進捗データが見つかりません' }
    }

    // CSVヘッダー
    const headers = [
      'プロセスID',
      'プロセス名',
      '知識エリア',
      'プロセス群',
      '完了状態',
      '理解度',
      '最終学習日',
      '学習回数',
    ]

    // CSVデータの生成
    const rows = [headers]

    Object.entries(progressData.processes || {}).forEach(([processId, data]) => {
      rows.push([
        processId,
        data.name || '',
        data.knowledgeArea || '',
        data.processGroup || '',
        data.completed ? '完了' : '未完了',
        data.understanding || 0,
        data.lastStudied || '',
        data.studyCount || 0,
      ])
    })

    // CSVテキストの生成（UTF-8 BOM付き）
    const BOM: string = '\uFEFF'
    const csvContent =
      BOM +
      rows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const filename: string = `pmp-progress-${this.getDateString()}.csv`

    this.downloadFile(blob, filename)
    return { success: true, filename }
  }

  // 学習レポートのエクスポート（簡易テキスト形式）
  exportLearningReport() {
    const data = this.collectAllData()
    const progress = data.data.progress || {}

    let report = '=== PMP学習レポート ===\n\n'
    report += `生成日時: ${new Date().toLocaleString('ja-JP')}\n`
    report += `ユーザー: ${data.data.user?.username || '未設定'}\n\n`

    // 全体の進捗
    const totalProcesses: number = 49
    const completedCount = Object.values(progress.processes || {}).filter((p) => p.completed).length
    const completionRate = Math.round((completedCount / totalProcesses) * 100)

    report += '【全体進捗】\n'
    report += `完了プロセス: ${completedCount}/${totalProcesses} (${completionRate}%)\n\n`

    // 知識エリア別進捗
    report += '【知識エリア別進捗】\n'
    const knowledgeAreas = this.getKnowledgeAreaStats(progress)
    Object.entries(knowledgeAreas).forEach(([area, stats]) => {
      report += `${area}: ${stats.completed}/${stats.total} (${stats.percentage}%)\n`
    })
    report += '\n'

    // プロセス群別進捗
    report += '【プロセス群別進捗】\n'
    const processGroups = this.getProcessGroupStats(progress)
    Object.entries(processGroups).forEach(([group, stats]) => {
      report += `${group}: ${stats.completed}/${stats.total} (${stats.percentage}%)\n`
    })
    report += '\n'

    // 最近の学習活動
    report += '【最近の学習活動】\n'
    const recentActivities = this.getRecentActivities(progress)
    recentActivities.forEach((activity) => {
      report += `- ${activity.date}: ${activity.process} (${activity.action})\n`
    })

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const filename: string = `pmp-learning-report-${this.getDateString()}.txt`

    this.downloadFile(blob, filename)
    return { success: true, filename }
  }

  // 選択的エクスポート
  exportSelected(options = {}) {
    const data = {
      version: this.version,
      exportDate: new Date().toISOString(),
      data: {},
    }

    if (options.progress) {
      const progressData = localStorage.getItem('learningProgress')
      if (progressData) {
        data.data.progress = JSON.parse(progressData)
      }
    }

    if (options.settings) {
      const themeSettings = localStorage.getItem('themeSettings')
      if (themeSettings) {
        data.data.settings = JSON.parse(themeSettings)
      }
    }

    if (options.collaboration) {
      const sharedNotes = localStorage.getItem('sharedNotes')
      const comments = localStorage.getItem('comments')
      const studyGroups = localStorage.getItem('studyGroups')

      data.data.collaboration = {
        notes: sharedNotes ? JSON.parse(sharedNotes) : [],
        comments: comments ? JSON.parse(comments) : [],
        groups: studyGroups ? JSON.parse(studyGroups) : [],
      }
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const filename: string = `pmp-partial-backup-${this.getDateString()}.json`

    this.downloadFile(blob, filename)
    return { success: true, filename }
  }

  // ヘルパーメソッド
  getProgressData() {
    try {
      const data = localStorage.getItem('learningProgress')
      return data ? JSON.parse(data) : null
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('進捗データの取得エラー:', error)
      }
      return null
    }
  }

  getKnowledgeAreaStats(progress) {
    const areas = {
      統合管理: { total: 7, completed: 0 },
      スコープ管理: { total: 6, completed: 0 },
      スケジュール管理: { total: 6, completed: 0 },
      コスト管理: { total: 4, completed: 0 },
      品質管理: { total: 3, completed: 0 },
      資源管理: { total: 6, completed: 0 },
      コミュニケーション管理: { total: 3, completed: 0 },
      リスク管理: { total: 7, completed: 0 },
      調達管理: { total: 3, completed: 0 },
      ステークホルダー管理: { total: 4, completed: 0 },
    }

    Object.values(progress.processes || {}).forEach((process) => {
      if (process.knowledgeArea && areas[process.knowledgeArea]) {
        if (process.completed) {
          areas[process.knowledgeArea].completed++
        }
      }
    })

    // パーセンテージを計算
    Object.keys(areas).forEach((area) => {
      areas[area].percentage = Math.round((areas[area].completed / areas[area].total) * 100)
    })

    return areas
  }

  getProcessGroupStats(progress) {
    const groups = {
      立上げ: { total: 2, completed: 0 },
      計画: { total: 24, completed: 0 },
      実行: { total: 10, completed: 0 },
      '監視・コントロール': { total: 12, completed: 0 },
      終結: { total: 1, completed: 0 },
    }

    Object.values(progress.processes || {}).forEach((process) => {
      if (process.processGroup && groups[process.processGroup]) {
        if (process.completed) {
          groups[process.processGroup].completed++
        }
      }
    })

    // パーセンテージを計算
    Object.keys(groups).forEach((group) => {
      groups[group].percentage = Math.round((groups[group].completed / groups[group].total) * 100)
    })

    return groups
  }

  getRecentActivities(progress, limit = 10) {
    const activities = []

    Object.entries(progress.processes || {}).forEach(([processId, data]) => {
      if (data.lastStudied) {
        activities.push({
          date: new Date(data.lastStudied).toLocaleDateString('ja-JP'),
          process: data.name || processId,
          action: data.completed ? '完了' : '学習中',
        })
      }
    })

    // 日付でソート（新しい順）
    activities.sort((a, b) => new Date(b.date) - new Date(a.date))

    return activities.slice(0, limit)
  }

  getDateString() {
    const now = new Date()
    return now.toISOString().replace(/[:.]/g, '-').substring(0, 19)
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// シングルトンインスタンス
const exportService = new ExportService()

export default exportService
