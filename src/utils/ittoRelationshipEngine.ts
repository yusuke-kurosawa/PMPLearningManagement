/**
 * ITTO Relationship Engine - Advanced D3.js-powered relationship visualization
 * @description Comprehensive ITTO relationship engine with force simulation
 * @author Claude Code Assistant
 * @version 1.0.0
 * @since 2025-09-10
 */

import * as d3 from 'd3'
import { completeProcesses, processITTO, getAllProcesses } from '../data/pmbok/completeProcesses'

// ========================================
// Types and Interfaces
// ========================================

export interface ITTONode {
  id: string
  name: string
  type: 'process' | 'input' | 'tool' | 'output'
  category?: string // knowledge area for processes
  group?: string // process group for processes
  level?: number // for hierarchical layouts
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  weight?: number // for importance weighting
  complexity?: number // complexity score
  connections?: number // number of connections
  metadata?: Record<string, any>
}

export interface ITTOLink {
  id: string
  source: string | ITTONode
  target: string | ITTONode
  type: 'input' | 'tool' | 'output' | 'process-flow'
  strength?: number
  distance?: number
  metadata?: Record<string, any>
}

export interface ITTOGraph {
  nodes: ITTONode[]
  links: ITTOLink[]
  metadata: {
    totalProcesses: number
    totalConnections: number
    knowledgeAreas: string[]
    processGroups: string[]
    complexityRange: [number, number]
  }
}

export interface ForceSimulationConfig {
  centerForce: number
  chargeForce: number
  linkDistance: number
  linkStrength: number
  collisionRadius: number
  alphaDecay: number
  velocityDecay: number
}

export interface LayoutOptions {
  algorithm: 'force' | 'hierarchical' | 'circular' | 'grid' | 'cluster'
  groupBy?: 'knowledgeArea' | 'processGroup' | 'complexity'
  showLayers: boolean
  enableClustering: boolean
  separationDistance: number
}

export interface FilterOptions {
  knowledgeAreas?: string[]
  processGroups?: string[]
  complexityRange?: [number, number]
  showInputs: boolean
  showTools: boolean
  showOutputs: boolean
  showProcesses: boolean
  searchQuery?: string
}

// ========================================
// ITTO Relationship Engine Class
// ========================================

export class ITTORelationshipEngine {
  private nodes: Map<string, ITTONode> = new Map()
  private links: Map<string, ITTOLink> = new Map()
  private simulation: d3.Simulation<ITTONode, ITTOLink> | null = null
  private config: ForceSimulationConfig
  private layoutOptions: LayoutOptions
  private filterOptions: FilterOptions

  constructor(
    config: Partial<ForceSimulationConfig> = {},
    layoutOptions: Partial<LayoutOptions> = {},
    filterOptions: Partial<FilterOptions> = {}
  ) {
    this.config = {
      centerForce: 0.1,
      chargeForce: -300,
      linkDistance: 100,
      linkStrength: 0.5,
      collisionRadius: 20,
      alphaDecay: 0.02,
      velocityDecay: 0.8,
      ...config,
    }

    this.layoutOptions = {
      algorithm: 'force',
      showLayers: false,
      enableClustering: false,
      separationDistance: 200,
      ...layoutOptions,
    }

    this.filterOptions = {
      showInputs: true,
      showTools: true,
      showOutputs: true,
      showProcesses: true,
      ...filterOptions,
    }

    this.initializeGraph()
  }

  // ========================================
  // Graph Initialization
  // ========================================

  private initializeGraph(): void {
    this.buildNodesFromProcesses()
    this.buildLinksFromITTO()
    this.calculateNodeMetrics()
  }

