import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, X, Tag, Book, ChevronRight } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { glossaryService } from '../../services/glossaryService'
import { useDebounce } from '../../hooks/useDebounce'

const PMPGlossary = React.memo(() => {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState(new Set())
  const [selectedTerm, setSelectedTerm] = useState(null)
  // //   const [viewMode, setViewMode] = useState('list') // list or card // TODO: Will be used in future // TODO: Will be used in future

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // リンクから遷移した場合、指定された用語を表示
  useEffect(() => {
    if (location.state?.selectedTermId) {
      const term = glossaryService.getTermById(location.state.selectedTermId)
      if (term) {
        setSelectedTerm(term)
        // 少し遅延を入れてスクロール
        setTimeout(() => {
          const element = document.getElementById(`term-${term.id}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      }
    }
  }, [location])

  // カテゴリーのトグル
  const toggleCategory = useCallback((categoryId) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }, [])

  // 全カテゴリーをクリア
  const clearAllCategories = useCallback(() => {
    setSelectedCategories(new Set())
  }, [])

  // フィルタリングされた用語
  const filteredTerms = useMemo(() => {
    let results = glossaryService.getAllTerms()

    // カテゴリーフィルター
    if (selectedCategories.size > 0) {
      results = glossaryService.filterByCategories(Array.from(selectedCategories))
    }

    // 検索フィルター
    if (debouncedSearchQuery) {
      results = glossaryService
        .searchTerms(debouncedSearchQuery)
        .filter(
          (term) =>
            selectedCategories.size === 0 ||
            term.categories.some((cat) => selectedCategories.has(cat))
        )
    }

    return results
  }, [debouncedSearchQuery, selectedCategories])

  // アルファベット順にグループ化
  const groupedTerms = useMemo(() => {
    const groups = {}
    filteredTerms.forEach((term) => {
      const firstLetter = term.term[0].toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(term)
    })

    // 各グループ内でソート
    Object.keys(groups).forEach((letter) => {
      groups[letter].sort((a, b) => a.term.localeCompare(b.term))
    })

    return groups
  }, [filteredTerms])

  // 関連用語を取得
  const getRelatedTerms = useCallback((relatedTermNames) => {
    return relatedTermNames
      .map((name) => glossaryService.getTermByName(name))
      .filter((term) => term)
  }, [])

  return (
    <div className="mx-auto max-w-7xl p-2 sm:p-4 md:p-6">
      <div className="rounded-lg bg-white shadow-lg">
        {/* ヘッダー */}
        <div className="border-b p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">PMP用語集</h1>

          {/* 検索バー */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="用語を検索..."
              className="w-full rounded-lg border px-4 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* カテゴリーフィルター */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">カテゴリー</h3>
              {selectedCategories.size > 0 && (
                <button
                  onClick={clearAllCategories}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  すべてクリア
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {glossaryService.getAllCategories().map((category) => {
                const isSelected = selectedCategories.has(category.id)
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? `${category.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 結果数 */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredTerms.length}件の用語が見つかりました
          </div>
        </div>

        {/* 用語リスト */}
        <div className="custom-scrollbar max-h-[600px] overflow-y-auto p-4 sm:p-6">
          {Object.keys(groupedTerms)
            .sort()
            .map((letter) => (
              <div key={letter} className="mb-6">
                <h2 className="sticky top-0 z-10 mb-3 bg-white py-2 text-lg font-bold text-gray-800">
                  {letter}
                </h2>
                <div className="space-y-3">
                  {groupedTerms[letter].map((term) => (
                    <div
                      key={term.id}
                      id={`term-${term.id}`}
                      className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                      onClick={() => setSelectedTerm(term)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {term.term}
                            <span className="ml-2 font-normal text-gray-600">
                              ({term.japanese})
                            </span>
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                            {term.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {term.categories.map((catId) => {
                              const category = glossaryService.getCategoryById(catId)
                              return category ? (
                                <span
                                  key={catId}
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${category.color} text-white`}
                                >
                                  {category.name}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                        <ChevronRight className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {filteredTerms.length === 0 && (
            <div className="py-12 text-center">
              <Book className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">該当する用語が見つかりませんでした</p>
            </div>
          )}
        </div>
      </div>

      {/* 用語詳細モーダル */}
      {selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedTerm.term}</h2>
                  <p className="text-lg text-gray-600">{selectedTerm.japanese}</p>
                </div>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-700">説明</h3>
                  <p className="text-gray-600">{selectedTerm.description}</p>
                </div>

                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-700">カテゴリー</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.categories.map((catId) => {
                      const category = glossaryService.getCategoryById(catId)
                      return category ? (
                        <span
                          key={catId}
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${category.color} text-white`}
                        >
                          <Tag className="mr-1 h-4 w-4" />
                          {category.name}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>

                {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-gray-700">関連用語</h3>
                    <div className="flex flex-wrap gap-2">
                      {getRelatedTerms(selectedTerm.relatedTerms).map((relatedTerm) => (
                        <button
                          key={relatedTerm.id}
                          onClick={() => setSelectedTerm(relatedTerm)}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 transition-colors hover:bg-blue-200"
                        >
                          {relatedTerm.term} ({relatedTerm.japanese})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

PMPGlossary.displayName = 'PMPGlossary'

export default PMPGlossary
