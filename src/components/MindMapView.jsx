import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Download, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

const MindMapView = ({ data }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

  // レスポンシブ対応
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: width || 1200, 
          height: isFullscreen ? window.innerHeight : (height || 800)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  // マインドマップデータの準備
  const mindMapData = useMemo(() => {
    if (!data) return null;

    // ルートノード（PMBOK）
    const root = {
      id: 'root',
      name: 'PMBOK第6版',
      children: []
    };

    // 知識エリアでグループ化
    const knowledgeAreas = {};
    const processes = data.nodes.filter(n => n.type === 'process');

    processes.forEach(process => {
      if (!knowledgeAreas[process.area]) {
        knowledgeAreas[process.area] = {
          id: `area_${process.area}`,
          name: `${process.area}マネジメント`,
          area: process.area,
          children: []
        };
      }

      // プロセス群でサブグループ化
      let processGroupNode = knowledgeAreas[process.area].children.find(
        pg => pg.name === process.group
      );

      if (!processGroupNode) {
        processGroupNode = {
          id: `${process.area}_${process.group}`,
          name: process.group,
          group: process.group,
          children: []
        };
        knowledgeAreas[process.area].children.push(processGroupNode);
      }

      // プロセスノード
      const processNode = {
        id: process.id,
        name: process.name,
        type: 'process',
        area: process.area,
        group: process.group,
        children: []
      };

      // ITTO情報を子ノードとして追加
      const ittoCategories = {
        inputs: { name: 'インプット', items: [] },
        tools: { name: 'ツールと技法', items: [] },
        outputs: { name: 'アウトプット', items: [] }
      };

      // リンクからITTO情報を収集
      data.links.forEach(link => {
        if (link.source === process.id || link.source.id === process.id) {
          const target = data.nodes.find(n => n.id === (link.target.id || link.target));
          if (target) {
            if (link.type === 'input' && target.type === 'input') {
              ittoCategories.inputs.items.push(target.name);
            } else if (link.type === 'tool' && target.type === 'tool') {
              ittoCategories.tools.items.push(target.name);
            } else if (link.type === 'output' && target.type === 'output') {
              ittoCategories.outputs.items.push(target.name);
            }
          }
        }
      });

      // ITTO情報を子ノードとして追加
      Object.entries(ittoCategories).forEach(([key, category]) => {
        if (category.items.length > 0) {
          const categoryNode = {
            id: `${process.id}_${key}`,
            name: `${category.name} (${category.items.length})`,
            type: 'category',
            children: category.items.slice(0, 5).map((item, idx) => ({
              id: `${process.id}_${key}_${idx}`,
              name: item,
              type: key.slice(0, -1)
            }))
          };
          processNode.children.push(categoryNode);
        }
      });

      processGroupNode.children.push(processNode);
    });

    // 知識エリアをルートに追加
    root.children = Object.values(knowledgeAreas).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    return root;
  }, [data]);

  // マインドマップの描画
  useEffect(() => {
    if (!mindMapData || !svgRef.current) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    // SVGのクリア
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // グループの作成
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // ズーム機能
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', `translate(${width / 2},${height / 2}) scale(${event.transform.k})`);
      });

    svg.call(zoom);

    // ツリーレイアウト（放射状）
    const tree = d3.tree()
      .size([2 * Math.PI, Math.min(width, height) / 2 - 150])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // 階層データの作成
    const hierarchyData = d3.hierarchy(mindMapData);
    
    // ノードの展開/折りたたみ状態を適用
    hierarchyData.each(node => {
      if (!expandedNodes.has(node.data.id) && node.children) {
        node._children = node.children;
        node.children = null;
      }
    });

    const treeData = tree(hierarchyData);
    const nodes = treeData.descendants();
    const links = treeData.links();

    // カラースケール
    const colorScale = d3.scaleOrdinal()
      .domain(['統合', 'スコープ', 'スケジュール', 'コスト', '品質', '資源', 'コミュニケーション', 'リスク', '調達', 'ステークホルダー'])
      .range(['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#84CC16', '#F97316']);

    const processGroupColors = {
      '立ち上げ': '#9333ea',
      '計画': '#2563eb',
      '実行': '#059669',
      '監視・コントロール': '#d97706',
      '終結': '#dc2626'
    };

    // リンクの描画
    const link = g.selectAll('.link')
      .data(links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y))
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2);

    // ノードグループ
    const node = g.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `);

    // ノード円
    node.append('circle')
      .attr('r', d => {
        if (d.depth === 0) return 30;
        if (d.depth === 1) return 20;
        if (d.depth === 2) return 15;
        if (d.depth === 3) return 10;
        return 5;
      })
      .attr('fill', d => {
        if (d.depth === 0) return '#6366f1';
        if (d.depth === 1) return colorScale(d.data.area);
        if (d.depth === 2) return processGroupColors[d.data.group] || '#94a3b8';
        if (d.depth === 3) return '#e5e7eb';
        return '#f3f4f6';
      })
      .attr('stroke', d => {
        if (d.children || d._children) return '#333';
        return 'none';
      })
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        
        // ノードの展開/折りたたみ
        if (d.children || d._children) {
          const newExpanded = new Set(expandedNodes);
          if (d.children) {
            d._children = d.children;
            d.children = null;
            newExpanded.delete(d.data.id);
          } else {
            d.children = d._children;
            d._children = null;
            newExpanded.add(d.data.id);
          }
          setExpandedNodes(newExpanded);
        }
        
        setSelectedNode(d.data);
      });

    // ノードテキスト
    node.append('text')
      .attr('dy', '.31em')
      .attr('x', d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr('text-anchor', d => d.x < Math.PI === !d.children ? 'start' : 'end')
      .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
      .attr('font-size', d => {
        if (d.depth === 0) return '16px';
        if (d.depth === 1) return '14px';
        if (d.depth === 2) return '12px';
        return '10px';
      })
      .attr('font-weight', d => d.depth <= 1 ? 'bold' : 'normal')
      .text(d => {
        if (d.data.name.length > 20) {
          return d.data.name.substring(0, 20) + '...';
        }
        return d.data.name;
      })
      .style('cursor', 'pointer');

    // 展開/折りたたみインジケーター
    node.filter(d => d.children || d._children)
      .append('text')
      .attr('x', d => d.x < Math.PI === !d.children ? -15 : 15)
      .attr('dy', '.31em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => d.children ? '−' : '+')
      .style('cursor', 'pointer');

    // ズームコントロール関数
    window.zoomIn = () => {
      svg.transition().call(zoom.scaleBy, 1.3);
    };

    window.zoomOut = () => {
      svg.transition().call(zoom.scaleBy, 0.7);
    };

    window.resetZoom = () => {
      svg.transition().call(zoom.transform, d3.zoomIdentity);
    };

  }, [mindMapData, dimensions, expandedNodes]);

  // SVGエクスポート
  const exportSVG = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pmbok-mindmap.svg';
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
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => window.zoomIn && window.zoomIn()}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            title="拡大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.zoomOut && window.zoomOut()}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            title="縮小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.resetZoom && window.resetZoom()}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            title="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
            title={isFullscreen ? '通常表示' : 'フルスクリーン'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={exportSVG}
            className="p-2 bg-green-600 text-white hover:bg-green-700 rounded-md"
            title="エクスポート"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          • ノードをクリックして展開/折りたたみ<br/>
          • ドラッグでパン、スクロールでズーム
        </p>
      </div>

      {/* 選択ノード情報 */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-gray-900">{selectedNode.name}</h3>
          {selectedNode.area && (
            <p className="text-sm text-gray-600">知識エリア: {selectedNode.area}</p>
          )}
          {selectedNode.group && (
            <p className="text-sm text-gray-600">プロセス群: {selectedNode.group}</p>
          )}
          {selectedNode.type && (
            <p className="text-sm text-gray-600">タイプ: {selectedNode.type}</p>
          )}
        </div>
      )}

      {/* SVGキャンバス */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ background: '#f9fafb' }}
      />
    </div>
  );
};

export default React.memo(MindMapView);