  private buildNodesFromProcesses(): void {
    const processes = getAllProcesses()

    processes.forEach((process) => {
      // Add process node
      const processNode: ITTONode = {
        id: `process_${this.sanitizeId(process.name)}`,
        name: process.name,
        type: 'process',
        category: process.knowledgeArea,
        group: process.processGroup,
        weight: 1,
        complexity: this.calculateProcessComplexity(process.itto),
        metadata: {
          originalData: process,
          description: `${process.knowledgeArea} - ${process.processGroup}`,
        },
      }
      this.nodes.set(processNode.id, processNode)

      // Add ITTO nodes
      if (process.itto.inputs) {
        process.itto.inputs.forEach((input) => {
          const inputId = `input_${this.sanitizeId(input)}`
          if (!this.nodes.has(inputId)) {
            const inputNode: ITTONode = {
              id: inputId,
              name: input,
              type: 'input',
              weight: 0.8,
              complexity: 1,
              metadata: { relatedProcesses: [] },
            }
            this.nodes.set(inputId, inputNode)
          }
          // Track related processes
          const inputNode = this.nodes.get(inputId)!
          if (!inputNode.metadata.relatedProcesses.includes(process.name)) {
            inputNode.metadata.relatedProcesses.push(process.name)
          }
        })
      }

      if (process.itto.tools) {
        process.itto.tools.forEach((tool) => {
          const toolId = `tool_${this.sanitizeId(tool)}`
          if (!this.nodes.has(toolId)) {
            const toolNode: ITTONode = {
              id: toolId,
              name: tool,
              type: 'tool',
              weight: 0.9,
              complexity: 2,
              metadata: { relatedProcesses: [] },
            }
            this.nodes.set(toolId, toolNode)
          }
          // Track related processes
          const toolNode = this.nodes.get(toolId)!
          if (!toolNode.metadata.relatedProcesses.includes(process.name)) {
            toolNode.metadata.relatedProcesses.push(process.name)
          }
        })
      }

      if (process.itto.outputs) {
        process.itto.outputs.forEach((output) => {
          const outputId = `output_${this.sanitizeId(output)}`
          if (!this.nodes.has(outputId)) {
            const outputNode: ITTONode = {
              id: outputId,
              name: output,
              type: 'output',
              weight: 0.7,
              complexity: 1,
              metadata: { relatedProcesses: [] },
            }
            this.nodes.set(outputId, outputNode)
          }
          // Track related processes
          const outputNode = this.nodes.get(outputId)!
          if (!outputNode.metadata.relatedProcesses.includes(process.name)) {
            outputNode.metadata.relatedProcesses.push(process.name)
          }
        })
      }
    })
  }

  private buildLinksFromITTO(): void {
    const processes = getAllProcesses()

    processes.forEach((process) => {
      const processId = `process_${this.sanitizeId(process.name)}`

      // Input to process links
      if (process.itto.inputs) {
        process.itto.inputs.forEach((input) => {
          const inputId = `input_${this.sanitizeId(input)}`
          const linkId = `${inputId}_to_${processId}`

          const link: ITTOLink = {
            id: linkId,
            source: inputId,
            target: processId,
            type: 'input',
            strength: 0.8,
            distance: this.config.linkDistance * 0.8,
            metadata: { processName: process.name },
          }
          this.links.set(linkId, link)
        })
      }

      // Tool to process links
      if (process.itto.tools) {
        process.itto.tools.forEach((tool) => {
          const toolId = `tool_${this.sanitizeId(tool)}`
          const linkId = `${toolId}_to_${processId}`

          const link: ITTOLink = {
            id: linkId,
            source: toolId,
            target: processId,
            type: 'tool',
            strength: 0.6,
            distance: this.config.linkDistance * 0.9,
            metadata: { processName: process.name },
          }
          this.links.set(linkId, link)
        })
      }

      // Process to output links
      if (process.itto.outputs) {
        process.itto.outputs.forEach((output) => {
          const outputId = `output_${this.sanitizeId(output)}`
          const linkId = `${processId}_to_${outputId}`

          const link: ITTOLink = {
            id: linkId,
            source: processId,
            target: outputId,
            type: 'output',
            strength: 0.7,
            distance: this.config.linkDistance * 0.8,
            metadata: { processName: process.name },
          }
          this.links.set(linkId, link)
        })
      }
    })

    // Build process-to-process links (output becomes input)
    this.buildProcessFlowLinks()
  }

