/**
 * Build Analysis & Bundle Optimization Type Definitions
 * ビルド分析、バンドルサイズ監視、パフォーマンス最適化の型定義
 */

// Bundle Analysis
export interface BundleAsset {
  readonly name: string
  readonly size: number
  readonly gzippedSize: number
  readonly type: 'js' | 'css' | 'html' | 'image' | 'font' | 'other'
  readonly chunk?: string
  readonly isEntry: boolean
  readonly isVendor: boolean
}

export interface BundleChunk {
  readonly id: string
  readonly name: string
  readonly size: number
  readonly modules: string[]
  readonly dependencies: string[]
  readonly isAsync: boolean
  readonly isEntry: boolean
}

export interface BundleAnalysis {
  readonly assets: BundleAsset[]
  readonly chunks: BundleChunk[]
  readonly totalSize: number
  readonly totalGzippedSize: number
  readonly entryPoints: string[]
  readonly vendorSize: number
  readonly timestamp: Date
}

// Bundle Size Monitoring
export interface BundleSizeThresholds {
  readonly totalSize: number
  readonly chunkSize: number
  readonly assetSize: number
  readonly vendorSize: number
}

export interface BundleSizeCheck {
  readonly analysis: BundleAnalysis
  readonly thresholds: BundleSizeThresholds
  readonly violations: BundleSizeViolation[]
  readonly passed: boolean
}

export interface BundleSizeViolation {
  readonly type: 'total' | 'chunk' | 'asset' | 'vendor'
  readonly name: string
  readonly actualSize: number
  readonly thresholdSize: number
  readonly severity: 'warning' | 'error'
}

// Performance Budget
export interface PerformanceBudget {
  readonly firstContentfulPaint: number // ms
  readonly largestContentfulPaint: number // ms
  readonly cumulativeLayoutShift: number // score
  readonly totalBlockingTime: number // ms
  readonly speedIndex: number // ms
  readonly bundleSize: number // bytes
}

export interface PerformanceMetrics {
  readonly fcp: number
  readonly lcp: number
  readonly cls: number
  readonly tbt: number
  readonly si: number
  readonly timestamp: Date
}

export interface PerformanceBudgetCheck {
  readonly metrics: PerformanceMetrics
  readonly budget: PerformanceBudget
  readonly violations: PerformanceViolation[]
  readonly score: number // 0-100
  readonly passed: boolean
}

export interface PerformanceViolation {
  readonly metric: keyof PerformanceMetrics
  readonly actual: number
  readonly threshold: number
  readonly impact: 'low' | 'medium' | 'high'
}

// Build Optimization
export interface OptimizationConfig {
  readonly minification: boolean
  readonly compression: boolean
  readonly treeshaking: boolean
  readonly codeSplitting: boolean
  readonly imageOptimization: boolean
  readonly cssOptimization: boolean
}

export interface OptimizationResult {
  readonly config: OptimizationConfig
  readonly beforeSize: number
  readonly afterSize: number
  readonly reduction: number
  readonly reductionPercentage: number
  readonly optimizations: OptimizationStep[]
  readonly duration: number
}

export interface OptimizationStep {
  readonly name: string
  readonly beforeSize: number
  readonly afterSize: number
  readonly reduction: number
  readonly duration: number
  readonly success: boolean
  readonly error?: Error
}

// Dependency Analysis
export interface DependencyInfo {
  readonly name: string
  readonly version: string
  readonly size: number
  readonly gzippedSize: number
  readonly isDevDependency: boolean
  readonly isDirect: boolean
  readonly license: string
  readonly vulnerabilities: VulnerabilityInfo[]
}

export interface VulnerabilityInfo {
  readonly id: string
  readonly severity: 'low' | 'moderate' | 'high' | 'critical'
  readonly title: string
  readonly description: string
  readonly patchedIn?: string
}

export interface DependencyAnalysis {
  readonly dependencies: DependencyInfo[]
  readonly totalSize: number
  readonly outdatedCount: number
  readonly vulnerabilityCount: number
  readonly recommendations: DependencyRecommendation[]
}

