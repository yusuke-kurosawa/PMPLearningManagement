import React, { useState, useMemo, useCallback, memo } from 'react';
import { ChevronDown, ChevronRight, Search, X, Loader2 } from 'lucide-react';

const PMBOKMatrix = memo(() => {
  const [loading, setLoading] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState(new Set());
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const processGroups = [
    '立上げ',
    '計画',
    '実行',
    '監視・コントロール',
    '終結'
  ];

  // モバイル用の短縮名
  const processGroupsShort = {
    '立上げ': '立上げ',
    '計画': '計画',
    '実行': '実行',
    '監視・コントロール': '監視',
    '終結': '終結'
  };

  const knowledgeAreas = [
    { id: 'integration', name: 'プロジェクト統合マネジメント', processes: 7 },
    { id: 'scope', name: 'プロジェクト・スコープ・マネジメント', processes: 6 },
    { id: 'schedule', name: 'プロジェクト・スケジュール・マネジメント', processes: 6 },
    { id: 'cost', name: 'プロジェクト・コスト・マネジメント', processes: 4 },
    { id: 'quality', name: 'プロジェクト品質マネジメント', processes: 3 },
    { id: 'resource', name: 'プロジェクト資源マネジメント', processes: 6 },
    { id: 'communications', name: 'プロジェクト・コミュニケーション・マネジメント', processes: 3 },
    { id: 'risk', name: 'プロジェクト・リスク・マネジメント', processes: 7 },
    { id: 'procurement', name: 'プロジェクト調達マネジメント', processes: 3 },
    { id: 'stakeholder', name: 'プロジェクト・ステークホルダー・マネジメント', processes: 4 }
  ];

  const processes = {
    integration: {
      '立上げ': ['プロジェクト憲章の作成'],
      '計画': ['プロジェクトマネジメント計画書の作成'],
      '実行': ['プロジェクト作業の指揮・マネジメント', 'プロジェクト知識のマネジメント'],
      '監視・コントロール': ['プロジェクト作業の監視・コントロール', '統合変更管理'],
      '終結': ['プロジェクトやフェーズの終結']
    },
    scope: {
      '計画': ['スコープ・マネジメントの計画', '要求事項の収集', 'スコープの定義', 'WBSの作成'],
      '監視・コントロール': ['スコープの妥当性確認', 'スコープのコントロール']
    },
    schedule: {
      '計画': ['スケジュール・マネジメントの計画', 'アクティビティの定義', 'アクティビティの順序設定', 'アクティビティの所要期間見積り', 'スケジュールの作成'],
      '監視・コントロール': ['スケジュールのコントロール']
    },
    cost: {
      '計画': ['コスト・マネジメントの計画', 'コストの見積り', '予算の設定'],
      '監視・コントロール': ['コストのコントロール']
    },
    quality: {
      '計画': ['品質マネジメントの計画'],
      '実行': ['品質のマネジメント'],
      '監視・コントロール': ['品質のコントロール']
    },
    resource: {
      '計画': ['資源マネジメントの計画', 'アクティビティ資源の見積り'],
      '実行': ['資源の獲得', 'チームの育成', 'チームのマネジメント'],
      '監視・コントロール': ['資源のコントロール']
    },
    communications: {
      '計画': ['コミュニケーション・マネジメントの計画'],
      '実行': ['コミュニケーションのマネジメント'],
      '監視・コントロール': ['コミュニケーションの監視']
    },
    risk: {
      '計画': ['リスク・マネジメントの計画', 'リスクの特定', '定性的リスク分析', '定量的リスク分析', 'リスク対応の計画'],
      '実行': ['リスク対応策の実行'],
      '監視・コントロール': ['リスクの監視']
    },
    procurement: {
      '計画': ['調達マネジメントの計画'],
      '実行': ['調達の実行'],
      '監視・コントロール': ['調達のコントロール']
    },
    stakeholder: {
      '立上げ': ['ステークホルダーの特定'],
      '計画': ['ステークホルダー・エンゲージメントの計画'],
      '実行': ['ステークホルダー・エンゲージメントのマネジメント'],
      '監視・コントロール': ['ステークホルダー・エンゲージメントの監視']
    }
  };

  const processDetails = {
    'プロジェクト憲章の作成': {
      inputs: ['ビジネス文書', '合意書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', '会議'],
      outputs: ['プロジェクト憲章', '前提条件ログ']
    },
    'プロジェクトマネジメント計画書の作成': {
      inputs: ['プロジェクト憲章', '他のプロセスからのアウトプット', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ収集', '対人関係とチームに関するスキル', '会議'],
      outputs: ['プロジェクトマネジメント計画書']
    },
    'プロジェクト作業の指揮・マネジメント': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '承認済み変更要求', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'プロジェクトマネジメント情報システム', '会議'],
      outputs: ['成果物', '作業パフォーマンス・データ', '課題ログ', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版', '組織のプロセス資産更新版']
    },
    'プロジェクト知識のマネジメント': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '成果物', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', '知識マネジメント', '情報マネジメント', '対人関係とチームに関するスキル'],
      outputs: ['教訓登録簿', 'プロジェクトマネジメント計画書更新版', '組織のプロセス資産更新版']
    },
    'プロジェクト作業の監視・コントロール': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス情報', '合意書', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ分析', '意思決定', '会議'],
      outputs: ['作業パフォーマンス報告書', '変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    '統合変更管理': {
      inputs: ['プロジェクトマネジメント計画書', 'プロジェクト文書', '作業パフォーマンス報告書', '変更要求', '組織体の環境要因', '組織のプロセス資産'],
      tools: ['専門家の判断', '変更管理ツール', 'データ分析', '意思決定', '会議'],
      outputs: ['承認済み変更要求', 'プロジェクトマネジメント計画書更新版', 'プロジェクト文書更新版']
    },
    'プロジェクトやフェーズの終結': {
      inputs: ['プロジェクト憲章', 'プロジェクトマネジメント計画書', 'プロジェクト文書', '受入済み成果物', 'ビジネス文書', '合意書', '調達文書', '組織のプロセス資産'],
      tools: ['専門家の判断', 'データ分析', '会議'],
      outputs: ['プロジェクト文書更新版', '最終プロダクト、サービス、所産の引渡し', '最終報告書', '組織のプロセス資産更新版']
    }
  };

  const toggleArea = useCallback((areaId) => {
    setLoading(true);
    setTimeout(() => {
      const newExpanded = new Set(expandedAreas);
      if (newExpanded.has(areaId)) {
        newExpanded.delete(areaId);
      } else {
        newExpanded.add(areaId);
      }
      setExpandedAreas(newExpanded);
      setLoading(false);
    }, 100);
  }, [expandedAreas]);

  const handleProcessClick = useCallback((process) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedProcess(process);
      setLoading(false);
      // ITTO詳細表示にスクロール
      setTimeout(() => {
        const element = document.getElementById('itto-details');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }, 100);
  }, []);

  const filteredProcesses = useMemo(() => {
    if (!searchQuery) return processes;
    
    const filtered = {};
    const query = searchQuery.toLowerCase();
    
    Object.entries(processes).forEach(([area, groups]) => {
      const filteredGroups = {};
      Object.entries(groups).forEach(([group, processList]) => {
        const filteredList = processList.filter(process => 
          process.toLowerCase().includes(query)
        );
        if (filteredList.length > 0) {
          filteredGroups[group] = filteredList;
        }
      });
      if (Object.keys(filteredGroups).length > 0) {
        filtered[area] = filteredGroups;
      }
    });
    
    return filtered;
  }, [searchQuery]);

  const getProcessCount = (areaId) => {
    const areaProcesses = filteredProcesses[areaId];
    if (!areaProcesses) return 0;
    return Object.values(areaProcesses).reduce((sum, group) => sum + group.length, 0);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            PMBOK 第6版 - プロセス・マトリックス (49プロセス)
          </h1>
          
          <div className="relative">
            <input
              type="text"
              placeholder="プロセスを検索..."
              className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 pr-10 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 sm:left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 sm:right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[550px] sm:min-w-[700px] md:min-w-[900px]">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-1 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500 uppercase tracking-tight sm:tracking-wider w-32 sm:w-48 md:w-60">
                  <div className="truncate">知識エリア</div>
                </th>
                {processGroups.map(group => (
                  <th key={group} className="px-0.5 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-[9px] sm:text-xs font-medium text-gray-500 uppercase tracking-tighter">
                    <div className="hidden sm:block">{group}</div>
                    <div className="sm:hidden">{processGroupsShort[group]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {knowledgeAreas.map(area => {
                const isExpanded = expandedAreas.has(area.id);
                const processCount = getProcessCount(area.id);
                const hasFilteredProcesses = processCount > 0;

                if (!hasFilteredProcesses && searchQuery) return null;

                return (
                  <React.Fragment key={area.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-1 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4">
                        <button
                          onClick={() => toggleArea(area.id)}
                          className="flex items-center space-x-1 text-left w-full"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 animate-spin flex-shrink-0" />
                          ) : isExpanded ? (
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-gray-900 text-[11px] sm:text-sm md:text-base block truncate">
                              <span className="sm:hidden">{area.name.replace('プロジェクト・', '').replace('プロジェクト', '').replace('マネジメント', '')}</span>
                              <span className="hidden sm:inline">{area.name}</span>
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-500">({processCount})</span>
                          </div>
                        </button>
                      </td>
                      {processGroups.map(group => {
                        const groupProcesses = filteredProcesses[area.id]?.[group] || [];
                        return (
                          <td key={group} className="px-0.5 sm:px-2 md:px-4 py-3 sm:py-4 text-center">
                            {groupProcesses.length > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-blue-100 text-blue-800 text-[10px] sm:text-xs md:text-sm font-semibold">
                                {groupProcesses.length}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {isExpanded && filteredProcesses[area.id] && (
                      <tr>
                        <td colSpan={6} className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {processGroups.map(group => {
                              const groupProcesses = filteredProcesses[area.id][group];
                              if (!groupProcesses || groupProcesses.length === 0) return null;
                              
                              return (
                                <div key={group} className="space-y-1.5 sm:space-y-2">
                                  <h4 className="font-semibold text-gray-700 text-xs sm:text-sm sticky top-0 bg-gray-50 py-1">
                                    {group}
                                  </h4>
                                  {groupProcesses.map(process => (
                                    <button
                                      key={process}
                                      onClick={() => handleProcessClick(process)}
                                      disabled={loading}
                                      className={`block w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                        selectedProcess === process
                                          ? 'bg-blue-100 border-blue-400 font-semibold'
                                          : 'bg-white hover:bg-blue-50 hover:border-blue-300'
                                      }`}
                                    >
                                      {process}
                                    </button>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ITTO詳細表示 */}
      {selectedProcess && processDetails[selectedProcess] && (
        <div id="itto-details" className="mt-6 bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">{selectedProcess}</h2>
            <button
              onClick={() => setSelectedProcess(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <ChevronRight className="w-5 h-5 mr-1" />
                    インプット
                  </h3>
                  <ul className="space-y-2">
                    {processDetails[selectedProcess].inputs.map((input, idx) => (
                      <li key={idx} className="text-gray-700 text-sm sm:text-base flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{input}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-3 flex items-center">
                    <ChevronRight className="w-5 h-5 mr-1" />
                    ツールと技法
                  </h3>
                  <ul className="space-y-2">
                    {processDetails[selectedProcess].tools.map((tool, idx) => (
                      <li key={idx} className="text-gray-700 text-sm sm:text-base flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3 flex items-center">
                    <ChevronRight className="w-5 h-5 mr-1" />
                    アウトプット
                  </h3>
                  <ul className="space-y-2">
                    {processDetails[selectedProcess].outputs.map((output, idx) => (
                      <li key={idx} className="text-gray-700 text-sm sm:text-base flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        <span>{output}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

PMBOKMatrix.displayName = 'PMBOKMatrix';

export default PMBOKMatrix;