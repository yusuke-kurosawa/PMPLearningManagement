import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, sankeyLeft, sankeyRight, sankeyCenter, sankeyJustify } from 'd3-sankey';
import { Download, Settings, Palette, AlignLeft, AlignRight, AlignCenter, AlignJustify } from 'lucide-react';

const SankeyDiagram = ({ data }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [selectedAlignment, setSelectedAlignment] = useState('justify');
  const [nodeWidth, setNodeWidth] = useState(15);
  const [nodePadding, setNodePadding] = useState(10);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  // カラーテーマ
  const themes = {
    default: {
      name: 'デフォルト',
      processGroup: {
        '立ち上げ': '#8B5CF6',
        '計画': '#3B82F6',
        '実行': '#10B981',
        '監視・コントロール': '#F59E0B',
        '終結': '#EF4444'
      },
      link: '#e0e0e0',
      linkHover: '#999',
      text: '#333',
      background: '#f9fafb'
    },
    ocean: {
      name: 'オーシャン',
      processGroup: {
        '立ち上げ': '#0891b2',
        '計画': '#0e7490',
        '実行': '#155e75',
        '監視・コントロール': '#164e63',
        '終結': '#134e4a'
      },
      link: '#cbd5e1',
      linkHover: '#64748b',
      text: '#1e293b',
      background: '#f0f9ff'
    },
    sunset: {
      name: 'サンセット',
      processGroup: {
        '立ち上げ': '#f97316',
        '計画': '#ea580c',
        '実行': '#dc2626',
        '監視・コントロール': '#b91c1c',
        '終結': '#991b1b'
      },
      link: '#fed7aa',
      linkHover: '#fb923c',
      text: '#451a03',
      background: '#fff7ed'
    }
  };

  // アラインメントオプション
  const alignments = {
    left: { name: '左寄せ', icon: AlignLeft, func: sankeyLeft },
    right: { name: '右寄せ', icon: AlignRight, func: sankeyRight },
    center: { name: '中央', icon: AlignCenter, func: sankeyCenter },
    justify: { name: '均等', icon: AlignJustify, func: sankeyJustify }
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

  // サンキーデータの準備
  const sankeyData = useMemo(() => {
    if (!data) return null;

    // ノードの作成（プロセス群とプロセス）
    const nodes = [];
    const nodeMap = new Map();
    let nodeIndex = 0;

    // プロセス群ノード
    const processGroups = ['立ち上げ', '計画', '実行', '監視・コントロール', '終結'];
    processGroups.forEach(group => {
      const node = { id: `pg_${group}`, name: group, type: 'processGroup', index: nodeIndex++ };
      nodes.push(node);
      nodeMap.set(node.id, node);
    });

    // プロセスノード（知識エリア別にグループ化）
    const processNodes = data.nodes.filter(n => n.type === 'process');
    const knowledgeAreas = [...new Set(processNodes.map(p => p.area))];
    
    knowledgeAreas.forEach(area => {
      const areaProcesses = processNodes.filter(p => p.area === area);
      areaProcesses.forEach(process => {
        const node = {
          id: process.id,
          name: process.name,
          type: 'process',
          area: process.area,
          group: process.group,
          index: nodeIndex++
        };
        nodes.push(node);
        nodeMap.set(node.id, node);
      });
    });

    // アウトプットノード（主要なもののみ）
    const majorOutputs = [
      'プロジェクト憲章',
      'プロジェクトマネジメント計画書',
      '成果物',
      '作業パフォーマンス・データ',
      '作業パフォーマンス報告書',
      '変更要求',
      '最終報告書'
    ];

    majorOutputs.forEach(outputName => {
      const outputNode = data.nodes.find(n => n.type === 'output' && n.name === outputName);
      if (outputNode) {
        const node = {
          id: outputNode.id,
          name: outputNode.name,
          type: 'output',
          index: nodeIndex++
        };
        nodes.push(node);
        nodeMap.set(node.id, node);
      }
    });

    // リンクの作成
    const links = [];
    
    // プロセス群からプロセスへのリンク
    processNodes.forEach(process => {
      const sourceId = `pg_${process.group}`;
      if (nodeMap.has(sourceId) && nodeMap.has(process.id)) {
        links.push({
          source: nodeMap.get(sourceId).index,
          target: nodeMap.get(process.id).index,
          value: 1,
          type: 'group-to-process'
        });
      }
    });

    // プロセスからアウトプットへのリンク
    data.links.forEach(link => {
      if (link.type === 'output') {
        const sourceNode = nodeMap.get(link.source.id || link.source);
        const targetNode = nodeMap.get(link.target.id || link.target);
        if (sourceNode && targetNode && targetNode.type === 'output') {
          links.push({
            source: sourceNode.index,
            target: targetNode.index,
            value: 1,
            type: 'process-to-output',
            originalLink: link
          });
        }
      }
    });

    return { nodes, links };
  }, [data]);

  // サンキーダイアグラムの描画
  useEffect(() => {
    if (!sankeyData || !svgRef.current) return;

    const theme = themes[selectedTheme];
    const margin = { top: 40, right: 150, bottom: 40, left: 150 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // SVGのクリア
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 背景色設定
    svg.style('background-color', theme.background);

    // グループの作成
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // サンキージェネレータの設定
    const sankeyGenerator = sankey()
      .nodeId(d => d.index)
      .nodeAlign(alignments[selectedAlignment].func)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .extent([[0, 0], [width, height]]);

    // データの処理
    const graph = sankeyGenerator({
      nodes: sankeyData.nodes.map(d => ({ ...d })),
      links: sankeyData.links.map(d => ({ ...d }))
    });

    // リンクの描画
    const link = g.append('g')
      .attr('fill', 'none')
      .selectAll('g')
      .data(graph.links)
      .join('g')
      .style('mix-blend-mode', 'multiply');

    link.append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => {
        if (d.type === 'group-to-process') {
          const targetNode = graph.nodes[d.target];
          return theme.processGroup[targetNode.group] || theme.link;
        }
        return theme.link;
      })
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('opacity', 0.5)
      .on('mouseenter', function(event, d) {
        setHoveredLink(d);
        d3.select(this)
          .attr('stroke', theme.linkHover)
          .attr('opacity', 0.8);
      })
      .on('mouseleave', function(event, d) {
        setHoveredLink(null);
        d3.select(this)
          .attr('stroke', d.type === 'group-to-process' 
            ? theme.processGroup[graph.nodes[d.target].group] || theme.link
            : theme.link)
          .attr('opacity', 0.5);
      });

    // ノードの描画
    const node = g.append('g')
      .selectAll('g')
      .data(graph.nodes)
      .join('g');

    node.append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => {
        if (d.type === 'processGroup') {
          return theme.processGroup[d.name];
        } else if (d.type === 'process') {
          return d3.color(theme.processGroup[d.group]).brighter(0.5);
        } else {
          return '#94a3b8';
        }
      })
      .attr('stroke', d => d3.color(
        d.type === 'processGroup' ? theme.processGroup[d.name] :
        d.type === 'process' ? theme.processGroup[d.group] :
        '#64748b'
      ).darker(0.5))
      .attr('stroke-width', 1)
      .on('mouseenter', function(event, d) {
        setHoveredNode(d);
        d3.select(this)
          .attr('opacity', 0.8);
      })
      .on('mouseleave', function() {
        setHoveredNode(null);
        d3.select(this)
          .attr('opacity', 1);
      });

    // ノードラベルの描画
    node.append('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .attr('font-size', d => d.type === 'processGroup' ? '14px' : '12px')
      .attr('font-weight', d => d.type === 'processGroup' ? 'bold' : 'normal')
      .attr('fill', theme.text)
      .text(d => d.name)
      .append('tspan')
      .attr('fill', '#666')
      .attr('font-size', '10px')
      .attr('dy', '1.2em')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .text(d => d.type === 'process' ? `(${d.area})` : '');

    // タイトル
    svg.append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', theme.text)
      .text('PMBOKプロセスフロー サンキーダイアグラム');

  }, [sankeyData, dimensions, selectedTheme, selectedAlignment, nodeWidth, nodePadding]);

  // SVGエクスポート
  const exportSVG = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pmbok-sankey-diagram.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-50">
      {/* コントロールパネル */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-4 max-w-xs">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カラーテーマ
          </label>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {Object.entries(themes).map(([key, theme]) => (
              <option key={key} value={key}>{theme.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ノード配置
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(alignments).map(([key, alignment]) => {
              const Icon = alignment.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedAlignment(key)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md ${
                    selectedAlignment === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{alignment.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ノード幅: {nodeWidth}px
          </label>
          <input
            type="range"
            min="5"
            max="30"
            value={nodeWidth}
            onChange={(e) => setNodeWidth(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ノード間隔: {nodePadding}px
          </label>
          <input
            type="range"
            min="5"
            max="30"
            value={nodePadding}
            onChange={(e) => setNodePadding(Number(e.target.value))}
            className="w-full"
          />
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
      {(hoveredNode || hoveredLink) && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          {hoveredNode && (
            <>
              <h3 className="font-semibold text-gray-900">{hoveredNode.name}</h3>
              {hoveredNode.type === 'process' && (
                <>
                  <p className="text-sm text-gray-600">プロセス群: {hoveredNode.group}</p>
                  <p className="text-sm text-gray-600">知識エリア: {hoveredNode.area}</p>
                </>
              )}
              <p className="text-sm text-gray-600">タイプ: {
                hoveredNode.type === 'processGroup' ? 'プロセス群' :
                hoveredNode.type === 'process' ? 'プロセス' :
                'アウトプット'
              }</p>
            </>
          )}
          {hoveredLink && (
            <>
              <p className="text-sm text-gray-600">
                接続: {hoveredLink.type === 'group-to-process' ? 'プロセス群 → プロセス' : 'プロセス → アウトプット'}
              </p>
            </>
          )}
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

export default React.memo(SankeyDiagram);