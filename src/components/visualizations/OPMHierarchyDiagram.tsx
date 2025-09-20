import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion } from 'framer-motion'
import {
  Building2,
  Target,
  Layers,
  Info,
  ArrowDown,
  ArrowUp,
  Settings,
  Download,
  RefreshCw,
  Maximize,
} from 'lucide-react'
import { opmFramework } from '../../data/pmbok/opmData.js'

interface HierarchyNode {
  id: string
  name: string
  level: number
  x: number
  y: number
  width: number
  height: number
  color: string
  data: any
}

interface HierarchyLink {
  source: HierarchyNode
  target: HierarchyNode
  type: 'strategic' | 'value' | 'resource'
}

interface OPMHierarchyDiagramProps {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
}

const OPMHierarchyDiagram: React.FC<OPMHierarchyDiagramProps> = ({
  width = 1000,
  height = 700,
  theme = 'light',
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<HierarchyNode | null>(null)
  const [animationMode, setAnimationMode] = useState<'static' | 'strategic' | 'value' | 'resource'>(
    'static'
  )
  const [dimensions, setDimensions] = useState({ width, height })

  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const newWidth = Math.max(800, Math.min(containerWidth - 40, 1200))
        const newHeight = Math.max(600, newWidth * 0.7)
        setDimensions({ width: newWidth, height: newHeight })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const hierarchyData = [
    {
      id: 'portfolio',
      name: 'ポートフォリオ\nマネジメント',
      level: 1,
      data: opmFramework.hierarchy.portfolio,
      color: theme === 'dark' ? '#9333ea' : '#8b5cf6',
    },
    {
      id: 'program',
      name: 'プログラム\nマネジメント',
      level: 2,
      data: opmFramework.hierarchy.program,
      color: theme === 'dark' ? '#2563eb' : '#3b82f6',
    },
    {
      id: 'project',
      name: 'プロジェクト\nマネジメント',
      level: 3,
      data: opmFramework.hierarchy.project,
      color: theme === 'dark' ? '#059669' : '#10b981',
    },
  ]

  useEffect(() => {
    if (!svgRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 60, right: 60, bottom: 60, left: 60 }
    const innerWidth = dimensions.width - margin.left - margin.right
    const innerHeight = dimensions.height - margin.top - margin.bottom

    // メイングループ
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // グラデーション定義
    const defs = svg.append('defs')

    hierarchyData.forEach((node, i) => {
      const gradient = defs
        .append('linearGradient')
        .attr('id', `gradient-${node.id}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', node.color)
        .attr('stop-opacity', 0.8)

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.color(node.color)?.darker(0.3)?.toString() || node.color)
        .attr('stop-opacity', 1)
    })

    // ノードの配置計算
    const nodeWidth = 200
    const nodeHeight = 120
    const levelHeight = innerHeight / 4

    const nodes: HierarchyNode[] = hierarchyData.map((node, i) => ({
      ...node,
      x: innerWidth / 2 - nodeWidth / 2,
      y: levelHeight * (i + 0.5) - nodeHeight / 2,
      width: nodeWidth,
      height: nodeHeight,
    }))

    // 価値の流れアニメーション用パス
    const valueFlowPath = d3.path()
    valueFlowPath.moveTo(nodes[2].x + nodes[2].width / 2, nodes[2].y)
    valueFlowPath.lineTo(nodes[1].x + nodes[1].width / 2, nodes[1].y + nodes[1].height)
    valueFlowPath.moveTo(nodes[1].x + nodes[1].width / 2, nodes[1].y)
    valueFlowPath.lineTo(nodes[0].x + nodes[0].width / 2, nodes[0].y + nodes[0].height)

    // 戦略的整合性アニメーション用パス
    const strategicFlowPath = d3.path()
    strategicFlowPath.moveTo(nodes[0].x + nodes[0].width / 2, nodes[0].y + nodes[0].height)
    strategicFlowPath.lineTo(nodes[1].x + nodes[1].width / 2, nodes[1].y)
    strategicFlowPath.moveTo(nodes[1].x + nodes[1].width / 2, nodes[1].y + nodes[1].height)
    strategicFlowPath.lineTo(nodes[2].x + nodes[2].width / 2, nodes[2].y)

    // 接続線の描画
    const connections = [
      { source: nodes[0], target: nodes[1] },
      { source: nodes[1], target: nodes[2] },
    ]

    const linkGroup = g.append('g').attr('class', 'links')

    connections.forEach((connection, i) => {
      // 双方向の線
      linkGroup
        .append('line')
        .attr('x1', connection.source.x + connection.source.width / 2)
        .attr('y1', connection.source.y + connection.source.height)
        .attr('x2', connection.target.x + connection.target.width / 2)
        .attr('y2', connection.target.y)
        .attr('stroke', theme === 'dark' ? '#6b7280' : '#9ca3af')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.6)
    })

    // アニメーション用のパーティクル
    const createParticles = (path: d3.Path, direction: 'up' | 'down', color: string) => {
      const pathString = path.toString()
      if (!pathString) {
        return
      }

      for (let i = 0; i < 3; i++) {
        g.append('circle')
          .attr('r', 4)
          .attr('fill', color)
          .attr('opacity', 0)
          .append('animateMotion')
          .attr('dur', '3s')
          .attr('begin', `${i * 0.5}s`)
          .attr('repeatCount', 'indefinite')
          .attr('path', pathString)
          .attr('rotate', 'auto')

        g.select('circle:last-child')
          .transition()
          .duration(500)
          .delay(i * 500)
          .attr('opacity', 0.8)
      }
    }

    // ノードの描画
    const nodeGroup = g.append('g').attr('class', 'nodes')

    const nodeElements = nodeGroup
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')

    // ノードの背景
    nodeElements
      .append('rect')
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('rx', 15)
      .attr('ry', 15)
      .attr('fill', (d) => `url(#gradient-${d.id})`)
      .attr('stroke', theme === 'dark' ? '#374151' : '#e5e7eb')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')

    // ノードのアイコン
    const iconData = [
      { icon: '🏢', y: 30 },
      { icon: '🎯', y: 30 },
      { icon: '📋', y: 30 },
    ]

    nodeElements
      .append('text')
      .attr('x', (d) => d.width / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '24px')
      .text((d, i) => iconData[i].icon)

    // ノードのテキスト
    nodeElements
      .append('text')
      .attr('x', (d) => d.width / 2)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', theme === 'dark' ? '#ffffff' : '#ffffff')
      .selectAll('tspan')
      .data((d) => d.name.split('\n'))
      .enter()
      .append('tspan')
      .attr('x', function (d) {
        const parentData = d3.select(this.parentNode as any).datum() as HierarchyNode
        return parentData.width / 2
      })
      .attr('dy', (d, i) => (i === 0 ? 0 : 16))
      .text((d) => d)

    // レベル表示
    nodeElements
      .append('text')
      .attr('x', (d) => d.width / 2)
      .attr('y', 105)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', theme === 'dark' ? '#d1d5db' : '#ffffff')
      .attr('opacity', 0.8)
      .text((d) => `レベル ${d.level}`)

    // インタラクション
    nodeElements
      .on('mouseenter', function (event, d) {
        setHoveredNode(d)
        d3.select(this)
          .select('rect')
          .transition()
          .duration(200)
          .attr('stroke-width', 4)
          .style('filter', 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.2))')
      })
      .on('mouseleave', function () {
        setHoveredNode(null)
        d3.select(this)
          .select('rect')
          .transition()
          .duration(200)
          .attr('stroke-width', 2)
          .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
      })
      .on('click', function (event, d) {
        setSelectedNode(selectedNode?.id === d.id ? null : d)
      })

    // アニメーションモードに応じたパーティクル生成
    if (animationMode === 'value') {
      createParticles(valueFlowPath, 'up', '#10b981')
    } else if (animationMode === 'strategic') {
      createParticles(strategicFlowPath, 'down', '#3b82f6')
    }

    // サイドラベル
    g.append('text')
      .attr('x', -30)
      .attr('y', nodes[0].y + nodes[0].height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', theme === 'dark' ? '#9ca3af' : '#6b7280')
      .attr('transform', `rotate(-90, -30, ${nodes[0].y + nodes[0].height / 2})`)
      .text('戦略レイヤー')

    g.append('text')
      .attr('x', -30)
      .attr('y', nodes[2].y + nodes[2].height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', theme === 'dark' ? '#9ca3af' : '#6b7280')
      .attr('transform', `rotate(-90, -30, ${nodes[2].y + nodes[2].height / 2})`)
      .text('実行レイヤー')
  }, [dimensions, theme, animationMode])

  const exportSVG = () => {
    if (!svgRef.current) {
      return
    }

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    const downloadLink = document.createElement('a')
    downloadLink.href = svgUrl
    downloadLink.download = 'opm-hierarchy.svg'
    downloadLink.click()

    URL.revokeObjectURL(svgUrl)
  }

  return (
    <div
      ref={containerRef}
      className={`w-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} overflow-hidden rounded-xl shadow-lg`}
    >
      {/* コントロールパネル */}
      <div
        className={`border-b p-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}
      >
        <div className='flex items-center justify-between'>
          <h3
            className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            OPM階層図
          </h3>
          <div className='flex items-center space-x-2'>
            <div className='flex items-center space-x-1'>
              <button
                onClick={() => setAnimationMode('static')}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  animationMode === 'static'
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                静的
              </button>
              <button
                onClick={() => setAnimationMode('strategic')}
                className={`flex items-center rounded px-3 py-1 text-sm transition-colors ${
                  animationMode === 'strategic'
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ArrowDown className='mr-1 h-3 w-3' />
                戦略
              </button>
              <button
                onClick={() => setAnimationMode('value')}
                className={`flex items-center rounded px-3 py-1 text-sm transition-colors ${
                  animationMode === 'value'
                    ? theme === 'dark'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ArrowUp className='mr-1 h-3 w-3' />
                価値
              </button>
            </div>
            <button
              onClick={exportSVG}
              className={`rounded p-2 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title='SVGをダウンロード'
            >
              <Download className='h-4 w-4' />
            </button>
          </div>
        </div>

        {animationMode !== 'static' && (
          <div className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {animationMode === 'strategic' && '戦略的整合性の流れ (Top-Down) を表示中'}
            {animationMode === 'value' && '価値の流れ (Bottom-Up) を表示中'}
          </div>
        )}
      </div>

      {/* SVG描画エリア */}
      <div className='relative'>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
        />

        {/* ツールチップ */}
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute right-4 top-4 z-10 max-w-xs rounded-lg p-4 shadow-lg ${
              theme === 'dark'
                ? 'border border-gray-600 bg-gray-800 text-white'
                : 'border border-gray-200 bg-white text-gray-900'
            }`}
          >
            <h4 className='mb-2 flex items-center font-semibold'>
              <Info className='mr-2 h-4 w-4' />
              {hoveredNode.data.name}
            </h4>
            <p className='mb-2 text-sm'>{hoveredNode.data.definition}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              主要フォーカス: {hoveredNode.data.primaryFocus}
            </p>
          </motion.div>
        )}
      </div>

      {/* 詳細パネル */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-t p-6 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}
        >
          <div className='mb-4 flex items-center justify-between'>
            <h4
              className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {selectedNode.data.name} - 詳細情報
            </h4>
            <button
              onClick={() => setSelectedNode(null)}
              className={`rounded p-2 transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              ×
            </button>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <div>
              <h5
                className={`mb-2 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
              >
                主要特徴
              </h5>
              <ul className='space-y-1'>
                {selectedNode.data.keyCharacteristics.map((char: string, index: number) => (
                  <li
                    key={index}
                    className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    • {char}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5
                className={`mb-2 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
              >
                主要成果物
              </h5>
              <ul className='space-y-1'>
                {selectedNode.data.deliverables.map((deliverable: string, index: number) => (
                  <li
                    key={index}
                    className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    • {deliverable}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5
                className={`mb-2 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
              >
                主要メトリクス
              </h5>
              <ul className='space-y-1'>
                {selectedNode.data.metrics.map((metric: string, index: number) => (
                  <li
                    key={index}
                    className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    • {metric}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default OPMHierarchyDiagram
