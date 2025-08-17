#!/usr/bin/env node

/**
 * パフォーマンスチェックスクリプト（簡易版）
 * ビルド後のパフォーマンス指標を確認
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIST_DIR = path.join(__dirname, '..', 'dist')
const ASSETS_DIR = path.join(DIST_DIR, 'assets')

// パフォーマンス基準値
const THRESHOLDS = {
  totalBundleSize: 2 * 1024 * 1024, // 2MB
  mainBundleSize: 200 * 1024, // 200KB
  vendorBundleSize: 300 * 1024, // 300KB
  chunkSize: 100 * 1024, // 100KB
  cssSize: 100 * 1024, // 100KB
}

/**
 * ファイルサイズ取得
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch {
    return 0
  }
}

/**
 * サイズフォーマット
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/**
 * バンドルサイズ分析
 */
function analyzeBundleSize() {
  console.log('\n📦 Bundle Size Analysis\n')
  
  if (!fs.existsSync(ASSETS_DIR)) {
    console.log('  ❌ Build directory not found. Run "npm run build" first.')
    return
  }
  
  const files = fs.readdirSync(ASSETS_DIR)
  const jsFiles = files.filter(f => f.endsWith('.js'))
  const cssFiles = files.filter(f => f.endsWith('.css'))
  
  let totalJsSize = 0
  let mainBundleSize = 0
  let vendorBundleSize = 0
  const chunks = []
  
  // JSファイル分析
  jsFiles.forEach(file => {
    const size = getFileSize(path.join(ASSETS_DIR, file))
    totalJsSize += size
    
    if (file.includes('index')) {
      mainBundleSize = size
    } else if (file.includes('vendor')) {
      vendorBundleSize = size
    } else {
      chunks.push({ name: file, size })
    }
  })
  
  // CSSファイル分析
  let totalCssSize = 0
  cssFiles.forEach(file => {
    totalCssSize += getFileSize(path.join(ASSETS_DIR, file))
  })
  
  // 結果表示
  console.log(`  Total JS Size: ${formatSize(totalJsSize)} ${totalJsSize > THRESHOLDS.totalBundleSize ? '⚠️' : '✅'}`)
  console.log(`  Main Bundle: ${formatSize(mainBundleSize)} ${mainBundleSize > THRESHOLDS.mainBundleSize ? '⚠️' : '✅'}`)
  console.log(`  Vendor Bundle: ${formatSize(vendorBundleSize)} ${vendorBundleSize > THRESHOLDS.vendorBundleSize ? '⚠️' : '✅'}`)
  console.log(`  Total CSS: ${formatSize(totalCssSize)} ${totalCssSize > THRESHOLDS.cssSize ? '⚠️' : '✅'}`)
  
  if (chunks.length > 0) {
    console.log('\n  Code Split Chunks:')
    chunks.sort((a, b) => b.size - a.size).slice(0, 5).forEach(chunk => {
      console.log(`    - ${chunk.name}: ${formatSize(chunk.size)}`)
    })
  }
  
  return {
    totalJsSize,
    mainBundleSize,
    vendorBundleSize,
    totalCssSize,
    chunks: chunks.length,
  }
}

/**
 * 総合レポート生成
 */
function generateReport(results) {
  console.log('\n📊 Performance Report\n')
  
  // 最適化の推奨事項
  console.log('💡 Recommendations:\n')
  
  if (results.totalJsSize > THRESHOLDS.totalBundleSize) {
    console.log('  • Reduce bundle size through code splitting and tree shaking')
  }
  
  if (results.mainBundleSize > THRESHOLDS.mainBundleSize) {
    console.log('  • Main bundle is too large. Consider more lazy loading')
  }
  
  if (results.vendorBundleSize > THRESHOLDS.vendorBundleSize) {
    console.log('  • Vendor bundle is too large. Review dependencies')
  }
  
  // JSONレポート保存
  const report = {
    timestamp: new Date().toISOString(),
    results,
  }
  
  const reportPath = path.join(__dirname, '..', 'performance-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`\n  Report saved to: ${reportPath}`)
}

/**
 * メイン実行
 */
function main() {
  console.log('\n🚀 Performance Check\n')
  console.log('='.repeat(50))
  
  const results = analyzeBundleSize()
  
  if (results) {
    generateReport(results)
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('\n✅ Performance check complete!\n')
}

// 実行
main()