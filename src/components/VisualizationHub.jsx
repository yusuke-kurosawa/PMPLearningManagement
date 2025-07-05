import React, { useState } from 'react';
import { Grid3x3, GitBranch, BarChart3, Network, ArrowUpDown, Sparkles } from 'lucide-react';
import PMBOKMatrix from './PMBOKMatrix';
import ITTOForceGraph from './ITTOForceGraph';
import ProcessFlowDiagram from './ProcessFlowDiagram';
import KnowledgeAreaHeatmap from './KnowledgeAreaHeatmap';

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

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      green: isActive ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
      purple: isActive ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      orange: isActive ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} />
                    <div className="text-left">
                      <div className="font-semibold">{viz.name}</div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'opacity-70'}`}>
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
          {CurrentVisualization && <CurrentVisualization />}
        </div>
      </div>
    </div>
  );
};

export default VisualizationHub;