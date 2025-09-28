import {
  glossaryTerms,
  glossaryCategories,
  type GlossaryTerm,
  type GlossaryCategory,
  type TermIndex,
} from '../data/schemas/glossary/pmpGlossary'

/**
 * 用語集データの統合管理サービス
 * すべてのコンポーネントから共通で使用される用語集データへのアクセスを提供
 */
class GlossaryService {
  private readonly terms: readonly GlossaryTerm[]
  private readonly categories: readonly GlossaryCategory[]
  private termIndex: TermIndex

  constructor() {
    this.terms = glossaryTerms
    this.categories = glossaryCategories
    this.termIndex = this.buildTermIndex()
  }

  /**
   * 用語のインデックスを構築
   * 日本語名と英語名の両方でアクセス可能
   */
  private buildTermIndex(): TermIndex {
    const index: TermIndex = {}
    this.terms.forEach((term) => {
      // 英語名でインデックス
      index[term.term.toLowerCase()] = term
      // 日本語名でインデックス
      if (term.japanese) {
        index[term.japanese] = term
      }
    })
    return index
  }

  /**
   * IDで用語を取得
   */
  getTermById(id: number): GlossaryTerm | undefined {
    return this.terms.find((term) => term.id === id)
  }

  /**
   * 名前（日本語または英語）で用語を取得
   */
  getTermByName(name: string): GlossaryTerm | undefined {
    return this.termIndex[name] || this.termIndex[name.toLowerCase()]
  }

  /**
   * カテゴリーIDでカテゴリー情報を取得
   */
  getCategoryById(categoryId: string): GlossaryCategory | undefined {
    return this.categories.find((cat) => cat.id === categoryId)
  }

  /**
   * 用語の検索
   */
  searchTerms(query: string): GlossaryTerm[] {
    if (!query || query.trim() === '') {
      return []
    }

    const lowerQuery = query.toLowerCase()
    return this.terms.filter((term) => {
      const searchText = `${term.term} ${term.japanese} ${term.description}`.toLowerCase()
      return searchText.includes(lowerQuery)
    })
  }

  /**
   * カテゴリーでフィルタリング
   */
  filterByCategories(categoryIds: string[]): GlossaryTerm[] {
    if (!categoryIds || categoryIds.length === 0) {
      return [...this.terms]
    }
    return this.terms.filter((term) => term.categories.some((cat) => categoryIds.includes(cat)))
  }

  /**
   * 関連用語を取得
   */
  getRelatedTerms(termId: number): GlossaryTerm[] {
    const term = this.getTermById(termId)
    if (!term || !term.relatedTerms) {
      return []
    }
    return term.relatedTerms
      .map((relatedName) => this.getTermByName(relatedName))
      .filter((t): t is GlossaryTerm => t !== undefined)
  }

  /**
   * すべての用語を取得
   */
  getAllTerms(): readonly GlossaryTerm[] {
    return this.terms
  }

  /**
   * すべてのカテゴリーを取得
   */
  getAllCategories(): readonly GlossaryCategory[] {
    return this.categories
  }

  /**
   * 新しい用語を追加（将来の拡張用）
   * Note: 実際のアプリケーションでは、データの永続化が必要
   */
  addTerm(term: Omit<GlossaryTerm, 'id'>): GlossaryTerm {
    const maxId = Math.max(...this.terms.map((t) => t.id), 0)
    const newTerm: GlossaryTerm = {
      ...term,
      id: maxId + 1,
    }

    // Note: readonly配列なので実際には変更できない
    // 実際のアプリケーションではストアやデータベースで管理する必要がある
    ;(this.terms as GlossaryTerm[]).push(newTerm)
    this.termIndex = this.buildTermIndex()
    return newTerm
  }

  /**
   * 用語を更新（将来の拡張用）
   * Note: 実際のアプリケーションでは、データの永続化が必要
   */
  updateTerm(id: number, updates: Partial<Omit<GlossaryTerm, 'id'>>): GlossaryTerm | null {
    const index = this.terms.findIndex((term) => term.id === id)
    if (index !== -1) {
      const updatedTerm = { ...this.terms[index], ...updates }
      // Note: readonly配列なので実際には変更できない
      // 実際のアプリケーションではストアやデータベースで管理する必要がある
      ;(this.terms as GlossaryTerm[])[index] = updatedTerm
      this.termIndex = this.buildTermIndex()
      return updatedTerm
    }
    return null
  }
}

// シングルトンインスタンスをエクスポート
export const glossaryService = new GlossaryService()

// 便利な関数もエクスポート
export const getTermById = (id: number): GlossaryTerm | undefined => glossaryService.getTermById(id)

export const getTermByName = (name: string): GlossaryTerm | undefined =>
  glossaryService.getTermByName(name)

export const searchTerms = (query: string): GlossaryTerm[] => glossaryService.searchTerms(query)

export const getAllTerms = (): readonly GlossaryTerm[] => glossaryService.getAllTerms()

export const getAllCategories = (): readonly GlossaryCategory[] =>
  glossaryService.getAllCategories()

// 型をエクスポート
export type { GlossaryTerm, GlossaryCategory, TermIndex }
