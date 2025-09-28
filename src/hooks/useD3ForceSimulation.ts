import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

/**
 * Node types for the force simulation
 */
export type NodeType = 'process' | 'input' | 'tool' | 'output';

/**
 * Link types for the force simulation
 */
export type LinkType = 'input' | 'tool' | 'output' | 'flow';

/**
 * Base node structure for force simulation
 */
export interface ForceNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: NodeType;
  group?: string;
  area?: string;
}

/**
 * Link structure for force simulation
 */
export interface ForceLink extends d3.SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
  type: LinkType;
}

/**
 * Configuration options for the force simulation
 */
export interface ForceSimulationConfig {
  width: number;
  height: number;
  nodeRadius?: number;
  linkDistance?: number;
  chargeStrength?: number;
  collisionRadius?: number;
}

/**
 * Render callbacks for D3 visualization
 */
export interface RenderCallbacks {
  onNodeClick?: (event: MouseEvent | TouchEvent, node: ForceNode) => void;
  onNodeShape?: (node: ForceNode, nodeGroup: d3.Selection<SVGGElement, ForceNode, null, undefined>) => void;
  onLinkStyle?: (link: ForceLink) => { stroke?: string; strokeWidth?: number; strokeDasharray?: string };
  getNodeColor?: (node: ForceNode) => string;
  getNodeLabel?: (node: ForceNode) => string;
}

/**
 * Custom hook for managing D3 force simulation
 *
 * Separates D3.js logic from React components for better maintainability.
 * Handles simulation lifecycle, rendering, and cleanup automatically.
 *
 * @param svgRef - React ref to the SVG element
 * @param nodes - Array of nodes to simulate
 * @param links - Array of links between nodes
 * @param config - Simulation configuration options
 * @param callbacks - Optional callbacks for customizing rendering
 * @returns Simulation control functions
 */
