/**
 * Interactive ITTO Network Component
 * @description Advanced interactive ITTO relationship visualization with D3.js
 * @author Claude Code Assistant
 * @version 1.0.0
 * @since 2025-09-10
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import {
  ITTORelationshipEngine,
  ITTONode,
  ITTOLink,
  FilterOptions,
  LayoutOptions,
  ForceSimulationConfig,
} from '../../utils/ittoRelationshipEngine'
import { useProgressV2 } from '../../hooks/useProgressV2'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Settings,
  BookOpen,
  Bookmark,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Eye,
  EyeOff,
  Target,
  Share2,
  Download,
} from 'lucide-react'

// ========================================
// Types and Interfaces
// ========================================

interface NodeContextMenu {
  visible: boolean
  x: number
  y: number
  node: ITTONode | null
}

interface ViewportState {
  scale: number
  translateX: number
  translateY: number
}

interface SelectionState {
  selectedNodes: Set<string>
  selectedLinks: Set<string>
  highlightedNodes: Set<string>
  highlightedLinks: Set<string>
}

interface InteractiveITTONetworkProps {
  width?: number
  height?: number
  className?: string
  onNodeSelect?: (node: ITTONode | null) => void
  onNodeDoubleClick?: (node: ITTONode) => void
  onLinkSelect?: (link: ITTOLink | null) => void
  enableDragAndDrop?: boolean
  enableContextMenu?: boolean
  showMinimap?: boolean
  initialFilter?: Partial<FilterOptions>
  initialLayout?: Partial<LayoutOptions>
  initialConfig?: Partial<ForceSimulationConfig>
}

// ========================================
// Main Component
// ========================================

const InteractiveITTONetwork: React.FC<InteractiveITTONetworkProps> = ({
  width = 1200,
  height = 800,
  className = '',
  onNodeSelect,
  onNodeDoubleClick,
  onLinkSelect,
  enableDragAndDrop = true,
  enableContextMenu = true,
  showMinimap = false,
  initialFilter = {},
  initialLayout = {},
  initialConfig = {},
}) => {
  // ========================================
  // Refs and State
  // ========================================

  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<ITTORelationshipEngine | null>(null)
  const simulationRef = useRef<d3.Simulation<ITTONode, ITTOLink> | null>(null)

  const [isInitialized, setIsInitialized] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [contextMenu, setContextMenu] = useState<NodeContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  })

  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })

  const [selection, setSelection] = useState<SelectionState>({
    selectedNodes: new Set(),
    selectedLinks: new Set(),
    highlightedNodes: new Set(),
    highlightedLinks: new Set(),
  })

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    showInputs: true,
    showTools: true,
    showOutputs: true,
    showProcesses: true,
    ...initialFilter,
  })

  const [layoutOptions, setLayoutOptions] = useState<LayoutOptions>({
    algorithm: 'force',
    showLayers: false,
    enableClustering: false,
    separationDistance: 200,
    ...initialLayout,
  })

  const [showControls, setShowControls] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  // Hooks
  const progress = useProgressV2()

  // ========================================
  // Memoized Values
  // ========================================

  const nodeColorScale = useMemo(() => {
    return d3
      .scaleOrdinal<string>()
      .domain(['input', 'process', 'tool', 'output'])
      .range(['#3B82F6', '#10B981', '#F59E0B', '#EF4444'])
  }, [])

  const nodeSizeScale = useMemo(() => {
    return d3.scaleSqrt().domain([1, 10]).range([8, 24])
  }, [])

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
    engineRef.current = new ITTORelationshipEngine(initialConfig, layoutOptions, {
      ...filterOptions,
      searchQuery,
    })

    // Create simulation
    simulationRef.current = engineRef.current.createSimulation(width, height)

    // Setup SVG structure
    setupSVGStructure(svg)

    // Setup zoom behavior
    setupZoomBehavior(svg)

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

  const setupSVGStructure = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Create defs for patterns, gradients, markers
    const defs = svg.append('defs')

    // Arrow markers
    const arrowMarker = defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')

    arrowMarker.append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#666').attr('opacity', 0.6)

    // Glow filter
    const filter = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')

    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')

    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Create main group with transform
    const mainGroup = svg.append('g').attr('class', 'main-group')

    // Create layers
    mainGroup.append('g').attr('class', 'links-layer')
    mainGroup.append('g').attr('class', 'nodes-layer')
    mainGroup.append('g').attr('class', 'labels-layer')
  }

  const setupZoomBehavior = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        const { transform } = event
        setViewport({
          scale: transform.k,
          translateX: transform.x,
          translateY: transform.y,
        })

        const mainGroup = svg.select('.main-group')
        mainGroup.attr('transform', transform.toString())
      })

    svg.call(zoom)
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

    // Update simulation data
    simulationRef.current.nodes(filteredData.nodes)
    const linkForce = simulationRef.current.force<d3.ForceLink<ITTONode, ITTOLink>>('link')
    if (linkForce) {
      linkForce.links(filteredData.links)
    }

    // Render links
    renderLinks(svg, filteredData.links)

    // Render nodes
    renderNodes(svg, filteredData.nodes)

    // Render labels
    renderLabels(svg, filteredData.nodes)

    // Setup tick handler
    simulationRef.current.on('tick', () => {
      updatePositions(svg)
    })

    // Restart simulation
    if (isPlaying) {
      simulationRef.current.restart()
    }
  }, [isPlaying, selection, filterOptions])

  const renderLinks = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    links: ITTOLink[]
  ) => {
    const linksLayer = svg.select('.links-layer')

    const linkSelection = linksLayer
      .selectAll<SVGLineElement, ITTOLink>('.link')
      .data(links, (d) => d.id)

    // Enter
    const linkEnter = linkSelection
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', (d) => getLinkColor(d))
      .attr('stroke-width', (d) => getLinkWidth(d))
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation()
        handleLinkClick(d)
      })
      .on('mouseenter', (event, d) => {
        highlightLink(d.id, true)
      })
      .on('mouseleave', (event, d) => {
        highlightLink(d.id, false)
      })

    // Update
    linkSelection
      .merge(linkEnter)
      .attr('stroke', (d) => getLinkColor(d))
      .attr('stroke-width', (d) => getLinkWidth(d))
      .attr('stroke-opacity', (d) => getLinkOpacity(d))
      .style('filter', (d) => (selection.highlightedLinks.has(d.id) ? 'url(#glow)' : 'none'))

    // Exit
    linkSelection.exit().remove()
  }

  const renderNodes = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodes: ITTONode[]
  ) => {
    const nodesLayer = svg.select('.nodes-layer')

    const nodeSelection = nodesLayer
      .selectAll<SVGCircleElement, ITTONode>('.node')
      .data(nodes, (d) => d.id)

    // Enter
    const nodeEnter = nodeSelection
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', (d) => getNodeRadius(d))
      .attr('fill', (d) => getNodeColor(d))
      .attr('stroke', (d) => getNodeStrokeColor(d))
      .attr('stroke-width', 2)
      .style('cursor', enableDragAndDrop ? 'grab' : 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation()
        handleNodeClick(d, event)
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation()
        if (onNodeDoubleClick) {
          onNodeDoubleClick(d)
        }
      })
      .on('contextmenu', (event, d) => {
        if (enableContextMenu) {
          event.preventDefault()
          showContextMenu(d, event)
        }
      })
      .on('mouseenter', (event, d) => {
        highlightNode(d.id, true)
      })
      .on('mouseleave', (event, d) => {
        highlightNode(d.id, false)
      })

    // Setup drag behavior
    if (enableDragAndDrop && simulationRef.current) {
      const drag = d3
        .drag<SVGCircleElement, ITTONode>()
        .on('start', (event, d) => {
          if (!event.active && simulationRef.current) {
            simulationRef.current.alphaTarget(0.3).restart()
          }
          d.fx = d.x
          d.fy = d.y
          d3.select(event.sourceEvent.target).style('cursor', 'grabbing')
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active && simulationRef.current) {
            simulationRef.current.alphaTarget(0)
          }
          d.fx = null
          d.fy = null
          d3.select(event.sourceEvent.target).style('cursor', 'grab')
        })

      nodeEnter.call(drag)
    }

    // Update
    nodeSelection
      .merge(nodeEnter)
      .attr('r', (d) => getNodeRadius(d))
      .attr('fill', (d) => getNodeColor(d))
      .attr('stroke', (d) => getNodeStrokeColor(d))
      .attr('stroke-width', (d) => getNodeStrokeWidth(d))
      .style('filter', (d) => (selection.highlightedNodes.has(d.id) ? 'url(#glow)' : 'none'))
      .style('opacity', (d) => getNodeOpacity(d))

    // Exit
    nodeSelection.exit().remove()
  }

  const renderLabels = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodes: ITTONode[]
  ) => {
    const labelsLayer = svg.select('.labels-layer')

    const labelSelection = labelsLayer.selectAll<SVGTextElement, ITTONode>('.label').data(
      nodes.filter((d) => shouldShowLabel(d)),
      (d) => d.id
    )

    // Enter
    const labelEnter = labelSelection
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .attr('pointer-events', 'none')
      .text((d) => truncateText(d.name, 20))

    // Update
    labelSelection
      .merge(labelEnter)
      .text((d) => truncateText(d.name, 20))
      .style('opacity', (d) => getLabelOpacity(d))

    // Exit
    labelSelection.exit().remove()
  }

  const updatePositions = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Update link positions
    svg
      .selectAll<SVGLineElement, ITTOLink>('.link')
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

    // Update node positions
    svg
      .selectAll<SVGCircleElement, ITTONode>('.node')
      .attr('cx', (d) => d.x || 0)
      .attr('cy', (d) => d.y || 0)

    // Update label positions
    svg
      .selectAll<SVGTextElement, ITTONode>('.label')
      .attr('x', (d) => d.x || 0)
      .attr('y', (d) => (d.y || 0) + getNodeRadius(d) + 15)
  }

  // ========================================
  // Event Handlers
  // ========================================

  const handleNodeClick = (node: ITTONode, event: MouseEvent) => {
    const newSelection = new Set(selection.selectedNodes)

    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      if (newSelection.has(node.id)) {
        newSelection.delete(node.id)
      } else {
        newSelection.add(node.id)
      }
    } else {
      // Single select
      newSelection.clear()
      newSelection.add(node.id)
    }

    setSelection((prev) => ({
      ...prev,
      selectedNodes: newSelection,
    }))

    if (onNodeSelect) {
      onNodeSelect(newSelection.size === 1 ? node : null)
    }
  }

  const handleLinkClick = (link: ITTOLink) => {
    const newSelection = new Set<string>()
    newSelection.add(link.id)

    setSelection((prev) => ({
      ...prev,
      selectedLinks: newSelection,
    }))

    if (onLinkSelect) {
      onLinkSelect(link)
    }
  }

  const highlightNode = (nodeId: string, highlight: boolean) => {
    setSelection((prev) => {
      const newHighlighted = new Set(prev.highlightedNodes)
      const newHighlightedLinks = new Set(prev.highlightedLinks)

      if (highlight) {
        newHighlighted.add(nodeId)

        // Highlight connected links
        if (engineRef.current) {
          const connectedNodes = engineRef.current.getConnectedNodes(nodeId)
          connectedNodes.forEach((connectedNode) => {
            newHighlighted.add(connectedNode.id)
          })

          engineRef.current.getAllLinks().forEach((link) => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id
            const targetId = typeof link.target === 'string' ? link.target : link.target.id

            if (sourceId === nodeId || targetId === nodeId) {
              newHighlightedLinks.add(link.id)
            }
          })
        }
      } else {
        newHighlighted.clear()
        newHighlightedLinks.clear()
      }

      return {
        ...prev,
        highlightedNodes: newHighlighted,
        highlightedLinks: newHighlightedLinks,
      }
    })
  }

  const highlightLink = (linkId: string, highlight: boolean) => {
    setSelection((prev) => {
      const newHighlighted = new Set(prev.highlightedLinks)

      if (highlight) {
        newHighlighted.add(linkId)
      } else {
        newHighlighted.delete(linkId)
      }

      return {
        ...prev,
        highlightedLinks: newHighlighted,
      }
    })
  }

  const showContextMenu = (node: ITTONode, event: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }

    setContextMenu({
      visible: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      node,
    })
  }

  const hideContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  // ========================================
  // Styling Functions
  // ========================================

  const getNodeColor = (node: ITTONode): string => {
    if (selection.selectedNodes.has(node.id)) {
      return '#DC2626' // red for selected
    }

    if (bookmarks.has(node.id)) {
      return '#7C3AED' // purple for bookmarked
    }

    return nodeColorScale(node.type)
  }

  const getNodeStrokeColor = (node: ITTONode): string => {
    if (selection.selectedNodes.has(node.id)) {
      return '#B91C1C'
    }

    if (selection.highlightedNodes.has(node.id)) {
      return '#059669'
    }

    return '#E5E7EB'
  }

  const getNodeStrokeWidth = (node: ITTONode): number => {
    if (selection.selectedNodes.has(node.id)) {
      return 3
    }

    if (selection.highlightedNodes.has(node.id)) {
      return 2.5
    }

    return 1.5
  }

  const getNodeRadius = (node: ITTONode): number => {
    const baseSize = nodeSizeScale(node.complexity || 1)

    if (selection.selectedNodes.has(node.id)) {
      return baseSize * 1.3
    }

    if (selection.highlightedNodes.has(node.id)) {
      return baseSize * 1.2
    }

    return baseSize
  }

  const getNodeOpacity = (node: ITTONode): number => {
    if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return 0.3
    }

    return 1
  }

  const getLinkColor = (link: ITTOLink): string => {
    if (selection.selectedLinks.has(link.id)) {
      return '#DC2626'
    }

    const colorMap = {
      input: '#3B82F6',
      tool: '#F59E0B',
      output: '#EF4444',
      'process-flow': '#10B981',
    }

    return colorMap[link.type] || '#6B7280'
  }

  const getLinkWidth = (link: ITTOLink): number => {
    if (selection.selectedLinks.has(link.id)) {
      return 3
    }

    if (selection.highlightedLinks.has(link.id)) {
      return 2.5
    }

    return link.type === 'process-flow' ? 2 : 1.5
  }

  const getLinkOpacity = (link: ITTOLink): number => {
    if (selection.highlightedLinks.has(link.id)) {
      return 1
    }

    if (selection.highlightedNodes.size > 0) {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id

      if (selection.highlightedNodes.has(sourceId) || selection.highlightedNodes.has(targetId)) {
        return 0.8
      }

      return 0.2
    }

    return 0.6
  }

  const shouldShowLabel = (node: ITTONode): boolean => {
    return (
      viewport.scale > 0.5 &&
      (selection.selectedNodes.has(node.id) ||
        selection.highlightedNodes.has(node.id) ||
        viewport.scale > 1.2)
    )
  }

  const getLabelOpacity = (node: ITTONode): number => {
    if (selection.selectedNodes.has(node.id) || selection.highlightedNodes.has(node.id)) {
      return 1
    }

    return Math.min(1, Math.max(0, (viewport.scale - 0.5) / 0.5))
  }

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // ========================================
  // Control Handlers
  // ========================================

  const handleZoomIn = () => {
    if (!svgRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom<SVGSVGElement, unknown>()
    svg.transition().duration(300).call(zoom.scaleBy, 1.5)
  }

  const handleZoomOut = () => {
    if (!svgRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom<SVGSVGElement, unknown>()
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
    const zoom = d3.zoom<SVGSVGElement, unknown>()
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity)
  }

  const handleTogglePlay = () => {
    if (!simulationRef.current) {
      return
    }

    if (isPlaying) {
      simulationRef.current.stop()
    } else {
      simulationRef.current.restart()
    }
    setIsPlaying(!isPlaying)
  }

  const handleToggleBookmark = () => {
    const selectedNode = Array.from(selection.selectedNodes)[0]
    if (!selectedNode) {
      return
    }

    const newBookmarks = new Set(bookmarks)
    if (bookmarks.has(selectedNode)) {
      newBookmarks.delete(selectedNode)
    } else {
      newBookmarks.add(selectedNode)
    }
    setBookmarks(newBookmarks)
    updateVisualization()
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (engineRef.current) {
      engineRef.current.updateFilter({ searchQuery: query })
      updateVisualization()
    }
  }

  const handleFilterChange = (newFilter: Partial<FilterOptions>) => {
    const updatedFilter = { ...filterOptions, ...newFilter }
    setFilterOptions(updatedFilter)

    if (engineRef.current) {
      engineRef.current.updateFilter(updatedFilter)
      updateVisualization()
    }
  }

  const handleLayoutChange = (newLayout: Partial<LayoutOptions>) => {
    const updatedLayout = { ...layoutOptions, ...newLayout }
    setLayoutOptions(updatedLayout)

    if (engineRef.current) {
      engineRef.current.updateLayout(updatedLayout, width, height)
      updateVisualization()
    }
  }

  // ========================================
  // Effects
  // ========================================

  useEffect(() => {
    updateVisualization()
  }, [updateVisualization, filterOptions, layoutOptions])

  useEffect(() => {
    const handleClickOutside = () => {
      hideContextMenu()
      setSelection((prev) => ({
        ...prev,
        selectedNodes: new Set(),
        selectedLinks: new Set(),
      }))
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          hideContextMenu()
          setSelection((prev) => ({
            ...prev,
            selectedNodes: new Set(),
            selectedLinks: new Set(),
            highlightedNodes: new Set(),
            highlightedLinks: new Set(),
          }))
          break
        case ' ':
          event.preventDefault()
          handleTogglePlay()
          break
        case 'b':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            handleToggleBookmark()
          }
          break
        case '=':
        case '+':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            handleZoomIn()
          }
          break
        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            handleZoomOut()
          }
          break
        case '0':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            handleResetView()
          }
          break
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selection.selectedNodes, isPlaying])

  // ========================================
  // Render
  // ========================================

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-gray-50 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Main SVG Canvas */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className='h-full w-full'
        style={{ background: 'linear-gradient(45deg, #f9fafb 25%, transparent 25%)' }}
      />

      {/* Control Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='absolute left-4 top-4 min-w-64 rounded-lg bg-white p-4 shadow-lg'
          >
            {/* Search */}
            <div className='mb-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <input
                  type='text'
                  placeholder='Search processes, inputs, outputs...'
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className='w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>

            {/* Quick Controls */}
            <div className='mb-4 flex flex-wrap gap-2'>
              <button
                onClick={handleTogglePlay}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium ${
                  isPlaying ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isPlaying ? <Pause className='h-3 w-3' /> : <Play className='h-3 w-3' />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={handleZoomIn}
                className='flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200'
              >
                <ZoomIn className='h-3 w-3' />
                Zoom In
              </button>

              <button
                onClick={handleZoomOut}
                className='flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200'
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
            </div>

            {/* Filter Controls */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>Show Elements</span>
                <Filter className='h-4 w-4 text-gray-400' />
              </div>

              <div className='grid grid-cols-2 gap-2'>
                {[
                  {
                    key: 'showProcesses',
                    label: 'Processes',
                    color: 'bg-green-100 text-green-700',
                  },
                  { key: 'showInputs', label: 'Inputs', color: 'bg-blue-100 text-blue-700' },
                  { key: 'showTools', label: 'Tools', color: 'bg-yellow-100 text-yellow-700' },
                  { key: 'showOutputs', label: 'Outputs', color: 'bg-red-100 text-red-700' },
                ].map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() =>
                      handleFilterChange({ [key]: !filterOptions[key as keyof FilterOptions] })
                    }
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      filterOptions[key as keyof FilterOptions]
                        ? color
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {filterOptions[key as keyof FilterOptions] ? (
                      <Eye className='h-3 w-3' />
                    ) : (
                      <EyeOff className='h-3 w-3' />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Controls */}
            <div className='mt-4 space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>Layout</span>
                <Settings className='h-4 w-4 text-gray-400' />
              </div>

              <select
                value={layoutOptions.algorithm}
                onChange={(e) => handleLayoutChange({ algorithm: e.target.value as any })}
                className='w-full rounded-md border border-gray-300 px-2 py-1 text-xs'
              >
                <option value='force'>Force-Directed</option>
                <option value='hierarchical'>Hierarchical</option>
                <option value='circular'>Circular</option>
                <option value='cluster'>Clustered</option>
                <option value='grid'>Grid</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Controls Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className='absolute right-4 top-4 rounded-lg bg-white p-2 shadow-lg hover:bg-gray-50'
      >
        {showControls ? (
          <EyeOff className='h-5 w-5 text-gray-600' />
        ) : (
          <Eye className='h-5 w-5 text-gray-600' />
        )}
      </button>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.visible && contextMenu.node && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='absolute z-50 rounded-lg border border-gray-200 bg-white py-2 shadow-lg'
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              transformOrigin: 'top left',
            }}
          >
            <div className='border-b border-gray-100 px-4 py-2'>
              <h3 className='font-medium text-gray-900'>{contextMenu.node.name}</h3>
              <p className='mt-1 text-xs text-gray-500'>
                {contextMenu.node.type.charAt(0).toUpperCase() + contextMenu.node.type.slice(1)}
                {contextMenu.node.category && ` • ${contextMenu.node.category}`}
              </p>
            </div>

            <div className='py-1'>
              <button
                onClick={handleToggleBookmark}
                className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50'
              >
                <Bookmark className='h-4 w-4' />
                {bookmarks.has(contextMenu.node.id) ? 'Remove Bookmark' : 'Add Bookmark'}
              </button>

              <button className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50'>
                <Target className='h-4 w-4' />
                Focus on Node
              </button>

              <button className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50'>
                <BookOpen className='h-4 w-4' />
                View Details
              </button>

              <button className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50'>
                <Share2 className='h-4 w-4' />
                Share Node
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className='absolute bottom-4 left-4 rounded-lg bg-white px-4 py-2 text-sm text-gray-600 shadow-lg'>
        <div className='flex items-center gap-4'>
          <span>Scale: {(viewport.scale * 100).toFixed(0)}%</span>
          <span>Nodes: {engineRef.current?.getAllNodes().length || 0}</span>
          <span>Links: {engineRef.current?.getAllLinks().length || 0}</span>
          {selection.selectedNodes.size > 0 && (
            <span className='text-blue-600'>Selected: {selection.selectedNodes.size}</span>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {!isInitialized && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <p className='text-gray-600'>Initializing ITTO Network...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveITTONetwork
