import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Play, Pause, RotateCcw, Info, Filter } from 'lucide-react';
import { glossaryService } from '../services/glossaryService';
import GlossaryDialog from './GlossaryDialog';
import { useNavigate } from 'react-router-dom';

const ProcessFlowDiagram = React.memo(() => {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedKnowledgeArea, setSelectedKnowledgeArea] = useState('all');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const animationRef = useRef(null);

  // プロセスグループの順序
  const processGroups = ['立上げ', '計画', '実行', '監視・コントロール', '終結'];
  
  // 知識エリア
  const knowledgeAreas = [
    { id: 'all', name: 'すべて' },
    { id: 'integration', name: '統合' },
    { id: 'scope', name: 'スコープ' },
    { id: 'schedule', name: 'スケジュール' },
    { id: 'cost', name: 'コスト' },
    { id: 'quality', name: '品質' },
    { id: 'resource', name: '資源' },
    { id: 'communications', name: 'コミュニケーション' },
    { id: 'risk', name: 'リスク' },
    { id: 'procurement', name: '調達' },
    { id: 'stakeholder', name: 'ステークホルダー' }
  ];

  // プロセスデータ
  const processData = useMemo(() => {
    const processes = [
      // 統合マネジメント
      { id: 'p1.1', name: 'プロジェクト憲章の作成', group: '立上げ', area: 'integration', x: 0, y: 0 },
      { id: 'p4.1', name: 'PM計画書の作成', group: '計画', area: 'integration', x: 1, y: 0 },
      { id: 'p4.2', name: 'プロジェクト作業の指揮', group: '実行', area: 'integration', x: 2, y: 0 },
      { id: 'p4.3', name: 'プロジェクト知識の管理', group: '実行', area: 'integration', x: 2, y: 0.5 },
      { id: 'p4.4', name: 'プロジェクト作業の監視', group: '監視・コントロール', area: 'integration', x: 3, y: 0 },
      { id: 'p4.5', name: '統合変更管理', group: '監視・コントロール', area: 'integration', x: 3, y: 0.5 },
      { id: 'p4.6', name: 'プロジェクトの終結', group: '終結', area: 'integration', x: 4, y: 0 },
      
      // スコープマネジメント
      { id: 'p5.1', name: 'スコープ計画', group: '計画', area: 'scope', x: 1, y: 1 },
      { id: 'p5.2', name: '要求事項収集', group: '計画', area: 'scope', x: 1, y: 1.3 },
      { id: 'p5.3', name: 'スコープ定義', group: '計画', area: 'scope', x: 1, y: 1.6 },
      { id: 'p5.4', name: 'WBS作成', group: '計画', area: 'scope', x: 1, y: 1.9 },
      { id: 'p5.5', name: 'スコープ妥当性確認', group: '監視・コントロール', area: 'scope', x: 3, y: 1 },
      { id: 'p5.6', name: 'スコープコントロール', group: '監視・コントロール', area: 'scope', x: 3, y: 1.3 },
      
      // ステークホルダーマネジメント
      { id: 'p13.1', name: 'ステークホルダー特定', group: '立上げ', area: 'stakeholder', x: 0, y: 1 },
      { id: 'p13.2', name: 'SH・エンゲージメント計画', group: '計画', area: 'stakeholder', x: 1, y: 9 },
      { id: 'p13.3', name: 'SH・エンゲージメント管理', group: '実行', area: 'stakeholder', x: 2, y: 9 },
      { id: 'p13.4', name: 'SH・エンゲージメント監視', group: '監視・コントロール', area: 'stakeholder', x: 3, y: 9 }
    ];

    // プロセス間の接続を定義
    const connections = [
      { source: 'p1.1', target: 'p4.1', type: 'primary' },
      { source: 'p1.1', target: 'p13.1', type: 'parallel' },
      { source: 'p4.1', target: 'p5.1', type: 'primary' },
      { source: 'p5.1', target: 'p5.2', type: 'sequential' },
      { source: 'p5.2', target: 'p5.3', type: 'sequential' },
      { source: 'p5.3', target: 'p5.4', type: 'sequential' },
      { source: 'p4.1', target: 'p4.2', type: 'primary' },
      { source: 'p4.2', target: 'p4.4', type: 'feedback' },
      { source: 'p4.4', target: 'p4.5', type: 'trigger' },
      { source: 'p4.5', target: 'p4.2', type: 'update' },
      { source: 'p13.1', target: 'p13.2', type: 'primary' },
      { source: 'p13.2', target: 'p13.3', type: 'primary' },
      { source: 'p13.3', target: 'p13.4', type: 'feedback' }
    ];

    return { processes, connections };
  }, []);

  // 色の定義
  const colors = {
    integration: '#8B5CF6',
    scope: '#3B82F6',
    schedule: '#06B6D4',
    cost: '#10B981',
    quality: '#F59E0B',
    resource: '#EF4444',
    communications: '#EC4899',
    risk: '#DC2626',
    procurement: '#7C3AED',
    stakeholder: '#6366F1'
  };

  // サイズの設定
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3.jsでの描画
  useEffect(() => {
    if (!svgRef.current || !processData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 60, right: 60, bottom: 60, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // メインコンテナ
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 背景グラデーション
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'bg-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('style', 'stop-color:#f3f4f6;stop-opacity:1');
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('style', 'stop-color:#e5e7eb;stop-opacity:1');

    // 背景
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#bg-gradient)');

    // プロセスグループの背景
    const groupWidth = innerWidth / processGroups.length;
    
    g.selectAll('.process-group-bg')
      .data(processGroups)
      .enter()
      .append('rect')
      .attr('class', 'process-group-bg')
      .attr('x', (d, i) => i * groupWidth)
      .attr('y', 0)
      .attr('width', groupWidth)
      .attr('height', innerHeight)
      .attr('fill', (d, i) => i % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.02)')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);

    // プロセスグループラベル
    g.selectAll('.process-group-label')
      .data(processGroups)
      .enter()
      .append('text')
      .attr('class', 'process-group-label')
      .attr('x', (d, i) => i * groupWidth + groupWidth / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text(d => d);

    // フィルタリング
    const filteredProcesses = selectedKnowledgeArea === 'all' 
      ? processData.processes 
      : processData.processes.filter(p => p.area === selectedKnowledgeArea);

    const filteredConnections = processData.connections.filter(c => {
      const sourceExists = filteredProcesses.some(p => p.id === c.source);
      const targetExists = filteredProcesses.some(p => p.id === c.target);
      return sourceExists && targetExists;
    });

    // スケール
    const xScale = d3.scaleLinear()
      .domain([0, processGroups.length - 1])
      .range([groupWidth / 2, innerWidth - groupWidth / 2]);

    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([50, innerHeight - 50]);

    // 接続線の定義
    const linkGenerator = d3.linkHorizontal()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    // マーカー定義
    defs.selectAll('marker')
      .data(['primary', 'sequential', 'feedback', 'parallel', 'trigger', 'update'])
      .enter()
      .append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', d => {
        switch(d) {
          case 'primary': return '#3B82F6';
          case 'sequential': return '#10B981';
          case 'feedback': return '#F59E0B';
          case 'parallel': return '#8B5CF6';
          case 'trigger': return '#EF4444';
          case 'update': return '#EC4899';
          default: return '#6B7280';
        }
      });

    // 接続線
    const links = g.selectAll('.process-link')
      .data(filteredConnections)
      .enter()
      .append('g')
      .attr('class', 'process-link');

    links.append('path')
      .attr('d', d => {
        const source = filteredProcesses.find(p => p.id === d.source);
        const target = filteredProcesses.find(p => p.id === d.target);
        return linkGenerator({
          source: { x: source.x, y: source.y },
          target: { x: target.x, y: target.y }
        });
      })
      .attr('fill', 'none')
      .attr('stroke', d => {
        switch(d.type) {
          case 'primary': return '#3B82F6';
          case 'sequential': return '#10B981';
          case 'feedback': return '#F59E0B';
          case 'parallel': return '#8B5CF6';
          case 'trigger': return '#EF4444';
          case 'update': return '#EC4899';
          default: return '#6B7280';
        }
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => d.type === 'feedback' || d.type === 'update' ? '5,5' : '0')
      .attr('marker-end', d => `url(#arrow-${d.type})`)
      .attr('opacity', 0.7);

    // プロセスノード
    const nodes = g.selectAll('.process-node')
      .data(filteredProcesses)
      .enter()
      .append('g')
      .attr('class', 'process-node')
      .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`);

    // ノードの背景
    nodes.append('rect')
      .attr('x', -60)
      .attr('y', -25)
      .attr('width', 120)
      .attr('height', 50)
      .attr('rx', 8)
      .attr('fill', d => colors[d.area])
      .attr('fill-opacity', 0.9)
      .attr('stroke', d => colors[d.area])
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .style('cursor', 'pointer');

    // ノードテキスト
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('fill', 'white')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text(d => d.name)
      .call(wrap, 100);

    // ホバー効果とクリック
    nodes
      .on('mouseenter', function() {
        d3.select(this).select('rect')
          .transition()
          .duration(200)
          .attr('fill-opacity', 1)
          .attr('stroke-width', 3);
      })
      .on('mouseleave', function() {
        d3.select(this).select('rect')
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.9)
          .attr('stroke-width', 2);
      })
      .on('click', (event, d) => {
        const term = glossaryService.getTermByName(d.name);
        if (term) {
          setSelectedGlossaryTerm(term);
        }
      });

    // テキストの折り返し関数
    function wrap(text, width) {
      text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const y = text.attr('y');
        const dy = parseFloat(text.attr('dy'));
        let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');

        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
          }
        }
      });
    }

    // アニメーション機能
    if (isAnimating) {
      let step = 0;
      const totalSteps = filteredProcesses.length;
      
      const animate = () => {
        if (step < totalSteps && isAnimating) {
          nodes
            .style('opacity', (d, i) => i <= step ? 1 : 0.2)
            .filter((d, i) => i === step)
            .select('rect')
            .transition()
            .duration(300)
            .attr('fill-opacity', 1)
            .attr('stroke-width', 4)
            .transition()
            .duration(300)
            .attr('fill-opacity', 0.9)
            .attr('stroke-width', 2);

          links
            .style('opacity', d => {
              const sourceIndex = filteredProcesses.findIndex(p => p.id === d.source);
              const targetIndex = filteredProcesses.findIndex(p => p.id === d.target);
              return sourceIndex <= step && targetIndex <= step ? 0.7 : 0.1;
            });

          step++;
          animationRef.current = setTimeout(animate, 800);
        } else {
          setIsAnimating(false);
          nodes.style('opacity', 1);
          links.style('opacity', 0.7);
        }
      };

      animate();
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [dimensions, processData, selectedKnowledgeArea, isAnimating]);

  const handleAnimation = () => {
    if (isAnimating) {
      setIsAnimating(false);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    } else {
      setIsAnimating(true);
    }
  };

  const handleReset = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    // Re-render
    const svg = d3.select(svgRef.current);
    svg.selectAll('.process-node').style('opacity', 1);
    svg.selectAll('.process-link').style('opacity', 0.7);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">プロセスフロー図</h1>
            <p className="text-sm text-gray-600 mt-1">
              PMBOKプロセスの時系列的な流れと相互関係を視覚化
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 知識エリアフィルター */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedKnowledgeArea}
                onChange={(e) => setSelectedKnowledgeArea(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {knowledgeAreas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>

            {/* アニメーションコントロール */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAnimation}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isAnimating 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isAnimating ? (
                  <>
                    <Pause className="w-4 h-4" />
                    一時停止
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    フロー再生
                  </>
                )}
              </button>
              
              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                title="リセット"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div ref={containerRef} className="flex-1 relative">
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* 凡例 */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">接続線の種類</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span>主要フロー</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-500"></div>
              <span>順次実行</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-yellow-500" style={{ borderStyle: 'dashed', borderWidth: '1px 0' }}></div>
              <span>フィードバック</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-purple-500"></div>
              <span>並行実行</span>
            </div>
          </div>
        </div>
      </div>

      {/* 用語集ダイアログ */}
      {selectedGlossaryTerm && (
        <GlossaryDialog
          term={selectedGlossaryTerm}
          onClose={() => setSelectedGlossaryTerm(null)}
          onNavigateToGlossary={(termId) => {
            navigate('/glossary', { state: { selectedTermId: termId } });
          }}
        />
      )}
    </div>
  );
});

ProcessFlowDiagram.displayName = 'ProcessFlowDiagram';

export default ProcessFlowDiagram;