  private buildProcessFlowLinks(): void {
    const outputToProcessMap = new Map<string, string[]>()

    // Map outputs to their producing processes
    Array.from(this.nodes.values()).forEach((node) => {
      if (node.type === 'process' && node.metadata.originalData.itto.outputs) {
        node.metadata.originalData.itto.outputs.forEach((output: string) => {
          const outputId = `output_${this.sanitizeId(output)}`
          if (!outputToProcessMap.has(outputId)) {
            outputToProcessMap.set(outputId, [])
          }
          outputToProcessMap.get(outputId)!.push(node.id)
        })
      }
    })

    // Create process flow links where outputs become inputs
    Array.from(this.nodes.values()).forEach((node) => {
      if (node.type === 'process' && node.metadata.originalData.itto.inputs) {
        node.metadata.originalData.itto.inputs.forEach((input: string) => {
          const inputId = `input_${this.sanitizeId(input)}`
          const outputId = `output_${this.sanitizeId(input)}`

          if (outputToProcessMap.has(outputId)) {
            outputToProcessMap.get(outputId)!.forEach((sourceProcessId) => {
              const linkId = `flow_${sourceProcessId}_to_${node.id}`

              const link: ITTOLink = {
                id: linkId,
                source: sourceProcessId,
                target: node.id,
                type: 'process-flow',
                strength: 0.5,
                distance: this.config.linkDistance * 1.5,
                metadata: {
                  flowType: 'output-to-input',
                  transferredItem: input,
                },
              }
              this.links.set(linkId, link)
            })
          }
        })
      }
    })
  }

  private calculateNodeMetrics(): void {
    // Calculate connection counts
    this.nodes.forEach((node) => {
      let connections = 0
      this.links.forEach((link) => {
        if (link.source === node.id || link.target === node.id) {
          connections++
        }
      })
      node.connections = connections
    })

    // Calculate weighted complexity based on connections and type
    this.nodes.forEach((node) => {
      const baseComplexity = node.complexity || 1
      const connectionBonus = Math.log(1 + (node.connections || 0)) * 0.5
      const typeMultiplier = this.getTypeComplexityMultiplier(node.type)

      node.complexity = baseComplexity * typeMultiplier + connectionBonus
    })
  }

  // ========================================
  // Force Simulation Management
  // ========================================

  public createSimulation(width: number, height: number): d3.Simulation<ITTONode, ITTOLink> {
    const filteredData = this.getFilteredGraph()

    this.simulation = d3
      .forceSimulation<ITTONode>(filteredData.nodes)
      .force(
        'link',
        d3
          .forceLink<ITTONode, ITTOLink>(filteredData.links)
          .id((d) => d.id)
          .distance((d) => d.distance || this.config.linkDistance)
          .strength((d) => d.strength || this.config.linkStrength)
      )
      .force('charge', d3.forceManyBody().strength(this.config.chargeForce))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(this.config.centerForce))
      .force('collision', d3.forceCollide().radius(this.config.collisionRadius))
      .alphaDecay(this.config.alphaDecay)
      .velocityDecay(this.config.velocityDecay)

    // Apply layout-specific forces
    this.applyLayoutForces(width, height)

