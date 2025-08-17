import { glossaryTerms } from '../data/schemas/glossary/pmpGlossary'
import { logger } from './logger'

// Fuse.jsのような検索ライブラリを使わず、カスタム実装
class SearchService {
  constructor() {
    this.searchIndex = []
    this.searchHistory = []
    this.buildIndex()
  }

  // 検索インデックスの構築
  buildIndex() {
    // プロセスデータのインデックス化
    const processes = getAllProcesses()
    processes.forEach((process) => {
      this.searchIndex.push({
        id: `process-${process.id}`,
        type: 'process',
        title: process.name,
        content: process.description || '',
        metadata: {
          knowledgeArea: process.knowledgeArea,
          processGroup: process.processGroup,
          itto: process.itto,
        },
        url: `/matrix#${process.id}`,
      })

      // ITTOもインデックスに追加
      if (process.itto) {
        // インプット
        process.itto.inputs?.forEach((input) => {
          this.searchIndex.push({
            id: `input-${process.id}-${input}`,
            type: 'itto',
            subtype: 'input',
            title: input,
            content: `${process.name}のインプット`,
            parentProcess: process.name,
            url: `/matrix#${process.id}`,
          })
        })

        // ツールと技法
        process.itto.tools?.forEach((tool) => {
          this.searchIndex.push({
            id: `tool-${process.id}-${tool}`,
            type: 'itto',
            subtype: 'tool',
            title: tool,
            content: `${process.name}のツールと技法`,
            parentProcess: process.name,
            url: `/matrix#${process.id}`,
          })
        })

        // アウトプット
        process.itto.outputs?.forEach((output) => {
          this.searchIndex.push({
            id: `output-${process.id}-${output}`,
            type: 'itto',
            subtype: 'output',
            title: output,
            content: `${process.name}のアウトプット`,
            parentProcess: process.name,
            url: `/matrix#${process.id}`,
          })
        })
      }
    })

    // 用語集データのインデックス化
    glossaryTerms.forEach((term) => {
      this.searchIndex.push({
        id: `glossary-${term.id}`,
        type: 'glossary',
        title: term.term,
        content: term.definition,
        metadata: {
          category: term.category,
          relatedTerms: term.relatedTerms,
        },
        url: `/glossary#${term.id}`,
      })
    })

    // 学習機能のインデックス化
    const learningFeatures = [
      {
        id: 'flashcards',
        title: 'フラッシュカード学習',
        content:
          'ITTOを効率的に暗記する3Dアニメーション付きフラッシュカード。間隔反復学習アルゴリズムで記憶の定着をサポート。',
        url: '/flashcards',
      },
      {
        id: 'mock-exam',
        title: 'PMP模擬試験',
        content:
          '実際の試験形式で練習。180問・230分のフル模擬試験で、詳細な結果分析と弱点把握が可能。',
        url: '/mock-exam',
      },
      {
        id: 'progress',
        title: '学習進捗ダッシュボード',
        content: '知識エリア別・プロセス群別の習熟度管理と統計表示。効率的な学習計画をサポート。',
        url: '/progress',
      },
      {
        id: 'visualizations',
        title: 'ビジュアライゼーションハブ',
        content:
          'サンキーダイアグラム、マインドマップ、ヒートマップなど8種類の高度な視覚化オプション。',
        url: '/visualizations',
      },
    ]

    learningFeatures.forEach((feature) => {
      this.searchIndex.push({
        id: `feature-${feature.id}`,
        type: 'feature',
        title: feature.title,
        content: feature.content,
        url: feature.url,
      })
    })
  }

  // ファジー検索の実装
  fuzzyMatch(str1, str2, threshold = 0.7) {
    str1 = str1.toLowerCase()
    str2 = str2.toLowerCase()

    // 完全一致
    if (str1 === str2) {return 1}

    // 部分一致
    if (str2.includes(str1) || str1.includes(str2)) {return 0.9}

    // レーベンシュタイン距離による類似度計算
    const distance = this.levenshteinDistance(str1, str2)
    const maxLength = Math.max(str1.length, str2.length)
    const similarity = 1 - distance / maxLength

    return similarity >= threshold ? similarity : 0
  }

