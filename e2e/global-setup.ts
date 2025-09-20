/**
 * PMP Learning Management System - Global E2E Test Setup
 * 
 * This file handles global test environment preparation including:
 * - Database seeding with PMBOK test data
 * - Authentication setup and user management
 * - Test environment configuration
 * - Performance monitoring initialization
 * - Visual regression baseline preparation
 * 
 * @fileoverview Global test environment setup and preparation
 * @author PMP Learning Management Team
 * @since 2.0.0
 */

import { chromium, type FullConfig } from '@playwright/test'
import { DatabaseSeeder } from './utils/database-seeder'
import { TestDataGenerator } from './utils/test-data-generator'
import { PerformanceMonitor } from './utils/performance-monitor'
import { VisualRegressionManager } from './utils/visual-regression-manager'
import { AuthenticationManager } from './utils/authentication-manager'

interface GlobalSetupConfig {
  storageState: string
  testUsers: Array<{
    email: string
    password: string
    role: string
    profile: any
  }>
  pmbokData: any
  performanceBaselines: any
  visualBaselines: any
}

async function globalSetup(config: FullConfig): Promise<GlobalSetupConfig | void> {
  console.log('🚀 Starting PMP Learning Management E2E Test Setup...')
  
  const setupStartTime = Date.now()
  let browser = null
  
  try {
    // Initialize browser for setup operations
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()

    // 1. Initialize test data generators
    console.log('📊 Initializing PMBOK test data generators...')
    const testDataGenerator = new TestDataGenerator()
    const pmbokData = await testDataGenerator.generateCompleteTestDataset()
    
    // 2. Setup test database (if using backend)
    console.log('🗄️ Setting up test database...')
    const dbSeeder = new DatabaseSeeder()
    await dbSeeder.seedTestDatabase({
      processes: pmbokData.processes,
      users: pmbokData.users,
      progressData: pmbokData.progressData,
      examData: pmbokData.examData
    })

    // 3. Create test users with different roles and progress states
    console.log('👥 Creating test users...')
    const authManager = new AuthenticationManager()
    const testUsers = await authManager.createTestUsers([
      {
        email: 'student.beginner@pmp-test.local',
        password: 'TestPass123!',
        role: 'student',
        profile: {
          name: 'Test Student (Beginner)',
          progress: 'beginner',
          completedProcesses: []
        }
      },
      {
        email: 'student.intermediate@pmp-test.local',
        password: 'TestPass123!',
        role: 'student',
        profile: {
          name: 'Test Student (Intermediate)',
          progress: 'intermediate',
          completedProcesses: pmbokData.processes.slice(0, 25).map(p => p.name)
        }
      },
      {
        email: 'student.advanced@pmp-test.local',
        password: 'TestPass123!',
        role: 'student',
        profile: {
          name: 'Test Student (Advanced)',
          progress: 'advanced',
          completedProcesses: pmbokData.processes.map(p => p.name),
          examAttempts: 3,
          bestScore: 185
        }
      },
      {
        email: 'instructor@pmp-test.local',
        password: 'TestPass123!',
        role: 'instructor',
        profile: {
          name: 'Test Instructor',
          permissions: ['view_all_progress', 'manage_content', 'grade_exams'],
          studentsManaged: 50
        }
      },
      {
        email: 'admin@pmp-test.local',
        password: 'TestPass123!',
        role: 'admin',
        profile: {
          name: 'Test Administrator',
          permissions: ['full_access'],
          systemRole: 'super_admin'
        }
      }
    ])

    // 4. Setup authentication state for different user types
    console.log('🔐 Setting up authentication states...')
    const storageStates = await authManager.createStorageStates(page, testUsers)

    // 5. Initialize performance monitoring baselines
    console.log('⚡ Setting up performance monitoring...')
    const performanceMonitor = new PerformanceMonitor()
    const performanceBaselines = await performanceMonitor.establishBaselines(page, {
      routes: [
        '/',
        '/#/matrix',
        '/#/network', 
        '/#/visualizations',
        '/#/glossary',
        '/#/progress',
        '/#/mock-exam'
      ],
      metrics: [
        'firstContentfulPaint',
        'largestContentfulPaint',
        'cumulativeLayoutShift',
        'firstInputDelay',
        'totalBlockingTime',
        'speedIndex'
      ]
    })

    // 6. Setup visual regression baselines
    console.log('👁️ Setting up visual regression baselines...')
    const visualManager = new VisualRegressionManager()
    const visualBaselines = await visualManager.captureBaselines(page, {
      components: [
        'home-page',
        'pmbok-matrix',
        'network-diagram',
        'sankey-diagram',
        'process-heatmap',
        'mind-map-view',
        'flashcard-system',
        'mock-exam-interface',
        'progress-dashboard',
        'glossary-interface'
      ],
      d3Visualizations: [
        'itto-network-graph',
        'enhanced-network-graph',
        'force-directed-graph',
        'hierarchical-edge-bundling',
        'circular-packing',
        'treemap-visualization'
      ],
      responsiveBreakpoints: [
        { width: 320, height: 568, name: 'mobile-small' },
        { width: 375, height: 812, name: 'mobile-large' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1024, height: 768, name: 'tablet-landscape' },
        { width: 1280, height: 720, name: 'desktop' },
        { width: 1920, height: 1080, name: 'desktop-large' }
      ]
    })

    // 7. Pre-warm application caches and generate test artifacts
    console.log('🔥 Pre-warming application caches...')
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Navigate through key routes to warm caches
    const keyRoutes = ['/', '/#/matrix', '/#/network', '/#/visualizations']
    for (const route of keyRoutes) {
      await page.goto(route)
      await page.waitForTimeout(2000)
    }

    // 8. Generate test data files for offline testing
    console.log('💾 Generating test data files...')
    const testDataPath = './e2e/test-data'
    await testDataGenerator.generateTestFiles(testDataPath, {
      pmbokData,
      testUsers,
      mockExamQuestions: 200,
      progressScenarios: 15,
      visualizationTestData: true
    })

    // 9. Setup AI-powered test analytics
    console.log('🤖 Initializing AI test analytics...')
    const aiAnalytics = await import('./utils/ai-test-analytics')
    await aiAnalytics.initialize({
      model: 'gpt-4',
      analysisTypes: [
        'failure_root_cause',
        'test_optimization',
        'coverage_analysis',
        'performance_insights',
        'visual_regression_analysis'
      ]
    })

    // Cleanup setup browser
    await context.close()
    
    const setupDuration = Date.now() - setupStartTime
    console.log(`✅ Global setup completed successfully in ${setupDuration}ms`)
    
    // Return setup configuration for use in tests
    return {
      storageState: storageStates.student,
      testUsers,
      pmbokData,
      performanceBaselines,
      visualBaselines
    }

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    
    // Attempt cleanup on failure
    if (browser) {
      await browser.close().catch(() => {})
    }
    
    // Log detailed error information
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    throw error
    
  } finally {
    // Ensure browser cleanup
    if (browser) {
      await browser.close().catch(() => {})
    }
  }
}

export default globalSetup