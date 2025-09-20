import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  BookmarkPlus,
  Download,
  Settings,
  Play,
  Pause,
} from 'lucide-react'

interface ITTOElement {
  id: string
  name: string
  type: 'input' | 'tool' | 'output'
  processId: string
  processName: string
  knowledgeArea: string
  processGroup: string
  description?: string
  examples?: string[]
  relationships: string[] // Connected element IDs
  complexity: 'low' | 'medium' | 'high'
  importance: number // 1-10
  userProgress?: {
    understood: boolean
    practiced: boolean
    mastered: boolean
  }
}

interface ProcessNode {
  id: string
  name: string
  knowledgeArea: string
  processGroup: string
  inputs: ITTOElement[]
  tools: ITTOElement[]
  outputs: ITTOElement[]
  x?: number
  y?: number
  fx?: number
  fy?: number
}

interface Link {
  source: string
  target: string
  type: 'input-to-process' | 'process-to-output' | 'output-to-input' | 'tool-relationship'
  strength: number
}

interface EnhancedITTODiagramProps {
  processes: ProcessNode[]
  onElementSelect?: (element: ITTOElement | ProcessNode) => void
  onRelationshipExplore?: (sourceId: string, targetId: string) => void
  className?: string
}

const KNOWLEDGE_AREA_COLORS = {
  Integration: '#FF6B6B',
  Scope: '#4ECDC4',
  Schedule: '#45B7D1',
  Cost: '#96CEB4',
  Quality: '#FFEAA7',
  Resource: '#DDA0DD',
  Communications: '#98D8C8',
  Risk: '#F7DC6F',
  Procurement: '#BB8FCE',
  Stakeholder: '#85C1E9',
} as const

const PROCESS_GROUP_COLORS = {
  Initiating: '#E8F5E8',
  Planning: '#E8F4FD',
  Executing: '#FFF2E8',
  Monitoring: '#F5E8F5',
  Closing: '#F8F8F8',
} as const

