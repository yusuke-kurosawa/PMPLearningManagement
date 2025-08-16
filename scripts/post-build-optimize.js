#!/usr/bin/env node

/**
 * Post-Build Optimization Script
 * GitHub Pages and PWA preparation
 * 
 * This script prepares the build output for GitHub Pages deployment
 * and ensures PWA assets are properly configured.
 */

const fs = require('fs')
const path = require('path')

const DIST_DIR = path.join(process.cwd(), 'dist')

function createFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✅ Created: ${path.relative(process.cwd(), filePath)}`)
  } catch (error) {
    console.error(`❌ Failed to create ${filePath}:`, error.message)
  }
}

function copyFile(src, dest) {
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
      console.log(`✅ Copied: ${path.relative(process.cwd(), dest)}`)
    }
  } catch (error) {
    console.error(`❌ Failed to copy ${src}:`, error.message)
  }
}

function optimizeBuild() {
  console.log('🚀 Starting post-build optimization...')

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Build directory not found:', DIST_DIR)
    process.exit(1)
  }

  // 1. Create .nojekyll for GitHub Pages
  createFile(path.join(DIST_DIR, '.nojekyll'), '')

  // 2. Create 404.html for SPA routing
  const indexPath = path.join(DIST_DIR, 'index.html')
  const notFoundPath = path.join(DIST_DIR, '404.html')
  
  if (fs.existsSync(indexPath)) {
    copyFile(indexPath, notFoundPath)
  }

  // 3. Create offline.html for PWA fallback
  const offlineHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>オフライン - PMP Learning Management</title>
  <style>
    body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
    .offline-container { max-width: 500px; margin: 0 auto; }
    .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="offline-icon">📵</div>
    <h1>オフラインです</h1>
    <p>インターネット接続を確認してもう一度お試しください。</p>
    <button onclick="window.location.reload()">再試行</button>
  </div>
</body>
</html>`
  
  createFile(path.join(DIST_DIR, 'offline.html'), offlineHtml)

  // 4. Create _headers for security (if not exists)
  const headersPath = path.join(DIST_DIR, '_headers')
  if (!fs.existsSync(headersPath)) {
    const securityHeaders = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Cache-Control: public, max-age=31536000, immutable`
    
    createFile(headersPath, securityHeaders)
  }

  // 5. Create deployment report
  const deploymentReport = {
    timestamp: new Date().toISOString(),
    buildTime: new Date().toISOString(),
    bundleSize: getBundleSize(),
    optimizations: [
      'SPA routing configured',
      'PWA offline fallback created',
      'Security headers added',
      'Jekyll disabled for GitHub Pages'
    ]
  }
  
  createFile(
    path.join(DIST_DIR, 'deployment-report.json'),
    JSON.stringify(deploymentReport, null, 2)
  )

  console.log('✅ Post-build optimization completed successfully!')
}

function getBundleSize() {
  try {
    const stats = fs.statSync(DIST_DIR)
    return `${(getDirectorySize(DIST_DIR) / 1024 / 1024).toFixed(2)} MB`
  } catch {
    return 'Unknown'
  }
}

function getDirectorySize(dir) {
  let size = 0
  try {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath)
      } else {
        size += stats.size
      }
    }
  } catch {
    // Ignore errors
  }
  return size
}

if (require.main === module) {
  optimizeBuild()
}

module.exports = { optimizeBuild }