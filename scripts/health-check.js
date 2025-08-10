#!/usr/bin/env node

/**
 * Database Health Check Script
 * Monitors database health, performance metrics, and connection status
 */

import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'
import { performance } from 'perf_hooks'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
})

// ============================================================================
// Health Check Functions
// ============================================================================

/**
 * Check PostgreSQL connectivity and version
 */
async function checkPostgresHealth() {
  const results = {
    status: 'unknown',
    responseTime: 0,
    version: null,
    details: {},
  }

  try {
    const startTime = performance.now()

    // Basic connectivity check
    const result =
      await prisma.$queryRaw`SELECT version(), current_database(), pg_postmaster_start_time()`

    results.responseTime = Math.round(performance.now() - startTime)
    results.status = 'healthy'
    results.version = result[0].version

    // Get database size
    const dbSize = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `
    results.details.databaseSize = dbSize[0].size

    // Get connection stats
    const connectionStats = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
      FROM pg_stat_activity
      WHERE datname = current_database()
    `
    results.details.connections = connectionStats[0]

    // Get table statistics
    const tableStats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_tables,
        SUM(n_live_tup) as total_rows,
        SUM(n_dead_tup) as dead_rows
      FROM pg_stat_user_tables
    `
    results.details.tables = tableStats[0]

    // Check for long-running queries
    const longQueries = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as count
      FROM pg_stat_activity
      WHERE state = 'active'
        AND query_start < CURRENT_TIMESTAMP - INTERVAL '1 minute'
        AND query NOT LIKE '%pg_stat_activity%'
    `
    results.details.longRunningQueries = longQueries[0].count

    // Get cache hit ratio
    const cacheRatio = await prisma.$queryRaw`
      SELECT 
        ROUND(100.0 * sum(heap_blks_hit) / 
          NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2) as cache_hit_ratio
      FROM pg_statio_user_tables
    `
    results.details.cacheHitRatio = cacheRatio[0].cache_hit_ratio || 0
  } catch (error) {
    results.status = 'unhealthy'
    results.error = error.message
  }

  return results
}

/**
 * Check Redis connectivity and status
 */
async function checkRedisHealth() {
  const results = {
    status: 'unknown',
    responseTime: 0,
    version: null,
    details: {},
  }

  try {
    const startTime = performance.now()

    // Ping Redis
    await redis.ping()

    results.responseTime = Math.round(performance.now() - startTime)
    results.status = 'healthy'

    // Get Redis info
    const info = await redis.info()
    const lines = info.split('\r\n')

    for (const line of lines) {
      if (line.startsWith('redis_version:')) {
        results.version = line.split(':')[1]
      }
      if (line.startsWith('used_memory_human:')) {
        results.details.memoryUsage = line.split(':')[1]
      }
      if (line.startsWith('connected_clients:')) {
        results.details.connectedClients = parseInt(line.split(':')[1])
      }
      if (line.startsWith('total_commands_processed:')) {
        results.details.totalCommands = parseInt(line.split(':')[1])
      }
    }

    // Get keyspace info
    const dbsize = await redis.dbsize()
    results.details.totalKeys = dbsize
  } catch (error) {
    results.status = 'unhealthy'
    results.error = error.message
  }

  return results
}

/**
 * Check application-specific metrics
 */
async function checkApplicationMetrics() {
  const metrics = {
    users: {},
    learning: {},
    content: {},
    performance: {},
  }

  try {
    // User metrics
    const userStats = await prisma.user.aggregate({
      _count: { id: true },
      where: { isActive: true },
    })
    metrics.users.totalActive = userStats._count.id

    const recentUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    })
    metrics.users.dailyActive = recentUsers

    // Learning metrics
    const progressStats = await prisma.learningProgress.aggregate({
      _count: { id: true },
      _avg: { understandingLevel: true },
      where: { status: 'completed' },
    })
    metrics.learning.completedProcesses = progressStats._count.id
    metrics.learning.avgUnderstanding = Math.round(progressStats._avg.understandingLevel || 0)

    const activeSessionsToday = await prisma.studySession.count({
      where: {
        startedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    })
    metrics.learning.todaySessions = activeSessionsToday

    // Content metrics
    metrics.content.totalProcesses = await prisma.process.count()
    metrics.content.totalQuestions = await prisma.examQuestion.count({ where: { isActive: true } })
    metrics.content.totalFlashcards = await prisma.flashcard.count()
    metrics.content.totalNotes = await prisma.studyNote.count()

    // Performance metrics (last hour)
    const recentActivities = await prisma.activityLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    })
    metrics.performance.recentActivities = recentActivities
  } catch (error) {
    metrics.error = error.message
  }

  return metrics
}