export interface DependencyRecommendation {
  readonly type: 'update' | 'replace' | 'remove'
  readonly dependency: string
  readonly reason: string
  readonly impact: 'low' | 'medium' | 'high'
  readonly action: string
}

// Asset Optimization
export interface AssetOptimizationConfig {
  readonly images: {
    quality: number
    formats: ('webp' | 'avif' | 'jpg' | 'png')[]
    responsive: boolean
  }
  readonly fonts: {
    subsetting: boolean
    preload: boolean
    fallbacks: string[]
  }
  readonly scripts: {
    minification: boolean
    compression: boolean
    splitting: boolean
  }
}

export interface AssetOptimizationResult {
  readonly type: 'image' | 'font' | 'script' | 'style'
  readonly originalPath: string
  readonly optimizedPath: string
  readonly originalSize: number
  readonly optimizedSize: number
  readonly reduction: number
  readonly format?: string
  readonly quality?: number
}

// Image Optimization
export interface ImageOptimizer {
  readonly optimize: () => Promise<void>
}

export interface ImageInfo {
  readonly width: number
  readonly height: number
  readonly size: number
  readonly format: string
  readonly path: string
}

export interface OptimizationConfig {
  readonly jpeg: {
    readonly quality: number
    readonly progressive: boolean
    readonly mozjpeg: boolean
  }
  readonly png: {
    readonly quality: readonly [number, number]
    readonly speed: number
    readonly strip: boolean
  }
  readonly webp: {
    readonly quality: number
    readonly effort: number
    readonly lossless: boolean
  }
  readonly avif: {
    readonly quality: number
    readonly effort: number
    readonly lossless: boolean
  }
}

export interface OptimizationReport {
  readonly timestamp: string
  readonly processedCount: number
  readonly totalSizeReduction: string
  readonly compressionRatio: string
  readonly webpCount: number
  readonly avifCount: number
  readonly formatBreakdown: readonly {
    readonly format: string
    readonly originalSize: string
    readonly optimizedSize: string
    readonly savings: string
  }[]
  readonly responsiveImages: readonly ResponsiveImageInfo[]
  readonly loadTimeImprovement: string
  readonly bandwidthSavings: string
  readonly coreWebVitalsImpact: string
  readonly recommendations: readonly string[]
  readonly errors: readonly {
    readonly path: string
    readonly error: string
  }[]
}

export interface ResponsiveImageInfo {
  readonly name: string
  readonly variants: readonly string[]
}

// Content Quality Analysis
export interface ContentQualityAnalyzer {
  readonly checkContentQuality: () => Promise<unknown>
}

export interface EducationalQualityStandards {
  readonly LEARNING_LEVELS: Record<
    string,
    {
      readonly weight: number
      readonly keywords: readonly string[]
    }
  >
  readonly READABILITY_METRICS: {
    readonly sentence_length: { readonly ideal: number; readonly max: number }
    readonly word_complexity: { readonly max_syllables: number }
    readonly paragraph_length: { readonly ideal: number; readonly max: number }
    readonly technical_term_ratio: { readonly max: number }
  }
  readonly PMP_EXAM_CRITERIA: {
    readonly process_coverage: number
    readonly itto_mastery: number
    readonly practical_application: number
    readonly exam_format_alignment: number
    readonly scenario_based_learning: number
  }
  readonly QUALITY_THRESHOLDS: {
    readonly content_clarity: number
    readonly learning_effectiveness: number
    readonly exam_preparation: number
    readonly accessibility: number
  }
}

