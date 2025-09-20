/**
 * Dashboard Types and Interfaces
 * Type definitions for the real-time learning analytics dashboard
 */

export interface DashboardConfig {
  layout: 'grid' | 'columns' | 'tabs'
  widgets: string[]
  refreshInterval: number
  enableNotifications: boolean
  showTooltips: boolean
  theme?: 'light' | 'dark' | 'auto'
  language?: string
}

export interface FilterSettings {
  dateRange: '1d' | '7d' | '30d' | '90d' | '1y' | 'custom'
  startDate?: Date
  endDate?: Date
  cohorts: string[]
  knowledgeAreas: string[]
  performanceBands: string[]
  studyModes: string[]
  deviceTypes?: string[]
  locations?: string[]
}

export interface AlertSettings {
  enableRealTime: boolean
  enableEmail: boolean
  enablePush?: boolean
  thresholds: {
    lowEngagement: number
    riskStudent: number
    systemIssue: number
    achievementMilestone?: number
    studyStreakBreak?: number
  }
  priorities: ('low' | 'medium' | 'high' | 'critical')[]
  categories: ('engagement' | 'performance' | 'system' | 'achievement' | 'risk')[]
}

export interface ExportSettings {
  format: 'pdf' | 'csv' | 'xlsx' | 'json'
  timeRange: FilterSettings['dateRange']
  startDate?: Date
  endDate?: Date
  includeCharts: boolean
  includeRawData: boolean
  sections: string[]
  schedule?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
}

export interface RealTimeMetrics {
  // Core KPIs
  activeUsers: number
  completionRate: number
  engagementScore: number
  performanceTrend: 'improving' | 'declining' | 'stable'

  // Study metrics
  totalStudyTime: number
  averageSessionDuration: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number

  // Achievement metrics
  newAchievements: number
  completedGoals: number
  averageProgress: number

  // Risk metrics
  atRiskStudents: number
  lowEngagementUsers: number
  strugglingAreas: string[]

  // System metrics
  systemHealth: number
  responseTime: number
  errorRate: number

  // Engagement metrics
  sessionStartsToday: number
  averageTimeOnPlatform: number
  returnUserRate: number

  timestamp: Date
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
}

export interface WidgetConfig {
  id: string
  title: string
  type: 'chart' | 'metric' | 'table' | 'gauge' | 'map'
  size: 'small' | 'medium' | 'large' | 'full'
  position: { x: number; y: number; w: number; h: number }
  refreshInterval?: number
  filters?: Partial<FilterSettings>
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar' | 'gauge'
  showLegend?: boolean
  showTooltips?: boolean
  drilldownEnabled?: boolean
}

export interface UserSegment {
  id: string
  name: string
  criteria: {
    field: string
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between'
    value: any
  }[]
  color: string
  userCount: number
  averagePerformance: number
}

export interface LearningPath {
  id: string
  name: string
  description: string
  totalProcesses: number
  completedProcesses: number
  averageCompletionTime: number
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  enrolledUsers: number
  completionRate: number
}

export interface ContentItem {
  id: string
  title: string
  type: 'process' | 'flashcard' | 'quiz' | 'video' | 'document'
  knowledgeArea: string
  processGroup: string
  engagementRate: number
  completionRate: number
  averageTimeSpent: number
  difficultyRating: number
  effectiveness: number
  lastUpdated: Date
}

export interface StudentProfile {
  id: string
  name: string
  email: string
  enrollmentDate: Date
  lastActive: Date
  studyStreak: number
  totalStudyTime: number
  overallProgress: number
  riskScore: number
  preferredStudyTime: string
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  strongAreas: string[]
  weakAreas: string[]
  achievements: number
  goals: number
}

export interface PredictiveInsight {
  type: 'success_probability' | 'completion_time' | 'risk_assessment' | 'recommendation'
  confidence: number
  value: any
  explanation: string
  actionItems: string[]
  impactScore: number
}

export interface GeospatialData {
  location: {
    country: string
    region: string
    city: string
    coordinates: [number, number]
  }
  userCount: number
  averagePerformance: number
  completionRate: number
  engagementScore: number
}

export interface A11yConfig {
  highContrast: boolean
  largeText: boolean
  screenReaderOptimized: boolean
  keyboardNavigation: boolean
  reducedMotion: boolean
  colorBlindFriendly: boolean
}

export interface PerformanceMetrics {
  renderTime: number
  dataFetchTime: number
  chartRenderTime: number
  memoryUsage: number
  bundleSize: number
  errorCount: number
  warningCount: number
}

export interface DrilldownData {
  level: number
  parentId?: string
  filters: Partial<FilterSettings>
  data: any
  breadcrumb: { label: string; filters: Partial<FilterSettings> }[]
}

export interface InteractiveEvent {
  type: 'click' | 'hover' | 'filter' | 'drill' | 'export' | 'share'
  target: string
  data: any
  timestamp: Date
  userId?: string
  sessionId: string
}

export interface CustomWidget {
  id: string
  name: string
  component: React.ComponentType<any>
  config: WidgetConfig
  permissions: string[]
  dependencies: string[]
}

export interface DashboardTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    danger: string
    info: string
    background: string
    surface: string
    text: string
    textSecondary: string
  }
  fonts: {
    primary: string
    secondary: string
  }
  spacing: {
    unit: number
    grid: number
  }
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
    wide: number
  }
}