/**
 * Run query performance tests
 */
async function checkQueryPerformance() {
  const tests = []

  // Test 1: Simple query
  const test1Start = performance.now()
  await prisma.user.findFirst()
  tests.push({
    name: 'Simple User Query',
    duration: Math.round(performance.now() - test1Start),
    status: performance.now() - test1Start < 100 ? 'good' : 'slow',
  })

  // Test 2: Complex join query
  const test2Start = performance.now()
  await prisma.learningProgress.findMany({
    where: { userId: { not: null } },
    include: {
      process: {
        include: {
          knowledgeArea: true,
          processGroup: true,
        },
      },
    },
    take: 10,
  })
  tests.push({
    name: 'Complex Join Query',
    duration: Math.round(performance.now() - test2Start),
    status: performance.now() - test2Start < 500 ? 'good' : 'slow',
  })

  // Test 3: Aggregation query
  const test3Start = performance.now()
  await prisma.learningProgress.groupBy({
    by: ['status'],
    _count: { id: true },
  })
  tests.push({
    name: 'Aggregation Query',
    duration: Math.round(performance.now() - test3Start),
    status: performance.now() - test3Start < 300 ? 'good' : 'slow',
  })

  return tests
}

/**
 * Check for potential issues
 */
async function checkForIssues() {
  const issues = []

  try {
    // Check for unused indexes
    const unusedIndexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
        AND indexname NOT LIKE '%_pkey'
      ORDER BY schemaname, tablename
    `

    if (unusedIndexes.length > 0) {
      issues.push({
        type: 'warning',
        category: 'indexes',
        message: `Found ${unusedIndexes.length} unused indexes`,
        details: unusedIndexes,
      })
    }

    // Check for tables needing vacuum
    const vacuumNeeded = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_dead_tup,
        n_live_tup,
        ROUND(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) as dead_ratio
      FROM pg_stat_user_tables
      WHERE n_dead_tup > 1000
        AND n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) > 0.2
    `

    if (vacuumNeeded.length > 0) {
      issues.push({
        type: 'warning',
        category: 'maintenance',
        message: `${vacuumNeeded.length} tables need vacuum`,
        details: vacuumNeeded,
      })
    }

    // Check for lock conflicts
    const locks = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as lock_count
      FROM pg_locks
      WHERE NOT granted
    `

    if (locks[0].lock_count > 0) {
      issues.push({
        type: 'critical',
        category: 'locks',
        message: `Found ${locks[0].lock_count} lock conflicts`,
        action: 'Investigate blocking queries',
      })
    }
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'check',
      message: 'Failed to complete issue checks',
      error: error.message,
    })
  }

  return issues
}

// ============================================================================
// Report Generation
// ============================================================================

async function generateHealthReport() {
  console.log('\n' + '='.repeat(60))
  console.log('DATABASE HEALTH CHECK REPORT')
  console.log('='.repeat(60))
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log('='.repeat(60))

  // PostgreSQL Health
  console.log('\n📊 PostgreSQL Status:')
  const pgHealth = await checkPostgresHealth()
  console.log(`  Status: ${pgHealth.status === 'healthy' ? '✅' : '❌'} ${pgHealth.status}`)
  console.log(`  Response Time: ${pgHealth.responseTime}ms`)
  if (pgHealth.version) {
    console.log(`  Version: ${pgHealth.version.split(',')[0]}`)
  }
  if (pgHealth.details) {
    console.log(`  Database Size: ${pgHealth.details.databaseSize}`)
    if (pgHealth.details.connections) {
      console.log(
        `  Connections: ${pgHealth.details.connections.total_connections} total, ${pgHealth.details.connections.active_connections} active`
      )
    }
    if (pgHealth.details.tables) {
      console.log(
        `  Tables: ${pgHealth.details.tables.total_tables} tables, ${pgHealth.details.tables.total_rows} rows`
      )
    }
    console.log(`  Cache Hit Ratio: ${pgHealth.details.cacheHitRatio}%`)
    if (pgHealth.details.longRunningQueries > 0) {
      console.log(`  ⚠️  Long Running Queries: ${pgHealth.details.longRunningQueries}`)
    }
  }

  // Redis Health
  console.log('\n📊 Redis Status:')
  const redisHealth = await checkRedisHealth()
  console.log(`  Status: ${redisHealth.status === 'healthy' ? '✅' : '❌'} ${redisHealth.status}`)
  console.log(`  Response Time: ${redisHealth.responseTime}ms`)
  if (redisHealth.version) {
    console.log(`  Version: ${redisHealth.version}`)
  }
  if (redisHealth.details) {
    console.log(`  Memory Usage: ${redisHealth.details.memoryUsage}`)
    console.log(`  Connected Clients: ${redisHealth.details.connectedClients}`)
    console.log(`  Total Keys: ${redisHealth.details.totalKeys}`)
  }

  // Application Metrics
  console.log('\n📊 Application Metrics:')
  const appMetrics = await checkApplicationMetrics()
  console.log('  Users:')
  console.log(`    Total Active: ${appMetrics.users.totalActive || 0}`)
  console.log(`    Daily Active: ${appMetrics.users.dailyActive || 0}`)
  console.log('  Learning:')
  console.log(`    Completed Processes: ${appMetrics.learning.completedProcesses || 0}`)
  console.log(`    Avg Understanding: ${appMetrics.learning.avgUnderstanding || 0}%`)
  console.log(`    Today\'s Sessions: ${appMetrics.learning.todaySessions || 0}`)
  console.log('  Content:')
  console.log(`    Processes: ${appMetrics.content.totalProcesses || 0}`)
  console.log(`    Questions: ${appMetrics.content.totalQuestions || 0}`)
  console.log(`    Flashcards: ${appMetrics.content.totalFlashcards || 0}`)
  console.log(`    Study Notes: ${appMetrics.content.totalNotes || 0}`)

  // Query Performance
  console.log('\n📊 Query Performance:')
  const queryPerf = await checkQueryPerformance()
  for (const test of queryPerf) {
    const icon = test.status === 'good' ? '✅' : '⚠️'
    console.log(`  ${icon} ${test.name}: ${test.duration}ms`)
  }

  // Issues
  console.log('\n📊 Potential Issues:')
  const issues = await checkForIssues()
  if (issues.length === 0) {
    console.log('  ✅ No issues detected')
  } else {
    for (const issue of issues) {
      const icon = issue.type === 'critical' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'
      console.log(`  ${icon} [${issue.category}] ${issue.message}`)
      if (issue.action) {
        console.log(`     Action: ${issue.action}`)
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  const overallHealth = pgHealth.status === 'healthy' && redisHealth.status === 'healthy'
  const healthIcon = overallHealth ? '✅' : '❌'
  console.log(`Overall Status: ${healthIcon} ${overallHealth ? 'HEALTHY' : 'ISSUES DETECTED'}`)
  console.log('='.repeat(60))

  // Save report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    postgresql: pgHealth,
    redis: redisHealth,
    application: appMetrics,
    queryPerformance: queryPerf,
    issues: issues,
    overallStatus: overallHealth ? 'healthy' : 'unhealthy',
  }

  const reportsDir = path.join(dirname(__dirname), 'database', 'reports')
  await fs.mkdir(reportsDir, { recursive: true })

  const reportFile = path.join(reportsDir, `health-check-${Date.now()}.json`)
  await fs.writeFile(reportFile, JSON.stringify(reportData, null, 2))
  console.log(`\nReport saved to: ${reportFile}`)

  return overallHealth
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  try {
    const isHealthy = await generateHealthReport()

    // Cleanup
    await prisma.$disconnect()
    redis.disconnect()

    process.exit(isHealthy ? 0 : 1)
  } catch (error) {
    console.error('\n❌ Health check failed:', error)

    // Cleanup
    await prisma.$disconnect()
    redis.disconnect()

    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { checkPostgresHealth, checkRedisHealth, checkApplicationMetrics }
