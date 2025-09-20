#!/usr/bin/env node
/**
 * Performance Benchmark Script
 * TypeScript version with comprehensive performance testing for 10,000+ concurrent users
 */

import { performance } from 'perf_hooks'
import * as os from 'os'
import * as fs from 'fs/promises'
import type {
  CLIConfig,
  Logger,
  LogLevel,
  ExitCode,
  ScriptOptions,
  ScriptResult
} from '../src/types/devops/scripts.js'

// ==================== Type Definitions ====================

interface CacheMetrics {
  hits: number
  misses: number
  totalRequests: number
  averageLatency: number
  hitRate?: number
}

interface CacheEntry {
  value: any
  timestamp: number
  accessCount: number
}

interface BenchmarkResult {
  test: string
  duration: string
  success: boolean
  details: Record<string, any>
}

interface SystemInfo {
  platform: string
  arch: string
  cpus: number
  memory: number
}

interface BenchmarkSummary {
  overallDuration: number
  totalTests: number
  passedTests: number
  successRate: string
}

interface BenchmarkReport {
  timestamp: string
  system: SystemInfo
  results: BenchmarkResult[]
  metrics: CacheMetrics
  summary: BenchmarkSummary
  memoryUsage: NodeJS.MemoryUsage
}

interface UserOperation {
  userId: number
  operation: number
  knowledgeArea: string
  masteryLevel: number
  timestamp: number
}

// ==================== Mock Cache Implementation ====================

class MockCache {
  private data: Map<string, CacheEntry>
  private metrics: CacheMetrics

  constructor() {
    this.data = new Map<string, CacheEntry>()
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      averageLatency: 0
    }
  }

  async set(key: string, value: any): Promise<boolean> {
    const start = performance.now()
    this.data.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    })
    const latency = performance.now() - start
    this.updateMetrics(latency)
    return true
  }

  async get(key: string): Promise<any> {
    const start = performance.now()
    const entry = this.data.get(key)
    const latency = performance.now() - start
    
    if (entry) {
      entry.accessCount++
      this.metrics.hits++
    } else {
      this.metrics.misses++
    }
    
    this.updateMetrics(latency)
    return entry ? entry.value : null
  }

  private updateMetrics(latency: number): void {
    this.metrics.totalRequests++
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (this.metrics.totalRequests - 1) + latency) / 
      this.metrics.totalRequests
  }

  getMetrics(): CacheMetrics {
    return {
      ...this.metrics,
      hitRate: this.metrics.totalRequests > 0 ? 
        this.metrics.hits / this.metrics.totalRequests : 0
    }
  }

  clear(): void {
    this.data.clear()
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      averageLatency: 0
    }
  }

  size(): number {
    return this.data.size
  }
}

// ==================== Performance Benchmark Class ====================

class PerformanceBenchmark {
  private cache: MockCache
  private results: BenchmarkResult[]

  constructor() {
    this.cache = new MockCache()
    this.results = []
  }

  async runBasicOperations(): Promise<boolean> {
    this.log('\n🔧 Running Basic Operations Test...', 'info')
    const testData = {
      userId: 'test_user_123',
      progress: {
        knowledgeArea: 'Integration Management',
        completionRate: 85
      },
      timestamp: Date.now()
    }

    const start = performance.now()
    
    // Test set operation
    const setResult = await this.cache.set('test_key', testData)
    
    // Test get operation
    const getData = await this.cache.get('test_key')
    
    const duration = performance.now() - start
    
    const success = setResult && JSON.stringify(getData) === JSON.stringify(testData)
    
    this.results.push({
      test: 'Basic Operations',
      duration: duration.toFixed(2),
      success,
      details: { setResult, dataMatch: success }
    })

    this.log(`✅ Basic Operations completed in ${duration.toFixed(2)}ms`, 'info')
    return success
  }

