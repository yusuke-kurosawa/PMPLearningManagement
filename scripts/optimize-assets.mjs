#!/usr/bin/env node

/**
 * アセット最適化スクリプト
 * 画像、フォント、その他のアセットを最適化
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const execAsync = promisify(exec)

const ASSET_DIR = path.join(__dirname, '..', 'public')
const DIST_DIR = path.join(__dirname, '..', 'dist')

/**
 * 画像最適化設定
 */
const IMAGE_OPTIMIZATION_CONFIG = {
  jpg: {
    quality: 85,
    progressive: true,
  },
  png: {
    quality: 90,
    compressionLevel: 9,
  },
  webp: {
    quality: 85,
    method: 6,
  },
  svg: {
    multipass: true,
    js2svg: {
      indent: 0,
      pretty: false,
    },
  },
}

/**
 * ファイルサイズを取得
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath)
  return stats.size
}

/**
 * ファイルサイズをフォーマット
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/**
 * 画像ファイルを最適化
 */
async function optimizeImages() {
  console.log('🖼️  Optimizing images...')
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']
  const images = []
  
  // 画像ファイルを探す
  function findImages(dir) {
    if (!fs.existsSync(dir)) return
    
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        findImages(filePath)
      } else if (imageExtensions.includes(path.extname(file).toLowerCase())) {
        images.push(filePath)
      }
    }
  }
  
  findImages(ASSET_DIR)
  if (fs.existsSync(DIST_DIR)) {
    findImages(DIST_DIR)
  }
  
  let totalSaved = 0
  
  for (const imagePath of images) {
    const originalSize = getFileSize(imagePath)
    const ext = path.extname(imagePath).toLowerCase()
    
    try {
      // SVG最適化
      if (ext === '.svg') {
        // SVGOがインストールされているか確認
        try {
          await execAsync('which svgo')
          await execAsync(`svgo -i "${imagePath}" -o "${imagePath}" --config='{"plugins":[{"name":"preset-default","params":{"overrides":{"removeViewBox":false}}}]}'`)
        } catch {
          console.log('  ⚠️  SVGO not installed, skipping SVG optimization')
        }
      }
      
      // JPEG/PNG最適化（ImageMagickを使用）
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        try {
          await execAsync('which convert')
          
          if (ext === '.jpg' || ext === '.jpeg') {
            await execAsync(`convert "${imagePath}" -quality ${IMAGE_OPTIMIZATION_CONFIG.jpg.quality} -interlace Plane "${imagePath}"`)
          } else if (ext === '.png') {
            await execAsync(`convert "${imagePath}" -quality ${IMAGE_OPTIMIZATION_CONFIG.png.quality} -strip "${imagePath}"`)
          }
        } catch {
          console.log('  ⚠️  ImageMagick not installed, skipping raster image optimization')
        }
      }
      
      const newSize = getFileSize(imagePath)
      const saved = originalSize - newSize
      
      if (saved > 0) {
        totalSaved += saved
        console.log(`  ✅ ${path.basename(imagePath)}: ${formatSize(originalSize)} → ${formatSize(newSize)} (saved ${formatSize(saved)})`)
      }
    } catch (error) {
      console.error(`  ❌ Failed to optimize ${path.basename(imagePath)}: ${error.message}`)
    }
  }
  
  if (totalSaved > 0) {
    console.log(`  💾 Total saved: ${formatSize(totalSaved)}`)
  }
}

/**
 * JavaScriptバンドルを分析
 */
async function analyzeBundles() {
  console.log('\n📦 Analyzing JavaScript bundles...')
  
  if (!fs.existsSync(DIST_DIR)) {
    console.log('  ⚠️  Build directory not found. Run "npm run build" first.')
    return
  }
  
  const jsFiles = fs.readdirSync(path.join(DIST_DIR, 'assets'))
    .filter(file => file.endsWith('.js'))
    .map(file => ({
      name: file,
      path: path.join(DIST_DIR, 'assets', file),
      size: getFileSize(path.join(DIST_DIR, 'assets', file))
    }))
    .sort((a, b) => b.size - a.size)
  
  console.log('\n  Top 10 largest bundles:')
  jsFiles.slice(0, 10).forEach(file => {
    console.log(`    ${file.name}: ${formatSize(file.size)}`)
  })
  
  const totalSize = jsFiles.reduce((sum, file) => sum + file.size, 0)
  console.log(`\n  Total JS size: ${formatSize(totalSize)}`)
  
  // 大きすぎるバンドルに警告
  const largeFiles = jsFiles.filter(file => file.size > 500 * 1024) // 500KB以上
  if (largeFiles.length > 0) {
    console.log('\n  ⚠️  Large bundles detected (>500KB):')
    largeFiles.forEach(file => {
      console.log(`    - ${file.name}: ${formatSize(file.size)}`)
    })
  }
}

/**
 * CSSを最適化
 */
