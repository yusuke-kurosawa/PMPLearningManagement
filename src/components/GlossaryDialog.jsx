import React from 'react';
import { X, Tag, ExternalLink } from 'lucide-react';
import { glossaryCategories } from '../data/pmpGlossary';

const GlossaryDialog = ({ term, onClose, onNavigateToGlossary }) => {
  if (!term) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {term.term}
              </h2>
              <p className="text-lg text-gray-600">{term.japanese}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="閉じる"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">説明</h3>
            <p className="text-gray-600">{term.description}</p>
          </div>

          {term.categories && term.categories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">カテゴリー</h3>
              <div className="flex flex-wrap gap-2">
                {term.categories.map(catId => {
                  const category = glossaryCategories.find(c => c.id === catId);
                  if (!category) return null;
                  return (
                    <span
                      key={catId}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.color} text-white`}
                    >
                      <Tag className="w-4 h-4 mr-1" />
                      {category.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">関連用語</h3>
              <div className="flex flex-wrap gap-2">
                {term.relatedTerms.map((relatedTerm, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {relatedTerm}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <button
              onClick={() => {
                onNavigateToGlossary(term.id);
                onClose();
              }}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              用語集で詳細を見る
              <ExternalLink className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlossaryDialog;