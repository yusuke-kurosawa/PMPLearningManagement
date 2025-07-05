import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  FileText,
  Tool,
  ArrowRight,
  Loader2,
  Command
} from 'lucide-react';
import searchService from '../services/searchService';
import { useDebounce } from '../hooks/useDebounce';
import { useTheme } from '../contexts/ThemeContext';

const GlobalSearch = () => {
  const navigate = useNavigate();
  const { settings } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // キーボードショートカット (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 検索実行
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsSearching(true);
      const searchResults = searchService.search(debouncedQuery, {
        fuzzy: true,
        limit: 10
      });
      setResults(searchResults);
      setIsSearching(false);
      setSelectedIndex(-1);
    } else if (debouncedQuery.length === 0) {
      setResults([]);
      setShowHistory(true);
    }
  }, [debouncedQuery]);

  // オートコンプリート候補の取得
  useEffect(() => {
    if (query.length >= 2) {
      const autocompleteSuggestions = searchService.getSuggestions(query);
      setSuggestions(autocompleteSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // フォーカス管理
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // 結果アイコンの取得
  const getResultIcon = (type, subtype) => {
    if (type === 'process') return <FileText className="w-4 h-4" />;
    if (type === 'itto') {
      if (subtype === 'tool') return <Tool className="w-4 h-4" />;
      return <ArrowRight className="w-4 h-4" />;
    }
    if (type === 'glossary') return <FileText className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  // 結果のタイプラベル
  const getTypeLabel = (type, subtype) => {
    if (type === 'process') return 'プロセス';
    if (type === 'itto') {
      if (subtype === 'input') return 'インプット';
      if (subtype === 'tool') return 'ツールと技法';
      if (subtype === 'output') return 'アウトプット';
    }
    if (type === 'glossary') return '用語';
    if (type === 'feature') return '機能';
    return '';
  };

  // 検索結果のハイライト
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-700 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // 結果の選択
  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');
    navigate(result.url);
  };

  // キーボードナビゲーション
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  // 検索履歴の取得
  const searchHistory = searchService.searchHistory;
  const popularSearches = searchService.getPopularSearches();

  return (
    <>
      {/* 検索ボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          ${settings.darkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          transition-colors
        `}
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">検索...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      {/* 検索モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* 検索パネル */}
          <div className="relative min-h-screen flex items-start justify-center pt-16 px-4">
            <div className={`
              relative w-full max-w-2xl rounded-xl shadow-2xl
              ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}
              transform transition-all
            `}>
              {/* 検索入力 */}
              <div className="relative border-b dark:border-gray-700">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="プロセス、ITTO、用語を検索..."
                  className={`
                    w-full pl-12 pr-12 py-4 text-lg
                    ${settings.darkMode 
                      ? 'bg-transparent text-white placeholder-gray-400' 
                      : 'bg-transparent text-gray-900 placeholder-gray-500'
                    }
                    focus:outline-none
                  `}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* オートコンプリート候補 */}
              {suggestions.length > 0 && (
                <div className="px-4 py-2 border-b dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(suggestion)}
                        className={`
                          px-3 py-1 rounded-full text-sm
                          ${settings.darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600' 
                            : 'bg-gray-100 hover:bg-gray-200'
                          }
                          transition-colors
                        `}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 検索結果 */}
              <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`
                          w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700
                          ${selectedIndex === index ? 'bg-gray-50 dark:bg-gray-700' : ''}
                          transition-colors text-left
                        `}
                      >
                        <div className={`
                          p-2 rounded-lg
                          ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                        `}>
                          {getResultIcon(result.type, result.subtype)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium dark:text-white">
                              {highlightMatch(result.title, query)}
                            </h4>
                            <span className={`
                              text-xs px-2 py-1 rounded
                              ${settings.darkMode 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'bg-gray-200 text-gray-600'
                              }
                            `}>
                              {getTypeLabel(result.type, result.subtype)}
                            </span>
                          </div>
                          {result.content && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {highlightMatch(result.content, query)}
                            </p>
                          )}
                          {result.parentProcess && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {result.parentProcess}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    「{query}」に一致する結果が見つかりませんでした
                  </div>
                ) : (
                  <div className="p-4">
                    {/* 検索履歴 */}
                    {searchHistory.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            最近の検索
                          </h3>
                          <button
                            onClick={() => searchService.clearHistory()}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            クリア
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {searchHistory.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => setQuery(item)}
                              className={`
                                px-3 py-1 rounded-full text-sm
                                ${settings.darkMode 
                                  ? 'bg-gray-700 hover:bg-gray-600' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                                }
                                transition-colors
                              `}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 人気の検索 */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        人気の検索
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.slice(0, 8).map((item, index) => (
                          <button
                            key={index}
                            onClick={() => setQuery(item)}
                            className={`
                              px-3 py-1 rounded-full text-sm
                              ${settings.darkMode 
                                ? 'bg-gray-700 hover:bg-gray-600' 
                                : 'bg-gray-100 hover:bg-gray-200'
                              }
                              transition-colors
                            `}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* フッター */}
              <div className={`
                px-4 py-3 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400
                flex items-center justify-between
              `}>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">↑↓</kbd>
                    移動
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd>
                    選択
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
                    閉じる
                  </span>
                </div>
                <span>
                  Powered by Smart Search
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;