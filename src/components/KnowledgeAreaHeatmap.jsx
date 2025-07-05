import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { TrendingUp, TrendingDown, Activity, Info } from 'lucide-react';
import { glossaryService } from '../services/glossaryService';
import GlossaryDialog from './GlossaryDialog';
import { useNavigate } from 'react-router-dom';

const KnowledgeAreaHeatmap = React.memo(() => {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedMetric, setSelectedMetric] = useState('processCount');
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // メトリクスの定義
  const metrics = [
    { id: 'processCount', name: 'プロセス数', description: '各エリア・グループのプロセス数' },
    { id: 'complexity', name: '複雑度', description: 'ITTO関係の複雑さ' },
    { id: 'importance', name: '重要度', description: 'PMP試験での出題頻度' },
    { id: 'difficulty', name: '難易度', description: '学習の難しさ' }
  ];

  // プロセスグループ
  const processGroups = ['立上げ', '計画', '実行', '監視・コントロール', '終結'];

  // 知識エリア
  const knowledgeAreas = [
    { id: 'integration', name: '統合マネジメント' },
    { id: 'scope', name: 'スコープ・マネジメント' },
    { id: 'schedule', name: 'スケジュール・マネジメント' },
    { id: 'cost', name: 'コスト・マネジメント' },
    { id: 'quality', name: '品質マネジメント' },
    { id: 'resource', name: '資源マネジメント' },
    { id: 'communications', name: 'コミュニケーション・マネジメント' },
    { id: 'risk', name: 'リスク・マネジメント' },
    { id: 'procurement', name: '調達マネジメント' },
    { id: 'stakeholder', name: 'ステークホルダー・マネジメント' }
  ];

  // ヒートマップデータ
  const heatmapData = useMemo(() => {
    const data = {
      processCount: {
        integration: { '立上げ': 1, '計画': 1, '実行': 2, '監視・コントロール': 2, '終結': 1 },
        scope: { '立上げ': 0, '計画': 4, '実行': 0, '監視・コントロール': 2, '終結': 0 },
        schedule: { '立上げ': 0, '計画': 5, '実行': 0, '監視・コントロール': 1, '終結': 0 },
        cost: { '立上げ': 0, '計画': 3, '実行': 0, '監視・コントロール': 1, '終結': 0 },
        quality: { '立上げ': 0, '計画': 1, '実行': 1, '監視・コントロール': 1, '終結': 0 },
        resource: { '立上げ': 0, '計画': 2, '実行': 3, '監視・コントロール': 1, '終結': 0 },
        communications: { '立上げ': 0, '計画': 1, '実行': 1, '監視・コントロール': 1, '終結': 0 },
        risk: { '立上げ': 0, '計画': 5, '実行': 1, '監視・コントロール': 1, '終結': 0 },
        procurement: { '立上げ': 0, '計画': 1, '実行': 1, '監視・コントロール': 1, '終結': 0 },
        stakeholder: { '立上げ': 1, '計画': 1, '実行': 1, '監視・コントロール': 1, '終結': 0 }
      },
      complexity: {
        integration: { '立上げ': 3, '計画': 5, '実行': 4, '監視・コントロール': 5, '終結': 3 },
        scope: { '立上げ': 0, '計画': 4, '実行': 0, '監視・コントロール': 3, '終結': 0 },
        schedule: { '立上げ': 0, '計画': 5, '実行': 0, '監視・コントロール': 3, '終結': 0 },
        cost: { '立上げ': 0, '計画': 4, '実行': 0, '監視・コントロール': 4, '終結': 0 },
        quality: { '立上げ': 0, '計画': 3, '実行': 3, '監視・コントロール': 3, '終結': 0 },
        resource: { '立上げ': 0, '計画': 3, '実行': 4, '監視・コントロール': 3, '終結': 0 },
        communications: { '立上げ': 0, '計画': 2, '実行': 3, '監視・コントロール': 2, '終結': 0 },
        risk: { '立上げ': 0, '計画': 5, '実行': 3, '監視・コントロール': 3, '終結': 0 },
        procurement: { '立上げ': 0, '計画': 3, '実行': 3, '監視・コントロール': 3, '終結': 0 },
        stakeholder: { '立上げ': 2, '計画': 3, '実行': 3, '監視・コントロール': 3, '終結': 0 }
      },
      importance: {
        integration: { '立上げ': 5, '計画': 5, '実行': 5, '監視・コントロール': 5, '終結': 4 },
        scope: { '立上げ': 0, '計画': 5, '実行': 0, '監視・コントロール': 4, '終結': 0 },
        schedule: { '立上げ': 0, '計画': 5, '実行': 0, '監視・コントロール': 4, '終結': 0 },
        cost: { '立上げ': 0, '計画': 4, '実行': 0, '監視・コントロール': 5, '終結': 0 },
        quality: { '立上げ': 0, '計画': 3, '実行': 3, '監視・コントロール': 3, '終結': 0 },
        resource: { '立上げ': 0, '計画': 3, '実行': 4, '監視・コントロール': 3, '終結': 0 },
        communications: { '立上げ': 0, '計画': 3, '実行': 4, '監視・コントロール': 3, '終結': 0 },
        risk: { '立上げ': 0, '計画': 5, '実行': 3, '監視・コントロール': 4, '終結': 0 },
        procurement: { '立上げ': 0, '計画': 2, '実行': 3, '監視・コントロール': 3, '終結': 0 },
        stakeholder: { '立上げ': 4, '計画': 4, '実行': 4, '監視・コントロール': 4, '終結': 0 }
      },
      difficulty: {
        integration: { '立上げ': 2, '計画': 4, '実行': 3, '監視・コントロール': 4, '終結': 2 },
        scope: { '立上げ': 0, '計画': 3, '実行': 0, '監視・コントロール': 3, '終結': 0 },
        schedule: { '立上げ': 0, '計画': 4, '実行': 0, '監視・コントロール': 3, '終結': 0 },
        cost: { '立上げ': 0, '計画': 4, '実行': 0, '監視・コントロール': 4, '終結': 0 },
        quality: { '立上げ': 0, '計画': 3, '実行': 3, '監視・コントロール': 3, '終結': 0 },
        resource: { '立上げ': 0, '計画': 3, '実行': 3, '監視・コントロール': 3, '終結': 0 },
        communications: { '立上げ': 0, '計画': 2, '実行': 2, '監視・コントロール': 2, '終結': 0 },
        risk: { '立上げ': 0, '計画': 5, '実行': 3, '監視・コントロール': 3, '終結': 0 },
        procurement: { '立上げ': 0, '計画': 3, '実行': 3, '監視・コントロール': 3, '終結': 0 },
        stakeholder: { '立上げ': 2, '計画': 3, '実行': 3, '監視・コントロール': 3, '終結': 0 }
      }
    };

    return data[selectedMetric] || data.processCount;
  }, [selectedMetric]);

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
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 120, right: 60, bottom: 60, left: 200 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // カラースケール
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain([0, 5]);

    // セルサイズ
    const cellWidth = Math.max(100, innerWidth / processGroups.length);
    const cellHeight = Math.max(40, innerHeight / knowledgeAreas.length);

    // メインコンテナ
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 背景
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#f9fafb');

    // タイトル
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', '#111827')
      .text('知識エリア別ヒートマップ');

    // サブタイトル
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#6b7280')
      .text(metrics.find(m => m.id === selectedMetric)?.description || '');

    // プロセスグループラベル
    g.selectAll('.process-group-label')
      .data(processGroups)
      .enter()
      .append('text')
      .attr('class', 'process-group-label')
      .attr('x', (d, i) => i * cellWidth + cellWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text(d => d);

    // 知識エリアラベル
    g.selectAll('.knowledge-area-label')
      .data(knowledgeAreas)
      .enter()
      .append('text')
      .attr('class', 'knowledge-area-label')
      .attr('x', -10)
      .attr('y', (d, i) => i * cellHeight + cellHeight / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '13px')
      .style('fill', '#374151')
      .text(d => d.name)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const term = glossaryService.getTermByName(d.name);
        if (term) {
          setSelectedGlossaryTerm(term);
        }
      });

    // ヒートマップセル
    const cells = g.selectAll('.heatmap-cell')
      .data(
        knowledgeAreas.flatMap((area, i) =>
          processGroups.map((group, j) => ({
            area: area.id,
            areaName: area.name,
            group,
            value: heatmapData[area.id][group],
            x: j * cellWidth,
            y: i * cellHeight
          }))
        )
      )
      .enter()
      .append('g')
      .attr('class', 'heatmap-cell');

    // セルの背景
    cells.append('rect')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', cellWidth - 2)
      .attr('height', cellHeight - 2)
      .attr('rx', 4)
      .attr('fill', d => d.value === 0 ? '#e5e7eb' : colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', d => d.value > 0 ? 'pointer' : 'default')
      .on('mouseenter', function(event, d) {
        if (d.value > 0) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 3);
          setHoveredCell(d);
        }
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
        setHoveredCell(null);
      });

    // 値のテキスト
    cells.append('text')
      .attr('x', d => d.x + cellWidth / 2)
      .attr('y', d => d.y + cellHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .style('fill', d => d.value > 3 ? '#fff' : '#374151')
      .style('pointer-events', 'none')
      .text(d => d.value > 0 ? d.value : '');

    // 凡例
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - margin.right - legendWidth - 20;
    const legendY = margin.top - 80;

    const legendScale = d3.scaleLinear()
      .domain([0, 5])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(6)
      .tickFormat(d3.format('d'));

    // 凡例のグラデーション
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    for (let i = 0; i <= 10; i++) {
      gradient.append('stop')
        .attr('offset', `${i * 10}%`)
        .attr('stop-color', colorScale(i / 2));
    }

    const legend = svg.append('g')
      .attr('transform', `translate(${legendX},${legendY})`);

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');

    legend.append('g')
      .attr('transform', `translate(0,${legendHeight})`)
      .call(legendAxis);

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('値の範囲');

    // 統計情報
    const stats = calculateStats();
    const statsG = svg.append('g')
      .attr('transform', `translate(${margin.left},${height - 40})`);

    statsG.selectAll('.stat')
      .data([
        { label: '最高値', value: stats.max, icon: TrendingUp },
        { label: '平均値', value: stats.avg.toFixed(1), icon: Activity },
        { label: '最低値', value: stats.min, icon: TrendingDown }
      ])
      .enter()
      .append('g')
      .attr('class', 'stat')
      .attr('transform', (d, i) => `translate(${i * 150},0)`);

    function calculateStats() {
      const values = Object.values(heatmapData).flatMap(area =>
        Object.values(area).filter(v => v > 0)
      );
      return {
        max: Math.max(...values),
        min: Math.min(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length
      };
    }

  }, [dimensions, heatmapData, selectedMetric]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* メトリクス選択 */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">表示指標:</label>
                <div className="flex gap-2">
                  {metrics.map(metric => (
                    <button
                      key={metric.id}
                      onClick={() => setSelectedMetric(metric.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedMetric === metric.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {metric.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              onClick={() => {
                const term = glossaryService.getTermByName('ヒートマップ');
                if (term) setSelectedGlossaryTerm(term);
              }}
            >
              <Info className="w-4 h-4" />
              ヒートマップとは？
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div ref={containerRef} className="flex-1 relative">
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* ツールチップ */}
        {hoveredCell && (
          <div
            className="absolute bg-gray-900 text-white p-3 rounded-lg shadow-lg pointer-events-none z-10"
            style={{
              left: `${dimensions.width * 0.17 + hoveredCell.x + 50}px`,
              top: `${dimensions.height * 0.15 + hoveredCell.y - 10}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="text-sm font-semibold">{hoveredCell.areaName}</div>
            <div className="text-xs opacity-90">{hoveredCell.group}</div>
            <div className="text-lg font-bold mt-1">{hoveredCell.value}</div>
          </div>
        )}
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

KnowledgeAreaHeatmap.displayName = 'KnowledgeAreaHeatmap';

export default KnowledgeAreaHeatmap;