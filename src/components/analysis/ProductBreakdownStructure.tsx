/**
 * Product Breakdown Structure (PBS)
 * Hierarchical decomposition of product deliverables
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ChevronRight,
  ChevronDown,
  Package,
  Layers,
  Box,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react'

interface PBSNode {
  id: string
  name: string
  level: number
  type: 'product' | 'subsystem' | 'component' | 'feature'
  status: 'completed' | 'in-progress' | 'planned'
  progress: number
  children?: PBSNode[]
  description?: string
  owner?: string
  priority?: 'high' | 'medium' | 'low'
}

export const ProductBreakdownStructure: React.FC = () => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']))
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const pbsData: PBSNode = useMemo(
    () => ({
      id: 'root',
      name: 'PMP Learning Management System',
      level: 0,
      type: 'product',
      status: 'in-progress',
      progress: 87,
      description: 'Comprehensive PWA-based PMBOK learning platform',
      children: [
        {
          id: 'core-platform',
          name: 'Core Platform',
          level: 1,
          type: 'subsystem',
          status: 'completed',
          progress: 100,
          description: 'Foundation infrastructure and architecture',
          children: [
            {
              id: 'auth-system',
              name: 'Authentication System',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              owner: 'Security Team',
              priority: 'high',
              children: [
                {
                  id: 'login',
                  name: 'Login/Register',
                  level: 3,
                  type: 'feature',
                  status: 'completed',
                  progress: 100,
                },
                {
                  id: 'jwt',
                  name: 'JWT Token Management',
                  level: 3,
                  type: 'feature',
                  status: 'completed',
                  progress: 100,
                },
                {
                  id: 'oauth',
                  name: 'OAuth Integration',
                  level: 3,
                  type: 'feature',
                  status: 'completed',
                  progress: 100,
                },
              ],
            },
            {
              id: 'routing',
              name: 'Routing System',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              owner: 'Frontend Team',
              priority: 'high',
            },
            {
              id: 'state-management',
              name: 'State Management',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              owner: 'Frontend Team',
              priority: 'high',
            },
          ],
        },
        {
          id: 'learning-features',
          name: 'Learning Features',
          level: 1,
          type: 'subsystem',
          status: 'completed',
          progress: 95,
          description: 'Core learning and educational functionality',
          children: [
            {
              id: 'pmbok-content',
              name: 'PMBOK Content',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              owner: 'Content Team',
              priority: 'high',
              children: [
                {
                  id: 'pmbok6',
                  name: 'PMBOK 6th Edition',
                  level: 3,
                  type: 'feature',
                  status: 'completed',
                  progress: 100,
                },
                {
                  id: 'pmbok7',
                  name: 'PMBOK 7th Edition',
                  level: 3,
                  type: 'feature',
                  status: 'completed',
                  progress: 100,
                },
                {
                  id: 'itto',
                  name: 'ITTO Framework',
                  level: 3,
                  type: 'feature',
                  status: 'completed',
                  progress: 100,
                },
              ],
            },
            {
              id: 'flashcards',
              name: 'Flashcard System',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              owner: 'Learning Team',
              priority: 'high',
            },
            {
              id: 'mock-exams',
              name: 'Mock Examination',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 90,
              owner: 'Assessment Team',
              priority: 'high',
              children: [
                {
                  id: 'exam-engine',
                  name: 'Exam Engine',
                  level: 3,
                  type: 'feature',
                  status: 'completed',
                  progress: 100,
                },
                {
                  id: 'result-analysis',
                  name: 'Result Analysis',
                  level: 3,
                  type: 'feature',
                  status: 'completed',
                  progress: 100,
                },
                {
                  id: 'adaptive-testing',
                  name: 'Adaptive Testing',
                  level: 3,
                  type: 'feature',
                  status: 'in-progress',
                  progress: 70,
                },
              ],
            },
            {
              id: 'progress-tracking',
              name: 'Progress Tracking',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 95,
              owner: 'Analytics Team',
              priority: 'medium',
            },
          ],
        },
        {
          id: 'visualizations',
          name: 'Visualization Suite',
          level: 1,
          type: 'subsystem',
          status: 'completed',
          progress: 100,
          description: 'Interactive data visualization components',
          children: [
            {
              id: 'matrix-view',
              name: 'PMBOK Matrix View',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              priority: 'high',
            },
            {
              id: 'network-graph',
              name: 'ITTO Network Graph',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              priority: 'high',
            },
            {
              id: 'sankey-diagram',
              name: 'Sankey Diagram',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              priority: 'medium',
            },
            {
              id: 'mindmap',
              name: 'Mind Map View',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              priority: 'medium',
            },
            {
              id: 'heatmaps',
              name: 'Process Heatmaps',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              priority: 'low',
            },
          ],
        },
        {
          id: 'ai-features',
          name: 'AI-Powered Features',
          level: 1,
          type: 'subsystem',
          status: 'in-progress',
          progress: 65,
          description: 'Artificial intelligence and machine learning features',
          children: [
            {
              id: 'ai-coaching',
              name: 'AI Coaching',
              level: 2,
              type: 'component',
              status: 'in-progress',
              progress: 70,
              owner: 'AI Team',
              priority: 'high',
              children: [
                {
                  id: 'study-recommendations',
                  name: 'Study Recommendations',
                  level: 3,
                  type: 'feature',
                  status: 'completed',
                  progress: 100,
                },
                {
                  id: 'performance-analysis',
                  name: 'Performance Analysis',
                  level: 3,
                  type: 'feature',
                  status: 'in-progress',
                  progress: 80,
                },
                {
                  id: 'personalized-path',
                  name: 'Personalized Learning Path',
                  level: 3,
                  type: 'feature',
                  status: 'in-progress',
                  progress: 60,
                },
              ],
            },
            {
              id: 'nlp-search',
              name: 'Natural Language Search',
              level: 2,
              type: 'component',
              status: 'in-progress',
              progress: 75,
              owner: 'AI Team',
              priority: 'medium',
            },
            {
              id: 'question-generation',
              name: 'AI Question Generation',
              level: 2,
              type: 'component',
              status: 'in-progress',
              progress: 50,
              owner: 'AI Team',
              priority: 'medium',
            },
          ],
        },
        {
          id: 'collaboration',
          name: 'Collaboration Tools',
          level: 1,
          type: 'subsystem',
          status: 'in-progress',
          progress: 60,
          description: 'Social learning and collaboration features',
          children: [
            {
              id: 'study-groups',
              name: 'Study Groups',
              level: 2,
              type: 'component',
              status: 'in-progress',
              progress: 70,
              priority: 'medium',
            },
            {
              id: 'shared-notes',
              name: 'Shared Notes',
              level: 2,
              type: 'component',
              status: 'in-progress',
              progress: 65,
              priority: 'medium',
            },
            {
              id: 'discussion-forums',
              name: 'Discussion Forums',
              level: 2,
              type: 'component',
              status: 'in-progress',
              progress: 55,
              priority: 'low',
            },
            {
              id: 'mentorship',
              name: 'Mentorship Hub',
              level: 2,
              type: 'component',
              status: 'planned',
              progress: 40,
              priority: 'low',
            },
          ],
        },
        {
          id: 'analytics',
          name: 'Analytics & Reporting',
          level: 1,
          type: 'subsystem',
          status: 'completed',
          progress: 90,
          description: 'Data analytics and business intelligence',
          children: [
            {
              id: 'learning-analytics',
              name: 'Learning Analytics',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 95,
              priority: 'high',
            },
            {
              id: 'performance-metrics',
              name: 'Performance Metrics',
              level: 2,
              type: 'component',
              status: 'completed',
              progress: 100,
              priority: 'high',
            },
            {
              id: 'export-reports',
              name: 'Export & Reports',
              level: 2,
              type: 'component',
              status: 'in-progress',
              progress: 75,
              priority: 'medium',
            },
          ],
        },
      ],
    }),
    []
  )

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className='h-4 w-4 text-green-600' />
      case 'in-progress':
        return <Circle className='h-4 w-4 fill-blue-200 text-blue-600' />
      case 'planned':
        return <AlertCircle className='h-4 w-4 text-gray-400' />
      default:
        return <Circle className='h-4 w-4 text-gray-400' />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className='h-5 w-5 text-purple-600' />
      case 'subsystem':
        return <Layers className='h-4 w-4 text-blue-600' />
      case 'component':
        return <Box className='h-4 w-4 text-green-600' />
      case 'feature':
        return <Box className='h-3 w-3 text-orange-600' />
      default:
        return <Box className='h-4 w-4 text-gray-600' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'in-progress':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'planned':
        return 'bg-gray-50 border-gray-200 text-gray-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  const renderNode = (node: PBSNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isSelected = selectedNode === node.id

    return (
      <div key={node.id} className='space-y-1'>
        <div
          className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all hover:bg-gray-50 ${
            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
          onClick={() => setSelectedNode(node.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className='flex-shrink-0'
            >
              {isExpanded ? (
                <ChevronDown className='h-4 w-4' />
              ) : (
                <ChevronRight className='h-4 w-4' />
              )}
            </button>
          )}
          {!hasChildren && <div className='w-4' />}

          <div className='flex-shrink-0'>{getTypeIcon(node.type)}</div>
          <div className='flex-shrink-0'>{getStatusIcon(node.status)}</div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <span className='truncate font-medium'>{node.name}</span>
              <Badge variant='outline' className='text-xs'>
                {node.type}
              </Badge>
              {node.priority && (
                <Badge
                  variant={node.priority === 'high' ? 'destructive' : 'secondary'}
                  className='text-xs'
                >
                  {node.priority}
                </Badge>
              )}
            </div>
            {node.description && (
              <p className='mt-1 text-xs text-muted-foreground'>{node.description}</p>
            )}
          </div>

          <div className='flex flex-shrink-0 items-center gap-3'>
            <div className='min-w-[60px] text-right'>
              <div className='text-sm font-medium'>{node.progress}%</div>
              <Progress value={node.progress} className='h-1 w-16' />
            </div>
            <Badge className={getStatusColor(node.status)}>{node.status}</Badge>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className='space-y-1'>
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const calculateStats = (node: PBSNode) => {
    let total = 1
    let completed = node.status === 'completed' ? 1 : 0
    let inProgress = node.status === 'in-progress' ? 1 : 0
    let planned = node.status === 'planned' ? 1 : 0

    if (node.children) {
      node.children.forEach((child) => {
        const stats = calculateStats(child)
        total += stats.total
        completed += stats.completed
        inProgress += stats.inProgress
        planned += stats.planned
      })
    }

    return { total, completed, inProgress, planned }
  }

  const stats = useMemo(() => calculateStats(pbsData), [pbsData])

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Product Breakdown Structure (PBS)</CardTitle>
          <CardDescription>
            Hierarchical decomposition of product deliverables and work packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div className='rounded-lg border p-4'>
              <div className='text-2xl font-bold'>{stats.total}</div>
              <div className='text-sm text-muted-foreground'>Total Elements</div>
            </div>
            <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
              <div className='text-2xl font-bold text-green-700'>{stats.completed}</div>
              <div className='text-sm text-green-600'>Completed</div>
            </div>
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
              <div className='text-2xl font-bold text-blue-700'>{stats.inProgress}</div>
              <div className='text-sm text-blue-600'>In Progress</div>
            </div>
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
              <div className='text-2xl font-bold text-gray-700'>{stats.planned}</div>
              <div className='text-sm text-gray-600'>Planned</div>
            </div>
          </div>

          <div className='space-y-2'>{renderNode(pbsData)}</div>

          <div className='mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4'>
            <h4 className='mb-2 font-semibold text-blue-900'>PBS Insights</h4>
            <ul className='space-y-1 text-sm text-blue-800'>
              <li>
                • Core Platform (100% complete): Solid foundation with authentication, routing, and
                state management
              </li>
              <li>
                • Learning Features (95% complete): Comprehensive PMBOK content with flashcards and
                mock exams
              </li>
              <li>
                • Visualization Suite (100% complete): Full range of interactive visualizations
                implemented
              </li>
              <li>
                • AI Features (65% in-progress): Active development on coaching and question
                generation
              </li>
              <li>
                • Collaboration Tools (60% in-progress): Social learning features under development
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductBreakdownStructure
