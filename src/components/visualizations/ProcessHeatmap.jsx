import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Download, Info, Settings } from 'lucide-react';

const ProcessHeatmap = ({ data, progressData }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [selectedMetric, setSelectedMetric] = useState('complexity');
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  // メトリクスの定義
  const metrics = {
    complexity: {
      name: '複雑度',
      description: 'ITTOの数に基づくプロセスの複雑さ',
      calculate: (process) => {
        if (!data) return 0;
        const links = data.links.filter(l => 
          l.source === process.id || l.source.id === process.id ||
          l.target === process.id || l.target.id === process.id
        );
        return links.length;
      }
    },
    progress: {
      name: '学習進捗',
      description: '各プロセスの学習完了度',
      calculate: (process) => {
        if (!progressData) return 0;
        const progress = progressData[process.id];
        return progress ? progress.understandingLevel : 0;
      }
    },
    connectivity: {
      name: '接続性',
      description: '他のプロセスとの関連度',
      calculate: (process) => {
        if (!data) return 0;
        const connectedProcesses = new Set();
        data.links.forEach(link => {
          if (link.source === process.id || link.source.id === process.id) {
            const target = data.nodes.find(n => n.id === (link.target.id || link.target));
            if (target && target.type === 'process') {
              connectedProcesses.add(target.id);
            }
          }
          if (link.target === process.id || link.target.id === process.id) {
            const source = data.nodes.find(n => n.id === (link.source.id || link.source));
            if (source && source.type === 'process') {
              connectedProcesses.add(source.id);
            }
          }
        });
        return connectedProcesses.size;
      }
    },
    importance: {
      name: '重要度',
      description: 'PMP試験での出題頻度（推定）',
      calculate: (process) => {
        // 重要なプロセスのマッピング（仮の値）
        const importanceMap = {
          'プロジェクト憲章の作成': 10,
          'プロジェクトマネジメント計画書の作成': 10,
          'プロジェクト作業の指揮・マネジメント': 9,
          'プロジェクト作業の監視・コントロール': 9,
          '統合変更管理': 10,
          'スコープの定義': 8,
          'WBSの作成': 9,
          'スケジュールの作成': 9,
          'コストの見積り': 8,
          'リスクの特定': 9,
          'リスク分析（定性的）': 8,
          'ステークホルダーの特定': 9,
          'コミュニケーションの管理': 8
        };
        return importanceMap[process.name] || 5;
      }
    }
  };

  // レスポンシブ対応
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: width || 1200, 
          height: height || 800
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // ヒートマップデータの準備
  const heatmapData = useMemo(() => {
    if (!data) return null;

    const processes = data.nodes.filter(n => n.type === 'process');
    const knowledgeAreas = ['統合', 'スコープ', 'スケジュール', 'コスト', '品質', 
                           '資源', 'コミュニケーション', 'リスク', '調達', 'ステークホルダー'];
    const processGroups = ['立ち上げ', '計画', '実行', '監視・コントロール', '終結'];

    // マトリックスデータの作成
    const matrix = [];
    knowledgeAreas.forEach((area, areaIndex) => {
      processGroups.forEach((group, groupIndex) => {
        const process = processes.find(p => p.area === area && p.group === group);
        if (process) {
          const value = metrics[selectedMetric].calculate(process);
          matrix.push({
            area,
            group,
            areaIndex,
            groupIndex,
            process,
            value
          });
        }
      });
    });

    return {
      matrix,
      knowledgeAreas,
      processGroups,
      maxValue: Math.max(...matrix.map(d => d.value))
    };
  }, [data, progressData, selectedMetric]);

  // ヒートマップの描画
  useEffect(() => {
    if (!heatmapData || !svgRef.current) return;

    const margin = { top: 120, right: 200, bottom: 60, left: 200 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // SVGのクリア
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // グループの作成
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // スケールの設定
    const xScale = d3.scaleBand()
      .domain(heatmapData.processGroups)
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(heatmapData.knowledgeAreas)
      .range([0, height])
      .padding(0.1);

    // カラースケール
    const colorScale = d3.scaleSequential()
      .domain([0, heatmapData.maxValue])
      .interpolator(d3.interpolateYlOrRd);

    // セルの描画
    const cells = g.selectAll('.cell')
      .data(heatmapData.matrix)
      .enter().append('g')
      .attr('class', 'cell');

    cells.append('rect')
      .attr('x', d => xScale(d.group))
      .attr('y', d => yScale(d.area))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredCell(d);
        d3.select(event.target)
          .attr('stroke', '#333')
          .attr('stroke-width', 3);
      })
      .on('mouseleave', (event) => {
        setHoveredCell(null);
        d3.select(event.target)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      });

    // セル内のテキスト（値）
    cells.append('text')
      .attr('x', d => xScale(d.group) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.area) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.value > heatmapData.maxValue * 0.6 ? '#fff' : '#333')
      .text(d => d.value.toFixed(0))
      .style('pointer-events', 'none');

    // X軸（プロセス群）
    g.append('g')
      .attr('transform', `translate(0,${-10})`)
      .selectAll('text')
      .data(heatmapData.processGroups)
      .enter().append('text')
      .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(d => d);

    // Y軸（知識エリア）
    g.append('g')
      .attr('transform', `translate(${-10},0)`)
      .selectAll('text')
      .data(heatmapData.knowledgeAreas)
      .enter().append('text')
      .attr('x', 0)
      .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dy', '.35em')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(d => `${d}マネジメント`);

    // タイトル
    svg.append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text(`PMBOKプロセス ${metrics[selectedMetric].name}ヒートマップ`);

    // 凡例
    if (showLegend) {
      const legendWidth = 300;
      const legendHeight = 20;
      
      const legendScale = d3.scaleLinear()
        .domain([0, heatmapData.maxValue])
        .range([0, legendWidth]);

      const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d3.format('.0f'));

      const legend = svg.append('g')
        .attr('transform', `translate(${dimensions.width - margin.right - legendWidth - 50},${margin.top - 60})`);

      // グラデーション定義
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      const numStops = 10;
      for (let i = 0; i <= numStops; i++) {
        gradient.append('stop')
          .attr('offset', `${(i / numStops) * 100}%`)
          .attr('stop-color', colorScale((i / numStops) * heatmapData.maxValue));
      }

      legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'url(#legend-gradient)')
        .attr('stroke', '#ccc');

      legend.append('g')
        .attr('transform', `translate(0,${legendHeight})`)
        .call(legendAxis);

      legend.append('text')
        .attr('x', legendWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(metrics[selectedMetric].name);
    }

  }, [heatmapData, dimensions, selectedMetric, showLegend]);

  // SVGエクスポート
  const exportSVG = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pmbok-heatmap.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-50">
      {/* コントロールパネル */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-4 max-w-xs">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            表示メトリクス
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {Object.entries(metrics).map(([key, metric]) => (
              <option key={key} value={key}>{metric.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-1">
            {metrics[selectedMetric].description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showLegend"
            checked={showLegend}
            onChange={(e) => setShowLegend(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="showLegend" className="text-sm text-gray-700">
            凡例を表示
          </label>
        </div>

        <button
          onClick={exportSVG}
          className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          SVGエクスポート
        </button>
      </div>

      {/* ホバー情報 */}
      {hoveredCell && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-gray-900">{hoveredCell.process.name}</h3>
          <p className="text-sm text-gray-600">知識エリア: {hoveredCell.area}マネジメント</p>
          <p className="text-sm text-gray-600">プロセス群: {hoveredCell.group}</p>
          <div className="mt-2 pt-2 border-t">
            <p className="text-sm font-semibold">{metrics[selectedMetric].name}: {hoveredCell.value.toFixed(1)}</p>
            {selectedMetric === 'progress' && (
              <p className="text-sm text-gray-600">理解度: {(hoveredCell.value * 10).toFixed(0)}%</p>
            )}
          </div>
        </div>
      )}

      {/* SVGキャンバス */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
    </div>
  );
};

export default React.memo(ProcessHeatmap);