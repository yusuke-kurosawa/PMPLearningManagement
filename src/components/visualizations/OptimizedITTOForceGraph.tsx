import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { debounce, throttle } from '@/utils/performance';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useResizeObserver } from '@/hooks/useResizeObserver';

interface Node {
  id: string;
  group: string;
  label?: string;
  type?: string;
}

interface Link {
  source: string | Node;
  target: string | Node;
  type?: string;
}

interface OptimizedITTOForceGraphProps {
  nodes: Node[];
  links: Link[];
  width?: number;
  height?: number;
  useCanvas?: boolean;
  enableClustering?: boolean;
  enableZoom?: boolean;
  enableCollisionDetection?: boolean;
  nodeRadius?: number;
  linkDistance?: number;
  chargeStrength?: number;
  centerStrength?: number;
  onNodeClick?: (node: Node) => void;
  onNodeHover?: (node: Node | null) => void;
  className?: string;
}

// Performance constants
const SIMULATION_ALPHA_MIN = 0.001;
const SIMULATION_ALPHA_DECAY = 0.0228;
const SIMULATION_VELOCITY_DECAY = 0.4;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.5;
const TICK_THROTTLE_MS = 16; // ~60fps
const ZOOM_THROTTLE_MS = 16;
const RESIZE_DEBOUNCE_MS = 250;