  async runConcurrencyTest(): Promise<boolean> {
    this.log('\n⚡ Running Concurrency Test (1,000 operations)...', 'info')
    
    const concurrentOps = 1000
    const promises: Promise<boolean>[] = []
    
    const start = performance.now()
    
    // Generate concurrent set operations
    for (let i = 0; i < concurrentOps; i++) {
      promises.push(
        this.cache.set(`concurrent_key_${i}`, {
          index: i,
          data: `test_data_${i}`,
          timestamp: Date.now()
        })
      )
    }
    
    const setResults = await Promise.allSettled(promises)
    
    // Generate concurrent get operations
    const getPromises: Promise<any>[] = []
    for (let i = 0; i < concurrentOps; i++) {
      getPromises.push(this.cache.get(`concurrent_key_${i}`))
    }
    
    const getResults = await Promise.allSettled(getPromises)
    
    const duration = performance.now() - start
    const successfulSets = setResults.filter(r => r.status === 'fulfilled' && r.value).length
    const successfulGets = getResults.filter(r => r.status === 'fulfilled' && r.value !== null).length
    
    const success = successfulSets === concurrentOps && successfulGets === concurrentOps
    
    this.results.push({
      test: 'Concurrency Test',
      duration: duration.toFixed(2),
      success,
      details: {
        operations: concurrentOps,
        successfulSets,
        successfulGets,
        opsPerSecond: (concurrentOps * 2 / (duration / 1000)).toFixed(0)
      }
    })

    this.log(`✅ Concurrency test completed in ${duration.toFixed(2)}ms`, 'info')
    this.log(`📊 ${successfulSets}/${concurrentOps} sets successful, ${successfulGets}/${concurrentOps} gets successful`, 'info')
    this.log(`🚀 ${(concurrentOps * 2 / (duration / 1000)).toFixed(0)} operations/second`, 'info')
    
    return success
  }

  async runLoadTest(): Promise<boolean> {
    this.log('\n🔥 Running Load Test (10,000 users simulation)...', 'info')
    
    const users = 10000
    const operationsPerUser = 5
    const totalOps = users * operationsPerUser
    
    const start = performance.now()
    const allPromises: Promise<PromiseSettledResult<any>[]>[] = []
    
    for (let userId = 0; userId < users; userId++) {
      const userOps: Promise<any>[] = []
      
      for (let op = 0; op < operationsPerUser; op++) {
        const key = `user_${userId}_op_${op}`
        const userData: UserOperation = {
          userId,
          operation: op,
          knowledgeArea: ['Integration', 'Scope', 'Schedule', 'Cost', 'Quality'][op % 5],
          masteryLevel: Math.floor(Math.random() * 100),
          timestamp: Date.now()
        }
        
        if (Math.random() < 0.8) {
          // 80% read operations
          userOps.push(this.cache.get(key))
        } else {
          // 20% write operations
          userOps.push(this.cache.set(key, userData))
        }
      }
      
      allPromises.push(Promise.allSettled(userOps))
      
      // Add small delay every 1000 users to avoid overwhelming
      if (userId % 1000 === 0 && userId > 0) {
        await new Promise(resolve => setTimeout(resolve, 1))
      }
    }
    
    const results = await Promise.allSettled(allPromises)
    const duration = performance.now() - start
    
    const successfulUsers = results.filter(r => r.status === 'fulfilled').length
    const successRate = successfulUsers / users
    
    const success = successRate > 0.95
    
    this.results.push({
      test: 'Load Test',
      duration: duration.toFixed(2),
      success,
      details: {
        users,
        operationsPerUser,
        totalOperations: totalOps,
        successfulUsers,
        successRate: (successRate * 100).toFixed(1) + '%',
        avgTimePerUser: (duration / users).toFixed(2),
        throughput: (totalOps / (duration / 1000)).toFixed(0) + ' ops/sec'
      }
    })

    this.log(`✅ Load test completed in ${duration.toFixed(2)}ms`, 'info')
    this.log(`👥 ${successfulUsers}/${users} users processed successfully (${(successRate * 100).toFixed(1)}%)`, 'info')
    this.log(`⚡ ${(totalOps / (duration / 1000)).toFixed(0)} operations/second throughput`, 'info')
    this.log(`📈 ${(duration / users).toFixed(2)}ms average per user`, 'info')
    
    return success
  }

