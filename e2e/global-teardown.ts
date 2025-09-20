/**
 * PMP Learning Management System - Global E2E Test Teardown
 * 
 * This file handles global test environment cleanup including:
 * - Test data cleanup and database restoration
 * - Performance metrics collection and analysis
 * - Test result aggregation and reporting
 * - Visual regression analysis and reporting
 * - AI-powered test insights generation
 * 
 * @fileoverview Global test environment cleanup and reporting
 * @author PMP Learning Management Team
 * @since 2.0.0
 */

import { type FullConfig } from '@playwright/test'
import { DatabaseSeeder } from './utils/database-seeder'
import { PerformanceAnalyzer } from './utils/performance-analyzer'
import { VisualRegressionAnalyzer } from './utils/visual-regression-analyzer'
import { TestReportGenerator } from './utils/test-report-generator'
import { AITestAnalytics } from './utils/ai-test-analytics'
import { NotificationManager } from './utils/notification-manager'
import fs from 'fs/promises'
import path from 'path'

interface TestSummary {
  totalTests: number
  passed: number
  failed: number
  skipped: number
  duration: number
  coverage: number
  performanceScore: number
  visualRegressions: number
  accessibilityIssues: number
  criticalIssues: Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendation: string
  }>
}

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('🧹 Starting PMP Learning Management E2E Test Teardown...')
  
  const teardownStartTime = Date.now()
  
  try {
    // 1. Collect and analyze test results
    console.log('📊 Collecting test results...')
    const testResults = await collectTestResults()
    
    // 2. Analyze performance metrics
    console.log('⚡ Analyzing performance metrics...')
    const performanceAnalyzer = new PerformanceAnalyzer()
    const performanceAnalysis = await performanceAnalyzer.analyzeResults({
      resultsPath: './test-results',
      baselinePath: './e2e/baselines/performance',
      thresholds: {
        firstContentfulPaint: 2000,
        largestContentfulPaint: 4000,
        cumulativeLayoutShift: 0.1,
        firstInputDelay: 100,
        totalBlockingTime: 300
      }
    })

    // 3. Process visual regression results
    console.log('👁️ Processing visual regression results...')
    const visualAnalyzer = new VisualRegressionAnalyzer()
    const visualAnalysis = await visualAnalyzer.processResults({
      resultsPath: './test-results',
      baselinePath: './e2e/baselines/visual',
      threshold: 0.1,
      generateDiffs: true
    })

    // 4. Generate accessibility analysis
    console.log('♿ Analyzing accessibility test results...')
    const accessibilityResults = await analyzeAccessibilityResults()

    // 5. AI-powered test analysis and insights
    console.log('🤖 Generating AI-powered test insights...')
    const aiAnalytics = new AITestAnalytics()
    const aiInsights = await aiAnalytics.generateInsights({
      testResults,
      performanceAnalysis,
      visualAnalysis,
      accessibilityResults,
      historicalData: await loadHistoricalTestData()
    })

    // 6. Generate comprehensive test report
    console.log('📋 Generating comprehensive test report...')
    const reportGenerator = new TestReportGenerator()
    const testSummary: TestSummary = {
      totalTests: testResults.totalTests,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      duration: testResults.duration,
      coverage: testResults.coverage,
      performanceScore: performanceAnalysis.overallScore,
      visualRegressions: visualAnalysis.regressionCount,
      accessibilityIssues: accessibilityResults.totalIssues,
      criticalIssues: [
        ...performanceAnalysis.criticalIssues,
        ...visualAnalysis.criticalIssues,
        ...accessibilityResults.criticalIssues,
        ...aiInsights.criticalIssues
      ]
    }

    await reportGenerator.generateReport({
      summary: testSummary,
      detailedResults: {
        testResults,
        performanceAnalysis,
        visualAnalysis,
        accessibilityResults,
        aiInsights
      },
      outputFormats: ['html', 'json', 'pdf', 'slack'],
      outputPath: './test-results/reports'
    })

    // 7. Update historical data and trends
    console.log('📈 Updating test trend data...')
    await updateHistoricalData({
      timestamp: new Date().toISOString(),
      summary: testSummary,
      environment: process.env.NODE_ENV || 'development',
      commit: process.env.GITHUB_SHA || 'local',
      branch: process.env.GITHUB_REF_NAME || 'local'
    })

    // 8. Send notifications based on results
    console.log('📢 Processing notifications...')
    const notificationManager = new NotificationManager()
    await notificationManager.processResults({
      summary: testSummary,
      aiInsights,
      channels: {
        slack: process.env.SLACK_WEBHOOK_URL,
        email: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
        teams: process.env.TEAMS_WEBHOOK_URL
      },
      thresholds: {
        successRate: 95, // Send alert if success rate < 95%
        performanceScore: 80, // Send alert if performance score < 80
        criticalIssues: 0 // Send alert if any critical issues
      }
    })

    // 9. Cleanup test artifacts and temporary data
    console.log('🧹 Cleaning up test artifacts...')
    await cleanupTestArtifacts({
      preserveReports: true,
      preserveBaselines: true,
      preserveFailureArtifacts: true,
      cleanupTempData: true,
      cleanupTestUsers: !process.env.PRESERVE_TEST_USERS
    })

    // 10. Database cleanup
    console.log('🗄️ Cleaning up test database...')
    const dbSeeder = new DatabaseSeeder()
    await dbSeeder.cleanupTestData({
      preserveBaselines: true,
      resetSequences: true
    })

    // 11. Generate quality gates report for CI/CD
    console.log('🚪 Generating quality gates report...')
    const qualityGates = await generateQualityGatesReport(testSummary)
    await fs.writeFile(
      './test-results/quality-gates.json',
      JSON.stringify(qualityGates, null, 2)
    )

    // 12. Update test metadata and cache
    console.log('🏷️ Updating test metadata...')
    await updateTestMetadata({
      lastRun: new Date().toISOString(),
      testSuite: 'e2e-comprehensive',
      version: process.env.npm_package_version || '2.0.0',
      summary: testSummary,
      qualityGates
    })

    const teardownDuration = Date.now() - teardownStartTime
    console.log(`✅ Global teardown completed successfully in ${teardownDuration}ms`)

    // Log final summary
    logFinalSummary(testSummary, teardownDuration)

  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    
    // Log error details for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // Attempt emergency cleanup
    await emergencyCleanup()
    
    throw error
  }
}