const OptimizedITTOForceGraph: React.FC<OptimizedITTOForceGraphProps> = React.memo(({
  nodes,
  links,
  width = 800,
  height = 600,
  useCanvas = true,
  enableClustering = false,
  enableZoom = true,
  enableCollisionDetection = true,
  nodeRadius = 5,
  linkDistance = 30,
  chargeStrength = -30,
  centerStrength = 0.1,
  onNodeClick,
  onNodeHover,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width, height });

  // Use intersection observer for lazy rendering
  const entry = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Use resize observer for responsive rendering
  useResizeObserver(containerRef, debounce((entries) => {
    const { width: newWidth, height: newHeight } = entries[0].contentRect;
    if (newWidth && newHeight) {
      setDimensions({ width: newWidth, height: newHeight });
    }
  }, RESIZE_DEBOUNCE_MS));

  // Memoize processed data
  const processedData = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));
    const processedLinks = links.map(l => ({
      ...l,
      source: typeof l.source === 'string' ? nodeMap.get(l.source) : l.source,
      target: typeof l.target === 'string' ? nodeMap.get(l.target) : l.target
    })).filter(l => l.source && l.target);

    return {
      nodes: Array.from(nodeMap.values()),
      links: processedLinks
    };
  }, [nodes, links]);

  // Canvas rendering function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !simulationRef.current) return;

    const transform = transformRef.current;
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Clear canvas
    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformation
    context.translate(
      transform.x * devicePixelRatio,
      transform.y * devicePixelRatio
    );
    context.scale(
      transform.k * devicePixelRatio,
      transform.k * devicePixelRatio
    );

    // Draw links
    context.globalAlpha = 0.6;
    context.strokeStyle = '#999';
    context.lineWidth = 1;

    processedData.links.forEach(link => {
      const source = link.source as Node & { x?: number; y?: number };
      const target = link.target as Node & { x?: number; y?: number };

      if (source.x !== undefined && source.y !== undefined &&
          target.x !== undefined && target.y !== undefined) {
        context.beginPath();
        context.moveTo(source.x, source.y);
        context.lineTo(target.x, target.y);
        context.stroke();
      }
    });

    // Draw nodes with clustering
    context.globalAlpha = 1;
    const nodeGroups = d3.group(processedData.nodes, d => d.group);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    nodeGroups.forEach((groupNodes, group) => {
      context.fillStyle = colorScale(group);

      groupNodes.forEach(node => {
        const n = node as Node & { x?: number; y?: number };
        if (n.x !== undefined && n.y !== undefined) {
          context.beginPath();
          context.arc(n.x, n.y, nodeRadius, 0, 2 * Math.PI);
          context.fill();
        }
      });
    });

    context.restore();
  }, [processedData, nodeRadius]);

  // SVG rendering function
  const renderSVG = useCallback(() => {
    const svg = d3.select(svgRef.current);
    if (!svg || !simulationRef.current) return;

    const g = svg.select('g.main-group');

    // Update links
    const linkSelection = g.select('g.links')
      .selectAll<SVGLineElement, Link>('line')
      .data(processedData.links, (d: Link) =>
        `${(d.source as Node).id}-${(d.target as Node).id}`
      );

    linkSelection.enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

    linkSelection.exit().remove();

    // Update nodes
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const nodeSelection = g.select('g.nodes')
      .selectAll<SVGCircleElement, Node>('circle')
      .data(processedData.nodes, (d: Node) => d.id);

    nodeSelection.enter()
      .append('circle')
      .attr('r', nodeRadius)
      .attr('fill', d => colorScale(d.group))
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d);
      })
      .on('mouseenter', (event, d) => onNodeHover?.(d))
      .on('mouseleave', () => onNodeHover?.(null));

    nodeSelection.exit().remove();
  }, [processedData, nodeRadius, onNodeClick, onNodeHover]);

  // Throttled tick function
  const handleTick = useMemo(
    () => throttle(() => {
      if (useCanvas) {
        renderCanvas();
      } else {
        const svg = d3.select(svgRef.current);
        const g = svg.select('g.main-group');

        // Update link positions
        g.select('g.links')
          .selectAll<SVGLineElement, Link>('line')
          .attr('x1', d => (d.source as any).x)
          .attr('y1', d => (d.source as any).y)
          .attr('x2', d => (d.target as any).x)
          .attr('y2', d => (d.target as any).y);

        // Update node positions
        g.select('g.nodes')
          .selectAll<SVGCircleElement, Node>('circle')
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);
      }
    }, TICK_THROTTLE_MS),
    [useCanvas, renderCanvas]
  );

  // Initialize simulation
  useEffect(() => {
    if (!isVisible || !processedData.nodes.length) return;

    // Create simulation with optimized parameters
    const simulation = d3.forceSimulation<Node>(processedData.nodes)
      .force('link', d3.forceLink<Node, Link>(processedData.links)
        .id((d: any) => d.id)
        .distance(linkDistance))
      .force('charge', d3.forceManyBody()
        .strength(chargeStrength)
        .distanceMax(200))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
        .strength(centerStrength));

    if (enableCollisionDetection) {
      simulation.force('collide', d3.forceCollide()
        .radius(nodeRadius * 1.5)
        .strength(0.5));
    }

    if (enableClustering) {
      simulation.force('cluster', d3.forceCluster()
        .strength(0.2));
    }

    // Configure simulation performance
    simulation
      .alphaMin(SIMULATION_ALPHA_MIN)
      .alphaDecay(SIMULATION_ALPHA_DECAY)
      .velocityDecay(SIMULATION_VELOCITY_DECAY);

    simulationRef.current = simulation;

    // Setup rendering based on type
    if (useCanvas) {
      const canvas = canvasRef.current;
      if (canvas) {
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * devicePixelRatio;
        canvas.height = dimensions.height * devicePixelRatio;
        canvas.style.width = `${dimensions.width}px`;
        canvas.style.height = `${dimensions.height}px`;
      }
    } else {
      const svg = d3.select(svgRef.current)
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

      // Create main group for transformations
      if (svg.select('g.main-group').empty()) {
        const g = svg.append('g').attr('class', 'main-group');
        g.append('g').attr('class', 'links');
        g.append('g').attr('class', 'nodes');
      }

      renderSVG();
    }

    // Setup zoom behavior
    if (enableZoom) {
      const zoom = d3.zoom<any, any>()
        .scaleExtent([MIN_ZOOM, MAX_ZOOM])
        .on('zoom', throttle((event: d3.D3ZoomEvent<any, any>) => {
          transformRef.current = event.transform;

          if (useCanvas) {
            renderCanvas();
          } else {
            d3.select(svgRef.current)
              .select('g.main-group')
              .attr('transform', event.transform.toString());
          }
        }, ZOOM_THROTTLE_MS));

      if (useCanvas) {
        d3.select(canvasRef.current as any)
          .call(zoom)
          .on('dblclick.zoom', null); // Disable double-click zoom
      } else {
        d3.select(svgRef.current as any)
          .call(zoom)
          .on('dblclick.zoom', null);
      }
    }

    // Setup tick handler
    simulation.on('tick', handleTick);

    // Run simulation
    simulation.restart();

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [
    isVisible,
    processedData,
    dimensions,
    useCanvas,
    enableClustering,
    enableZoom,
    enableCollisionDetection,
    nodeRadius,
    linkDistance,
    chargeStrength,
    centerStrength,
    handleTick,
    renderCanvas,
    renderSVG
  ]);

  // Update visibility when intersection changes
  useEffect(() => {
    setIsVisible(!!entry?.isIntersecting);
  }, [entry]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {useCanvas ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor: enableZoom ? 'grab' : 'default' }}
        />
      ) : (
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ cursor: enableZoom ? 'grab' : 'default' }}
        />
      )}
    </div>
  );
});

OptimizedITTOForceGraph.displayName = 'OptimizedITTOForceGraph';

export default OptimizedITTOForceGraph;