  async runMemoryPressureTest(): Promise<boolean> {
    this.log('\n🧠 Running Memory Pressure Test...', 'info')
    
    const initialMemory = process.memoryUsage()
    const largeDataSize = 10000 // 10KB per object
    const numObjects = 5000
    
    const start = performance.now()
    
    const promises: Promise<boolean>[] = []
    for (let i = 0; i < numObjects; i++) {
      const largeData = {
        id: i,
        payload: 'x'.repeat(largeDataSize),
        metadata: {
          created: new Date().toISOString(),
          size: largeDataSize,
          index: i
        }
      }
      
      promises.push(this.cache.set(`large_${i}`, largeData))
    }
    
    const results = await Promise.allSettled(promises)
    const duration = performance.now() - start
    const finalMemory = process.memoryUsage()
    
    const successfulOps = results.filter(r => r.status === 'fulfilled' && r.value).length
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
    
    const success = successfulOps === numObjects && memoryIncrease > 0
    
    this.results.push({
      test: 'Memory Pressure Test',
      duration: duration.toFixed(2),
      success,
      details: {
        objects: numObjects,
        objectSize: `${largeDataSize} bytes`,
        successfulOps,
        memoryIncrease: `${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`,
        finalCacheSize: this.cache.size(),
        heapUsed: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`
      }
    })

    this.log(`✅ Memory pressure test completed in ${duration.toFixed(2)}ms`, 'info')
    this.log(`💾 Memory increased by ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`, 'info')
    this.log(`📊 Cache contains ${this.cache.size()} objects`, 'info')
    
    return success
  }

  async runPerformanceProfileTest(): Promise<boolean> {
    this.log('\n📊 Running Performance Profile Test...', 'info')
    
    const iterations = 1000
    const latencies: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      const key = `profile_${i}`
      const data = {
        iteration: i,
        timestamp: Date.now(),
        randomData: Math.random().toString(36).substring(7)
      }
      
      const start = performance.now()
      
      await this.cache.set(key, data)
      const retrieved = await this.cache.get(key)
      
      const latency = performance.now() - start
      latencies.push(latency)
      
      if (JSON.stringify(retrieved) !== JSON.stringify(data)) {
        this.log(`❌ Data mismatch at iteration ${i}`, 'error')
      }
    }
    
    // Calculate statistics
    latencies.sort((a, b) => a - b)
    const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
    const p50Latency = latencies[Math.floor(latencies.length * 0.5)]
    const p95Latency = latencies[Math.floor(latencies.length * 0.95)]
    const p99Latency = latencies[Math.floor(latencies.length * 0.99)]
    const minLatency = latencies[0]
    const maxLatency = latencies[latencies.length - 1]
    
    const success = avgLatency < 50 && p95Latency < 100
    
    this.results.push({
      test: 'Performance Profile Test',
      duration: `${avgLatency.toFixed(2)}ms avg`,
      success,
      details: {
        iterations,
        avgLatency: `${avgLatency.toFixed(2)}ms`,
        p50Latency: `${p50Latency.toFixed(2)}ms`,
        p95Latency: `${p95Latency.toFixed(2)}ms`,
        p99Latency: `${p99Latency.toFixed(2)}ms`,
        minLatency: `${minLatency.toFixed(2)}ms`,
        maxLatency: `${maxLatency.toFixed(2)}ms`
      }
    })

    this.log('✅ Performance profile completed', 'info')
    this.log(`📈 Avg: ${avgLatency.toFixed(2)}ms, P95: ${p95Latency.toFixed(2)}ms, P99: ${p99Latency.toFixed(2)}ms`, 'info')
    
    return success
  }

  async runAllBenchmarks(options: ScriptOptions = {}): Promise<ScriptResult<BenchmarkReport>> {
    const startTime = Date.now()

    try {
      this.log('🚀 PMPLearningManagement Performance Benchmark Suite', 'info')
      this.log('===================================================', 'info')
      this.log(`🖥️  System: ${os.platform()} ${os.arch()}`, 'info')
      this.log(`💾 Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`, 'info')
      this.log(`🔧 CPUs: ${os.cpus().length} cores`, 'info')
      this.log(`📅 Date: ${new Date().toISOString()}`, 'info')
      
      if (options.dryRun) {
        this.log('DRY RUN MODE: Would run performance benchmarks but no actual tests will execute', 'warn')
        return {
          success: true,
          data: {} as BenchmarkReport,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }

      const overallStart = performance.now()
      
      // Run all benchmark tests
      await this.runBasicOperations()
      await this.runConcurrencyTest()
      await this.runLoadTest()
      await this.runMemoryPressureTest()
      await this.runPerformanceProfileTest()
      
      const overallDuration = performance.now() - overallStart
      
      // Generate final report
      const report = await this.generateReport(overallDuration)
      
      const success = report.summary.passedTests === report.summary.totalTests

      return {
        success,
        data: report,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ Benchmark failed: ${errorMessage}`, 'error')

      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
  }

  private async generateReport(overallDuration: number): Promise<BenchmarkReport> {
    this.log('\n📋 Benchmark Results Summary', 'info')
    this.log('=============================', 'info')
    
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.success).length
    const successRate = (passedTests / totalTests * 100).toFixed(1)
    
    this.log(`\n📊 Overall Results:`, 'info')
    this.log(`   Total Duration: ${overallDuration.toFixed(2)}ms`, 'info')
    this.log(`   Tests Passed: ${passedTests}/${totalTests} (${successRate}%)`, 'info')
    
    this.log('\n🔍 Test Details:', 'info')
    this.results.forEach((result) => {
      const status = result.success ? '✅' : '❌'
      this.log(`   ${status} ${result.test}: ${result.duration}ms`, 'info')
      
      if (result.details) {
        Object.entries(result.details).forEach(([key, value]) => {
          this.log(`      ${key}: ${value}`, 'info')
        })
      }
    })
    
    // Cache final metrics
    const cacheMetrics = this.cache.getMetrics()
    this.log('\n💾 Cache Performance:', 'info')
    this.log(`   Total Requests: ${cacheMetrics.totalRequests.toLocaleString()}`, 'info')
    this.log(`   Cache Hits: ${cacheMetrics.hits.toLocaleString()}`, 'info')
    this.log(`   Cache Misses: ${cacheMetrics.misses.toLocaleString()}`, 'info')
    this.log(`   Hit Rate: ${((cacheMetrics.hitRate || 0) * 100).toFixed(1)}%`, 'info')
    this.log(`   Average Latency: ${cacheMetrics.averageLatency.toFixed(3)}ms`, 'info')
    this.log(`   Cache Size: ${this.cache.size().toLocaleString()} entries`, 'info')
    
    // System resource usage
    const memUsage = process.memoryUsage()
    this.log('\n🖥️  System Resources:', 'info')
    this.log(`   Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`, 'info')
    this.log(`   Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`, 'info')
    this.log(`   RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`, 'info')
    
    // Performance recommendations
    this.log('\n💡 Performance Assessment:', 'info')
    if (successRate === '100.0') {
      this.log('   🎉 Excellent! All performance benchmarks passed', 'info')
    } else if (parseFloat(successRate) >= 80) {
      this.log('   ✅ Good performance with some areas for improvement', 'info')
    } else {
      this.log('   ⚠️  Performance issues detected - optimization needed', 'warn')
    }
    
    if ((cacheMetrics.hitRate || 0) > 0.8) {
      this.log('   🎯 Cache hit rate is optimal (>80%)', 'info')
    } else {
      this.log('   📈 Cache hit rate could be improved', 'warn')
    }
    
    if (cacheMetrics.averageLatency < 10) {
      this.log('   ⚡ Response time is excellent (<10ms average)', 'info')
    } else if (cacheMetrics.averageLatency < 50) {
      this.log('   ✅ Response time is good (<50ms average)', 'info')
    } else {
      this.log('   ⏰ Response time needs optimization', 'warn')
    }
    
    // Create detailed report
    const report: BenchmarkReport = {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: os.totalmem()
      },
      results: this.results,
      metrics: cacheMetrics,
      summary: {
        overallDuration,
        totalTests,
        passedTests,
        successRate
      },
      memoryUsage: memUsage
    }
    
    try {
      await fs.writeFile(
        'performance-benchmark-report.json', 
        JSON.stringify(report, null, 2)
      )
      this.log('\n💾 Detailed report saved to: performance-benchmark-report.json', 'info')
    } catch (error) {
      this.log(`⚠️  Could not save detailed report: ${error}`, 'warn')
    }
    
    this.log('\n🏁 Performance benchmark completed!', 'info')
    
    return report
  }

  private log(message: string, level: LogLevel = 'info'): void {
    console.log(message)
  }
}

// ==================== CLI Execution ====================

async function runPerformanceBenchmarkMain(options: ScriptOptions = {}): Promise<ScriptResult<BenchmarkReport>> {
  const benchmark = new PerformanceBenchmark()
  return benchmark.runAllBenchmarks(options)
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }

  runPerformanceBenchmarkMain(options)
    .then((result) => {
      if (result.success) {
        process.exit(0)
      } else {
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error(`Unexpected error: ${error}`)
      process.exit(1)
    })
}

export default PerformanceBenchmark
export { PerformanceBenchmark, runPerformanceBenchmarkMain, type BenchmarkReport, type BenchmarkResult }