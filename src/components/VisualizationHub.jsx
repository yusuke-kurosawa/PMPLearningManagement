import React, { useState, lazy, Suspense } from 'react';
import { Grid3x3, GitBranch, BarChart3, Network, ArrowUpDown, Sparkles, Workflow, Brain, Activity } from 'lucide-react';

// 遅延ロードでパフォーマンス最適化
const PMBOKMatrix = lazy(() => import('./PMBOKMatrix'));
const ITTOForceGraph = lazy(() => import('./ITTOForceGraph'));
const ProcessFlowDiagram = lazy(() => import('./ProcessFlowDiagram'));
const KnowledgeAreaHeatmap = lazy(() => import('./KnowledgeAreaHeatmap'));
const EnhancedNetworkGraph = lazy(() => import('./EnhancedNetworkGraph'));
const SankeyDiagram = lazy(() => import('./SankeyDiagram'));
const MindMapView = lazy(() => import('./MindMapView'));
const ProcessHeatmap = lazy(() => import('./ProcessHeatmap'));

const VisualizationHub = () => {
  const [selectedView, setSelectedView] = useState('matrix');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const visualizations = [
    {
      id: 'matrix',
      name: 'マトリックスビュー',
      description: '知識エリアとプロセス群の2次元表示',
      icon: Grid3x3,
      component: PMBOKMatrix,
      color: 'blue'
    },
    {
      id: 'network',
      name: 'ネットワーク図',
      description: 'ITTO関係性の力学的表示',
      icon: Network,
      component: ITTOForceGraph,
      color: 'green'
    },
    {
      id: 'flow',
      name: 'プロセスフロー',
      description: '時系列的なプロセスの流れ',
      icon: GitBranch,
      component: ProcessFlowDiagram,
      color: 'purple',
      isNew: true
    },
    {
      id: 'heatmap',
      name: 'ヒートマップ',
      description: '知識エリア別の各種指標',
      icon: BarChart3,
      component: KnowledgeAreaHeatmap,
      color: 'orange',
      isNew: true
    },
    {
      id: 'enhanced-network',
      name: '拡張ネットワーク',
      description: '多様なレイアウトとテーマ',
      icon: Workflow,
      component: EnhancedNetworkGraph,
      color: 'indigo',
      isNew: true
    },
    {
      id: 'sankey',
      name: 'サンキーダイアグラム',
      description: 'プロセスフローの可視化',
      icon: Activity,
      component: SankeyDiagram,
      color: 'teal',
      isNew: true
    },
    {
      id: 'mindmap',
      name: 'マインドマップ',
      description: '階層的な知識構造',
      icon: Brain,
      component: MindMapView,
      color: 'pink',
      isNew: true
    },
    {
      id: 'process-heatmap',
      name: 'プロセスヒートマップ',
      description: '複雑度と進捗の可視化',
      icon: Activity,
      component: ProcessHeatmap,
      color: 'amber',
      isNew: true
    }
  ];

  const handleViewChange = (viewId) => {
    if (viewId === selectedView) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedView(viewId);
      setIsTransitioning(false);
    }, 300);
  };

  const CurrentVisualization = visualizations.find(v => v.id === selectedView)?.component;

  // ビジュアライゼーション用のデータを取得
  const getVisualizationData = () => {
    // 実際のプロジェクトではAPIから取得するが、ここではダミーデータを返す
    return {
      nodes: [
        // Integration Management Processes
        { id: 'p1', name: 'プロジェクト憲章の作成', type: 'process', group: '立ち上げ', area: '統合' },
        { id: 'p2', name: 'プロジェクトマネジメント計画書の作成', type: 'process', group: '計画', area: '統合' },
        { id: 'p3', name: 'プロジェクト作業の指揮・マネジメント', type: 'process', group: '実行', area: '統合' },
        { id: 'p4', name: 'プロジェクト知識のマネジメント', type: 'process', group: '実行', area: '統合' },
        { id: 'p5', name: 'プロジェクト作業の監視・コントロール', type: 'process', group: '監視・コントロール', area: '統合' },
        { id: 'p6', name: '統合変更管理', type: 'process', group: '監視・コントロール', area: '統合' },
        { id: 'p7', name: 'プロジェクトやフェーズの終結', type: 'process', group: '終結', area: '統合' },
        
        // Key Inputs
        { id: 'i1', name: 'ビジネス文書', type: 'input' },
        { id: 'i2', name: '合意書', type: 'input' },
        { id: 'i3', name: '組織体の環境要因', type: 'input' },
        { id: 'i4', name: '組織のプロセス資産', type: 'input' },
        { id: 'i5', name: 'プロジェクト憲章', type: 'input' },
        { id: 'i6', name: 'プロジェクトマネジメント計画書', type: 'input' },
        
        // Key Tools
        { id: 't1', name: '専門家の判断', type: 'tool' },
        { id: 't2', name: 'データ収集', type: 'tool' },
        { id: 't3', name: 'データ分析', type: 'tool' },
        { id: 't4', name: '意思決定', type: 'tool' },
        { id: 't5', name: '会議', type: 'tool' },
        
        // Key Outputs
        { id: 'o1', name: 'プロジェクト憲章', type: 'output' },
        { id: 'o2', name: 'プロジェクトマネジメント計画書', type: 'output' },
        { id: 'o3', name: '成果物', type: 'output' },
        { id: 'o4', name: '作業パフォーマンス・データ', type: 'output' },
        { id: 'o5', name: '作業パフォーマンス報告書', type: 'output' }
      ],
      links: [
        // Develop Project Charter
        { source: 'i1', target: 'p1', type: 'input' },
        { source: 'i2', target: 'p1', type: 'input' },
        { source: 't1', target: 'p1', type: 'tool' },
        { source: 't2', target: 'p1', type: 'tool' },
        { source: 'p1', target: 'o1', type: 'output' },
        
        // Develop Project Management Plan
        { source: 'i5', target: 'p2', type: 'input' },
        { source: 'i3', target: 'p2', type: 'input' },
        { source: 't1', target: 'p2', type: 'tool' },
        { source: 't5', target: 'p2', type: 'tool' },
        { source: 'p2', target: 'o2', type: 'output' }
      ]
    };
  };

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      green: isActive ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
      purple: isActive ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      orange: isActive ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
      indigo: isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      teal: isActive ? 'bg-teal-500 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100',
      pink: isActive ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-700 hover:bg-pink-100',
      amber: isActive ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ビジュアライゼーション選択バー */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                ビジュアライゼーションハブ
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                様々な視点からPMBOKプロセスを理解する
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ArrowUpDown className="w-4 h-4" />
              表示を切り替えてください
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {visualizations.map((viz) => {
              const Icon = viz.icon;
              const isActive = selectedView === viz.id;
              
              return (
                <button
                  key={viz.id}
                  onClick={() => handleViewChange(viz.id)}
                  className={`
                    relative p-4 rounded-xl transition-all duration-300 transform
                    ${getColorClasses(viz.color, isActive)}
                    ${isActive ? 'scale-105 shadow-lg' : 'hover:scale-105'}
                  `}
                >
                  {viz.isNew && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      NEW
                    </span>
                  )}
                  
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Icon className={`w-8 h-8 ${isActive ? 'text-white' : ''}`} />
                    <div>
                      <div className="font-semibold text-sm">{viz.name}</div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'opacity-70'} hidden lg:block`}>
                        {viz.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ビジュアライゼーションコンテンツ */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className={`
            absolute inset-0 transition-all duration-300
            ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}
        >
          {CurrentVisualization && (
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">ビジュアライゼーションを読み込み中...</p>
                </div>
              </div>
            }>
              <CurrentVisualization data={getVisualizationData()} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizationHub;