#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const DIST_DIR = path.join(__dirname, '..', 'dist/assets')

const LIMITS = {
  'index-*.js': 280 * 1024, // 280KB
  'vendor-*.js': 170 * 1024, // 170KB
  'ui-*.js': 180 * 1024, // 180KB
  'd3-*.js': 100 * 1024, // 100KB
  '*.css': 50 * 1024, // 50KB
}

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(1) + 'KB'
}

function getGzipSize(filePath) {
  try {
    const gzipOutput = execSync(`gzip -c "${filePath}" | wc -c`, { encoding: 'utf8' })
    return parseInt(gzipOutput.trim())
  } catch (error) {
    return fs.statSync(filePath).size
  }
}

function matchesPattern(filename, pattern) {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  return regex.test(filename)
}

console.log('📊 Bundle Size Analysis')
console.log('========================\n')

if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Build directory not found. Run npm run build first.')
  process.exit(1)
}

const files = fs.readdirSync(DIST_DIR)
let allPassed = true

for (const [pattern, limit] of Object.entries(LIMITS)) {
  const matchingFiles = files.filter((file) => matchesPattern(file, pattern))

  if (matchingFiles.length === 0) {
    console.log(`⚠️  No files found matching pattern: ${pattern}`)
    continue
  }

  for (const file of matchingFiles) {
    const filePath = path.join(DIST_DIR, file)
    const gzipSize = getGzipSize(filePath)
    const rawSize = fs.statSync(filePath).size

    const passed = gzipSize <= limit
    const status = passed ? '✅' : '❌'

    console.log(`${status} ${file}`)
    console.log(
      `   Raw: ${formatBytes(rawSize)} | Gzipped: ${formatBytes(gzipSize)} | Limit: ${formatBytes(limit)}`
    )

    if (!passed) {
      allPassed = false
      const overage = (((gzipSize - limit) / limit) * 100).toFixed(1)
      console.log(`   ⚠️  Exceeds limit by ${overage}%`)
    }
    console.log()
  }
}

console.log('========================')
if (allPassed) {
  console.log('✅ All bundle sizes are within limits!')
  process.exit(0)
} else {
  console.log('❌ Some bundles exceed size limits!')
  process.exit(1)
}
