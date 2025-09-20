/**
 * Multi-Layered ITTO Visualization Component
 * @description Advanced multi-layer ITTO visualization with semantic zoom and layered rendering
 * @author Claude Code Assistant
 * @version 1.0.0
 * @since 2025-09-10
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ITTORelationshipEngine,
  ITTONode,
  ITTOLink,
  FilterOptions,
  LayoutOptions,
} from '../../utils/ittoRelationshipEngine'
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Grid,
  Zap,
  Eye,
  EyeOff,
  Settings,
  Filter,
  Map,
} from 'lucide-react'

// ========================================
// Types and Interfaces
// ========================================

interface LayerDefinition {
  id: string
  name: string
  description: string
  visible: boolean
  opacity: number
  zIndex: number
  color: string
  renderCondition: (zoom: number) => boolean
  nodeFilter: (node: ITTONode) => boolean
  linkFilter: (link: ITTOLink) => boolean
}

interface ViewportState {
  scale: number
  translateX: number
  translateY: number
  semanticLevel: 'overview' | 'intermediate' | 'detailed'
}

interface MinimapState {
  visible: boolean
  width: number
  height: number
  scale: number
  nodes: ITTONode[]
  viewportRect: { x: number; y: number; width: number; height: number }
}

interface MultiLayeredITTOVisualizationProps {
  width?: number
  height?: number
  className?: string
  onNodeSelect?: (node: ITTONode | null) => void
  onLayerToggle?: (layerId: string, visible: boolean) => void
  onSemanticLevelChange?: (level: ViewportState['semanticLevel']) => void
  initialLayers?: Partial<LayerDefinition>[]
  enableMinimap?: boolean
  enableSemanticZoom?: boolean
}

// ========================================
// Default Layer Definitions
// ========================================

const createDefaultLayers = (): LayerDefinition[] => [
  {
    id: 'overview',
    name: 'Overview',
    description: 'High-level process groups and main flows',
    visible: true,
    opacity: 1,
    zIndex: 1,
    color: '#3B82F6',
    renderCondition: (zoom) => zoom <= 1,
    nodeFilter: (node) => node.type === 'process' && (node.weight || 0) > 0.8,
    linkFilter: (link) => link.type === 'process-flow',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Detailed processes with main ITTO elements',
    visible: true,
    opacity: 0.9,
    zIndex: 2,
    color: '#10B981',
    renderCondition: (zoom) => zoom > 0.5 && zoom <= 2,
    nodeFilter: (node) => true,
    linkFilter: (link) => ['input', 'output'].includes(link.type),
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'All ITTO elements with tools and techniques',
    visible: true,
    opacity: 0.8,
    zIndex: 3,
    color: '#F59E0B',
    renderCondition: (zoom) => zoom > 1.5,
    nodeFilter: (node) => true,
    linkFilter: (link) => true,
  },
  {
    id: 'tools',
    name: 'Tools Layer',
    description: 'Tools and techniques overlay',
    visible: false,
    opacity: 0.6,
    zIndex: 4,
    color: '#8B5CF6',
    renderCondition: (zoom) => zoom > 1,
    nodeFilter: (node) => node.type === 'tool',
    linkFilter: (link) => link.type === 'tool',
  },
  {
    id: 'flows',
    name: 'Process Flows',
    description: 'Process-to-process relationships',
    visible: true,
    opacity: 0.7,
    zIndex: 5,
    color: '#EF4444',
    renderCondition: (zoom) => true,
    nodeFilter: (node) => false, // Only shows links
    linkFilter: (link) => link.type === 'process-flow',
  },
]

// ========================================
// Main Component
// ========================================

const MultiLayeredITTOVisualization: React.FC<MultiLayeredITTOVisualizationProps> = ({
  width = 1400,
  height = 900,
  className = '',
  onNodeSelect,
  onLayerToggle,
  onSemanticLevelChange,
  initialLayers = [],
  enableMinimap = true,
  enableSemanticZoom = true,
}) => {
  // ========================================
  // Refs and State
  // ========================================

  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<ITTORelationshipEngine | null>(null)
  const simulationRef = useRef<d3.Simulation<ITTONode, ITTOLink> | null>(null)

  const [isInitialized, setIsInitialized] = useState(false)
  const [layers, setLayers] = useState<LayerDefinition[]>(() => {
    const defaultLayers = createDefaultLayers()
    return defaultLayers.map((layer) => {
      const customLayer = initialLayers.find((l) => l.id === layer.id)
      return customLayer ? { ...layer, ...customLayer } : layer
    })
  })

  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
    semanticLevel: 'overview',
  })

  const [minimap, setMinimap] = useState<MinimapState>({
    visible: enableMinimap,
    width: 200,
    height: 150,
    scale: 0.1,
    nodes: [],
    viewportRect: { x: 0, y: 0, width: 0, height: 0 },
  })

  const [showControls, setShowControls] = useState(true)
  const [selectedNode, setSelectedNode] = useState<ITTONode | null>(null)
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)

  // ========================================
  // Semantic Zoom Logic
  // ========================================

  const semanticLevel = useMemo<ViewportState['semanticLevel']>(() => {
    if (!enableSemanticZoom) {
      return 'detailed'
    }

    if (viewport.scale <= 0.5) {
      return 'overview'
    }
    if (viewport.scale <= 1.5) {
      return 'intermediate'
    }
    return 'detailed'
  }, [viewport.scale, enableSemanticZoom])

  const visibleLayers = useMemo(() => {
    return layers
      .filter((layer) => layer.visible && layer.renderCondition(viewport.scale))
      .sort((a, b) => a.zIndex - b.zIndex)
  }, [layers, viewport.scale])

  // ========================================
  // Initialization
  // ========================================

  useEffect(() => {
    if (!svgRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Initialize engine
    engineRef.current = new ITTORelationshipEngine({
      centerForce: 0.1,
      chargeForce: -200,
      linkDistance: 80,
      linkStrength: 0.3,
    })

    // Create simulation
    simulationRef.current = engineRef.current.createSimulation(width, height)

    // Setup SVG structure
    setupMultiLayerSVG(svg)

    // Setup zoom behavior with semantic zoom
    setupSemanticZoomBehavior(svg)

    // Initialize minimap
    if (enableMinimap) {
      initializeMinimap()
    }

    // Initial render
    updateVisualization()

    setIsInitialized(true)

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
      if (engineRef.current) {
        engineRef.current.destroy()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])

  // ========================================
  // SVG Setup
  // ========================================

  const setupMultiLayerSVG = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Create defs for gradients, patterns, filters
    const defs = svg.append('defs')

    // Layer-specific gradients
    layers.forEach((layer) => {
      const gradient = defs
        .append('linearGradient')
        .attr('id', `gradient-${layer.id}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', layer.color)
        .attr('stop-opacity', layer.opacity)

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.color(layer.color)?.darker(0.3)?.toString() || layer.color)
        .attr('stop-opacity', layer.opacity * 0.6)
    })

    // Advanced filters
    const glowFilter = defs
      .append('filter')
      .attr('id', 'advanced-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur')

    const feMerge = glowFilter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Shadow filter for depth
    const shadowFilter = defs
      .append('filter')
      .attr('id', 'drop-shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    shadowFilter
      .append('feDropShadow')
      .attr('dx', '2')
      .attr('dy', '2')
      .attr('stdDeviation', '3')
      .attr('flood-opacity', '0.3')

    // Arrow markers for each layer
    layers.forEach((layer) => {
      const marker = defs
        .append('marker')
        .attr('id', `arrow-${layer.id}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')

      marker
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', layer.color)
        .attr('opacity', layer.opacity)
    })

    // Create main group with transform
    const mainGroup = svg.append('g').attr('class', 'main-group')

    // Create layer groups
    layers.forEach((layer) => {
      const layerGroup = mainGroup
        .append('g')
        .attr('class', `layer-${layer.id}`)
        .attr('opacity', layer.opacity)
        .style('pointer-events', layer.visible ? 'all' : 'none')

      // Sub-groups for different element types
      layerGroup.append('g').attr('class', 'links')
      layerGroup.append('g').attr('class', 'nodes')
      layerGroup.append('g').attr('class', 'labels')
    })

    // Create interaction layer on top
    mainGroup.append('g').attr('class', 'interaction-layer')
  }

  const setupSemanticZoomBehavior = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ) => {
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        const { transform } = event

        const newViewport = {
          scale: transform.k,
          translateX: transform.x,
          translateY: transform.y,
          semanticLevel: getSemanticLevel(transform.k),
        }

        setViewport(newViewport)

        // Apply transform to main group
        const mainGroup = svg.select('.main-group')
        mainGroup.attr('transform', transform.toString())

        // Update layer visibility based on zoom
        updateLayerVisibility(transform.k)

        // Update minimap viewport
        if (enableMinimap) {
          updateMinimapViewport(transform)
        }

        // Trigger semantic level change callback
        if (onSemanticLevelChange && newViewport.semanticLevel !== viewport.semanticLevel) {
          onSemanticLevelChange(newViewport.semanticLevel)
        }
      })
      .on('start', () => {
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0.1).restart()
        }
      })
      .on('end', () => {
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0)
        }
      })

    svg.call(zoom)

    // Store zoom behavior for programmatic control
    ;(svg as any).__zoom__ = zoom
  }

  // ========================================
  // Layer Management
  // ========================================

  const updateLayerVisibility = (scale: number) => {
    if (!svgRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)

    layers.forEach((layer) => {
      const shouldShow = layer.visible && layer.renderCondition(scale)
      const layerGroup = svg.select(`.layer-${layer.id}`)

      layerGroup
        .transition()
        .duration(300)
        .attr('opacity', shouldShow ? layer.opacity : 0)
        .style('pointer-events', shouldShow ? 'all' : 'none')
    })
  }

  const toggleLayer = (layerId: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    )

    if (onLayerToggle) {
      const layer = layers.find((l) => l.id === layerId)
      if (layer) {
        onLayerToggle(layerId, !layer.visible)
      }
    }

    updateVisualization()
  }

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => (layer.id === layerId ? { ...layer, opacity } : layer))
    )

    updateVisualization()
  }

  // ========================================
  // Visualization Update
  // ========================================

  const updateVisualization = useCallback(() => {
    if (!svgRef.current || !engineRef.current || !simulationRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    const filteredData = engineRef.current.getFilteredGraph()

    visibleLayers.forEach((layer) => {
      const layerNodes = filteredData.nodes.filter(layer.nodeFilter)
      const layerLinks = filteredData.links.filter(layer.linkFilter)

      renderLayerLinks(svg, layer, layerLinks)
      renderLayerNodes(svg, layer, layerNodes)
      renderLayerLabels(svg, layer, layerNodes)
    })

    // Update simulation
    simulationRef.current.on('tick', () => {
      updateLayerPositions(svg)
    })

    simulationRef.current.restart()

    // Update minimap
    if (enableMinimap) {
      updateMinimapData(filteredData.nodes)
    }
  }, [visibleLayers, enableMinimap])

  const renderLayerLinks = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    layer: LayerDefinition,
    links: ITTOLink[]
  ) => {
    const layerGroup = svg.select(`.layer-${layer.id} .links`)

    const linkSelection = layerGroup
      .selectAll<SVGLineElement, ITTOLink>(`.link-${layer.id}`)
      .data(links, (d) => `${layer.id}-${d.id}`)

    // Enter
    const linkEnter = linkSelection
      .enter()
      .append('line')
      .attr('class', `link-${layer.id}`)
      .attr('stroke', layer.color)
      .attr('stroke-width', (d) => getLayerLinkWidth(d, layer))
      .attr('stroke-opacity', layer.opacity)
      .attr('marker-end', `url(#arrow-${layer.id})`)
      .style('filter', 'url(#drop-shadow)')
      .on('mouseenter', (event, d) => {
        highlightConnection(d, layer)
      })
      .on('mouseleave', () => {
        clearHighlight()
      })

    // Update
    linkSelection
      .merge(linkEnter)
      .transition()
      .duration(300)
      .attr('stroke', layer.color)
      .attr('stroke-width', (d) => getLayerLinkWidth(d, layer))
      .attr('stroke-opacity', layer.opacity)

    // Exit
    linkSelection.exit().transition().duration(300).attr('stroke-opacity', 0).remove()
  }

  const renderLayerNodes = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    layer: LayerDefinition,
    nodes: ITTONode[]
  ) => {
    const layerGroup = svg.select(`.layer-${layer.id} .nodes`)

    const nodeSelection = layerGroup
      .selectAll<SVGCircleElement, ITTONode>(`.node-${layer.id}`)
      .data(nodes, (d) => `${layer.id}-${d.id}`)

    // Enter
    const nodeEnter = nodeSelection
      .enter()
      .append('circle')
      .attr('class', `node-${layer.id}`)
      .attr('r', (d) => getLayerNodeRadius(d, layer))
      .attr('fill', (d) => getLayerNodeColor(d, layer))
      .attr('stroke', layer.color)
      .attr('stroke-width', 2)
      .attr('fill-opacity', layer.opacity)
      .style('filter', 'url(#drop-shadow)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        handleNodeClick(d)
      })
      .on('mouseenter', (event, d) => {
        highlightNode(d, layer)
      })
      .on('mouseleave', () => {
        clearHighlight()
      })

    // Update
    nodeSelection
      .merge(nodeEnter)
      .transition()
      .duration(300)
      .attr('r', (d) => getLayerNodeRadius(d, layer))
      .attr('fill', (d) => getLayerNodeColor(d, layer))
      .attr('fill-opacity', layer.opacity)

    // Exit
    nodeSelection.exit().transition().duration(300).attr('r', 0).remove()
  }

  const renderLayerLabels = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    layer: LayerDefinition,
    nodes: ITTONode[]
  ) => {
    // Only show labels in detailed view or for selected/important nodes
    const showLabels = viewport.scale > 1 || layer.id === 'overview'
    if (!showLabels) {
      return
    }

    const layerGroup = svg.select(`.layer-${layer.id} .labels`)

    const labelSelection = layerGroup
      .selectAll<SVGTextElement, ITTONode>(`.label-${layer.id}`)
      .data(nodes, (d) => `${layer.id}-${d.id}`)

    // Enter
    const labelEnter = labelSelection
      .enter()
      .append('text')
      .attr('class', `label-${layer.id}`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d) => getLayerLabelSize(d, layer))
      .attr('font-weight', '500')
      .attr('fill', layer.color)
      .attr('fill-opacity', layer.opacity)
      .attr('pointer-events', 'none')
      .text((d) => truncateText(d.name, getMaxLabelLength(layer)))

    // Update
    labelSelection
      .merge(labelEnter)
      .transition()
      .duration(300)
      .attr('font-size', (d) => getLayerLabelSize(d, layer))
      .attr('fill', layer.color)
      .attr('fill-opacity', layer.opacity)
      .text((d) => truncateText(d.name, getMaxLabelLength(layer)))

    // Exit
    labelSelection.exit().transition().duration(300).attr('fill-opacity', 0).remove()
  }

  const updateLayerPositions = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    layers.forEach((layer) => {
      // Update links
      svg
        .selectAll<SVGLineElement, ITTOLink>(`.link-${layer.id}`)
        .attr('x1', (d) => {
          const source = d.source as ITTONode
          return source.x || 0
        })
        .attr('y1', (d) => {
          const source = d.source as ITTONode
          return source.y || 0
        })
        .attr('x2', (d) => {
          const target = d.target as ITTONode
          return target.x || 0
        })
        .attr('y2', (d) => {
          const target = d.target as ITTONode
          return target.y || 0
        })

      // Update nodes
      svg
        .selectAll<SVGCircleElement, ITTONode>(`.node-${layer.id}`)
        .attr('cx', (d) => d.x || 0)
        .attr('cy', (d) => d.y || 0)

      // Update labels
      svg
        .selectAll<SVGTextElement, ITTONode>(`.label-${layer.id}`)
        .attr('x', (d) => d.x || 0)
        .attr('y', (d) => (d.y || 0) + getLayerNodeRadius(d, layer) + 15)
    })
  }

  // ========================================
  // Minimap Implementation
  // ========================================

  const initializeMinimap = () => {
    if (!engineRef.current) {
      return
    }

    const nodes = engineRef.current.getAllNodes()
    setMinimap((prev) => ({
      ...prev,
      nodes: nodes.slice(0, 50), // Limit for performance
      viewportRect: {
        x: 0,
        y: 0,
        width: width * prev.scale,
        height: height * prev.scale,
      },
    }))
  }

  const updateMinimapData = (nodes: ITTONode[]) => {
    setMinimap((prev) => ({
      ...prev,
      nodes: nodes.slice(0, 50),
    }))
  }

  const updateMinimapViewport = (transform: d3.ZoomTransform) => {
    const scale = minimap.scale
    setMinimap((prev) => ({
      ...prev,
      viewportRect: {
        x: -transform.x * scale,
        y: -transform.y * scale,
        width: (width / transform.k) * scale,
        height: (height / transform.k) * scale,
      },
    }))
  }

  // ========================================
  // Utility Functions
  // ========================================

  const getSemanticLevel = (scale: number): ViewportState['semanticLevel'] => {
    if (scale <= 0.5) {
      return 'overview'
    }
    if (scale <= 1.5) {
      return 'intermediate'
    }
    return 'detailed'
  }

  const getLayerNodeRadius = (node: ITTONode, layer: LayerDefinition): number => {
    const baseSize = 8 + (node.complexity || 1) * 2
    const layerMultiplier = layer.id === 'overview' ? 1.5 : 1
    const semanticMultiplier = viewport.scale > 2 ? 1.2 : 1

    return baseSize * layerMultiplier * semanticMultiplier
  }

  const getLayerNodeColor = (node: ITTONode, layer: LayerDefinition): string => {
    if (selectedNode?.id === node.id) {
      return '#DC2626'
    }

    return `url(#gradient-${layer.id})`
  }

  const getLayerLinkWidth = (link: ITTOLink, layer: LayerDefinition): number => {
    const baseWidth = layer.id === 'flows' ? 3 : 2
    const importanceMultiplier = (link.strength || 1) * 1.5

    return Math.min(baseWidth * importanceMultiplier, 8)
  }

  const getLayerLabelSize = (node: ITTONode, layer: LayerDefinition): string => {
    const baseSize = layer.id === 'overview' ? 14 : 12
    const zoomMultiplier = Math.min(viewport.scale, 2)

    return `${baseSize * zoomMultiplier}px`
  }

  const getMaxLabelLength = (layer: LayerDefinition): number => {
    switch (layer.id) {
      case 'overview':
        return 15
      case 'intermediate':
        return 25
      case 'detailed':
        return 40
      default:
        return 20
    }
  }

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const handleNodeClick = (node: ITTONode) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node)
    if (onNodeSelect) {
      onNodeSelect(selectedNode?.id === node.id ? null : node)
    }
  }

  const highlightNode = (node: ITTONode, layer: LayerDefinition) => {
    // Implement highlighting logic
  }

  const highlightConnection = (link: ITTOLink, layer: LayerDefinition) => {
    // Implement connection highlighting logic
  }

  const clearHighlight = () => {
    // Implement highlight clearing logic
  }

  // ========================================
  // Control Handlers
  // ========================================

  const handleZoomIn = () => {
    if (!svgRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    const zoom = (svg as any).__zoom__
    svg.transition().duration(300).call(zoom.scaleBy, 1.5)
  }

  const handleZoomOut = () => {
    if (!svgRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    const zoom = (svg as any).__zoom__
    svg
      .transition()
      .duration(300)
      .call(zoom.scaleBy, 1 / 1.5)
  }

  const handleResetView = () => {
    if (!svgRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    const zoom = (svg as any).__zoom__
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity)
  }

  const handleFitToScreen = () => {
    if (!svgRef.current || !engineRef.current) {
      return
    }

    const nodes = engineRef.current.getAllNodes()
    if (nodes.length === 0) {
      return
    }

    const bounds = {
      minX: Math.min(...nodes.map((n) => n.x || 0)),
      maxX: Math.max(...nodes.map((n) => n.x || 0)),
      minY: Math.min(...nodes.map((n) => n.y || 0)),
      maxY: Math.max(...nodes.map((n) => n.y || 0)),
    }

    const boundsWidth = bounds.maxX - bounds.minX
    const boundsHeight = bounds.maxY - bounds.minY
    const centerX = bounds.minX + boundsWidth / 2
    const centerY = bounds.minY + boundsHeight / 2

    const scale = Math.min(width / boundsWidth, height / boundsHeight) * 0.8 // Add some padding

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(scale)
      .translate(-centerX, -centerY)

    const svg = d3.select(svgRef.current)
    const zoom = (svg as any).__zoom__
    svg.transition().duration(1000).call(zoom.transform, transform)
  }

  // ========================================
  // Effects
  // ========================================

  useEffect(() => {
    updateVisualization()
  }, [updateVisualization, layers])

  useEffect(() => {
    if (onSemanticLevelChange) {
      onSemanticLevelChange(semanticLevel)
    }
  }, [semanticLevel, onSemanticLevelChange])

  // ========================================
  // Render
  // ========================================

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}
    >
      {/* Main SVG Canvas */}
      <svg ref={svgRef} width={width} height={height} className='h-full w-full' />

      {/* Layer Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='absolute left-4 top-4 min-w-80 rounded-lg bg-white p-4 shadow-lg'
          >
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                <Layers className='h-5 w-5' />
                Visualization Layers
              </h3>
              <div className='text-xs text-gray-500'>
                {semanticLevel.charAt(0).toUpperCase() + semanticLevel.slice(1)} View
              </div>
            </div>

            {/* Layer List */}
            <div className='space-y-3'>
              {layers.map((layer) => (
                <motion.div
                  key={layer.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    layer.visible ? 'border-gray-200 bg-gray-50' : 'bg-gray-25 border-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  onMouseEnter={() => setHoveredLayer(layer.id)}
                  onMouseLeave={() => setHoveredLayer(null)}
                >
                  <div className='mb-2 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className={`flex items-center gap-2 text-sm font-medium ${
                          layer.visible ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {layer.visible ? (
                          <Eye className='h-4 w-4' />
                        ) : (
                          <EyeOff className='h-4 w-4' />
                        )}
                        {layer.name}
                      </button>
                      <div
                        className='h-3 w-3 rounded-full border'
                        style={{
                          backgroundColor: layer.color,
                          opacity: layer.opacity,
                        }}
                      />
                    </div>
                    <div className='text-xs text-gray-500'>
                      {layer.renderCondition(viewport.scale) ? 'Visible' : 'Hidden'}
                    </div>
                  </div>

                  <p className='mb-2 text-xs text-gray-600'>{layer.description}</p>

                  {layer.visible && (
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-gray-500'>Opacity:</span>
                      <input
                        type='range'
                        min='0'
                        max='1'
                        step='0.1'
                        value={layer.opacity}
                        onChange={(e) => updateLayerOpacity(layer.id, parseFloat(e.target.value))}
                        className='h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200'
                      />
                      <span className='w-8 text-xs text-gray-500'>
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Quick Controls */}
            <div className='mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4'>
              <button
                onClick={handleZoomIn}
                className='flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200'
              >
                <ZoomIn className='h-3 w-3' />
                Zoom In
              </button>

              <button
                onClick={handleZoomOut}
                className='flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200'
              >
                <ZoomOut className='h-3 w-3' />
                Zoom Out
              </button>

              <button
                onClick={handleResetView}
                className='flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200'
              >
                <RotateCcw className='h-3 w-3' />
                Reset
              </button>

              <button
                onClick={handleFitToScreen}
                className='flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200'
              >
                <Maximize2 className='h-3 w-3' />
                Fit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Controls Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className='absolute right-4 top-4 rounded-lg bg-white p-3 shadow-lg hover:bg-gray-50'
      >
        <Settings className='h-5 w-5 text-gray-600' />
      </button>

      {/* Minimap */}
      {enableMinimap && minimap.visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='absolute bottom-4 right-4 rounded-lg border border-gray-200 bg-white p-2 shadow-lg'
          style={{ width: minimap.width + 16, height: minimap.height + 16 }}
        >
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-xs font-medium text-gray-700'>Overview</span>
            <button
              onClick={() => setMinimap((prev) => ({ ...prev, visible: false }))}
              className='text-gray-400 hover:text-gray-600'
            >
              <Minimize2 className='h-3 w-3' />
            </button>
          </div>

          <svg
            width={minimap.width}
            height={minimap.height}
            className='rounded border border-gray-200'
            style={{ background: '#f9fafb' }}
          >
            {/* Minimap nodes */}
            {minimap.nodes.map((node) => (
              <circle
                key={`minimap-${node.id}`}
                cx={(node.x || 0) * minimap.scale + minimap.width / 2}
                cy={(node.y || 0) * minimap.scale + minimap.height / 2}
                r={2}
                fill={node.type === 'process' ? '#3B82F6' : '#9CA3AF'}
                opacity={0.7}
              />
            ))}

            {/* Viewport indicator */}
            <rect
              x={Math.max(0, minimap.viewportRect.x)}
              y={Math.max(0, minimap.viewportRect.y)}
              width={Math.min(minimap.width, minimap.viewportRect.width)}
              height={Math.min(minimap.height, minimap.viewportRect.height)}
              fill='none'
              stroke='#DC2626'
              strokeWidth='2'
              opacity={0.8}
            />
          </svg>
        </motion.div>
      )}

      {/* Semantic Level Indicator */}
      <div className='absolute bottom-4 left-4 rounded-lg bg-white px-4 py-2 shadow-lg'>
        <div className='flex items-center gap-3'>
          <Zap className='h-4 w-4 text-blue-600' />
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-gray-700'>Zoom:</span>
            <span className='text-sm text-gray-600'>{(viewport.scale * 100).toFixed(0)}%</span>
            <div className='h-4 w-px bg-gray-300' />
            <span className='text-sm capitalize text-gray-600'>{semanticLevel}</span>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {!isInitialized && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <p className='text-gray-600'>Initializing Multi-Layer Visualization...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiLayeredITTOVisualization
