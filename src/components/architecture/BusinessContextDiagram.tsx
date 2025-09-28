import React, { useState, useRef, useEffect } from 'react'
import {
  Users,
  Database,
  Cloud,
  Code,
  Shield,
  Zap,
  Brain,
  BookOpen,
  GitBranch,
  Globe,
  Server,
  Lock,
  Activity,
  ArrowRight,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
} from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

/**
 * Business Context Diagram Component
 *
 * Interactive SVG-based architecture diagram showing:
 * - System boundaries and components
 * - External actors and systems
 * - Data flows and integrations
 * - System interfaces
 */

interface Actor {
  id: string
  name: string
  type: 'user' | 'system' | 'service'
  icon: React.ElementType
  description: string
  color: string
  position: { x: number; y: number }
}

interface DataFlow {
  id: string
  from: string
  to: string
  label: string
  type: 'data' | 'auth' | 'api' | 'cache' | 'deploy'
  bidirectional?: boolean
}

interface Subsystem {
  id: string
  name: string
  description: string
  technologies: string[]
  color: string
  position: { x: number; y: number }
  width: number
  height: number
}

const BusinessContextDiagram: React.FC = () => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Define actors (users and external systems)
  const actors: Actor[] = [
    {
      id: 'learner',
      name: 'PMP Learner',
      type: 'user',
      icon: Users,
      description: 'Primary user studying for PMP certification',
      color: '#3B82F6',
      position: { x: 100, y: 200 },
    },
    {
      id: 'admin',
      name: 'Administrator',
      type: 'user',
      icon: Shield,
      description: 'System administrator managing content and users',
      color: '#EF4444',
      position: { x: 100, y: 350 },
    },
    {
      id: 'mentor',
      name: 'Mentor',
      type: 'user',
      icon: BookOpen,
      description: 'Expert providing guidance to learners',
      color: '#10B981',
      position: { x: 100, y: 500 },
    },
  ]

  // Define external systems
  const externalSystems: Actor[] = [
    {
      id: 'supabase',
      name: 'Supabase',
      type: 'system',
      icon: Database,
      description: 'Authentication & database backend',
      color: '#3ECF8E',
      position: { x: 900, y: 150 },
    },
    {
      id: 'upstash',
      name: 'Upstash Redis',
      type: 'system',
      icon: Zap,
      description: 'Serverless caching layer',
      color: '#00E9A3',
      position: { x: 900, y: 300 },
    },
    {
      id: 'github',
      name: 'GitHub Pages',
      type: 'system',
      icon: GitBranch,
      description: 'Static site hosting & deployment',
      color: '#24292E',
      position: { x: 900, y: 450 },
    },
    {
      id: 'context7',
      name: 'Context7 MCP',
      type: 'service',
      icon: Brain,
      description: 'Documentation & library context',
      color: '#8B5CF6',
      position: { x: 900, y: 600 },
    },
    {
      id: 'serena',
      name: 'Serena MCP',
      type: 'service',
      icon: Code,
      description: 'Code analysis & semantic search',
      color: '#EC4899',
      position: { x: 900, y: 750 },
    },
  ]

  // Define internal subsystems (core application components)
  const subsystems: Subsystem[] = [
    {
      id: 'frontend',
      name: 'Frontend Layer',
      description: 'React PWA with interactive UI',
      technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite'],
      color: '#3B82F6',
      position: { x: 300, y: 100 },
      width: 250,
      height: 120,
    },
    {
      id: 'learning',
      name: 'Learning Modules',
      description: 'Core learning functionality',
      technologies: ['PMBOK Data', 'Progress Tracking', 'Flashcards', 'Mock Exams'],
      color: '#10B981',
      position: { x: 300, y: 250 },
      width: 250,
      height: 120,
    },
    {
      id: 'visualization',
      name: 'Visualization Engine',
      description: 'Data visualization components',
      technologies: ['D3.js', 'Force Graphs', 'Heatmaps', 'Sankey Diagrams'],
      color: '#F59E0B',
      position: { x: 300, y: 400 },
      width: 250,
      height: 120,
    },
    {
      id: 'collaboration',
      name: 'Collaboration Hub',
      description: 'Social learning features',
      technologies: ['Study Groups', 'Shared Notes', 'Discussions', 'Mentorship'],
      color: '#8B5CF6',
      position: { x: 300, y: 550 },
      width: 250,
      height: 120,
    },
    {
      id: 'ai',
      name: 'AI Coaching',
      description: 'Intelligent learning assistance',
      technologies: ['AI Coach', 'Project Simulator', 'Adaptive Learning'],
      color: '#EC4899',
      position: { x: 300, y: 700 },
      width: 250,
      height: 120,
    },
    {
      id: 'services',
      name: 'Service Layer',
      description: 'Business logic & data management',
      technologies: ['Context Manager', 'Progress Service', 'Auth Service', 'Export/Import'],
      color: '#6366F1',
      position: { x: 600, y: 250 },
      width: 250,
      height: 180,
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      description: 'Deployment & monitoring',
      technologies: ['GitHub Actions', 'IDD Workflow', 'PWA Service Worker'],
      color: '#64748B',
      position: { x: 600, y: 470 },
      width: 250,
      height: 120,
    },
    {
      id: 'security',
      name: 'Security Layer',
      description: 'Authentication & authorization',
      technologies: ['JWT', 'RBAC', 'OAuth', 'Session Management'],
      color: '#DC2626',
      position: { x: 600, y: 630 },
      width: 250,
      height: 120,
    },
  ]

  // Define data flows
  const dataFlows: DataFlow[] = [
    // User to Frontend
    { id: 'flow1', from: 'learner', to: 'frontend', label: 'User Interactions', type: 'data' },
    { id: 'flow2', from: 'admin', to: 'frontend', label: 'Admin Actions', type: 'data' },
    { id: 'flow3', from: 'mentor', to: 'frontend', label: 'Mentorship', type: 'data' },

    // Frontend to Learning Modules
    { id: 'flow4', from: 'frontend', to: 'learning', label: 'Learning Requests', type: 'data' },
    { id: 'flow5', from: 'frontend', to: 'visualization', label: 'Viz Requests', type: 'data' },
    { id: 'flow6', from: 'frontend', to: 'collaboration', label: 'Social Actions', type: 'data' },
    { id: 'flow7', from: 'frontend', to: 'ai', label: 'AI Queries', type: 'api' },

    // Internal module connections
    { id: 'flow8', from: 'learning', to: 'services', label: 'Progress Updates', type: 'data' },
    { id: 'flow9', from: 'collaboration', to: 'services', label: 'Data Sync', type: 'data' },
    { id: 'flow10', from: 'ai', to: 'services', label: 'Learning Analytics', type: 'data' },
    { id: 'flow11', from: 'visualization', to: 'services', label: 'Data Queries', type: 'data' },

    // Services to external systems
    {
      id: 'flow12',
      from: 'services',
      to: 'supabase',
      label: 'Data Persistence',
      type: 'data',
      bidirectional: true,
    },
    {
      id: 'flow13',
      from: 'services',
      to: 'upstash',
      label: 'Caching',
      type: 'cache',
      bidirectional: true,
    },

    // Security layer
    {
      id: 'flow14',
      from: 'frontend',
      to: 'security',
      label: 'Auth Requests',
      type: 'auth',
    },
    {
      id: 'flow15',
      from: 'security',
      to: 'supabase',
      label: 'Auth Verification',
      type: 'auth',
      bidirectional: true,
    },

    // Infrastructure
    {
      id: 'flow16',
      from: 'infrastructure',
      to: 'github',
      label: 'CI/CD Deploy',
      type: 'deploy',
    },

    // MCP services
    {
      id: 'flow17',
      from: 'services',
      to: 'context7',
      label: 'Doc Context',
      type: 'api',
    },
    {
      id: 'flow18',
      from: 'services',
      to: 'serena',
      label: 'Code Analysis',
      type: 'api',
    },
  ]

  // Zoom controls
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 3))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Export as PNG
  const handleExport = () => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 1200
    canvas.height = 900

    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = 'pmp-business-context-diagram.png'
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  // Render actor node
  const renderActor = (actor: Actor) => {
    const Icon = actor.icon
    const isSelected = selectedElement === actor.id
    const isHovered = hoveredElement === actor.id

    return (
      <g
        key={actor.id}
        transform={`translate(${actor.position.x}, ${actor.position.y})`}
        onMouseEnter={() => setHoveredElement(actor.id)}
        onMouseLeave={() => setHoveredElement(null)}
        onClick={() => setSelectedElement(actor.id)}
        className='cursor-pointer'
      >
        {/* Shadow for depth */}
        <circle cx='40' cy='43' r='35' fill='rgba(0,0,0,0.1)' filter='blur(3px)' />

        {/* Main circle */}
        <circle
          cx='40'
          cy='40'
          r='35'
          fill={isSelected || isHovered ? actor.color : 'white'}
          stroke={actor.color}
          strokeWidth={isSelected ? 4 : 2}
          className='transition-all duration-200'
        />

        {/* Icon */}
        <foreignObject x='15' y='15' width='50' height='50'>
          <div className='flex h-full w-full items-center justify-center'>
            <Icon
              size={24}
              color={isSelected || isHovered ? 'white' : actor.color}
              strokeWidth={2}
            />
          </div>
        </foreignObject>

        {/* Label */}
        <text x='40' y='95' textAnchor='middle' className='text-sm font-semibold' fill='#1F2937'>
          {actor.name}
        </text>

        {/* Tooltip on hover */}
        {isHovered && (
          <g transform='translate(40, -30)'>
            <rect x='-80' y='-25' width='160' height='40' rx='6' fill='#1F2937' opacity='0.95' />
            <text x='0' y='-5' textAnchor='middle' className='text-xs' fill='white'>
              {actor.description}
            </text>
          </g>
        )}
      </g>
    )
  }

  // Render subsystem box
  const renderSubsystem = (subsystem: Subsystem) => {
    const isSelected = selectedElement === subsystem.id
    const isHovered = hoveredElement === subsystem.id

    return (
      <g
        key={subsystem.id}
        transform={`translate(${subsystem.position.x}, ${subsystem.position.y})`}
        onMouseEnter={() => setHoveredElement(subsystem.id)}
        onMouseLeave={() => setHoveredElement(null)}
        onClick={() => setSelectedElement(subsystem.id)}
        className='cursor-pointer'
      >
        {/* Shadow */}
        <rect
          x='3'
          y='3'
          width={subsystem.width}
          height={subsystem.height}
          rx='8'
          fill='rgba(0,0,0,0.1)'
          filter='blur(3px)'
        />

        {/* Main box */}
        <rect
          x='0'
          y='0'
          width={subsystem.width}
          height={subsystem.height}
          rx='8'
          fill='white'
          stroke={subsystem.color}
          strokeWidth={isSelected ? 3 : 2}
          className='transition-all duration-200'
        />

        {/* Header bar */}
        <rect
          x='0'
          y='0'
          width={subsystem.width}
          height='35'
          rx='8'
          fill={subsystem.color}
          opacity={isHovered ? 1 : 0.9}
        />

        {/* Title */}
        <text
          x={subsystem.width / 2}
          y='23'
          textAnchor='middle'
          className='text-sm font-bold'
          fill='white'
        >
          {subsystem.name}
        </text>

        {/* Description */}
        <text x='10' y='55' className='text-xs' fill='#4B5563'>
          {subsystem.description}
        </text>

        {/* Technologies */}
        <foreignObject x='10' y='70' width={subsystem.width - 20} height={subsystem.height - 80}>
          <div className='flex flex-wrap gap-1'>
            {subsystem.technologies.map((tech, i) => (
              <span key={i} className='rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700'>
                {tech}
              </span>
            ))}
          </div>
        </foreignObject>
      </g>
    )
  }

  // Render data flow arrow
  const renderDataFlow = (flow: DataFlow) => {
    // Find source and target elements
    const allElements = [...actors, ...externalSystems, ...subsystems]
    const source = allElements.find((e) => e.id === flow.from)
    const target = allElements.find((e) => e.id === flow.to)

    if (!source || !target) return null

    // Calculate positions
    const sourcePos =
      'width' in source
        ? { x: source.position.x + source.width / 2, y: source.position.y + source.height / 2 }
        : { x: source.position.x + 40, y: source.position.y + 40 }

    const targetPos =
      'width' in target
        ? { x: target.position.x + target.width / 2, y: target.position.y + target.height / 2 }
        : { x: target.position.x + 40, y: target.position.y + 40 }

    // Color based on type
    const colors = {
      data: '#3B82F6',
      auth: '#EF4444',
      api: '#8B5CF6',
      cache: '#10B981',
      deploy: '#F59E0B',
    }

    const color = colors[flow.type]
    const isHovered = hoveredElement === flow.id

    return (
      <g
        key={flow.id}
        onMouseEnter={() => setHoveredElement(flow.id)}
        onMouseLeave={() => setHoveredElement(null)}
        className='cursor-pointer'
      >
        {/* Line */}
        <line
          x1={sourcePos.x}
          y1={sourcePos.y}
          x2={targetPos.x}
          y2={targetPos.y}
          stroke={color}
          strokeWidth={isHovered ? 3 : 2}
          strokeDasharray={flow.type === 'api' ? '5,5' : 'none'}
          markerEnd={`url(#arrowhead-${flow.type})`}
          opacity={isHovered ? 1 : 0.6}
          className='transition-all duration-200'
        />

        {/* Bidirectional arrow */}
        {flow.bidirectional && (
          <line
            x1={sourcePos.x}
            y1={sourcePos.y}
            x2={targetPos.x}
            y2={targetPos.y}
            stroke={color}
            strokeWidth={isHovered ? 3 : 2}
            markerStart={`url(#arrowhead-${flow.type})`}
            opacity={0}
          />
        )}

        {/* Label background */}
        <rect
          x={(sourcePos.x + targetPos.x) / 2 - 50}
          y={(sourcePos.y + targetPos.y) / 2 - 12}
          width='100'
          height='24'
          rx='4'
          fill='white'
          stroke={color}
          strokeWidth='1'
          opacity={isHovered ? 1 : 0.8}
        />

        {/* Label text */}
        <text
          x={(sourcePos.x + targetPos.x) / 2}
          y={(sourcePos.y + targetPos.y) / 2 + 4}
          textAnchor='middle'
          className='text-xs font-medium'
          fill={color}
        >
          {flow.label}
        </text>
      </g>
    )
  }

  return (
    <div className='flex h-full w-full flex-col bg-gray-50'>
      {/* Header */}
      <div className='border-b border-gray-200 bg-white px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Business Context Diagram</h1>
            <p className='mt-1 text-sm text-gray-600'>
              PMP Learning Management System - Architecture Overview
            </p>
          </div>

          {/* Controls */}
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={handleZoomOut}>
              <ZoomOut className='h-4 w-4' />
            </Button>
            <span className='px-3 text-sm font-medium'>{Math.round(zoom * 100)}%</span>
            <Button variant='outline' size='sm' onClick={handleZoomIn}>
              <ZoomIn className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={handleResetView}>
              <Maximize2 className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={handleExport}>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main diagram area */}
      <div className='relative flex-1 overflow-hidden'>
        <svg
          ref={svgRef}
          width='100%'
          height='100%'
          className='bg-white'
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Define arrowhead markers */}
          <defs>
            {Object.entries({
              data: '#3B82F6',
              auth: '#EF4444',
              api: '#8B5CF6',
              cache: '#10B981',
              deploy: '#F59E0B',
            }).map(([type, color]) => (
              <marker
                key={type}
                id={`arrowhead-${type}`}
                markerWidth='10'
                markerHeight='10'
                refX='9'
                refY='3'
                orient='auto'
              >
                <polygon points='0 0, 10 3, 0 6' fill={color} />
              </marker>
            ))}
          </defs>

          {/* Main group with zoom and pan */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* System boundary box */}
            <rect
              x='280'
              y='80'
              width='590'
              height='690'
              rx='12'
              fill='none'
              stroke='#9CA3AF'
              strokeWidth='2'
              strokeDasharray='10,5'
            />
            <text x='575' y='60' textAnchor='middle' className='text-lg font-bold' fill='#4B5563'>
              PMP Learning Management System
            </text>

            {/* Render data flows (behind everything) */}
            {dataFlows.map(renderDataFlow)}

            {/* Render subsystems */}
            {subsystems.map(renderSubsystem)}

            {/* Render actors and external systems */}
            {[...actors, ...externalSystems].map(renderActor)}
          </g>
        </svg>

        {/* Legend */}
        <Card className='absolute bottom-4 right-4 w-64 p-4 shadow-lg'>
          <h3 className='mb-3 flex items-center gap-2 font-semibold'>
            <Info className='h-4 w-4' />
            Legend
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 rounded-full border-2 border-blue-500' />
              <span>Users</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 rounded border-2 border-gray-400' />
              <span>Subsystems</span>
            </div>
            <div className='flex items-center gap-2'>
              <ArrowRight className='h-4 w-4 text-blue-500' />
              <span>Data Flow</span>
            </div>
            <div className='flex items-center gap-2'>
              <ArrowRight className='h-4 w-4 text-red-500' />
              <span>Authentication</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-0.5 w-4 border-t-2 border-dashed border-purple-500' />
              <span>API Call</span>
            </div>
            <div className='flex items-center gap-2'>
              <ArrowRight className='h-4 w-4 text-green-500' />
              <span>Caching</span>
            </div>
            <div className='flex items-center gap-2'>
              <ArrowRight className='h-4 w-4 text-orange-500' />
              <span>Deployment</span>
            </div>
          </div>
        </Card>

        {/* Element details panel */}
        {selectedElement && (
          <Card className='absolute left-4 top-4 w-80 p-4 shadow-lg'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='font-semibold'>Element Details</h3>
              <button
                onClick={() => setSelectedElement(null)}
                className='text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            </div>
            {(() => {
              const element = [...actors, ...externalSystems, ...subsystems].find(
                (e) => e.id === selectedElement
              )
              if (!element) return null

              return (
                <div className='space-y-2'>
                  <div>
                    <Badge
                      variant='outline'
                      className='mb-2'
                      style={{ borderColor: element.color }}
                    >
                      {'type' in element ? element.type : 'subsystem'}
                    </Badge>
                    <h4 className='text-lg font-semibold'>{element.name}</h4>
                    <p className='text-sm text-gray-600'>
                      {'description' in element ? element.description : ''}
                    </p>
                  </div>
                  {'technologies' in element && (
                    <div>
                      <p className='mb-1 text-xs font-semibold text-gray-700'>Technologies:</p>
                      <div className='flex flex-wrap gap-1'>
                        {element.technologies.map((tech, i) => (
                          <Badge key={i} variant='secondary' className='text-xs'>
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </Card>
        )}
      </div>
    </div>
  )
}

export default BusinessContextDiagram