export const EnhancedITTODiagram: React.FC<EnhancedITTODiagramProps> = ({
  processes,
  onElementSelect,
  onRelationshipExplore,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // State management
  const [selectedElement, setSelectedElement] = useState<ITTOElement | ProcessNode | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterConfig, setFilterConfig] = useState({
    knowledgeAreas: new Set<string>(),
    processGroups: new Set<string>(),
    complexity: new Set<string>(),
    progressStatus: new Set<string>(),
    showOnlyConnected: false,
  })
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'flow' | 'matrix'>('overview')
  const [isAnimating, setIsAnimating] = useState(false)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [zoomLevel, setZoomLevel] = useState(1)

  // Simulation references
  const simulationRef = useRef<d3.Simulation<ProcessNode, Link> | null>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  // Process data for visualization
  const processedData = useMemo(() => {
    const allElements: (ITTOElement & { nodeType: 'element' })[] = []
    const processNodes: (ProcessNode & { nodeType: 'process' })[] = []
    const links: Link[] = []

    // Filter processes based on current filters
    const filteredProcesses = processes.filter((process) => {
      if (
        filterConfig.knowledgeAreas.size > 0 &&
        !filterConfig.knowledgeAreas.has(process.knowledgeArea)
      ) {
        return false
      }
      if (
        filterConfig.processGroups.size > 0 &&
        !filterConfig.processGroups.has(process.processGroup)
      ) {
        return false
      }
      return true
    })

    filteredProcesses.forEach((process) => {
      processNodes.push({ ...process, nodeType: 'process' })

      // Add all ITTO elements
      ;[...process.inputs, ...process.tools, ...process.outputs].forEach((element) => {
        // Apply filters
        if (
          searchTerm &&
          !element.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !element.description?.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return
        }
        if (filterConfig.complexity.size > 0 && !filterConfig.complexity.has(element.complexity)) {
          return
        }

        allElements.push({ ...element, nodeType: 'element' })

        // Create links
        if (element.type === 'input') {
          links.push({
            source: element.id,
            target: process.id,
            type: 'input-to-process',
            strength: 0.8,
          })
        } else if (element.type === 'output') {
          links.push({
            source: process.id,
            target: element.id,
            type: 'process-to-output',
            strength: 0.8,
          })
        }

        // Create relationship links
        element.relationships.forEach((relId) => {
          if (allElements.find((e) => e.id === relId)) {
            links.push({
              source: element.id,
              target: relId,
              type: 'output-to-input',
              strength: 0.6,
            })
          }
        })
      })
    })

    return { elements: allElements, processes: processNodes, links }
  }, [processes, searchTerm, filterConfig])

  // Initialize D3 visualization
  const initializeVisualization = useCallback(() => {
    if (!svgRef.current || !containerRef.current) {
      return
    }

    const container = containerRef.current
    const svg = d3.select(svgRef.current)
    const width = container.clientWidth
    const height = container.clientHeight

    svg.selectAll('*').remove()

    // Setup zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        svg.select('.main-group').attr('transform', event.transform)
        setZoomLevel(event.transform.k)
      })

    svg.call(zoom)
    zoomRef.current = zoom

    // Create main group
    const mainGroup = svg.append('g').attr('class', 'main-group')

    // Create defs for patterns and gradients
    const defs = svg.append('defs')

    // Add patterns for different element types
    Object.entries(KNOWLEDGE_AREA_COLORS).forEach(([area, color]) => {
      const pattern = defs
        .append('pattern')
        .attr('id', `pattern-${area.toLowerCase()}`)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 20)
        .attr('height', 20)

      pattern
        .append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', color)
        .attr('opacity', 0.3)

      pattern
        .append('path')
        .attr('d', 'M0,10 L20,10 M10,0 L10,20')
        .attr('stroke', color)
        .attr('stroke-width', 1)
    })

    // Arrow markers
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#666')

    // Initialize simulation
    const simulation = d3
      .forceSimulation<ProcessNode>()
      .force(
        'link',
        d3
          .forceLink<ProcessNode, Link>()
          .id((d: any) => d.id)
          .distance((d) => (viewMode === 'flow' ? 100 : 80))
          .strength((d) => d.strength)
      )
      .force('charge', d3.forceManyBody().strength(viewMode === 'detailed' ? -300 : -200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    simulationRef.current = simulation

    renderVisualization()
  }, [viewMode, processedData])

  // Render the visualization
  const renderVisualization = useCallback(() => {
    if (!svgRef.current || !simulationRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    const mainGroup = svg.select('.main-group')
    const { elements, processes, links } = processedData
    const allNodes = [...elements, ...processes] as any[]

    // Render links
    const linkSelection = mainGroup
      .selectAll('.link')
      .data(links, (d: any) => `${d.source}-${d.target}`)

    linkSelection.exit().remove()

    const linkEnter = linkSelection
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', (d) => {
        switch (d.type) {
          case 'input-to-process':
            return '#4CAF50'
          case 'process-to-output':
            return '#2196F3'
          case 'output-to-input':
            return '#FF9800'
          default:
            return '#666'
        }
      })
      .attr('stroke-width', (d) => d.strength * 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)')

    const linkUpdate = linkEnter.merge(linkSelection)

    // Render nodes
    const nodeSelection = mainGroup.selectAll('.node').data(allNodes, (d: any) => d.id)

    nodeSelection.exit().remove()

    const nodeEnter = nodeSelection
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')

    // Add different shapes for different node types
    nodeEnter.each(function (d: any) {
      const node = d3.select(this)

      if (d.nodeType === 'process') {
        // Process nodes as rectangles
        node
          .append('rect')
          .attr('width', 120)
          .attr('height', 60)
          .attr('x', -60)
          .attr('y', -30)
          .attr('rx', 8)
          .attr(
            'fill',
            PROCESS_GROUP_COLORS[d.processGroup as keyof typeof PROCESS_GROUP_COLORS] || '#f0f0f0'
          )
          .attr(
            'stroke',
            KNOWLEDGE_AREA_COLORS[d.knowledgeArea as keyof typeof KNOWLEDGE_AREA_COLORS] || '#666'
          )
          .attr('stroke-width', 2)
      } else {
        // Element nodes as circles/shapes based on type
        const shape = node
          .append('circle')
          .attr('r', (d) => {
            switch (d.type) {
              case 'input':
                return 25
              case 'tool':
                return 20
              case 'output':
                return 25
              default:
                return 20
            }
          })
          .attr('fill', (d) => {
            const baseColor =
              KNOWLEDGE_AREA_COLORS[d.knowledgeArea as keyof typeof KNOWLEDGE_AREA_COLORS] || '#666'
            switch (d.type) {
              case 'input':
                return baseColor
              case 'tool':
                return d3.color(baseColor)?.brighter(0.5)?.toString() || baseColor
              case 'output':
                return d3.color(baseColor)?.darker(0.3)?.toString() || baseColor
              default:
                return baseColor
            }
          })
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)

        // Add progress indicators
        if (d.userProgress) {
          const progressRing = node
            .append('circle')
            .attr('r', 30)
            .attr('fill', 'none')
            .attr(
              'stroke',
              d.userProgress.mastered
                ? '#4CAF50'
                : d.userProgress.practiced
                  ? '#FF9800'
                  : d.userProgress.understood
                    ? '#2196F3'
                    : '#ddd'
            )
            .attr('stroke-width', 3)
            .attr('stroke-dasharray', d.userProgress.mastered ? 'none' : '5,3')
        }
      }

      // Add labels
      const text = node
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('fill', '#333')
        .style('font-size', '12px')
        .style('font-weight', d.nodeType === 'process' ? 'bold' : 'normal')

      // Multi-line text for long names
      const words = d.name.split(' ')
      if (words.length > 3) {
        text.append('tspan').attr('x', 0).attr('dy', '-0.3em').text(words.slice(0, 2).join(' '))
        text.append('tspan').attr('x', 0).attr('dy', '1.2em').text(words.slice(2).join(' '))
      } else {
        text.text(d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name)
      }
    })

    const nodeUpdate = nodeEnter.merge(nodeSelection)

    // Add interactions
    nodeUpdate
      .on('click', (event, d: any) => {
        event.stopPropagation()
        setSelectedElement(d)
        onElementSelect?.(d)
      })
      .on('mouseover', function (event, d: any) {
        d3.select(this).style('opacity', 0.8)

        // Highlight connected nodes
        const connectedIds = new Set([d.id])
        links.forEach((link) => {
          if (link.source === d.id) {
            connectedIds.add(link.target)
          }
          if (link.target === d.id) {
            connectedIds.add(link.source)
          }
        })

        nodeUpdate.style('opacity', (n: any) => (connectedIds.has(n.id) ? 1 : 0.3))
        linkUpdate.style('opacity', (l: any) => (l.source === d.id || l.target === d.id ? 1 : 0.1))
      })
      .on('mouseout', function () {
        nodeUpdate.style('opacity', 1)
        linkUpdate.style('opacity', 0.6)
      })
      .call(
        d3
          .drag<any, any>()
          .on('start', (event, d) => {
            if (!event.active) {
              simulationRef.current?.alphaTarget(0.3).restart()
            }
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) {
              simulationRef.current?.alphaTarget(0)
            }
            d.fx = null
            d.fy = null
          })
      )

    // Update simulation
    simulationRef.current.nodes(allNodes).force(
      'link',
      d3
        .forceLink<any, Link>()
        .links(links)
        .id((d: any) => d.id)
        .distance(80)
        .strength(0.1)
    )

    simulationRef.current.on('tick', () => {
      linkUpdate
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      nodeUpdate.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    simulationRef.current.restart()
  }, [processedData, selectedElement, onElementSelect])

  // Event handlers
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (!zoomRef.current || !svgRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    const currentTransform = d3.zoomTransform(svgRef.current)

    let newScale = currentTransform.k
    switch (direction) {
      case 'in':
        newScale = Math.min(currentTransform.k * 1.5, 4)
        break
      case 'out':
        newScale = Math.max(currentTransform.k / 1.5, 0.1)
        break
      case 'reset':
        newScale = 1
        break
    }

    svg.transition().duration(300).call(zoomRef.current.scaleTo, newScale)
  }

  const handleAnimationToggle = () => {
    setIsAnimating(!isAnimating)
    if (simulationRef.current) {
      if (isAnimating) {
        simulationRef.current.stop()
      } else {
        simulationRef.current.alpha(0.3).restart()
      }
    }
  }

  const handleBookmark = () => {
    if (selectedElement) {
      const newBookmarks = new Set(bookmarks)
      if (bookmarks.has(selectedElement.id)) {
        newBookmarks.delete(selectedElement.id)
      } else {
        newBookmarks.add(selectedElement.id)
      }
      setBookmarks(newBookmarks)
    }
  }

  const exportVisualization = () => {
    if (!svgRef.current) {
      return
    }

    const svgElement = svgRef.current
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const link = document.createElement('a')
      link.download = `ITTO-diagram-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL()
      link.click()
    }

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  // Initialize visualization on mount and data change
  useEffect(() => {
    initializeVisualization()
  }, [initializeVisualization])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      initializeVisualization()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initializeVisualization])

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Control Panel */}
      <Card className='mb-4'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              ITTO Relationship Explorer
            </CardTitle>
            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>Zoom: {Math.round(zoomLevel * 100)}%</Badge>
              <Button variant='outline' size='sm' onClick={handleAnimationToggle}>
                {isAnimating ? <Pause className='h-4 w-4' /> : <Play className='h-4 w-4' />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex flex-wrap gap-4'>
            {/* Search */}
            <div className='flex items-center gap-2'>
              <Search className='h-4 w-4' />
              <Input
                placeholder='Search ITTO elements...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-64'
              />
            </div>

            {/* View Mode Selector */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='detailed'>Detailed</TabsTrigger>
                <TabsTrigger value='flow'>Flow</TabsTrigger>
                <TabsTrigger value='matrix'>Matrix</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Controls */}
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={() => handleZoom('in')}>
                <ZoomIn className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='sm' onClick={() => handleZoom('out')}>
                <ZoomOut className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='sm' onClick={() => handleZoom('reset')}>
                <RotateCcw className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleBookmark}
                disabled={!selectedElement}
              >
                <BookmarkPlus className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='sm' onClick={exportVisualization}>
                <Download className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className='mb-4 flex flex-wrap gap-2'>
            {Object.keys(KNOWLEDGE_AREA_COLORS).map((area) => (
              <Badge
                key={area}
                variant={filterConfig.knowledgeAreas.has(area) ? 'default' : 'secondary'}
                className='cursor-pointer'
                style={{
                  backgroundColor: filterConfig.knowledgeAreas.has(area)
                    ? KNOWLEDGE_AREA_COLORS[area as keyof typeof KNOWLEDGE_AREA_COLORS]
                    : undefined,
                }}
                onClick={() => {
                  const newFilter = new Set(filterConfig.knowledgeAreas)
                  if (newFilter.has(area)) {
                    newFilter.delete(area)
                  } else {
                    newFilter.add(area)
                  }
                  setFilterConfig((prev) => ({ ...prev, knowledgeAreas: newFilter }))
                }}
              >
                {area}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Visualization */}
      <Card className='flex-1'>
        <CardContent className='h-full p-0'>
          <div ref={containerRef} className='relative h-full w-full'>
            <svg ref={svgRef} className='h-full w-full' style={{ minHeight: '600px' }} />
          </div>
        </CardContent>
      </Card>

      {/* Selected Element Details */}
      {selectedElement && (
        <Card className='mt-4'>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>
                {selectedElement.name}
                {'type' in selectedElement && (
                  <Badge className='ml-2'>{selectedElement.type.toUpperCase()}</Badge>
                )}
              </span>
              <Button variant='ghost' size='sm' onClick={() => setSelectedElement(null)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h4 className='mb-2 font-semibold'>Details</h4>
                <div className='space-y-1 text-sm'>
                  <div>
                    <span className='font-medium'>Knowledge Area:</span>{' '}
                    {selectedElement.knowledgeArea}
                  </div>
                  <div>
                    <span className='font-medium'>Process Group:</span>{' '}
                    {selectedElement.processGroup}
                  </div>
                  {'complexity' in selectedElement && (
                    <div>
                      <span className='font-medium'>Complexity:</span> {selectedElement.complexity}
                    </div>
                  )}
                  {'importance' in selectedElement && (
                    <div>
                      <span className='font-medium'>Importance:</span> {selectedElement.importance}
                      /10
                    </div>
                  )}
                </div>
              </div>
              <div>
                {selectedElement.description && (
                  <>
                    <h4 className='mb-2 font-semibold'>Description</h4>
                    <p className='text-sm text-gray-600'>{selectedElement.description}</p>
                  </>
                )}
              </div>
            </div>

            {'relationships' in selectedElement && selectedElement.relationships.length > 0 && (
              <div className='mt-4'>
                <h4 className='mb-2 font-semibold'>Relationships</h4>
                <div className='flex flex-wrap gap-2'>
                  {selectedElement.relationships.map((relId) => (
                    <Badge key={relId} variant='outline' className='cursor-pointer'>
                      {relId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {'userProgress' in selectedElement && selectedElement.userProgress && (
              <div className='mt-4'>
                <h4 className='mb-2 font-semibold'>Learning Progress</h4>
                <div className='flex gap-4'>
                  <Badge
                    variant={selectedElement.userProgress.understood ? 'default' : 'secondary'}
                  >
                    Understood
                  </Badge>
                  <Badge variant={selectedElement.userProgress.practiced ? 'default' : 'secondary'}>
                    Practiced
                  </Badge>
                  <Badge variant={selectedElement.userProgress.mastered ? 'default' : 'secondary'}>
                    Mastered
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EnhancedITTODiagram
