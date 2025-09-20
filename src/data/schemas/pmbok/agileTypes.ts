/**
 * アジャイル・マニフェストと原則の型定義
 * PMBOK第7版アジャイル関連データの包括的な型システム
 */

// アジャイル・マニフェストの価値
export interface AgileValue {
  id: string
  title: string
  subtitle: string
  description: string
  leftSide: {
    value: string
    explanation: string
  }
  rightSide: {
    value: string
    explanation: string
  }
  keyPoints: string[]
  practicalExamples: string[]
  pmbokConnection: {
    knowledgeAreas: string[]
    processes: string[]
    performanceDomains: string[]
  }
  commonMisunderstandings: string[]
  benefits: string[]
  challenges: string[]
}

// アジャイル宣言の原則
export interface AgilePrinciple {
  id: string
  number: number
  title: string
  description: string
  japaneseText: string
  englishText: string
  category: 'customer-collaboration' | 'working-software' | 'team-dynamics' | 'process-improvement'
  keyWords: string[]
  practicalApplications: string[]
  pmbokAlignment: {
    knowledgeAreas: string[]
    processes: string[]
    performanceDomains: string[]
    principles: string[]
  }
  implementationTips: string[]
  metrics: string[]
  antiPatterns: string[]
  successStories: string[]
}

// アジャイル・プラクティス
export interface AgilePractice {
  id: string
  name: string
  category: AgilePracticeCategory
  framework: AgileFramework[]
  description: string
  purpose: string
  whenToUse: string[]
  howToImplement: string[]
  benefits: string[]
  challenges: string[]
  prerequisites: string[]
  timeBoxing?: string
  participants: string[]
  artifacts?: string[]
  ceremonies?: string[]
  pmbokMapping: {
    knowledgeAreas: string[]
    processes: string[]
    performanceDomains: string[]
  }
  metrics: string[]
  variations: string[]
  toolsAndTechniques: string[]
  commonPitfalls: string[]
  successFactors: string[]
  realWorldExamples: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  teamSize: string
  duration: string
}

// アジャイル・プラクティスのカテゴリ
export type AgilePracticeCategory =
  | 'scrum'
  | 'kanban'
  | 'xp'
  | 'lean'
  | 'safe'
  | 'planning'
  | 'development'
  | 'testing'
  | 'deployment'
  | 'collaboration'
  | 'retrospectives'
  | 'estimation'
  | 'requirements'
  | 'quality'
  | 'leadership'
  | 'scaling'

// アジャイル・フレームワーク
export type AgileFramework =
  | 'Scrum'
  | 'Kanban'
  | 'XP'
  | 'Lean'
  | 'SAFe'
  | 'LeSS'
  | 'Nexus'
  | 'Crystal'
  | 'DSDM'
  | 'FDD'
  | 'ASD'
  | 'Generic'

// アジャイル・イベント/セレモニー
export interface AgileEvent {
  id: string
  name: string
  framework: AgileFramework
  purpose: string
  duration: string
  frequency: string
  participants: string[]
  facilitator: string
  inputs: string[]
  outputs: string[]
  agenda: string[]
  successCriteria: string[]
  commonIssues: string[]
  improvements: string[]
}

// アジャイル・ロール
export interface AgileRole {
  id: string
  name: string
  framework: AgileFramework[]
  responsibilities: string[]
  skills: string[]
  authorities: string[]
  accountabilities: string[]
  interactions: {
    role: string
    frequency: string
    purpose: string
  }[]
  careerPath: string[]
  certifications: string[]
}

// アジャイル・アーティファクト
export interface AgileArtifact {
  id: string
  name: string
  framework: AgileFramework
  purpose: string
  owner: string
  format: string
  updateFrequency: string
  contents: string[]
  qualityCriteria: string[]
  tools: string[]
  bestPractices: string[]
}

// アジャイル・メトリクス
export interface AgileMetric {
  id: string
  name: string
  category: 'velocity' | 'quality' | 'predictability' | 'team-health' | 'value-delivery'
  purpose: string
  calculation: string
  frequency: string
  target: string
  interpretation: string[]
  actionTriggers: string[]
  visualizations: string[]
  tools: string[]
}

// アジャイル変革
export interface AgileTransformation {
  id: string
  phase: string
  objectives: string[]
  activities: string[]
  duration: string
  roles: string[]
  deliverables: string[]
  successMetrics: string[]
  risks: string[]
  mitigations: string[]
}

// 包括的なアジャイル・データ構造
export interface AgileManifestoData {
  manifesto: {
    values: AgileValue[]
    principles: AgilePrinciple[]
    background: {
      history: string
      authors: string[]
      date: string
      location: string
      context: string
    }
  }
  practices: AgilePractice[]
  events: AgileEvent[]
  roles: AgileRole[]
  artifacts: AgileArtifact[]
  metrics: AgileMetric[]
  frameworks: {
    [key in AgileFramework]: {
      name: string
      description: string
      principles: string[]
      practices: string[]
      roles: string[]
      events: string[]
      artifacts: string[]
      whenToUse: string[]
      benefits: string[]
      challenges: string[]
    }
  }
  transformation: AgileTransformation[]
  glossary: {
    [key: string]: {
      term: string
      definition: string
      framework?: AgileFramework
      synonyms: string[]
      relatedTerms: string[]
    }
  }
}

// フィルターとソート用の型
export interface AgileFilter {
  category?: AgilePracticeCategory[]
  framework?: AgileFramework[]
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[]
  teamSize?: string[]
}

export interface AgileSortOptions {
  field: 'name' | 'category' | 'difficulty' | 'framework'
  direction: 'asc' | 'desc'
}

// 検索結果の型
export interface AgileSearchResult {
  type: 'value' | 'principle' | 'practice' | 'event' | 'role' | 'artifact'
  item: AgileValue | AgilePrinciple | AgilePractice | AgileEvent | AgileRole | AgileArtifact
  relevanceScore: number
  matchedFields: string[]
}

// アジャイル・アセスメント
export interface AgileAssessment {
  id: string
  name: string
  description: string
  categories: {
    name: string
    questions: {
      id: string
      question: string
      type: 'scale' | 'boolean' | 'multiple-choice'
      options?: string[]
      weight: number
    }[]
  }[]
  scoring: {
    levels: {
      name: string
      minScore: number
      maxScore: number
      description: string
      recommendations: string[]
    }[]
  }
}

export default AgileManifestoData
