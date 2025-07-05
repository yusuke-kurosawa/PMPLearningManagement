import { glossaryTerms, glossaryCategories } from '../data/pmpGlossary';

/**
 * 用語集データの統合管理サービス
 * すべてのコンポーネントから共通で使用される用語集データへのアクセスを提供
 */
class GlossaryService {
  constructor() {
    this.terms = glossaryTerms;
    this.categories = glossaryCategories;
    this.termIndex = this.buildTermIndex();
  }

  /**
   * 用語のインデックスを構築
   * 日本語名と英語名の両方でアクセス可能
   */
  buildTermIndex() {
    const index = {};
    this.terms.forEach(term => {
      // 英語名でインデックス
      index[term.term.toLowerCase()] = term;
      // 日本語名でインデックス
      if (term.japanese) {
        index[term.japanese] = term;
      }
    });
    return index;
  }

  /**
   * IDで用語を取得
   */
  getTermById(id) {
    return this.terms.find(term => term.id === id);
  }

  /**
   * 名前（日本語または英語）で用語を取得
   */
  getTermByName(name) {
    return this.termIndex[name] || this.termIndex[name.toLowerCase()];
  }

  /**
   * カテゴリーIDでカテゴリー情報を取得
   */
  getCategoryById(categoryId) {
    return this.categories.find(cat => cat.id === categoryId);
  }

  /**
   * 用語の検索
   */
  searchTerms(query) {
    const lowerQuery = query.toLowerCase();
    return this.terms.filter(term => {
      const searchText = `${term.term} ${term.japanese} ${term.description}`.toLowerCase();
      return searchText.includes(lowerQuery);
    });
  }

  /**
   * カテゴリーでフィルタリング
   */
  filterByCategories(categoryIds) {
    if (!categoryIds || categoryIds.length === 0) {
      return this.terms;
    }
    return this.terms.filter(term => 
      term.categories.some(cat => categoryIds.includes(cat))
    );
  }

  /**
   * 関連用語を取得
   */
  getRelatedTerms(termId) {
    const term = this.getTermById(termId);
    if (!term || !term.relatedTerms) {
      return [];
    }
    return term.relatedTerms
      .map(relatedName => this.getTermByName(relatedName))
      .filter(t => t);
  }

  /**
   * すべての用語を取得
   */
  getAllTerms() {
    return this.terms;
  }

  /**
   * すべてのカテゴリーを取得
   */
  getAllCategories() {
    return this.categories;
  }

  /**
   * 新しい用語を追加（将来の拡張用）
   */
  addTerm(term) {
    const newTerm = {
      ...term,
      id: this.terms.length + 1
    };
    this.terms.push(newTerm);
    this.termIndex = this.buildTermIndex();
    return newTerm;
  }

  /**
   * 用語を更新（将来の拡張用）
   */
  updateTerm(id, updates) {
    const index = this.terms.findIndex(term => term.id === id);
    if (index !== -1) {
      this.terms[index] = { ...this.terms[index], ...updates };
      this.termIndex = this.buildTermIndex();
      return this.terms[index];
    }
    return null;
  }
}

// シングルトンインスタンスをエクスポート
export const glossaryService = new GlossaryService();

// 便利な関数もエクスポート
export const getTermById = (id) => glossaryService.getTermById(id);
export const getTermByName = (name) => glossaryService.getTermByName(name);
export const searchTerms = (query) => glossaryService.searchTerms(query);
export const getAllTerms = () => glossaryService.getAllTerms();
export const getAllCategories = () => glossaryService.getAllCategories();