export interface QualityReport {
  readonly report_meta: {
    readonly generated_at: string
    readonly checker_version: string
    readonly project: string
  }
  readonly quality_summary: {
    readonly overall_score: number
    readonly meets_educational_standards: boolean
    readonly ready_for_pmp_preparation: boolean
  }
  readonly detailed_scores: {
    readonly content_clarity: string
    readonly learning_effectiveness: string
    readonly exam_preparation: string
    readonly accessibility: string
  }
  readonly quality_gates: {
    readonly clarity_gate: boolean
    readonly effectiveness_gate: boolean
    readonly exam_prep_gate: boolean
    readonly accessibility_gate: boolean
  }
  readonly detailed_analysis: Record<string, unknown>
  readonly issues: readonly {
    readonly severity: string
    readonly message: string
    readonly timestamp: string
  }[]
  readonly recommendations: readonly {
    readonly message: string
    readonly timestamp: string
  }[]
  readonly improvement_actions: readonly string[]
}

export interface LearningEffectivenessAnalysis {
  readonly bloom_taxonomy_coverage: Record<string, number>
  readonly learning_path_quality: number
  readonly interactive_elements: number
  readonly assessment_alignment: number
}

// Performance Budget Management
export interface PerformanceBudgetChecker {
  readonly check: () => Promise<void>
}

export interface PerformanceBudget {
  readonly version: string
  readonly description: string
  readonly budgets: {
    readonly lighthouse: Record<string, { readonly min: number; readonly warn: number }>
    readonly coreWebVitals: Record<string, { readonly max: number; readonly warn: number }>
    readonly performance: Record<string, { readonly max: number; readonly warn: number }>
    readonly resources: Record<string, { readonly max: number; readonly warn: number }>
    readonly timing: Record<string, { readonly max: number; readonly warn: number }>
  }
  readonly alerts: {
    readonly slack: {
      readonly enabled: boolean
      readonly webhook?: string
    }
    readonly email: {
      readonly enabled: boolean
      readonly recipients: readonly string[]
    }
  }
}

export interface BudgetViolation {
  readonly type: string
  readonly category: string
  readonly message: string
  readonly current: number
  readonly limit: number
  readonly severity: 'error' | 'warning'
}

export interface BudgetWarning {
  readonly type: string
  readonly category: string
  readonly message: string
  readonly current: number
  readonly limit: number
  readonly severity: 'error' | 'warning'
}

export interface BudgetReport {
  readonly timestamp: string
  readonly status: 'pass' | 'fail'
  readonly summary: {
    readonly violations: number
    readonly warnings: number
    readonly total: number
  }
  readonly violations: readonly BudgetViolation[]
  readonly warnings: readonly BudgetWarning[]
  readonly recommendations: readonly {
    readonly category: string
    readonly priority: string
    readonly action: string
    readonly details: readonly string[]
  }[]
}

export interface PerformanceResults {
  readonly scores: {
    readonly performance: number
    readonly accessibility: number
    readonly bestPractices: number
    readonly seo: number
    readonly pwa: number
  }
  readonly coreWebVitals: {
    readonly lcp: number
    readonly fid: number
    readonly cls: number
  }
  readonly performanceMetrics: {
    readonly fcp: number
    readonly si: number
    readonly tti: number
    readonly tbt: number
  }
  readonly resourceMetrics: {
    readonly totalByteWeight: number
    readonly unusedJavaScript: number
    readonly unusedCSS: number
  }
}

// Build Performance Tracking
export interface BuildPerformanceMetrics {
  readonly buildTime: number // ms
  readonly bundleTime: number // ms
  readonly optimizationTime: number // ms
  readonly analysisTime: number // ms
  readonly totalTime: number // ms
  readonly memoryUsage: number // bytes
  readonly cacheHitRate: number // percentage
}

export interface BuildTrend {
  readonly date: Date
  readonly metrics: BuildPerformanceMetrics
  readonly bundleSize: number
  readonly commitSha: string
}

export interface BuildTrendAnalysis {
  readonly trends: BuildTrend[]
  readonly averageMetrics: BuildPerformanceMetrics
  readonly changes: {
    buildTimeChange: number
    bundleSizeChange: number
    performanceChange: number
  }
  readonly alerts: BuildAlert[]
}

export interface BuildAlert {
  readonly type: 'regression' | 'improvement' | 'threshold'
  readonly metric: string
  readonly message: string
  readonly severity: 'info' | 'warning' | 'error'
}
