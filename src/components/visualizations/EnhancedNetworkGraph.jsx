import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Filter, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Menu, 
  X, 
  Download,
  Maximize2,
  Settings,
  Palette,
  Layout
} from 'lucide-react';

const EnhancedNetworkGraph = ({ data, onNodeClick }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedLayout, setSelectedLayout] = useState('force');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [nodeSize, setNodeSize] = useState(1);
  const [linkStrength, setLinkStrength] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [hoveredNode, setHoveredNode] = useState(null);

  // レイアウトオプション
  const layouts = {
    force: '力学モデル',
    hierarchical: '階層型',
    circular: '円形',
    radial: '放射状',
    grid: 'グリッド'
  };

  // カラーテーマ
  const themes = {
    default: {
      name: 'デフォルト',
      process: '#8B5CF6',
      input: '#3B82F6',
      tool: '#10B981',
      output: '#F59E0B',
      link: '#999',
      background: '#f3f4f6'
    },
    dark: {
      name: 'ダーク',
      process: '#A78BFA',
      input: '#60A5FA',
      tool: '#34D399',
      output: '#FBBF24',
      link: '#666',
      background: '#1f2937'
    },
    colorblind: {
      name: 'カラーブラインド対応',
      process: '#E69F00',
      input: '#56B4E9',
      tool: '#009E73',
      output: '#F0E442',
      link: '#999',
      background: '#f3f4f6'
    }
  };

  // レスポンシブ対応
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: width || 1200, 
          height: isFullscreen ? window.innerHeight - 100 : (height || 800)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  // レイアウトアルゴリズム
  const applyLayout = useCallback((nodes, links) => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.35;

    switch (selectedLayout) {
      case 'hierarchical':
        // 階層型レイアウト
        const levels = {};
        nodes.forEach(node => {
          const level = node.type === 'process' ? 0 : 
                        node.type === 'input' ? -1 :
                        node.type === 'output' ? 1 : 0;
          if (!levels[level]) levels[level] = [];
          levels[level].push(node);
        });

        Object.entries(levels).forEach(([level, levelNodes]) => {
          const levelY = centerY + parseInt(level) * 150;
          levelNodes.forEach((node, i) => {
            node.fx = (i + 1) * dimensions.width / (levelNodes.length + 1);
            node.fy = levelY;
          });
        });
        break;

      case 'circular':
        // 円形レイアウト
        nodes.forEach((node, i) => {
          const angle = (i / nodes.length) * 2 * Math.PI;
          node.fx = centerX + radius * Math.cos(angle);
          node.fy = centerY + radius * Math.sin(angle);
        });
        break;

      case 'radial':
        // 放射状レイアウト
        const typeGroups = d3.group(nodes, d => d.type);
        let angleOffset = 0;
        typeGroups.forEach((groupNodes, type) => {
          const angleStep = (2 * Math.PI) / typeGroups.size;
          groupNodes.forEach((node, i) => {
            const r = type === 'process' ? 0 : radius * (0.5 + i * 0.1);
            const angle = angleOffset + (i / groupNodes.length) * angleStep;
            node.fx = centerX + r * Math.cos(angle);
            node.fy = centerY + r * Math.sin(angle);
          });
          angleOffset += angleStep;
        });
        break;

      case 'grid':
        // グリッドレイアウト
        const cols = Math.ceil(Math.sqrt(nodes.length));
        nodes.forEach((node, i) => {
          node.fx = ((i % cols) + 1) * dimensions.width / (cols + 1);
          node.fy = (Math.floor(i / cols) + 1) * dimensions.height / (Math.ceil(nodes.length / cols) + 1);
        });
        break;

      default:
        // 力学モデル（デフォルト）
        nodes.forEach(node => {
          node.fx = null;
          node.fy = null;
        });
    }
  }, [selectedLayout, dimensions]);

  // グラフ描画
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const theme = themes[selectedTheme];
    
    // 背景設定
    svg.style('background-color', theme.background);

    // グラフコンテナ
    const g = svg.append('g');

    // ズーム機能
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // ノードとリンクのコピーを作成
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    // シミュレーション設定
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(100)
        .strength(linkStrength))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeSize(d) + 5));

    // レイアウト適用
    applyLayout(nodes, links);

    // リンク描画
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', theme.link)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value || 1));

    // ノード描画
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation));

    // ノード形状
    node.each(function(d) {
      const nodeGroup = d3.select(this);
      const size = getNodeSize(d) * nodeSize;
      const color = getNodeColor(d, theme);

      switch (d.type) {
        case 'process':
          nodeGroup.append('circle')
            .attr('r', size)
            .attr('fill', color);
          break;
        case 'input':
          nodeGroup.append('rect')
            .attr('x', -size)
            .attr('y', -size)
            .attr('width', size * 2)
            .attr('height', size * 2)
            .attr('transform', 'rotate(45)')
            .attr('fill', color);
          break;
        case 'tool':
          nodeGroup.append('rect')
            .attr('x', -size)
            .attr('y', -size)
            .attr('width', size * 2)
            .attr('height', size * 2)
            .attr('fill', color);
          break;
        case 'output':
          nodeGroup.append('polygon')
            .attr('points', `0,-${size} ${size},${size} -${size},${size}`)
            .attr('fill', color);
          break;
      }

      // ノードラベル
      if (showLabels) {
        nodeGroup.append('text')
          .text(d.name)
          .attr('x', 0)
          .attr('y', size + 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', theme.background === '#1f2937' ? '#fff' : '#333');
      }
    });

    // ホバー効果
    node.on('mouseenter', function(event, d) {
      setHoveredNode(d);
      d3.select(this).select('circle, rect, polygon')
        .transition()
        .duration(200)
        .attr('opacity', 0.8)
        .attr('transform', 'scale(1.2)');
    })
    .on('mouseleave', function() {
      setHoveredNode(null);
      d3.select(this).select('circle, rect, polygon')
        .transition()
        .duration(200)
        .attr('opacity', 1)
        .attr('transform', 'scale(1)');
    })
    .on('click', (event, d) => {
      if (onNodeClick) onNodeClick(d);
      
      // 複数選択モード
      if (event.shiftKey) {
        const newSelected = new Set(selectedNodes);
        if (newSelected.has(d.id)) {
          newSelected.delete(d.id);
        } else {
          newSelected.add(d.id);
        }
        setSelectedNodes(newSelected);
      }
    });

    // シミュレーション更新
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // アニメーション速度
    simulation.alphaDecay(0.02 / animationSpeed);

    // ドラッグ機能
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        if (selectedLayout === 'force') {
          event.subject.fx = null;
          event.subject.fy = null;
        }
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, selectedLayout, selectedTheme, animationSpeed, showLabels, nodeSize, linkStrength]);

  // ノードサイズ計算
  const getNodeSize = (node) => {
    const baseSize = node.type === 'process' ? 20 : 15;
    return baseSize;
  };

  // ノード色計算
  const getNodeColor = (node, theme) => {
    return theme[node.type] || '#999';
  };

  // SVGエクスポート
  const exportSVG = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network-graph.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  // フルスクリーン切り替え
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div ref={containerRef} className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'w-full h-full'}`}>
      {/* コントロールパネル */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-4 max-w-xs">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            レイアウト
          </label>
          <select
            value={selectedLayout}
            onChange={(e) => setSelectedLayout(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {Object.entries(layouts).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

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
            アニメーション速度
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ノードサイズ
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={nodeSize}
            onChange={(e) => setNodeSize(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showLabels"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="showLabels" className="text-sm text-gray-700">
            ラベルを表示
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Maximize2 className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={exportSVG}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* ホバー情報 */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-gray-900">{hoveredNode.name}</h3>
          <p className="text-sm text-gray-600">タイプ: {hoveredNode.type}</p>
          {hoveredNode.description && (
            <p className="text-sm text-gray-700 mt-2">{hoveredNode.description}</p>
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

export default React.memo(EnhancedNetworkGraph);