import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Code,
  Calendar,
  Briefcase,
  Package,
  BarChart3,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Target,
  CheckCircle,
  AlertCircle,
  Link
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { pmbok7PerformanceDomains } from '../../data/schemas/pmbok/pmbok7Data';

const PMBOK7PerformanceDomains = () => {
  const { settings } = useTheme();
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or diagram

  // ドメインのアイコンマッピング
  const domainIcons = {
    stakeholder: UserCheck,
    team: Users,
    development: Code,
    planning: Calendar,
    work: Briefcase,
    delivery: Package,
    measurement: BarChart3,
    uncertainty: HelpCircle
  };

  // ドメインの色マッピング
  const domainColors = {
    stakeholder: 'purple',
    team: 'green',
    development: 'blue',
    planning: 'amber',
    work: 'orange',
    delivery: 'emerald',
    measurement: 'indigo',
    uncertainty: 'red'
  };

  const getColorClasses = (color, type = 'bg') => {
    const colorMap = {
      blue: type === 'bg' ? 'bg-blue-100 dark:bg-blue-900/20' : 'text-blue-600 dark:text-blue-400',
      green: type === 'bg' ? 'bg-green-100 dark:bg-green-900/20' : 'text-green-600 dark:text-green-400',
      purple: type === 'bg' ? 'bg-purple-100 dark:bg-purple-900/20' : 'text-purple-600 dark:text-purple-400',
      amber: type === 'bg' ? 'bg-amber-100 dark:bg-amber-900/20' : 'text-amber-600 dark:text-amber-400',
      indigo: type === 'bg' ? 'bg-indigo-100 dark:bg-indigo-900/20' : 'text-indigo-600 dark:text-indigo-400',
      red: type === 'bg' ? 'bg-red-100 dark:bg-red-900/20' : 'text-red-600 dark:text-red-400',
      orange: type === 'bg' ? 'bg-orange-100 dark:bg-orange-900/20' : 'text-orange-600 dark:text-orange-400',
      emerald: type === 'bg' ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'text-emerald-600 dark:text-emerald-400'
    };
    return colorMap[color] || (type === 'bg' ? 'bg-gray-100 dark:bg-gray-900/20' : 'text-gray-600 dark:text-gray-400');
  };

  // ドメイン間の相互作用を可視化
  const renderDomainDiagram = () => {
    const positions = {
      stakeholder: { x: 50, y: 20 },
      team: { x: 20, y: 40 },
      development: { x: 80, y: 40 },
      planning: { x: 20, y: 60 },
      work: { x: 50, y: 60 },
      delivery: { x: 80, y: 60 },
      measurement: { x: 20, y: 80 },
      uncertainty: { x: 50, y: 90 }
    };

    return (
      <div className={`relative h-[600px] rounded-lg p-8 ${
        settings.darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <svg className="absolute inset-0 w-full h-full">
          {/* 相互作用の線を描画 */}
          {pmbok7PerformanceDomains.map(domain => 
            domain.interactions.map(targetId => {
              if (targetId === 'all') return null;
              const source = positions[domain.id];
              const target = positions[targetId];
              if (!source || !target) return null;
              
              return (
                <line
                  key={`${domain.id}-${targetId}`}
                  x1={`${source.x}%`}
                  y1={`${source.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke={settings.darkMode ? '#4B5563' : '#D1D5DB'}
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
              );
            })
          )}
        </svg>

        {/* ドメインノード */}
        {pmbok7PerformanceDomains.map(domain => {
          const Icon = domainIcons[domain.id];
          const color = domainColors[domain.id];
          const position = positions[domain.id];
          
          return (
            <div
              key={domain.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              onClick={() => setSelectedDomain(domain)}
            >
              <div className={`relative group`}>
                <div className={`p-4 rounded-full ${getColorClasses(color, 'bg')} 
                  shadow-lg hover:shadow-xl transition-all hover:scale-110`}>
                  <Icon className={`w-8 h-8 ${getColorClasses(color, 'text')}`} />
                </div>
                <div className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 
                  whitespace-nowrap px-3 py-1 rounded text-sm ${
                  settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                } opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                  {domain.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`p-6 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* ヘッダー */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-3">PMBOK第7版 - 8つのパフォーマンスドメイン</h2>
        <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          プロジェクトパフォーマンスを構成する相互関連した活動領域
        </p>
      </div>

      {/* ビューモード切替 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'grid'
              ? 'bg-blue-600 text-white'
              : settings.darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          グリッドビュー
        </button>
        <button
          onClick={() => setViewMode('diagram')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'diagram'
              ? 'bg-blue-600 text-white'
              : settings.darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          相互作用ダイアグラム
        </button>
      </div>

      {/* コンテンツ表示 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pmbok7PerformanceDomains.map((domain) => {
            const Icon = domainIcons[domain.id];
            const color = domainColors[domain.id];
            
            return (
              <div
                key={domain.id}
                className={`rounded-lg border transition-all cursor-pointer ${
                  settings.darkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:shadow-lg'
                } ${selectedDomain?.id === domain.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedDomain(domain)}
              >
                <div className="p-6">
                  <div className={`p-3 rounded-lg mb-4 ${getColorClasses(color, 'bg')}`}>
                    <Icon className={`w-8 h-8 ${getColorClasses(color, 'text')}`} />
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{domain.name}</h3>
                  <p className={`text-sm mb-4 ${
                    settings.darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {domain.description}
                  </p>

                  {/* フォーカスエリア */}
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold mb-1 uppercase tracking-wide">
                      フォーカスエリア
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {domain.focusAreas.slice(0, 3).map((area, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded-full ${
                            settings.darkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {area}
                        </span>
                      ))}
                      {domain.focusAreas.length > 3 && (
                        <span className={`text-xs px-2 py-1 ${
                          settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          +{domain.focusAreas.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 期待される成果 */}
                  <div className="flex items-center gap-1 text-xs">
                    <CheckCircle className="w-3 h-3" />
                    <span>{domain.outcomes.length}個の期待成果</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        renderDomainDiagram()
      )}

      {/* 選択されたドメインの詳細モーダル */}
      {selectedDomain && (
        <div className={`fixed inset-0 z-50 overflow-y-auto`}>
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedDomain(null)} />
            
            <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform">
              <div className={`rounded-lg shadow-xl ${
                settings.darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        getColorClasses(domainColors[selectedDomain.id], 'bg')
                      }`}>
                        {React.createElement(domainIcons[selectedDomain.id], {
                          className: `w-8 h-8 ${getColorClasses(domainColors[selectedDomain.id], 'text')}`
                        })}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{selectedDomain.name}</h3>
                        <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedDomain.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDomain(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <span className="sr-only">閉じる</span>
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* フォーカスエリア */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        フォーカスエリア
                      </h4>
                      <div className="space-y-2">
                        {selectedDomain.focusAreas.map((area, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg flex items-start gap-3 ${
                              settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}
                          >
                            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{area}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 期待される成果 */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        期待される成果
                      </h4>
                      <div className="space-y-2">
                        {selectedDomain.outcomes.map((outcome, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg flex items-start gap-3 ${
                              settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              getColorClasses(domainColors[selectedDomain.id], 'bg')
                            }`}>
                              <CheckCircle className={`w-3 h-3 ${
                                getColorClasses(domainColors[selectedDomain.id], 'text')
                              }`} />
                            </div>
                            <span className="text-sm">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 相互作用 */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      他のドメインとの相互作用
                    </h4>
                    {selectedDomain.interactions[0] === 'all' ? (
                      <div className={`p-4 rounded-lg ${
                        settings.darkMode ? 'bg-gray-700' : 'bg-blue-50'
                      }`}>
                        <p className="text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          このドメインはすべての他のドメインと相互作用します
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {selectedDomain.interactions.map(interactionId => {
                          const targetDomain = pmbok7PerformanceDomains.find(d => d.id === interactionId);
                          if (!targetDomain) return null;
                          const Icon = domainIcons[targetDomain.id];
                          
                          return (
                            <div
                              key={interactionId}
                              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{targetDomain.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 実践のポイント */}
                  <div className={`mt-6 p-4 rounded-lg ${
                    settings.darkMode ? 'bg-gray-700' : 'bg-amber-50'
                  }`}>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      実践のポイント
                    </h4>
                    <p className={`text-sm ${
                      settings.darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      このドメインは他のドメインと密接に関連しています。
                      効果的なプロジェクトマネジメントのためには、
                      各ドメイン間の相互作用を理解し、
                      統合的なアプローチを取ることが重要です。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMBOK7PerformanceDomains;