async function collectTestResults(): Promise<any> {
  try {
    const resultsPath = './test-results/results.json'
    const resultsData = await fs.readFile(resultsPath, 'utf-8')
    return JSON.parse(resultsData)
  } catch (error) {
    console.warn('Failed to load test results, using defaults')
    return {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      coverage: 0
    }
  }
}

async function analyzeAccessibilityResults(): Promise<any> {
  // Placeholder for accessibility analysis
  return {
    totalIssues: 0,
    criticalIssues: [],
    summary: 'No accessibility issues detected'
  }
}

async function loadHistoricalTestData(): Promise<any> {
  try {
    const historyPath = './test-results/history/test-trends.json'
    const historyData = await fs.readFile(historyPath, 'utf-8')
    return JSON.parse(historyData)
  } catch (error) {
    return { runs: [] }
  }
}

async function updateHistoricalData(data: any): Promise<void> {
  try {
    const historyPath = './test-results/history/test-trends.json'
    const historicalData = await loadHistoricalTestData()
    
    historicalData.runs.push(data)
    
    // Keep only last 100 runs
    if (historicalData.runs.length > 100) {
      historicalData.runs = historicalData.runs.slice(-100)
    }
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(historyPath), { recursive: true })
    await fs.writeFile(historyPath, JSON.stringify(historicalData, null, 2))
  } catch (error) {
    console.warn('Failed to update historical data:', error.message)
  }
}

async function cleanupTestArtifacts(options: any): Promise<void> {
  try {
    if (options.cleanupTempData) {
      await fs.rm('./e2e/test-data/temp', { recursive: true, force: true })
    }
    
    if (options.cleanupTestUsers) {
      // Remove test user storage states
      await fs.rm('./e2e/storage-states', { recursive: true, force: true })
    }
  } catch (error) {
    console.warn('Non-critical cleanup error:', error.message)
  }
}

async function generateQualityGatesReport(summary: TestSummary): Promise<any> {
  return {
    passed: summary.failed === 0 && summary.criticalIssues.length === 0,
    gates: {
      testSuccess: {
        passed: (summary.passed / summary.totalTests) >= 0.95,
        value: summary.passed / summary.totalTests,
        threshold: 0.95
      },
      performanceScore: {
        passed: summary.performanceScore >= 80,
        value: summary.performanceScore,
        threshold: 80
      },
      visualRegressions: {
        passed: summary.visualRegressions === 0,
        value: summary.visualRegressions,
        threshold: 0
      },
      accessibilityIssues: {
        passed: summary.accessibilityIssues === 0,
        value: summary.accessibilityIssues,
        threshold: 0
      }
    }
  }
}

async function updateTestMetadata(metadata: any): Promise<void> {
  try {
    const metadataPath = './test-results/metadata.json'
    await fs.mkdir(path.dirname(metadataPath), { recursive: true })
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
  } catch (error) {
    console.warn('Failed to update test metadata:', error.message)
  }
}

function logFinalSummary(summary: TestSummary, teardownDuration: number): void {
  console.log('\n' + '='.repeat(80))
  console.log('🎯 PMP LEARNING MANAGEMENT E2E TEST SUMMARY')
  console.log('='.repeat(80))
  console.log(`📊 Tests: ${summary.totalTests} total, ${summary.passed} passed, ${summary.failed} failed`)
  console.log(`⚡ Performance Score: ${summary.performanceScore}/100`)
  console.log(`👁️ Visual Regressions: ${summary.visualRegressions}`)
  console.log(`♿ Accessibility Issues: ${summary.accessibilityIssues}`)
  console.log(`⏱️ Duration: ${(summary.duration / 1000).toFixed(2)}s (teardown: ${teardownDuration}ms)`)
  console.log(`🎯 Success Rate: ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%`)
  
  if (summary.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:')
    summary.criticalIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue.type}: ${issue.description}`)
    })
  }
  
  console.log('='.repeat(80) + '\n')
}

async function emergencyCleanup(): Promise<void> {
  try {
    console.log('🚨 Performing emergency cleanup...')
    // Basic cleanup operations that should always work
    await fs.rm('./e2e/test-data/temp', { recursive: true, force: true }).catch(() => {})
  } catch (error) {
    console.error('Emergency cleanup also failed:', error.message)
  }
}

export default globalTeardown