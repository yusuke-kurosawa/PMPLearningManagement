import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Filter, RotateCcw, ZoomIn, ZoomOut, Menu, X } from 'lucide-react';
import { glossaryService } from '../services/glossaryService';
import GlossaryDialog from './GlossaryDialog';
import { useNavigate } from 'react-router-dom';

const ITTOForceGraph = React.memo(() => {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedFilters, setSelectedFilters] = useState({
    processGroups: [],
    knowledgeAreas: []
  });
  const [focusedNode, setFocusedNode] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isMobile, setIsMobile] = useState(false);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState(null);

  // Process groups and knowledge areas for filtering
  const processGroups = useMemo(() => 
    ['立ち上げ', '計画', '実行', '監視・コントロール', '終結'],
  []);
  
  const knowledgeAreas = useMemo(() => 
    ['統合', 'スコープ', 'スケジュール', 'コスト', '品質',
     '資源', 'コミュニケーション', 'リスク', '調達', 'ステークホルダー'],
  []);

  // Color scales
  const knowledgeAreaColors = useMemo(() => ({
    '統合': '#8B5CF6',
    'スコープ': '#3B82F6',
    'スケジュール': '#06B6D4',
    'コスト': '#10B981',
    '品質': '#F59E0B',
    '資源': '#EF4444',
    'コミュニケーション': '#EC4899',
    'リスク': '#6366F1',
    '調達': '#84CC16',
    'ステークホルダー': '#F97316'
  }), []);

  const nodeTypeShapes = useMemo(() => ({
    'process': 'circle',
    'input': 'diamond',
    'tool': 'square',
    'output': 'triangle'
  }), []);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsPanelOpen(window.innerWidth > 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width || 800, height: height || 600 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initialize comprehensive ITTO data
    setIsLoading(true);
    
    // Simulate data loading
    setTimeout(() => {
      const data = {
      nodes: [
        // Integration Management Processes
        { id: 'p1', name: 'プロジェクト憲章の作成', type: 'process', group: '立ち上げ', area: '統合' },
        { id: 'p2', name: 'プロジェクトマネジメント計画書の作成', type: 'process', group: '計画', area: '統合' },
        { id: 'p3', name: 'プロジェクト作業の指揮・マネジメント', type: 'process', group: '実行', area: '統合' },
        { id: 'p4', name: 'プロジェクト知識のマネジメント', type: 'process', group: '実行', area: '統合' },
        { id: 'p5', name: 'プロジェクト作業の監視・コントロール', type: 'process', group: '監視・コントロール', area: '統合' },
        { id: 'p6', name: '統合変更管理', type: 'process', group: '監視・コントロール', area: '統合' },
        { id: 'p7', name: 'プロジェクトやフェーズの終結', type: 'process', group: '終結', area: '統合' },
        
        // Scope Management Processes
        { id: 'p8', name: 'スコープ・マネジメントの計画', type: 'process', group: '計画', area: 'スコープ' },
        { id: 'p9', name: '要求事項の収集', type: 'process', group: '計画', area: 'スコープ' },
        { id: 'p10', name: 'スコープの定義', type: 'process', group: '計画', area: 'スコープ' },
        { id: 'p11', name: 'WBSの作成', type: 'process', group: '計画', area: 'スコープ' },
        { id: 'p12', name: 'スコープの妥当性確認', type: 'process', group: '監視・コントロール', area: 'スコープ' },
        { id: 'p13', name: 'スコープのコントロール', type: 'process', group: '監視・コントロール', area: 'スコープ' },
        
        // Stakeholder Management Processes
        { id: 'p14', name: 'ステークホルダーの特定', type: 'process', group: '立ち上げ', area: 'ステークホルダー' },
        { id: 'p15', name: 'ステークホルダー・エンゲージメントの計画', type: 'process', group: '計画', area: 'ステークホルダー' },
        { id: 'p16', name: 'ステークホルダー・エンゲージメントのマネジメント', type: 'process', group: '実行', area: 'ステークホルダー' },
        { id: 'p17', name: 'ステークホルダー・エンゲージメントの監視', type: 'process', group: '監視・コントロール', area: 'ステークホルダー' },
        
        // Key Inputs
        { id: 'i1', name: 'ビジネス文書', type: 'input' },
        { id: 'i2', name: '合意書', type: 'input' },
        { id: 'i3', name: '組織体の環境要因', type: 'input' },
        { id: 'i4', name: '組織のプロセス資産', type: 'input' },
        { id: 'i5', name: 'プロジェクト憲章', type: 'input' },
        { id: 'i6', name: 'プロジェクトマネジメント計画書', type: 'input' },
        { id: 'i7', name: 'プロジェクト文書', type: 'input' },
        { id: 'i8', name: '作業パフォーマンス・データ', type: 'input' },
        { id: 'i9', name: '作業パフォーマンス報告書', type: 'input' },
        { id: 'i10', name: '変更要求', type: 'input' },
        
        // Key Tools
        { id: 't1', name: '専門家の判断', type: 'tool' },
        { id: 't2', name: 'データ収集', type: 'tool' },
        { id: 't3', name: 'データ分析', type: 'tool' },
        { id: 't4', name: '意思決定', type: 'tool' },
        { id: 't5', name: '会議', type: 'tool' },
        { id: 't6', name: '人間関係とチームに関するスキル', type: 'tool' },
        { id: 't7', name: 'プロジェクトマネジメント情報システム', type: 'tool' },
        { id: 't8', name: '要素分解', type: 'tool' },
        
        // Key Outputs
        { id: 'o1', name: 'プロジェクト憲章', type: 'output' },
        { id: 'o2', name: 'プロジェクトマネジメント計画書', type: 'output' },
        { id: 'o3', name: '成果物', type: 'output' },
        { id: 'o4', name: '作業パフォーマンス・データ', type: 'output' },
        { id: 'o5', name: '作業パフォーマンス報告書', type: 'output' },
        { id: 'o6', name: '変更要求', type: 'output' },
        { id: 'o7', name: 'プロジェクト文書更新版', type: 'output' },
        { id: 'o8', name: 'ステークホルダー登録簿', type: 'output' },
        { id: 'o9', name: '要求事項文書', type: 'output' },
        { id: 'o10', name: 'スコープ・ベースライン', type: 'output' }
      ],
      links: [
        // Develop Project Charter
        { source: 'i1', target: 'p1', type: 'input' },
        { source: 'i2', target: 'p1', type: 'input' },
        { source: 't1', target: 'p1', type: 'tool' },
        { source: 't2', target: 'p1', type: 'tool' },
        { source: 'p1', target: 'o1', type: 'output' },
        
        // Identify Stakeholders
        { source: 'i1', target: 'p14', type: 'input' },
        { source: 'i5', target: 'p14', type: 'input' },
        { source: 't1', target: 'p14', type: 'tool' },
        { source: 't2', target: 'p14', type: 'tool' },
        { source: 'p14', target: 'o8', type: 'output' },
        
        // Develop Project Management Plan
        { source: 'i5', target: 'p2', type: 'input' },
        { source: 'i3', target: 'p2', type: 'input' },
        { source: 't1', target: 'p2', type: 'tool' },
        { source: 't5', target: 'p2', type: 'tool' },
        { source: 'p2', target: 'o2', type: 'output' },
        
        // Direct and Manage Project Work
        { source: 'i6', target: 'p3', type: 'input' },
        { source: 'i7', target: 'p3', type: 'input' },
        { source: 't1', target: 'p3', type: 'tool' },
        { source: 't7', target: 'p3', type: 'tool' },
        { source: 'p3', target: 'o3', type: 'output' },
        { source: 'p3', target: 'o4', type: 'output' },
        { source: 'p3', target: 'o6', type: 'output' },
        
        // Collect Requirements
        { source: 'i5', target: 'p9', type: 'input' },
        { source: 'i6', target: 'p9', type: 'input' },
        { source: 'o8', target: 'p9', type: 'input' },
        { source: 't1', target: 'p9', type: 'tool' },
        { source: 't2', target: 'p9', type: 'tool' },
        { source: 't6', target: 'p9', type: 'tool' },
        { source: 'p9', target: 'o9', type: 'output' },
        
        // Define Scope
        { source: 'i5', target: 'p10', type: 'input' },
        { source: 'i6', target: 'p10', type: 'input' },
        { source: 'o9', target: 'p10', type: 'input' },
        { source: 't1', target: 'p10', type: 'tool' },
        { source: 't3', target: 'p10', type: 'tool' },
        { source: 'p10', target: 'o10', type: 'output' },
        
        // Create WBS
        { source: 'i6', target: 'p11', type: 'input' },
        { source: 'o10', target: 'p11', type: 'input' },
        { source: 't1', target: 'p11', type: 'tool' },
        { source: 't8', target: 'p11', type: 'tool' },
        { source: 'p11', target: 'o10', type: 'output' },
        
        // Process interconnections
        { source: 'o1', target: 'i5', type: 'flow' },
        { source: 'o2', target: 'i6', type: 'flow' },
        { source: 'o4', target: 'i8', type: 'flow' },
        { source: 'o5', target: 'i9', type: 'flow' },
        { source: 'o6', target: 'i10', type: 'flow' }
      ]
      };

      setGraphData(data);
      setIsLoading(false);
    }, 500);
  }, []);

  // Memoized filtered data
  const { filteredNodes, filteredLinks } = useMemo(() => {
    if (!graphData) return { filteredNodes: [], filteredLinks: [] };
    
    let nodes = [...graphData.nodes];
    let links = [...graphData.links];

    if (selectedFilters.processGroups.length > 0 || selectedFilters.knowledgeAreas.length > 0) {
      const processNodeIds = new Set(
        graphData.nodes
          .filter(n => n.type === 'process' && 
            (selectedFilters.processGroups.length === 0 || selectedFilters.processGroups.includes(n.group)) &&
            (selectedFilters.knowledgeAreas.length === 0 || selectedFilters.knowledgeAreas.includes(n.area)))
          .map(n => n.id)
      );

      // Include related nodes
      const relatedNodeIds = new Set(processNodeIds);
      graphData.links.forEach(link => {
        if (processNodeIds.has(link.source.id || link.source) || processNodeIds.has(link.target.id || link.target)) {
          relatedNodeIds.add(link.source.id || link.source);
          relatedNodeIds.add(link.target.id || link.target);
        }
      });

      nodes = graphData.nodes.filter(n => relatedNodeIds.has(n.id));
      links = graphData.links.filter(l => 
        relatedNodeIds.has(l.source.id || l.source) && relatedNodeIds.has(l.target.id || l.target)
      );
    }
    
    return { filteredNodes: nodes, filteredLinks: links };
  }, [graphData, selectedFilters]);

  useEffect(() => {
    if (!graphData || isLoading) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const nodeRadius = isMobile ? 15 : 25;
    const fontSize = isMobile ? '10px' : '12px';
    const linkDistance = isMobile ? 60 : 100;
    const chargeStrength = isMobile ? -200 : -300;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Create container for zoom
    const container = svg.append("g");

    // Add zoom behavior with touch support
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);
    
    // Enable touch gestures
    if (isMobile) {
      svg.on("touchstart", function(event) {
        event.preventDefault();
      });
    }

    // Create arrow markers
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .join("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", nodeRadius + 5)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#999")
      .attr("d", "M0,-5L10,0L0,5");

    // Use pre-filtered data from useMemo

    // Create force simulation
    const simulation = d3.forceSimulation(filteredNodes)
      .force("link", d3.forceLink(filteredLinks).id(d => d.id).distance(linkDistance))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(nodeRadius + 5));

    // Create links
    const link = container.append("g")
      .selectAll("line")
      .data(filteredLinks)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => d.type === 'flow' ? 3 : 2)
      .attr("stroke-dasharray", d => d.type === 'flow' ? "5,5" : "0")
      .attr("marker-end", "url(#arrow)");

    // Create node groups
    const node = container.append("g")
      .selectAll("g")
      .data(filteredNodes)
      .join("g")
      .call(drag(simulation));

    // Add shapes based on node type
    node.each(function(d) {
      const nodeGroup = d3.select(this);
      
      if (d.type === 'process') {
        nodeGroup.append("circle")
          .attr("r", nodeRadius)
          .attr("fill", knowledgeAreaColors[d.area] || "#gray");
      } else if (d.type === 'input') {
        const size = nodeRadius * 1.6;
        nodeGroup.append("rect")
          .attr("width", size)
          .attr("height", size)
          .attr("x", -size/2)
          .attr("y", -size/2)
          .attr("transform", "rotate(45)")
          .attr("fill", "#3B82F6");
      } else if (d.type === 'tool') {
        const size = nodeRadius * 1.6;
        nodeGroup.append("rect")
          .attr("width", size)
          .attr("height", size)
          .attr("x", -size/2)
          .attr("y", -size/2)
          .attr("fill", "#10B981");
      } else if (d.type === 'output') {
        const scale = nodeRadius / 25;
        nodeGroup.append("polygon")
          .attr("points", `0,${-25*scale} ${22*scale},${12*scale} ${-22*scale},${12*scale}`)
          .attr("fill", "#F59E0B");
      }
    });

    // Add labels
    node.append("text")
      .text(d => isMobile ? d.name.substring(0, 15) + (d.name.length > 15 ? '...' : '') : d.name)
      .attr("x", 0)
      .attr("y", nodeRadius + 10)
      .attr("text-anchor", "middle")
      .style("font-size", fontSize)
      .style("pointer-events", "none");

    // Add tooltips
    node.append("title")
      .text(d => {
        if (d.type === 'process') {
          return `${d.name}\nプロセス群: ${d.group}\n知識エリア: ${d.area}`;
        }
        return d.name;
      });

    // Handle node click/touch for focus
    node.on("click touchstart", (event, d) => {
      event.stopPropagation();
      setFocusedNode(d.id);
      
      // Check if the node name matches a glossary term
      const term = glossaryService.getTermByName(d.name);
      if (term) {
        setSelectedGlossaryTerm(term);
      }
      
      // Highlight connected nodes
      const connectedNodes = new Set([d.id]);
      filteredLinks.forEach(link => {
        if (link.source.id === d.id || link.source === d.id) {
          connectedNodes.add(link.target.id || link.target);
        }
        if (link.target.id === d.id || link.target === d.id) {
          connectedNodes.add(link.source.id || link.source);
        }
      });

      // Update opacity
      node.style("opacity", n => connectedNodes.has(n.id) ? 1 : 0.3);
      link.style("opacity", l => 
        (l.source.id === d.id || l.source === d.id || l.target.id === d.id || l.target === d.id) ? 1 : 0.1
      );
    });

    // Clear focus on background click/touch
    svg.on("click touchstart", (event) => {
      if (event.target === svg.node()) {
        setFocusedNode(null);
        node.style("opacity", 1);
        link.style("opacity", 0.6);
      }
    });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag functions with touch support
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
        .filter(event => !event.ctrlKey && !event.button);
    }

    // Zoom control functions
    window.zoomIn = () => {
      svg.transition().call(zoom.scaleBy, 1.3);
    };

    window.zoomOut = () => {
      svg.transition().call(zoom.scaleBy, 0.7);
    };

    window.resetZoom = () => {
      svg.transition().call(zoom.transform, d3.zoomIdentity);
    };

  }, [filteredNodes, filteredLinks, focusedNode, dimensions, isMobile, isLoading, knowledgeAreaColors]);

  const handleFilterChange = useCallback((type, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  return (
    <div className="w-full h-screen flex relative">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={togglePanel}
          className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-2"
          aria-label="メニュー切り替え"
        >
          {isPanelOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}
      
      {/* Control Panel */}
      <div className={`${
        isMobile 
          ? `absolute inset-y-0 left-0 z-10 w-64 transform transition-transform duration-300 ${
              isPanelOpen ? 'translate-x-0' : '-translate-x-full'
            }` 
          : 'w-80'
      } bg-white shadow-lg overflow-y-auto`}>
        <div className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">PMBOK ITTOフォースグラフ</h2>
        
          {/* Legend */}
          <div className="mb-4 md:mb-6">
            <h3 className="font-semibold mb-2 text-sm md:text-base">凡例</h3>
            <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span>プロセス（知識エリア別）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 bg-blue-500 transform rotate-45 flex-shrink-0"></div>
                <span>インプット</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 bg-green-500 flex-shrink-0"></div>
                <span>ツールと技法</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-0 h-0 border-l-[8px] md:border-l-[12px] border-l-transparent border-r-[8px] md:border-r-[12px] border-r-transparent border-b-[14px] md:border-b-[20px] border-b-amber-500 flex-shrink-0"></div>
                <span>アウトプット</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 md:mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
              <Filter className="w-3 h-3 md:w-4 md:h-4" />
              フィルター
            </h3>
          
            <div className="mb-3 md:mb-4">
              <h4 className="text-xs md:text-sm font-medium mb-2">プロセス群</h4>
              <div className="space-y-1">
                {processGroups.map(group => (
                  <label key={group} className="flex items-center gap-2 text-xs md:text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedFilters.processGroups.includes(group)}
                      onChange={() => handleFilterChange('processGroups', group)}
                      className="rounded w-3 h-3 md:w-4 md:h-4"
                    />
                    <span className="truncate">{group}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs md:text-sm font-medium mb-2">知識エリア</h4>
              <div className="space-y-1">
                {knowledgeAreas.map(area => (
                  <label key={area} className="flex items-center gap-2 text-xs md:text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedFilters.knowledgeAreas.includes(area)}
                      onChange={() => handleFilterChange('knowledgeAreas', area)}
                      className="rounded w-3 h-3 md:w-4 md:h-4"
                    />
                    <div className="flex items-center gap-1 md:gap-2">
                      <div 
                        className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: knowledgeAreaColors[area] }}
                      ></div>
                      <span className="truncate">{area}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="border-t pt-3 md:pt-4">
            <h3 className="font-semibold mb-2 text-sm md:text-base">コントロール</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.zoomIn && window.zoomIn()}
                className="flex items-center gap-1 px-2 md:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs md:text-sm"
              >
                <ZoomIn className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">拡大</span>
              </button>
              <button
                onClick={() => window.zoomOut && window.zoomOut()}
                className="flex items-center gap-1 px-2 md:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs md:text-sm"
              >
                <ZoomOut className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">縮小</span>
              </button>
              <button
                onClick={() => window.resetZoom && window.resetZoom()}
                className="flex items-center gap-1 px-2 md:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs md:text-sm"
              >
                <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">リセット</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              • ノードを{isMobile ? 'タッチ' : 'クリック'}してフォーカス<br/>
              • ノードをドラッグして位置変更<br/>
              • {isMobile ? 'ピンチでズーム、ドラッグでパン' : 'スクロールでズーム、ドラッグでパン'}
            </p>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div ref={containerRef} className="flex-1 bg-gray-50 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">ITTO ビジュアライゼーションを読み込み中...</p>
            </div>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full"></svg>
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

ITTOForceGraph.displayName = 'ITTOForceGraph';

export default ITTOForceGraph;