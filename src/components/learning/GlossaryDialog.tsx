import React from 'react'
import { X, Tag, ExternalLink } from 'lucide-react'
import { glossaryCategories } from '../../data/schemas/glossary/pmpGlossary'

const GlossaryDialog = ({ term, onClose, onNavigateToGlossary }) => {
  if (!term) {return null}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 border-b bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{term.term}</h2>
              <p className="text-lg text-gray-600">{term.japanese}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
              aria-label="閉じる"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">説明</h3>
            <p className="text-gray-600">{term.description}</p>
          </div>

          {term.categories && term.categories.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">カテゴリー</h3>
              <div className="flex flex-wrap gap-2">
                {term.categories.map((catId) => {
                  const category = glossaryCategories.find((c) => c.id === catId)
                  if (!category) {return null}
                  return (
                    <span
                      key={catId}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${category.color} text-white`}
                    >
                      <Tag className="mr-1 h-4 w-4" />
                      {category.name}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">関連用語</h3>
              <div className="flex flex-wrap gap-2">
                {term.relatedTerms.map((relatedTerm, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {relatedTerm}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <button
              onClick={() => {
                onNavigateToGlossary(term.id)
                onClose()
              }}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              用語集で詳細を見る
              <ExternalLink className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlossaryDialog
