var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { g as glossaryTerms, e as glossaryCategories } from "./index-CZZZnLRW.js";
var __defProp2 = Object.defineProperty;
var __defNormalProp = /* @__PURE__ */ __name((obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value, "__defNormalProp");
var __publicField = /* @__PURE__ */ __name((obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value), "__publicField");
const _GlossaryService = class _GlossaryService {
  constructor() {
    __publicField(this, "terms");
    __publicField(this, "categories");
    __publicField(this, "termIndex");
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
    this.terms.forEach((term) => {
      index[term.term.toLowerCase()] = term;
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
    return this.terms.find((term) => term.id === id);
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
    return this.categories.find((cat) => cat.id === categoryId);
  }
  /**
   * 用語の検索
   */
  searchTerms(query) {
    if (!query || query.trim() === "") {
      return [];
    }
    const lowerQuery = query.toLowerCase();
    return this.terms.filter((term) => {
      const searchText = `${term.term} ${term.japanese} ${term.description}`.toLowerCase();
      return searchText.includes(lowerQuery);
    });
  }
  /**
   * カテゴリーでフィルタリング
   */
  filterByCategories(categoryIds) {
    if (!categoryIds || categoryIds.length === 0) {
      return [...this.terms];
    }
    return this.terms.filter((term) => term.categories.some((cat) => categoryIds.includes(cat)));
  }
  /**
   * 関連用語を取得
   */
  getRelatedTerms(termId) {
    const term = this.getTermById(termId);
    if (!term || !term.relatedTerms) {
      return [];
    }
    return term.relatedTerms.map((relatedName) => this.getTermByName(relatedName)).filter((t) => t !== void 0);
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
   * Note: 実際のアプリケーションでは、データの永続化が必要
   */
  addTerm(term) {
    const maxId = Math.max(...this.terms.map((t) => t.id), 0);
    const newTerm = {
      ...term,
      id: maxId + 1
    };
    this.terms.push(newTerm);
    this.termIndex = this.buildTermIndex();
    return newTerm;
  }
  /**
   * 用語を更新（将来の拡張用）
   * Note: 実際のアプリケーションでは、データの永続化が必要
   */
  updateTerm(id, updates) {
    const index = this.terms.findIndex((term) => term.id === id);
    if (index !== -1) {
      const updatedTerm = { ...this.terms[index], ...updates };
      this.terms[index] = updatedTerm;
      this.termIndex = this.buildTermIndex();
      return updatedTerm;
    }
    return null;
  }
};
__name(_GlossaryService, "GlossaryService");
let GlossaryService = _GlossaryService;
const glossaryService = new GlossaryService();
export {
  glossaryService as g
};
