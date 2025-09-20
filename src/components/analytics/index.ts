/**
 * Analytics Dashboard Exports
 * Central export point for all analytics dashboard components
 */

// Main dashboard component
export { default as RealTimeLearningAnalyticsDashboard } from './RealTimeLearningAnalyticsDashboard'
export { default as AnalyticsDashboardDemo } from './AnalyticsDashboardDemo'

// Widgets
export { default as ExecutiveOverviewWidget } from './widgets/ExecutiveOverviewWidget'
export { default as LearningAnalyticsWidget } from './widgets/LearningAnalyticsWidget'
export { default as StudentInsightsWidget } from './widgets/StudentInsightsWidget'
export { default as ContentAnalyticsWidget } from './widgets/ContentAnalyticsWidget'
export { default as BehavioralAnalyticsWidget } from './widgets/BehavioralAnalyticsWidget'
export { default as PredictiveAnalyticsWidget } from './widgets/PredictiveAnalyticsWidget'
export { default as RealTimeChartsWidget } from './widgets/RealTimeChartsWidget'
export { default as AlertsWidget } from './widgets/AlertsWidget'
export { default as CustomizableDashboard } from './widgets/CustomizableDashboard'

// Components
export { default as InteractiveChart } from './components/InteractiveChart'
export { default as InteractiveTooltip } from './components/InteractiveTooltip'
export { default as PerformanceMonitor } from './components/PerformanceMonitor'
export { default as KeyboardShortcuts } from './components/KeyboardShortcuts'
export { default as ExportDialog } from './components/ExportDialog'
export { default as FilterPanel } from './components/FilterPanel'

// Hooks
export { useRealTimeAnalytics } from '../../hooks/useRealTimeAnalytics'

// Types
export type * from './types/dashboard'
