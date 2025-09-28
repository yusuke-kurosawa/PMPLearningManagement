// Product Analysis Types and Interfaces

export interface PBSNode {
  id: string
  name: string
  level: number
  type: 'platform' | 'module' | 'feature' | 'component'
  children?: PBSNode[]
  expanded?: boolean
  details?: {
    description?: string
    priority?: 'high' | 'medium' | 'low'
    status?: 'implemented' | 'in-progress' | 'planned'
    owner?: string
  }
}

export interface SystemsEngineeringPhase {
  id: string
  name: string
  phase:
    | 'concept'
    | 'design'
    | 'development'
    | 'integration'
    | 'testing'
    | 'deployment'
    | 'operations'
  startDate?: string
  endDate?: string
  status: 'completed' | 'in-progress' | 'planned'
  deliverables: string[]
  metrics: {
    progress: number
    quality: number
    risk: number
  }
}

export interface CrossFunctionalInteraction {
  source: string
  target: string
  type: 'data' | 'control' | 'dependency'
  strength: number
}

export interface SystemGoal {
  id: string
  name: string
  category: 'primary' | 'secondary' | 'supporting'
  description: string
  kpis: KPI[]
  currentValue?: number
  targetValue?: number
  trend?: 'up' | 'down' | 'stable'
}

export interface KPI {
  id: string
  name: string
  metric: string
  value: number
  target: number
  unit: string
  status: 'achieved' | 'on-track' | 'at-risk' | 'behind'
  history?: { date: string; value: number }[]
}

export interface Requirement {
  id: string
  category: 'functional' | 'non-functional' | 'technical' | 'business'
  subcategory:
    | 'learning'
    | 'assessment'
    | 'collaboration'
    | 'analytics'
    | 'performance'
    | 'security'
    | 'usability'
  description: string
  priority: 'must' | 'should' | 'could' | 'wont'
  status: 'validated' | 'implemented' | 'testing' | 'pending'
  effort: number
  riskLevel: 'low' | 'medium' | 'high'
  dependencies?: string[]
  acceptanceCriteria?: string[]
}

export interface FASTFunction {
  id: string
  name: string
  type: 'basic' | 'secondary' | 'required' | 'aesthetic'
  verb: string
  noun: string
  cost: number
  value: number
  parent?: string
  children?: string[]
  alternatives?: Alternative[]
}

export interface Alternative {
  id: string
  description: string
  cost: number
  feasibility: number
  impact: number
  roi: number
}

export interface ValueMetric {
  category: 'cost' | 'quality' | 'reliability' | 'performance' | 'usability'
  subcategory?: string
  current: number
  target: number
  benchmark?: number
  unit: string
  trend: number[]
}

export interface CostBreakdown {
  category: string
  amount: number
  percentage: number
  subcategories?: CostBreakdown[]
  optimizationPotential?: number
  notes?: string
}

export interface RiskAssessment {
  id: string
  category: 'technical' | 'business' | 'operational' | 'financial'
  description: string
  probability: number
  impact: number
  riskScore: number
  mitigation: string
  owner: string
  status: 'active' | 'mitigated' | 'accepted'
}

export interface OptimizationOpportunity {
  id: string
  area: string
  description: string
  currentCost: number
  potentialSavings: number
  implementation: string
  effort: 'low' | 'medium' | 'high'
  priority: number
  roi: number
}

export interface AnalysisResult {
  methodology: string
  timestamp: string
  summary: string
  findings: string[]
  recommendations: string[]
  metrics?: Record<string, number>
}

export interface ProductAnalysisData {
  pbs: PBSNode
  systemsEngineering: {
    phases: SystemsEngineeringPhase[]
    interactions: CrossFunctionalInteraction[]
    architecture: {
      layers: string[]
      components: Record<string, string[]>
    }
  }
  systemAnalysis: {
    goals: SystemGoal[]
    processFlows: ProcessFlow[]
    optimizations: OptimizationOpportunity[]
  }
  requirements: {
    items: Requirement[]
    summary: {
      total: number
      byPriority: Record<string, number>
      byStatus: Record<string, number>
      completionRate: number
    }
  }
  valueEngineering: {
    functions: FASTFunction[]
    alternatives: Alternative[]
    costValueMatrix: { function: string; cost: number; value: number }[]
  }
  valueAnalysis: {
    costs: CostBreakdown[]
    metrics: ValueMetric[]
    risks: RiskAssessment[]
    opportunities: OptimizationOpportunity[]
  }
}

export interface ProcessFlow {
  id: string
  name: string
  steps: ProcessStep[]
  metrics: {
    cycleTime: number
    efficiency: number
    errorRate: number
  }
}

export interface ProcessStep {
  id: string
  name: string
  type: 'start' | 'end' | 'process' | 'decision' | 'data'
  duration?: number
  resources?: string[]
  next?: string[]
}