  // レーベンシュタイン距離の計算
  levenshteinDistance(str1, str2) {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  // 検索実行
  search(query, options = {}) {
    const { types = ['process', 'itto', 'glossary', 'feature'], fuzzy = true, limit = 20 } = options

    if (!query || query.trim().length === 0) {
      return []
    }

    const normalizedQuery = query.toLowerCase().trim()
    const results = []

    this.searchIndex.forEach((item) => {
      if (!types.includes(item.type)) {return}

      let score = 0

      // タイトルマッチング
      if (fuzzy) {
        score = Math.max(score, this.fuzzyMatch(normalizedQuery, item.title) * 2)
      } else if (item.title.toLowerCase().includes(normalizedQuery)) {
        score = 2
      }

      // コンテンツマッチング
      if (item.content) {
        if (fuzzy) {
          const contentWords = item.content.split(/\s+/)
          contentWords.forEach((word) => {
            score = Math.max(score, this.fuzzyMatch(normalizedQuery, word) * 0.5)
          })
        } else if (item.content.toLowerCase().includes(normalizedQuery)) {
          score = Math.max(score, 1)
        }
      }

      // メタデータマッチング
      if (item.metadata) {
        Object.values(item.metadata).forEach((value) => {
          if (typeof value === 'string' && value.toLowerCase().includes(normalizedQuery)) {
            score = Math.max(score, 0.8)
          }
        })
      }

      if (score > 0) {
        results.push({ ...item, score })
      }
    })

    // スコアでソート
    results.sort((a, b) => b.score - a.score)

    // 検索履歴に追加
    this.addToHistory(query)

    return results.slice(0, limit)
  }

  // 検索候補の取得（オートコンプリート用）
  getSuggestions(query, limit = 5) {
    if (!query || query.trim().length < 2) {
      return []
    }

    const normalizedQuery = query.toLowerCase().trim()
    const suggestions = new Set()

    // タイトルから候補を抽出
    this.searchIndex.forEach((item) => {
      if (item.title.toLowerCase().startsWith(normalizedQuery)) {
        suggestions.add(item.title)
      }
    })

    // 検索履歴から候補を抽出
    this.searchHistory.forEach((historyItem) => {
      if (historyItem.toLowerCase().startsWith(normalizedQuery)) {
        suggestions.add(historyItem)
      }
    })

    return Array.from(suggestions).slice(0, limit)
  }

  // 検索履歴の管理
  addToHistory(query) {
    if (!query || query.trim().length === 0) {return}

    // 重複を削除
    this.searchHistory = this.searchHistory.filter((item) => item !== query)

    // 先頭に追加
    this.searchHistory.unshift(query)

    // 最大10件まで保持
    if (this.searchHistory.length > 10) {
      this.searchHistory = this.searchHistory.slice(0, 10)
    }

    // LocalStorageに保存
    try {
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('検索履歴の保存エラー:', error)
      }
    }
  }

  // 検索履歴の読み込み
  loadHistory() {
    try {
      const saved = localStorage.getItem('searchHistory')
      if (saved) {
        this.searchHistory = JSON.parse(saved)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('検索履歴の読み込みエラー:', error)
      }
      this.searchHistory = []
    }
  }

  // 検索履歴のクリア
  clearHistory() {
    this.searchHistory = []
    try {
      localStorage.removeItem('searchHistory')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('検索履歴のクリアエラー:', error)
      }
    }
  }

  // 人気の検索キーワード（ダミーデータ）
  getPopularSearches() {
    return [
      'プロジェクト憲章',
      'WBS',
      'リスク管理',
      'ステークホルダー',
      'スコープ',
      'ITTO',
      '変更管理',
      'コミュニケーション',
    ]
  }
}

// シングルトンインスタンス
const searchService = new SearchService()
searchService.loadHistory()

export default searchService

// プロセスデータを取得する関数（実際のデータ構造に合わせて調整が必要）
function getAllProcesses() {
  // ダミーデータ - 実際のプロセスデータに置き換える
  return [
    {
      id: 'p1',
      name: 'プロジェクト憲章の作成',
      knowledgeArea: '統合',
      processGroup: '立ち上げ',
      description:
        'プロジェクトを正式に承認し、プロジェクト・マネジャーに権限を付与する文書を作成するプロセス',
      itto: {
        inputs: ['ビジネス文書', '合意書'],
        tools: ['専門家の判断', 'データ収集'],
        outputs: ['プロジェクト憲章', '前提条件ログ'],
      },
    },
    // 他のプロセスデータ...
  ]
}
