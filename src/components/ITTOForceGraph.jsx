import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Filter, RotateCcw, ZoomIn, ZoomOut, Menu, X } from 'lucide-react';

const ITTOForceGraph = React.memo(() => {
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

  // Process groups and knowledge areas for filtering
  const processGroups = useMemo(() => 
    ['Initiating', 'Planning', 'Executing', 'Monitoring & Controlling', 'Closing'],
  []);
  
  const knowledgeAreas = useMemo(() => 
    ['Integration', 'Scope', 'Schedule', 'Cost', 'Quality',
     'Resource', 'Communications', 'Risk', 'Procurement', 'Stakeholder'],
  []);

  // Color scales
  const knowledgeAreaColors = useMemo(() => ({
    'Integration': '#8B5CF6',
    'Scope': '#3B82F6',
    'Schedule': '#06B6D4',
    'Cost': '#10B981',
    'Quality': '#F59E0B',
    'Resource': '#EF4444',
    'Communications': '#EC4899',
    'Risk': '#6366F1',
    'Procurement': '#84CC16',
    'Stakeholder': '#F97316'
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
        { id: 'p1', name: 'Develop Project Charter', type: 'process', group: 'Initiating', area: 'Integration' },
        { id: 'p2', name: 'Develop Project Management Plan', type: 'process', group: 'Planning', area: 'Integration' },
        { id: 'p3', name: 'Direct and Manage Project Work', type: 'process', group: 'Executing', area: 'Integration' },
        { id: 'p4', name: 'Manage Project Knowledge', type: 'process', group: 'Executing', area: 'Integration' },
        { id: 'p5', name: 'Monitor and Control Project Work', type: 'process', group: 'Monitoring & Controlling', area: 'Integration' },
        { id: 'p6', name: 'Perform Integrated Change Control', type: 'process', group: 'Monitoring & Controlling', area: 'Integration' },
        { id: 'p7', name: 'Close Project or Phase', type: 'process', group: 'Closing', area: 'Integration' },
        
        // Scope Management Processes
        { id: 'p8', name: 'Plan Scope Management', type: 'process', group: 'Planning', area: 'Scope' },
        { id: 'p9', name: 'Collect Requirements', type: 'process', group: 'Planning', area: 'Scope' },
        { id: 'p10', name: 'Define Scope', type: 'process', group: 'Planning', area: 'Scope' },
        { id: 'p11', name: 'Create WBS', type: 'process', group: 'Planning', area: 'Scope' },
        { id: 'p12', name: 'Validate Scope', type: 'process', group: 'Monitoring & Controlling', area: 'Scope' },
        { id: 'p13', name: 'Control Scope', type: 'process', group: 'Monitoring & Controlling', area: 'Scope' },
        
        // Stakeholder Management Processes
        { id: 'p14', name: 'Identify Stakeholders', type: 'process', group: 'Initiating', area: 'Stakeholder' },
        { id: 'p15', name: 'Plan Stakeholder Engagement', type: 'process', group: 'Planning', area: 'Stakeholder' },
        { id: 'p16', name: 'Manage Stakeholder Engagement', type: 'process', group: 'Executing', area: 'Stakeholder' },
        { id: 'p17', name: 'Monitor Stakeholder Engagement', type: 'process', group: 'Monitoring & Controlling', area: 'Stakeholder' },
        
        // Key Inputs
        { id: 'i1', name: 'Business Documents', type: 'input' },
        { id: 'i2', name: 'Agreements', type: 'input' },
        { id: 'i3', name: 'EEF', type: 'input' },
        { id: 'i4', name: 'OPA', type: 'input' },
        { id: 'i5', name: 'Project Charter', type: 'input' },
        { id: 'i6', name: 'Project Management Plan', type: 'input' },
        { id: 'i7', name: 'Project Documents', type: 'input' },
        { id: 'i8', name: 'Work Performance Data', type: 'input' },
        { id: 'i9', name: 'Work Performance Reports', type: 'input' },
        { id: 'i10', name: 'Change Requests', type: 'input' },
        
        // Key Tools
        { id: 't1', name: 'Expert Judgment', type: 'tool' },
        { id: 't2', name: 'Data Gathering', type: 'tool' },
        { id: 't3', name: 'Data Analysis', type: 'tool' },
        { id: 't4', name: 'Decision Making', type: 'tool' },
        { id: 't5', name: 'Meetings', type: 'tool' },
        { id: 't6', name: 'Interpersonal Skills', type: 'tool' },
        { id: 't7', name: 'PMIS', type: 'tool' },
        { id: 't8', name: 'Decomposition', type: 'tool' },
        
        // Key Outputs
        { id: 'o1', name: 'Project Charter', type: 'output' },
        { id: 'o2', name: 'Project Management Plan', type: 'output' },
        { id: 'o3', name: 'Deliverables', type: 'output' },
        { id: 'o4', name: 'Work Performance Data', type: 'output' },
        { id: 'o5', name: 'Work Performance Reports', type: 'output' },
        { id: 'o6', name: 'Change Requests', type: 'output' },
        { id: 'o7', name: 'Project Documents Updates', type: 'output' },
        { id: 'o8', name: 'Stakeholder Register', type: 'output' },
        { id: 'o9', name: 'Requirements Documentation', type: 'output' },
        { id: 'o10', name: 'Scope Baseline', type: 'output' }
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
          return `${d.name}\nGroup: ${d.group}\nArea: ${d.area}`;
        }
        return d.name;
      });

    // Handle node click/touch for focus
    node.on("click touchstart", (event, d) => {
      event.stopPropagation();
      setFocusedNode(d.id);
      
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
          aria-label="Toggle menu"
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
          <h2 className="text-lg md:text-xl font-bold mb-4">PMBOK ITTO Force Graph</h2>
        
          {/* Legend */}
          <div className="mb-4 md:mb-6">
            <h3 className="font-semibold mb-2 text-sm md:text-base">Legend</h3>
            <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span>Process (by Knowledge Area)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 bg-blue-500 transform rotate-45 flex-shrink-0"></div>
                <span>Input</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-6 md:h-6 bg-green-500 flex-shrink-0"></div>
                <span>Tool & Technique</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-0 h-0 border-l-[8px] md:border-l-[12px] border-l-transparent border-r-[8px] md:border-r-[12px] border-r-transparent border-b-[14px] md:border-b-[20px] border-b-amber-500 flex-shrink-0"></div>
                <span>Output</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 md:mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
              <Filter className="w-3 h-3 md:w-4 md:h-4" />
              Filters
            </h3>
          
            <div className="mb-3 md:mb-4">
              <h4 className="text-xs md:text-sm font-medium mb-2">Process Groups</h4>
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
              <h4 className="text-xs md:text-sm font-medium mb-2">Knowledge Areas</h4>
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
            <h3 className="font-semibold mb-2 text-sm md:text-base">Controls</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.zoomIn && window.zoomIn()}
                className="flex items-center gap-1 px-2 md:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs md:text-sm"
              >
                <ZoomIn className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">Zoom In</span>
              </button>
              <button
                onClick={() => window.zoomOut && window.zoomOut()}
                className="flex items-center gap-1 px-2 md:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs md:text-sm"
              >
                <ZoomOut className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">Zoom Out</span>
              </button>
              <button
                onClick={() => window.resetZoom && window.resetZoom()}
                className="flex items-center gap-1 px-2 md:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs md:text-sm"
              >
                <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              • {isMobile ? 'Touch' : 'Click'} node to focus<br/>
              • {isMobile ? 'Drag' : 'Drag'} nodes to reposition<br/>
              • {isMobile ? 'Pinch to zoom, drag to pan' : 'Scroll to zoom, drag to pan'}
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
              <p className="mt-4 text-gray-600">Loading ITTO visualization...</p>
            </div>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full"></svg>
        )}
      </div>
    </div>
  );
});

ITTOForceGraph.displayName = 'ITTOForceGraph';

export default ITTOForceGraph;