    return this.simulation
  }

  private applyLayoutForces(width: number, height: number): void {
    if (!this.simulation) {
      return
    }

    switch (this.layoutOptions.algorithm) {
      case 'hierarchical':
        this.applyHierarchicalForces(width, height)
        break
      case 'circular':
        this.applyCircularForces(width, height)
        break
      case 'cluster':
        this.applyClusterForces(width, height)
        break
      case 'grid':
        this.applyGridForces(width, height)
        break
      default:
        // Force layout is already applied by default
        break
    }
  }

  private applyHierarchicalForces(width: number, height: number): void {
    if (!this.simulation) {
      return
    }

    // Add Y-positioning force based on node level
    this.simulation.force(
      'y',
      d3
        .forceY<ITTONode>()
        .y((d) => {
          const level = this.getNodeLevel(d)
          return (height / 5) * (level + 1)
        })
        .strength(0.3)
    )

    // Group similar types horizontally
    this.simulation.force(
      'x',
      d3
        .forceX<ITTONode>()
        .x((d) => {
          const typeIndex = ['input', 'process', 'tool', 'output'].indexOf(d.type)
          return (width / 5) * (typeIndex + 1)
        })
        .strength(0.2)
    )
  }

  private applyCircularForces(width: number, height: number): void {
    if (!this.simulation) {
      return
    }

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.3

    this.simulation.force(
      'circular',
      d3.forceRadial<ITTONode>(radius, centerX, centerY).strength(0.3)
    )
  }

  private applyClusterForces(width: number, height: number): void {
    if (!this.simulation) {
      return
    }

    const clusters = this.createClusters()

    this.simulation.force('cluster', (alpha: number) => {
      clusters.forEach((cluster) => {
        cluster.nodes.forEach((node) => {
          if (node.x && node.y) {
            const dx = cluster.center.x - node.x
            const dy = cluster.center.y - node.y
            node.x += dx * alpha * 0.1
            node.y += dy * alpha * 0.1
          }
        })
      })
    })
  }

  private applyGridForces(width: number, height: number): void {
    if (!this.simulation) {
      return
    }

    const cols = Math.ceil(Math.sqrt(this.nodes.size))
    const rows = Math.ceil(this.nodes.size / cols)
    const cellWidth = width / cols
    const cellHeight = height / rows

    let index = 0
    this.simulation.force('grid', (alpha: number) => {
      this.simulation!.nodes().forEach((node) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        const targetX = col * cellWidth + cellWidth / 2
        const targetY = row * cellHeight + cellHeight / 2

        if (node.x && node.y) {
          const dx = targetX - node.x
          const dy = targetY - node.y
          node.x += dx * alpha * 0.1
          node.y += dy * alpha * 0.1
        }
        index++
      })
    })
  }

  // ========================================
  // Filtering and Search
  // ========================================

  public updateFilter(newFilter: Partial<FilterOptions>): void {
    this.filterOptions = { ...this.filterOptions, ...newFilter }

    if (this.simulation) {
      const filteredData = this.getFilteredGraph()
      this.simulation.nodes(filteredData.nodes)
      this.simulation.force(
        'link',
        d3
          .forceLink<ITTONode, ITTOLink>(filteredData.links)
          .id((d) => d.id)
          .distance((d) => d.distance || this.config.linkDistance)
          .strength((d) => d.strength || this.config.linkStrength)
      )
      this.simulation.restart()
    }
  }

  public getFilteredGraph(): ITTOGraph {
    let filteredNodes = Array.from(this.nodes.values())
    let filteredLinks = Array.from(this.links.values())

    // Apply type filters
    if (!this.filterOptions.showInputs) {
      filteredNodes = filteredNodes.filter((n) => n.type !== 'input')
    }
    if (!this.filterOptions.showTools) {
      filteredNodes = filteredNodes.filter((n) => n.type !== 'tool')
    }
    if (!this.filterOptions.showOutputs) {
      filteredNodes = filteredNodes.filter((n) => n.type !== 'output')
    }
    if (!this.filterOptions.showProcesses) {
      filteredNodes = filteredNodes.filter((n) => n.type !== 'process')
    }

    // Apply knowledge area filter
    if (this.filterOptions.knowledgeAreas && this.filterOptions.knowledgeAreas.length > 0) {
      filteredNodes = filteredNodes.filter(
        (n) => n.type !== 'process' || this.filterOptions.knowledgeAreas!.includes(n.category!)
      )
    }

    // Apply process group filter
    if (this.filterOptions.processGroups && this.filterOptions.processGroups.length > 0) {
      filteredNodes = filteredNodes.filter(
        (n) => n.type !== 'process' || this.filterOptions.processGroups!.includes(n.group!)
      )
    }

    // Apply complexity range filter
    if (this.filterOptions.complexityRange) {
      const [min, max] = this.filterOptions.complexityRange
      filteredNodes = filteredNodes.filter((n) => n.complexity! >= min && n.complexity! <= max)
    }

    // Apply search query
    if (this.filterOptions.searchQuery && this.filterOptions.searchQuery.trim()) {
      const query = this.filterOptions.searchQuery.toLowerCase().trim()
      filteredNodes = filteredNodes.filter(
        (n) =>
          n.name.toLowerCase().includes(query) ||
          (n.category && n.category.toLowerCase().includes(query)) ||
          (n.group && n.group.toLowerCase().includes(query))
      )
    }

    // Filter links to only include those with both source and target in filtered nodes
    const nodeIds = new Set(filteredNodes.map((n) => n.id))
    filteredLinks = filteredLinks.filter(
      (l) =>
        nodeIds.has(typeof l.source === 'string' ? l.source : l.source.id) &&
        nodeIds.has(typeof l.target === 'string' ? l.target : l.target.id)
    )

    return {
      nodes: filteredNodes,
      links: filteredLinks,
      metadata: this.generateGraphMetadata(filteredNodes, filteredLinks),
    }
  }

  // ========================================
  // Utility Methods
  // ========================================

  private sanitizeId(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
  }

  private calculateProcessComplexity(itto: any): number {
    const inputs = itto.inputs?.length || 0
    const tools = itto.tools?.length || 0
    const outputs = itto.outputs?.length || 0

    return Math.log(1 + inputs + tools + outputs) + inputs * 0.1 + tools * 0.15 + outputs * 0.1
  }

  private getTypeComplexityMultiplier(type: string): number {
    switch (type) {
      case 'process':
        return 2.0
      case 'tool':
        return 1.5
      case 'input':
        return 1.0
      case 'output':
        return 1.0
      default:
        return 1.0
    }
  }

  private getNodeLevel(node: ITTONode): number {
    if (node.level !== undefined) {
      return node.level
    }

    switch (node.type) {
      case 'input':
        return 0
      case 'process':
        return 1
      case 'tool':
        return 1
      case 'output':
        return 2
      default:
        return 1
    }
  }

  private createClusters() {
    const clusters = new Map()

    Array.from(this.nodes.values()).forEach((node) => {
      const clusterKey =
        this.layoutOptions.groupBy === 'knowledgeArea'
          ? node.category || 'unknown'
          : this.layoutOptions.groupBy === 'processGroup'
            ? node.group || 'unknown'
            : Math.floor((node.complexity || 1) / 2).toString()

      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, {
          id: clusterKey,
          nodes: [],
          center: { x: 0, y: 0 },
        })
      }

      clusters.get(clusterKey).nodes.push(node)
    })

    return Array.from(clusters.values())
  }

  private generateGraphMetadata(nodes: ITTONode[], links: ITTOLink[]) {
    const knowledgeAreas = Array.from(
      new Set(nodes.filter((n) => n.category).map((n) => n.category!))
    )

    const processGroups = Array.from(new Set(nodes.filter((n) => n.group).map((n) => n.group!)))

    const complexities = nodes.map((n) => n.complexity || 0)
    const complexityRange: [number, number] = [Math.min(...complexities), Math.max(...complexities)]

    return {
      totalProcesses: nodes.filter((n) => n.type === 'process').length,
      totalConnections: links.length,
      knowledgeAreas,
      processGroups,
      complexityRange,
    }
  }

  // ========================================
  // Public API
  // ========================================

  public getNode(id: string): ITTONode | undefined {
    return this.nodes.get(id)
  }

  public getLink(id: string): ITTOLink | undefined {
    return this.links.get(id)
  }

  public getAllNodes(): ITTONode[] {
    return Array.from(this.nodes.values())
  }

  public getAllLinks(): ITTOLink[] {
    return Array.from(this.links.values())
  }

  public getConnectedNodes(nodeId: string): ITTONode[] {
    const connectedIds = new Set<string>()

    this.links.forEach((link) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id

      if (sourceId === nodeId) {
        connectedIds.add(targetId)
      } else if (targetId === nodeId) {
        connectedIds.add(sourceId)
      }
    })

    return Array.from(connectedIds)
      .map((id) => this.nodes.get(id)!)
      .filter(Boolean)
  }

  public getShortestPath(sourceId: string, targetId: string): ITTONode[] {
    // Implementation of Dijkstra's algorithm for shortest path
    const distances = new Map<string, number>()
    const previous = new Map<string, string | null>()
    const unvisited = new Set<string>()

    // Initialize distances
    this.nodes.forEach((node, id) => {
      distances.set(id, id === sourceId ? 0 : Infinity)
      previous.set(id, null)
      unvisited.add(id)
    })

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentId: string | null = null
      let minDistance = Infinity

      unvisited.forEach((id) => {
        const distance = distances.get(id)!
        if (distance < minDistance) {
          minDistance = distance
          currentId = id
        }
      })

      if (currentId === null || minDistance === Infinity) {
        break
      }

      unvisited.delete(currentId)

      if (currentId === targetId) {
        break
      }

      // Update distances to neighbors
      this.links.forEach((link) => {
        const sourceNodeId = typeof link.source === 'string' ? link.source : link.source.id
        const targetNodeId = typeof link.target === 'string' ? link.target : link.target.id

        let neighborId: string | null = null
        if (sourceNodeId === currentId && unvisited.has(targetNodeId)) {
          neighborId = targetNodeId
        } else if (targetNodeId === currentId && unvisited.has(sourceNodeId)) {
          neighborId = sourceNodeId
        }

        if (neighborId) {
          const newDistance = distances.get(currentId)! + (link.distance || 1)
          if (newDistance < distances.get(neighborId)!) {
            distances.set(neighborId, newDistance)
            previous.set(neighborId, currentId)
          }
        }
      })
    }

    // Reconstruct path
    const path: ITTONode[] = []
    let currentId: string | null = targetId

    while (currentId !== null) {
      const node = this.nodes.get(currentId)
      if (node) {
        path.unshift(node)
      }
      currentId = previous.get(currentId) || null
    }

    return path.length > 1 ? path : []
  }

  public updateConfig(newConfig: Partial<ForceSimulationConfig>): void {
    this.config = { ...this.config, ...newConfig }

    if (this.simulation) {
      // Update forces with new configuration
      this.simulation
        .force('charge', d3.forceManyBody().strength(this.config.chargeForce))
        .force('collision', d3.forceCollide().radius(this.config.collisionRadius))
        .alphaDecay(this.config.alphaDecay)
        .velocityDecay(this.config.velocityDecay)

      const linkForce = this.simulation.force<d3.ForceLink<ITTONode, ITTOLink>>('link')
      if (linkForce) {
        linkForce
          .distance((d) => d.distance || this.config.linkDistance)
          .strength((d) => d.strength || this.config.linkStrength)
      }

      this.simulation.restart()
    }
  }

  public updateLayout(newLayout: Partial<LayoutOptions>, width?: number, height?: number): void {
    this.layoutOptions = { ...this.layoutOptions, ...newLayout }

    if (this.simulation && width && height) {
      this.applyLayoutForces(width, height)
      this.simulation.restart()
    }
  }

  public destroy(): void {
    if (this.simulation) {
      this.simulation.stop()
      this.simulation = null
    }
  }
}
