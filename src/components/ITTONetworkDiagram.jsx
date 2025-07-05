import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Circle, Square, Triangle, Info } from 'lucide-react';

const ITTONetworkDiagram = () => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Comprehensive ITTO data for PMBOK processes
  const ittoData = {
    processes: [
      {
        id: 'charter',
        name: 'Develop Project Charter',
        group: 'Initiating',
        area: 'Integration',
        position: { x: 200, y: 100 }
      },
      {
        id: 'plan',
        name: 'Develop Project Management Plan',
        group: 'Planning',
        area: 'Integration',
        position: { x: 400, y: 200 }
      },
      {
        id: 'direct',
        name: 'Direct and Manage Project Work',
        group: 'Executing',
        area: 'Integration',
        position: { x: 600, y: 300 }
      },
      {
        id: 'knowledge',
        name: 'Manage Project Knowledge',
        group: 'Executing',
        area: 'Integration',
        position: { x: 800, y: 200 }
      },
      {
        id: 'monitor',
        name: 'Monitor and Control Project Work',
        group: 'Monitoring & Controlling',
        area: 'Integration',
        position: { x: 700, y: 400 }
      },
      {
        id: 'change',
        name: 'Perform Integrated Change Control',
        group: 'Monitoring & Controlling',
        area: 'Integration',
        position: { x: 500, y: 500 }
      },
      {
        id: 'close',
        name: 'Close Project or Phase',
        group: 'Closing',
        area: 'Integration',
        position: { x: 900, y: 500 }
      },
      {
        id: 'stakeholders',
        name: 'Identify Stakeholders',
        group: 'Initiating',
        area: 'Stakeholder',
        position: { x: 300, y: 50 }
      },
      {
        id: 'requirements',
        name: 'Collect Requirements',
        group: 'Planning',
        area: 'Scope',
        position: { x: 300, y: 300 }
      },
      {
        id: 'scope',
        name: 'Define Scope',
        group: 'Planning',
        area: 'Scope',
        position: { x: 400, y: 350 }
      },
      {
        id: 'wbs',
        name: 'Create WBS',
        group: 'Planning',
        area: 'Scope',
        position: { x: 500, y: 400 }
      }
    ],
    inputs: [
      { id: 'i1', name: 'Business Documents', type: 'input', position: { x: 50, y: 100 } },
      { id: 'i2', name: 'Agreements', type: 'input', position: { x: 50, y: 150 } },
      { id: 'i3', name: 'Enterprise Environmental Factors', type: 'input', position: { x: 50, y: 200 } },
      { id: 'i4', name: 'Organizational Process Assets', type: 'input', position: { x: 50, y: 250 } },
      { id: 'i5', name: 'Project Charter', type: 'input', position: { x: 350, y: 100 } },
      { id: 'i6', name: 'Stakeholder Register', type: 'input', position: { x: 450, y: 50 } },
      { id: 'i7', name: 'Requirements Documentation', type: 'input', position: { x: 450, y: 300 } }
    ],
    tools: [
      { id: 't1', name: 'Expert Judgment', type: 'tool', position: { x: 150, y: 400 } },
      { id: 't2', name: 'Data Gathering', type: 'tool', position: { x: 150, y: 450 } },
      { id: 't3', name: 'Meetings', type: 'tool', position: { x: 150, y: 500 } },
      { id: 't4', name: 'Interpersonal Skills', type: 'tool', position: { x: 150, y: 550 } },
      { id: 't5', name: 'Decomposition', type: 'tool', position: { x: 350, y: 450 } }
    ],
    outputs: [
      { id: 'o1', name: 'Project Charter', type: 'output', position: { x: 350, y: 100 } },
      { id: 'o2', name: 'Project Management Plan', type: 'output', position: { x: 550, y: 200 } },
      { id: 'o3', name: 'Deliverables', type: 'output', position: { x: 750, y: 300 } },
      { id: 'o4', name: 'Work Performance Data', type: 'output', position: { x: 850, y: 350 } },
      { id: 'o5', name: 'Change Requests', type: 'output', position: { x: 650, y: 500 } },
      { id: 'o6', name: 'Stakeholder Register', type: 'output', position: { x: 450, y: 50 } },
      { id: 'o7', name: 'Requirements Documentation', type: 'output', position: { x: 450, y: 300 } },
      { id: 'o8', name: 'Project Scope Statement', type: 'output', position: { x: 550, y: 350 } },
      { id: 'o9', name: 'WBS', type: 'output', position: { x: 650, y: 400 } }
    ],
    connections: [
      // Develop Project Charter connections
      { from: 'i1', to: 'charter', type: 'input' },
      { from: 'i2', to: 'charter', type: 'input' },
      { from: 'i3', to: 'charter', type: 'input' },
      { from: 'i4', to: 'charter', type: 'input' },
      { from: 't1', to: 'charter', type: 'tool' },
      { from: 't2', to: 'charter', type: 'tool' },
      { from: 't3', to: 'charter', type: 'tool' },
      { from: 'charter', to: 'o1', type: 'output' },
      
      // Identify Stakeholders connections
      { from: 'i1', to: 'stakeholders', type: 'input' },
      { from: 'i2', to: 'stakeholders', type: 'input' },
      { from: 'o1', to: 'stakeholders', type: 'input' },
      { from: 't1', to: 'stakeholders', type: 'tool' },
      { from: 't2', to: 'stakeholders', type: 'tool' },
      { from: 'stakeholders', to: 'o6', type: 'output' },
      
      // Develop Project Management Plan
      { from: 'o1', to: 'plan', type: 'input' },
      { from: 'i3', to: 'plan', type: 'input' },
      { from: 'i4', to: 'plan', type: 'input' },
      { from: 't1', to: 'plan', type: 'tool' },
      { from: 't3', to: 'plan', type: 'tool' },
      { from: 'plan', to: 'o2', type: 'output' },
      
      // Collect Requirements
      { from: 'o1', to: 'requirements', type: 'input' },
      { from: 'o2', to: 'requirements', type: 'input' },
      { from: 'o6', to: 'requirements', type: 'input' },
      { from: 't1', to: 'requirements', type: 'tool' },
      { from: 't2', to: 'requirements', type: 'tool' },
      { from: 't4', to: 'requirements', type: 'tool' },
      { from: 'requirements', to: 'o7', type: 'output' },
      
      // Define Scope
      { from: 'o1', to: 'scope', type: 'input' },
      { from: 'o2', to: 'scope', type: 'input' },
      { from: 'o7', to: 'scope', type: 'input' },
      { from: 't1', to: 'scope', type: 'tool' },
      { from: 'scope', to: 'o8', type: 'output' },
      
      // Create WBS
      { from: 'o2', to: 'wbs', type: 'input' },
      { from: 'o8', to: 'wbs', type: 'input' },
      { from: 't1', to: 'wbs', type: 'tool' },
      { from: 't5', to: 'wbs', type: 'tool' },
      { from: 'wbs', to: 'o9', type: 'output' },
      
      // Direct and Manage Project Work
      { from: 'o2', to: 'direct', type: 'input' },
      { from: 'i3', to: 'direct', type: 'input' },
      { from: 'i4', to: 'direct', type: 'input' },
      { from: 't1', to: 'direct', type: 'tool' },
      { from: 'direct', to: 'o3', type: 'output' },
      { from: 'direct', to: 'o4', type: 'output' },
      { from: 'direct', to: 'o5', type: 'output' },
      
      // Process outputs feeding into other processes
      { from: 'o1', to: 'i5', type: 'flow' },
      { from: 'o6', to: 'i6', type: 'flow' },
      { from: 'o7', to: 'i7', type: 'flow' }
    ]
  };

  // Combine all nodes for easier access
  const allNodes = useMemo(() => {
    return [
      ...ittoData.processes,
      ...ittoData.inputs,
      ...ittoData.tools,
      ...ittoData.outputs
    ];
  }, []);

  // Get connected nodes for highlighting
  const getConnectedNodes = (nodeId) => {
    const connected = new Set();
    ittoData.connections.forEach(conn => {
      if (conn.from === nodeId) {
        connected.add(conn.to);
      } else if (conn.to === nodeId) {
        connected.add(conn.from);
      }
    });
    return connected;
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get node color based on type
  const getNodeColor = (node) => {
    if (node.type === 'input') return '#3B82F6'; // blue
    if (node.type === 'tool') return '#10B981'; // green
    if (node.type === 'output') return '#F59E0B'; // amber
    if (node.group === 'Initiating') return '#8B5CF6'; // violet
    if (node.group === 'Planning') return '#3B82F6'; // blue
    if (node.group === 'Executing') return '#10B981'; // green
    if (node.group === 'Monitoring & Controlling') return '#F59E0B'; // amber
    if (node.group === 'Closing') return '#EF4444'; // red
    return '#6B7280'; // gray
  };

  // Get node shape component
  const getNodeShape = (node) => {
    if (node.type === 'input') return Circle;
    if (node.type === 'tool') return Square;
    if (node.type === 'output') return Triangle;
    return Circle;
  };

  // Calculate path for connections with curves
  const calculatePath = (from, to) => {
    const fromNode = allNodes.find(n => n.id === from);
    const toNode = allNodes.find(n => n.id === to);
    
    if (!fromNode || !toNode) return '';
    
    const dx = toNode.position.x - fromNode.position.x;
    const dy = toNode.position.y - fromNode.position.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    
    return `M ${fromNode.position.x} ${fromNode.position.y} A ${dr},${dr} 0 0,1 ${toNode.position.x} ${toNode.position.y}`;
  };

  // Handle mouse wheel for zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(2, prev * delta)));
  };

  // Handle drag for pan
  const handleMouseDown = (e) => {
    if (e.target === svgRef.current) {
      const startX = e.clientX - pan.x;
      const startY = e.clientY - pan.y;
      
      const handleMouseMove = (e) => {
        setPan({
          x: e.clientX - startX,
          y: e.clientY - startY
        });
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const connectedNodes = hoveredNode ? getConnectedNodes(hoveredNode) : new Set();

  return (
    <div className="w-full h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
        <h2 className="text-lg font-bold mb-2">PMBOK ITTO Network Diagram</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Circle className="w-4 h-4 text-blue-500" />
            <span>Inputs / Process (Initiating)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Square className="w-4 h-4 text-green-500" />
            <span>Tools & Techniques</span>
          </div>
          <div className="flex items-center space-x-2">
            <Triangle className="w-4 h-4 text-amber-500" />
            <span>Outputs</span>
          </div>
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-gray-600">Scroll to zoom, drag to pan</p>
            <p className="text-xs text-gray-600">Click nodes for details</p>
          </div>
        </div>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{ cursor: 'grab' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6B7280"
            />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render connections */}
          {ittoData.connections.map((conn, idx) => {
            const isHighlighted = hoveredNode && (conn.from === hoveredNode || conn.to === hoveredNode);
            const fromNode = allNodes.find(n => n.id === conn.from);
            const toNode = allNodes.find(n => n.id === conn.to);
            
            if (!fromNode || !toNode) return null;
            
            return (
              <g key={idx}>
                <line
                  x1={fromNode.position.x}
                  y1={fromNode.position.y}
                  x2={toNode.position.x}
                  y2={toNode.position.y}
                  stroke={isHighlighted ? '#3B82F6' : '#E5E7EB'}
                  strokeWidth={isHighlighted ? 3 : 2}
                  markerEnd="url(#arrowhead)"
                  opacity={hoveredNode && !isHighlighted ? 0.2 : 1}
                  style={{
                    transition: 'all 0.3s ease',
                    filter: isHighlighted ? 'url(#glow)' : 'none'
                  }}
                >
                  {isHighlighted && (
                    <animate
                      attributeName="stroke-dasharray"
                      values="0,5;5,5"
                      dur="0.5s"
                      repeatCount="indefinite"
                    />
                  )}
                </line>
              </g>
            );
          })}

          {/* Render nodes */}
          {allNodes.map(node => {
            const isHighlighted = hoveredNode === node.id || connectedNodes.has(node.id);
            const NodeShape = getNodeShape(node);
            const color = getNodeColor(node);
            
            return (
              <g
                key={node.id}
                transform={`translate(${node.position.x}, ${node.position.y})`}
                className="cursor-pointer"
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                opacity={hoveredNode && !isHighlighted && hoveredNode !== node.id ? 0.3 : 1}
                style={{ transition: 'all 0.3s ease' }}
              >
                <circle
                  r={isHighlighted ? 35 : 30}
                  fill="white"
                  stroke={color}
                  strokeWidth={isHighlighted ? 4 : 2}
                  filter={isHighlighted ? 'url(#glow)' : 'none'}
                />
                {node.type === 'input' && (
                  <Circle
                    x={-12}
                    y={-12}
                    size={24}
                    color={color}
                  />
                )}
                {node.type === 'tool' && (
                  <Square
                    x={-12}
                    y={-12}
                    size={24}
                    color={color}
                  />
                )}
                {node.type === 'output' && (
                  <Triangle
                    x={-12}
                    y={-12}
                    size={24}
                    color={color}
                  />
                )}
                {!node.type && (
                  <Circle
                    x={-12}
                    y={-12}
                    size={24}
                    color={color}
                    fill={color}
                  />
                )}
                <text
                  y={45}
                  textAnchor="middle"
                  className="text-xs font-medium pointer-events-none"
                  fill="#374151"
                >
                  {node.name.length > 20 ? node.name.substring(0, 20) + '...' : node.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Node details modal */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-6 max-w-md z-10">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">{selectedNode.name}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            {selectedNode.type && (
              <p><span className="font-semibold">Type:</span> {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}</p>
            )}
            {selectedNode.group && (
              <p><span className="font-semibold">Process Group:</span> {selectedNode.group}</p>
            )}
            {selectedNode.area && (
              <p><span className="font-semibold">Knowledge Area:</span> {selectedNode.area}</p>
            )}
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-600 flex items-center">
                <Info className="w-4 h-4 mr-1" />
                Click other nodes to explore relationships
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITTONetworkDiagram;