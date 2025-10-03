/**
 * ITTO Force Graph Component - Refactored Version
 *
 * A modern, performant force-directed graph visualization for PMBOK ITTO relationships.
 * This refactored version follows React 18+ best practices:
 *
 * 1. Separation of Concerns: D3.js logic extracted into useD3ForceSimulation custom hook
 * 2. Performance Optimization: Proper memoization with useMemo and useCallback
 * 3. Accessibility: ARIA labels, keyboard navigation support
 * 4. Type Safety: Full TypeScript implementation
 * 5. Modern React Patterns: Composition, custom hooks, and error boundaries
 *
 * @module ITTOForceGraph
 */

import React, { useRef, useState, useMemo, useCallback, memo } from 'react'
import * as d3 from 'd3'
import { Filter, RotateCcw, ZoomIn, ZoomOut, Menu, X } from 'lucide-react'
import { glossaryService } from '../../services/glossaryService'
import { GlossaryDialog } from '../learning'
import { useNavigate } from 'react-router-dom'
import {
  useD3ForceSimulation,
  ForceNode,
  ForceLink,
  type ForceSimulationConfig,
  type RenderCallbacks,
} from '../../hooks/useD3ForceSimulation'
import { useWindowSize } from '../../hooks/useWindowSize'

// ============================================================================
// Types
// ============================================================================

interface FilterState {
  processGroups: string[]
  knowledgeAreas: string[]
}

interface GraphData {
  nodes: ForceNode[]
  links: ForceLink[]
}

// ============================================================================
// Constants
// ============================================================================

const PROCESS_GROUPS = ['立ち上げ', '計画', '実行', '監視・コントロール', '終結'] as const

const KNOWLEDGE_AREAS = [
  '統合',
  'スコープ',
  'スケジュール',
  'コスト',
  '品質',
  '資源',
  'コミュニケーション',
  'リスク',
  '調達',
  'ステークホルダー',
] as const

const KNOWLEDGE_AREA_COLORS: Record<string, string> = {
  統合: '#8B5CF6',
  スコープ: '#3B82F6',
  スケジュール: '#06B6D4',
  コスト: '#10B981',
  品質: '#F59E0B',
  資源: '#EF4444',
  コミュニケーション: '#EC4899',
  リスク: '#6366F1',
  調達: '#84CC16',
  ステークホルダー: '#F97316',
}

const NODE_TYPE_COLORS = {
  process: (area: string) => KNOWLEDGE_AREA_COLORS[area] || '#gray',
  input: '#3B82F6',
  tool: '#10B981',
  output: '#F59E0B',
}

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Legend component showing node type representations
 */
const Legend = memo(() => (
  <div className='mb-4 md:mb-6'>
    <h3 className='mb-2 text-sm font-semibold md:text-base'>凡例</h3>
    <div className='space-y-1 text-xs md:space-y-2 md:text-sm'>
      <div className='flex items-center gap-2'>
        <div
          className='h-4 w-4 flex-shrink-0 rounded-full bg-blue-500 md:h-6 md:w-6'
          aria-hidden='true'
        />
        <span>プロセス（知識エリア別）</span>
      </div>
      <div className='flex items-center gap-2'>
        <div
          className='h-4 w-4 flex-shrink-0 rotate-45 transform bg-blue-500 md:h-6 md:w-6'
          aria-hidden='true'
        />
        <span>インプット</span>
      </div>
      <div className='flex items-center gap-2'>
        <div className='h-4 w-4 flex-shrink-0 bg-green-500 md:h-6 md:w-6' aria-hidden='true' />
        <span>ツールと技法</span>
      </div>
      <div className='flex items-center gap-2'>
        <div
          className='h-0 w-0 flex-shrink-0 border-b-[14px] border-l-[8px] border-r-[8px] border-b-amber-500 border-l-transparent border-r-transparent md:border-b-[20px] md:border-l-[12px] md:border-r-[12px]'
          aria-hidden='true'
        />
        <span>アウトプット</span>
      </div>
    </div>
  </div>
))

Legend.displayName = 'Legend'

/**
 * Filter section component
 */
interface FilterSectionProps {
  selectedFilters: FilterState
  onFilterChange: (type: keyof FilterState, value: string) => void
}