export const useD3ForceSimulation = (
  svgRef: React.RefObject<SVGSVGElement>,
  nodes: ForceNode[],
  links: ForceLink[],
  config: ForceSimulationConfig,
  callbacks?: RenderCallbacks
) => {
  const simulationRef = useRef<d3.Simulation<ForceNode, ForceLink> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  /**
   * Initialize and render the force simulation
   */
  const renderSimulation = useCallback(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const { width, height, nodeRadius = 25, linkDistance = 100, chargeStrength = -300, collisionRadius = 30 } = config;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current).attr('viewBox', [0, 0, width, height]);

    // Container for zoom/pan
    const container = svg.append('g').attr('class', 'simulation-container');

    // Setup zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        container.attr('transform', event.transform.toString());
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Arrow markers for directed links
    const defs = svg.append('defs');
    defs
      .selectAll('marker')
      .data(['arrow'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', nodeRadius + 5)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#999')
      .attr('d', 'M0,-5L10,0L0,5');

    // Create force simulation
    const simulation = d3
      .forceSimulation<ForceNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<ForceNode, ForceLink>(links)
          .id((d) => d.id)
          .distance(linkDistance)
      )
      .force('charge', d3.forceManyBody<ForceNode>().strength(chargeStrength))
      .force('center', d3.forceCenter<ForceNode>(width / 2, height / 2))
      .force('collision', d3.forceCollide<ForceNode>().radius(collisionRadius));

    simulationRef.current = simulation;

    // Render links
    const linkSelection = container
      .append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, ForceLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => callbacks?.onLinkStyle?.(d)?.stroke || '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => callbacks?.onLinkStyle?.(d)?.strokeWidth || 2)
      .attr('stroke-dasharray', (d) => callbacks?.onLinkStyle?.(d)?.strokeDasharray || '0')
      .attr('marker-end', 'url(#arrow)');

    // Render nodes
    const nodeSelection = container
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, ForceNode>('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(createDragBehavior(simulation));

    // Custom node rendering
    nodeSelection.each(function (d) {
      const nodeGroup = d3.select(this);
      if (callbacks?.onNodeShape) {
        callbacks.onNodeShape(d, nodeGroup);
      } else {
        // Default: render as circle
        nodeGroup
          .append('circle')
          .attr('r', nodeRadius)
          .attr('fill', callbacks?.getNodeColor?.(d) || '#3B82F6');
      }
    });

    // Add labels
    nodeSelection
      .append('text')
      .text((d) => callbacks?.getNodeLabel?.(d) || d.name)
      .attr('x', 0)
      .attr('y', nodeRadius + 15)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-label')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Add tooltips
    nodeSelection.append('title').text((d) => {
      if (d.type === 'process') {
        return `${d.name}\nプロセス群: ${d.group || 'N/A'}\n知識エリア: ${d.area || 'N/A'}`;
      }
      return d.name;
    });

    // Node interaction handlers
    if (callbacks?.onNodeClick) {
      nodeSelection.on('click', (event, d) => {
        event.stopPropagation();
        callbacks.onNodeClick!(event, d);
      });
    }

    // Update positions on each tick
    simulation.on('tick', () => {
      linkSelection
        .attr('x1', (d) => (d.source as ForceNode).x ?? 0)
        .attr('y1', (d) => (d.source as ForceNode).y ?? 0)
        .attr('x2', (d) => (d.target as ForceNode).x ?? 0)
        .attr('y2', (d) => (d.target as ForceNode).y ?? 0);

      nodeSelection.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, links, config, svgRef]);

  /**
   * Create drag behavior for nodes
   */
  const createDragBehavior = useCallback(
    (simulation: d3.Simulation<ForceNode, ForceLink>) => {
      const dragStarted = (event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>, d: ForceNode) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      };

      const dragged = (event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>, d: ForceNode) => {
        d.fx = event.x;
        d.fy = event.y;
      };

      const dragEnded = (event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>, d: ForceNode) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      };

      return d3
        .drag<SVGGElement, ForceNode>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded);
    },
    []
  );

  /**
   * Zoom control functions
   */
  const zoomIn = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
    }
  }, [svgRef]);

  const zoomOut = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
    }
  }, [svgRef]);

  const resetZoom = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, [svgRef]);

  /**
   * Restart simulation with new alpha target
   */
  const restartSimulation = useCallback(() => {
    simulationRef.current?.alpha(1).restart();
  }, []);

  /**
   * Stop the simulation
   */
  const stopSimulation = useCallback(() => {
    simulationRef.current?.stop();
  }, []);

  /**
   * Highlight connected nodes
   */
  const highlightConnectedNodes = useCallback(
    (nodeId: string) => {
      if (!svgRef.current) return;

      const connectedNodes = new Set([nodeId]);
      links.forEach((link) => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;

        if (sourceId === nodeId) connectedNodes.add(targetId);
        if (targetId === nodeId) connectedNodes.add(sourceId);
      });

      const svg = d3.select(svgRef.current);

      svg
        .selectAll<SVGGElement, ForceNode>('.node')
        .style('opacity', (d) => (connectedNodes.has(d.id) ? 1 : 0.3));

      svg
        .selectAll<SVGLineElement, ForceLink>('.links line')
        .style('opacity', (d) => {
          const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
          const targetId = typeof d.target === 'string' ? d.target : d.target.id;
          return sourceId === nodeId || targetId === nodeId ? 1 : 0.1;
        });
    },
    [links, svgRef]
  );

  /**
   * Clear highlights
   */
  const clearHighlight = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('.node').style('opacity', 1);
    svg.selectAll('.links line').style('opacity', 0.6);
  }, [svgRef]);

  // Render simulation when dependencies change
  useEffect(() => {
    renderSimulation();

    // Cleanup on unmount
    return () => {
      simulationRef.current?.stop();
    };
  }, [renderSimulation]);

  return {
    zoomIn,
    zoomOut,
    resetZoom,
    restartSimulation,
    stopSimulation,
    highlightConnectedNodes,
    clearHighlight,
  };
};