async function optimizeCSS() {
  console.log('\n🎨 Optimizing CSS...')
  
  if (!fs.existsSync(DIST_DIR)) {
    console.log('  ⚠️  Build directory not found.')
    return
  }
  
  const cssFiles = fs.readdirSync(path.join(DIST_DIR, 'assets'))
    .filter(file => file.endsWith('.css'))
    .map(file => path.join(DIST_DIR, 'assets', file))
  
  let totalSaved = 0
  
  for (const cssPath of cssFiles) {
    const originalSize = getFileSize(cssPath)
    const originalContent = fs.readFileSync(cssPath, 'utf8')
    
    // 簡単なCSS最適化
    let optimized = originalContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // コメント削除
      .replace(/\s+/g, ' ') // 複数の空白を1つに
      .replace(/:\s+/g, ':') // コロン後の空白削除
      .replace(/;\s+/g, ';') // セミコロン後の空白削除
      .replace(/\s*{\s*/g, '{') // 中括弧周りの空白削除
      .replace(/\s*}\s*/g, '}')
      .replace(/;\}/g, '}') // 最後のセミコロン削除
    
    fs.writeFileSync(cssPath, optimized)
    
    const newSize = getFileSize(cssPath)
    const saved = originalSize - newSize
    
    if (saved > 0) {
      totalSaved += saved
      console.log(`  ✅ ${path.basename(cssPath)}: ${formatSize(originalSize)} → ${formatSize(newSize)}`)
    }
  }
  
  if (totalSaved > 0) {
    console.log(`  💾 Total saved: ${formatSize(totalSaved)}`)
  }
}

/**
 * HTMLを最適化
 */
async function optimizeHTML() {
  console.log('\n📄 Optimizing HTML...')
  
  const htmlPath = path.join(DIST_DIR, 'index.html')
  
  if (!fs.existsSync(htmlPath)) {
    console.log('  ⚠️  index.html not found in dist directory.')
    return
  }
  
  const originalSize = getFileSize(htmlPath)
  let html = fs.readFileSync(htmlPath, 'utf8')
  
  // Preload critical resources
  const preloads = [
    '<link rel="preload" href="/PMPLearningManagement/assets/index.css" as="style">',
    '<link rel="preload" href="/PMPLearningManagement/assets/vendor.js" as="script">',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="dns-prefetch" href="https://www.google-analytics.com">',
  ]
  
  // Add preloads to head
  html = html.replace('</head>', `${preloads.join('\n  ')}\n  </head>`)
  
  // Minify HTML
  html = html
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/>\s+</g, '><') // Remove spaces between tags
    .trim()
  
  fs.writeFileSync(htmlPath, html)
  
  const newSize = getFileSize(htmlPath)
  const saved = originalSize - newSize
  
  if (saved > 0) {
    console.log(`  ✅ index.html: ${formatSize(originalSize)} → ${formatSize(newSize)}`)
  }
}

/**
 * 最適化レポートを生成
 */
async function generateReport() {
  console.log('\n📊 Generating optimization report...')
  
  const report = {
    timestamp: new Date().toISOString(),
    bundles: [],
    images: [],
    css: [],
    recommendations: []
  }
  
  // バンドル情報
  if (fs.existsSync(DIST_DIR)) {
    const jsFiles = fs.readdirSync(path.join(DIST_DIR, 'assets'))
      .filter(file => file.endsWith('.js'))
    
    report.bundles = jsFiles.map(file => ({
      name: file,
      size: getFileSize(path.join(DIST_DIR, 'assets', file))
    }))
  }
  
  // 推奨事項
  const totalBundleSize = report.bundles.reduce((sum, b) => sum + b.size, 0)
  
  if (totalBundleSize > 2 * 1024 * 1024) {
    report.recommendations.push('⚠️ Total bundle size exceeds 2MB. Consider code splitting.')
  }
  
  const largeBundle = report.bundles.find(b => b.size > 500 * 1024)
  if (largeBundle) {
    report.recommendations.push(`⚠️ ${largeBundle.name} is larger than 500KB. Consider splitting this bundle.`)
  }
  
  // レポート保存
  const reportPath = path.join(__dirname, '..', 'optimization-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`  ✅ Report saved to: ${reportPath}`)
  
  if (report.recommendations.length > 0) {
    console.log('\n  📝 Recommendations:')
    report.recommendations.forEach(rec => console.log(`    ${rec}`))
  }
}

/**
 * メイン実行
 */
async function main() {
  console.log('🚀 Starting asset optimization...\n')
  
  try {
    await optimizeImages()
    await analyzeBundles()
    await optimizeCSS()
    await optimizeHTML()
    await generateReport()
    
    console.log('\n✅ Optimization complete!')
  } catch (error) {
    console.error('\n❌ Optimization failed:', error)
    process.exit(1)
  }
}

// 実行
main()