const FilterSection = memo<FilterSectionProps>(({ selectedFilters, onFilterChange }) => (
  <div className='mb-4 md:mb-6'>
    <h3 className='mb-2 flex items-center gap-2 text-sm font-semibold md:text-base'>
      <Filter className='h-3 w-3 md:h-4 md:w-4' aria-hidden='true' />
      フィルター
    </h3>

    {/* Process Groups Filter */}
    <fieldset className='mb-3 md:mb-4'>
      <legend className='mb-2 text-xs font-medium md:text-sm'>プロセス群</legend>
      <div className='space-y-1'>
        {PROCESS_GROUPS.map((group) => (
          <label
            key={group}
            className='flex cursor-pointer items-center gap-2 rounded p-1 text-xs hover:bg-gray-50 md:text-sm'
          >
            <input
              type='checkbox'
              checked={selectedFilters.processGroups.includes(group)}
              onChange={() => onFilterChange('processGroups', group)}
              className='h-3 w-3 rounded md:h-4 md:w-4'
              aria-label={`${group}プロセス群をフィルタリング`}
            />
            <span className='truncate'>{group}</span>
          </label>
        ))}
      </div>
    </fieldset>

    {/* Knowledge Areas Filter */}
    <fieldset>
      <legend className='mb-2 text-xs font-medium md:text-sm'>知識エリア</legend>
      <div className='space-y-1'>
        {KNOWLEDGE_AREAS.map((area) => (
          <label
            key={area}
            className='flex cursor-pointer items-center gap-2 rounded p-1 text-xs hover:bg-gray-50 md:text-sm'
          >
            <input
              type='checkbox'
              checked={selectedFilters.knowledgeAreas.includes(area)}
              onChange={() => onFilterChange('knowledgeAreas', area)}
              className='h-3 w-3 rounded md:h-4 md:w-4'
              aria-label={`${area}知識エリアをフィルタリング`}
            />
            <div className='flex items-center gap-1 md:gap-2'>
              <div
                className='h-2 w-2 flex-shrink-0 rounded-full md:h-3 md:w-3'
                style={{ backgroundColor: KNOWLEDGE_AREA_COLORS[area] }}
                aria-hidden='true'
              />
              <span className='truncate'>{area}</span>
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  </div>
))

FilterSection.displayName = 'FilterSection'

/**
 * Zoom controls component
 */
interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  isMobile: boolean
}

const ZoomControls = memo<ZoomControlsProps>(({ onZoomIn, onZoomOut, onReset, isMobile }) => (
  <div className='border-t pt-3 md:pt-4'>
    <h3 className='mb-2 text-sm font-semibold md:text-base'>コントロール</h3>
    <div className='flex flex-wrap gap-2'>
      <button
        onClick={onZoomIn}
        className='flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-3 md:text-sm'
        aria-label='グラフを拡大'
      >
        <ZoomIn className='h-3 w-3 md:h-4 md:w-4' aria-hidden='true' />
        <span className='hidden md:inline'>拡大</span>
      </button>
      <button
        onClick={onZoomOut}
        className='flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-3 md:text-sm'
        aria-label='グラフを縮小'
      >
        <ZoomOut className='h-3 w-3 md:h-4 md:w-4' aria-hidden='true' />
        <span className='hidden md:inline'>縮小</span>
      </button>
      <button
        onClick={onReset}
        className='flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-3 md:text-sm'
        aria-label='ズームをリセット'
      >
        <RotateCcw className='h-3 w-3 md:h-4 md:w-4' aria-hidden='true' />
        <span className='hidden md:inline'>リセット</span>
      </button>
    </div>
    <p className='mt-2 text-xs text-gray-600'>
      • ノードを{isMobile ? 'タッチ' : 'クリック'}してフォーカス
      <br />
      • ノードをドラッグして位置変更
      <br />• {isMobile ? 'ピンチでズーム、ドラッグでパン' : 'スクロールでズーム、ドラッグでパン'}
    </p>
  </div>
))

ZoomControls.displayName = 'ZoomControls'

// ============================================================================
// Data Loading Hook
// ============================================================================

/**
 * Custom hook for loading ITTO graph data
 * In production, this would fetch from an API
 */
const useGraphData = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      const data: GraphData = {
        nodes: [
          // Integration Management Processes
          {
            id: 'p1',
            name: 'プロジェクト憲章の作成',
            type: 'process',
            group: '立ち上げ',
            area: '統合',
          },
          {
            id: 'p2',
            name: 'プロジェクトマネジメント計画書の作成',
            type: 'process',
            group: '計画',
            area: '統合',
          },
          {
            id: 'p3',
            name: 'プロジェクト作業の指揮・マネジメント',
            type: 'process',
            group: '実行',
            area: '統合',
          },
          {
            id: 'p4',
            name: 'プロジェクト知識のマネジメント',
            type: 'process',
            group: '実行',
            area: '統合',
          },
          {
            id: 'p5',
            name: 'プロジェクト作業の監視・コントロール',
            type: 'process',
            group: '監視・コントロール',
            area: '統合',
          },
          {
            id: 'p6',
            name: '統合変更管理',
            type: 'process',
            group: '監視・コントロール',
            area: '統合',
          },
          {
            id: 'p7',
            name: 'プロジェクトやフェーズの終結',
            type: 'process',
            group: '終結',
            area: '統合',
          },
          // Scope Management Processes
          {
            id: 'p8',
            name: 'スコープ・マネジメントの計画',
            type: 'process',
            group: '計画',
            area: 'スコープ',
          },
          { id: 'p9', name: '要求事項の収集', type: 'process', group: '計画', area: 'スコープ' },
          { id: 'p10', name: 'スコープの定義', type: 'process', group: '計画', area: 'スコープ' },
          { id: 'p11', name: 'WBSの作成', type: 'process', group: '計画', area: 'スコープ' },
          {
            id: 'p12',
            name: 'スコープの妥当性確認',
            type: 'process',
            group: '監視・コントロール',
            area: 'スコープ',
          },
          {
            id: 'p13',
            name: 'スコープのコントロール',
            type: 'process',
            group: '監視・コントロール',
            area: 'スコープ',
          },
          // Stakeholder Management Processes
          {
            id: 'p14',
            name: 'ステークホルダーの特定',
            type: 'process',
            group: '立ち上げ',
            area: 'ステークホルダー',
          },
          {
            id: 'p15',
            name: 'ステークホルダー・エンゲージメントの計画',
            type: 'process',
            group: '計画',
            area: 'ステークホルダー',
          },
          {
            id: 'p16',
            name: 'ステークホルダー・エンゲージメントのマネジメント',
            type: 'process',
            group: '実行',
            area: 'ステークホルダー',
          },
          {
            id: 'p17',
            name: 'ステークホルダー・エンゲージメントの監視',
            type: 'process',
            group: '監視・コントロール',
            area: 'ステークホルダー',
          },
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
          { id: 'o10', name: 'スコープ・ベースライン', type: 'output' },
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
          { source: 'o6', target: 'i10', type: 'flow' },
        ],
      }

      setGraphData(data)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return { graphData, isLoading }
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ITTO Force Graph - Main Component
 *
 * Displays PMBOK ITTO relationships as an interactive force-directed graph
 */
const ITTOForceGraph: React.FC = () => {
  const navigate = useNavigate()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // State
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    processGroups: [],
    knowledgeAreas: [],
  })
  const [focusedNode, setFocusedNode] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<any>(null)

  // Custom hooks
  const { graphData, isLoading } = useGraphData()
  const { width, height } = useWindowSize()
  const isMobile = width <= MOBILE_BREAKPOINT

  // Responsive configuration
  const nodeRadius = isMobile ? 15 : 25
  const fontSize = isMobile ? 10 : 12

  // Memoized filtered data
  const { filteredNodes, filteredLinks } = useMemo(() => {
    if (!graphData) {
      return { filteredNodes: [], filteredLinks: [] }
    }

    let nodes = [...graphData.nodes]
    let links = [...graphData.links]

    if (selectedFilters.processGroups.length > 0 || selectedFilters.knowledgeAreas.length > 0) {
      const processNodeIds = new Set(
        graphData.nodes
          .filter(
            (n) =>
              n.type === 'process' &&
              (selectedFilters.processGroups.length === 0 ||
                selectedFilters.processGroups.includes(n.group!)) &&
              (selectedFilters.knowledgeAreas.length === 0 ||
                selectedFilters.knowledgeAreas.includes(n.area!))
          )
          .map((n) => n.id)
      )

      // Include related nodes
      const relatedNodeIds = new Set(processNodeIds)
      graphData.links.forEach((link) => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id
        const targetId = typeof link.target === 'string' ? link.target : link.target.id

        if (processNodeIds.has(sourceId) || processNodeIds.has(targetId)) {
          relatedNodeIds.add(sourceId)
          relatedNodeIds.add(targetId)
        }
      })

      nodes = graphData.nodes.filter((n) => relatedNodeIds.has(n.id))
      links = graphData.links.filter((l) => {
        const sourceId = typeof l.source === 'string' ? l.source : l.source.id
        const targetId = typeof l.target === 'string' ? l.target : l.target.id
        return relatedNodeIds.has(sourceId) && relatedNodeIds.has(targetId)
      })
    }

    return { filteredNodes: nodes, filteredLinks: links }
  }, [graphData, selectedFilters])

  // Simulation configuration
  const simulationConfig: ForceSimulationConfig = useMemo(
    () => ({
      width: containerRef.current?.clientWidth || 1200,
      height: containerRef.current?.clientHeight || 800,
      nodeRadius,
      linkDistance: isMobile ? 60 : 100,
      chargeStrength: isMobile ? -200 : -300,
      collisionRadius: nodeRadius + 5,
    }),
    [nodeRadius, isMobile]
  )

  // Render callbacks for D3 visualization
  const renderCallbacks: RenderCallbacks = useMemo(
    () => ({
      onNodeClick: (event, node) => {
        setFocusedNode(node.id)

        // Check if node name matches glossary term
        const term = glossaryService.getTermByName(node.name)
        if (term) {
          setSelectedGlossaryTerm(term)
        }

        // Highlight connected nodes
        simulationControls.highlightConnectedNodes(node.id)
      },
      onNodeShape: (node, nodeGroup) => {
        if (node.type === 'process') {
          nodeGroup
            .append('circle')
            .attr('r', nodeRadius)
            .attr('fill', NODE_TYPE_COLORS.process(node.area || ''))
        } else if (node.type === 'input') {
          const size = nodeRadius * 1.6
          nodeGroup
            .append('rect')
            .attr('width', size)
            .attr('height', size)
            .attr('x', -size / 2)
            .attr('y', -size / 2)
            .attr('transform', 'rotate(45)')
            .attr('fill', NODE_TYPE_COLORS.input)
        } else if (node.type === 'tool') {
          const size = nodeRadius * 1.6
          nodeGroup
            .append('rect')
            .attr('width', size)
            .attr('height', size)
            .attr('x', -size / 2)
            .attr('y', -size / 2)
            .attr('fill', NODE_TYPE_COLORS.tool)
        } else if (node.type === 'output') {
          const scale = nodeRadius / 25
          nodeGroup
            .append('polygon')
            .attr(
              'points',
              `0,${-25 * scale} ${22 * scale},${12 * scale} ${-22 * scale},${12 * scale}`
            )
            .attr('fill', NODE_TYPE_COLORS.output)
        }
      },
      onLinkStyle: (link) => ({
        stroke: '#999',
        strokeWidth: link.type === 'flow' ? 3 : 2,
        strokeDasharray: link.type === 'flow' ? '5,5' : '0',
      }),
      getNodeLabel: (node) => {
        if (isMobile && node.name.length > 15) {
          return node.name.substring(0, 15) + '...'
        }
        return node.name
      },
    }),
    [nodeRadius, isMobile]
  )

  // Use D3 force simulation hook
  const simulationControls = useD3ForceSimulation(
    svgRef,
    filteredNodes,
    filteredLinks,
    simulationConfig,
    renderCallbacks
  )

  // Event handlers
  const handleFilterChange = useCallback((type: keyof FilterState, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }))
  }, [])

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev)
  }, [])

  const handleGlossaryNavigate = useCallback(
    (termId: string) => {
      navigate('/glossary', { state: { selectedTermId: termId } })
    },
    [navigate]
  )

  // Mobile panel management
  React.useEffect(() => {
    setIsPanelOpen(!isMobile)
  }, [isMobile])

  // Loading state
  if (isLoading) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500' />
          <p className='mt-4 text-gray-600'>ITTO ビジュアライゼーションを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='relative flex h-screen w-full'>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={togglePanel}
          className='absolute left-4 top-4 z-20 rounded-lg bg-white p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          aria-label={isPanelOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isPanelOpen}
        >
          {isPanelOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
        </button>
      )}

      {/* Control Panel */}
      <aside
        className={`${
          isMobile
            ? `absolute inset-y-0 left-0 z-10 w-64 transform transition-transform duration-300 ${
                isPanelOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'w-80'
        } overflow-y-auto bg-white shadow-lg`}
        aria-label='コントロールパネル'
      >
        <div className='p-4 md:p-6'>
          <h1 className='mb-4 text-lg font-bold md:text-xl'>PMBOK ITTOフォースグラフ</h1>

          <Legend />
          <FilterSection selectedFilters={selectedFilters} onFilterChange={handleFilterChange} />
          <ZoomControls
            onZoomIn={simulationControls.zoomIn}
            onZoomOut={simulationControls.zoomOut}
            onReset={simulationControls.resetZoom}
            isMobile={isMobile}
          />
        </div>
      </aside>

      {/* Graph Container */}
      <main
        ref={containerRef}
        className='relative flex-1 bg-gray-50'
        role='main'
        aria-label='フォースグラフ'
      >
        <svg
          ref={svgRef}
          className='h-full w-full'
          role='img'
          aria-label='PMBOK ITTO 関係性を示すフォースグラフ'
        />
      </main>

      {/* Glossary Dialog */}
      {selectedGlossaryTerm && (
        <GlossaryDialog
          term={selectedGlossaryTerm}
          onClose={() => setSelectedGlossaryTerm(null)}
          onNavigateToGlossary={handleGlossaryNavigate}
        />
      )}
    </div>
  )
}

ITTOForceGraph.displayName = 'ITTOForceGraph'

export default memo(ITTOForceGraph)
