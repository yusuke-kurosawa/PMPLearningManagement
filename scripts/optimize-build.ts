#!/usr/bin/env node
/**
 * Post-Build Optimization Script for GitHub Pages PWA Deployment
 * TypeScript version with enhanced type safety and error handling
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import type {
  CLIConfig,
  Logger,
  LogLevel,
  ExitCode,
  CLIException
} from '../src/types/scripts/node-cli.js'
import type {
  OptimizationConfig,
  OptimizationResult,
  BuildPerformanceMetrics
} from '../src/types/scripts/build-analysis.js'

// ==================== Configuration ====================

interface PWADeploymentConfig {
  distDir: string
  basePath: string
  requiredFiles: string[]
  securityHeaders: SecurityHeaders
  optimization: OptimizationConfig
}

interface SecurityHeaders {
  csp: string
  xFrame: string
  xContentType: string
  referrer: string
  permissions: string
}

interface DeploymentReport {
  timestamp: string
  buildPath: string
  baseUrl: string
  pwaAssets: PWAAssetStatus
  routing: RoutingStatus
  bundleSize?: BundleSizeInfo
  validation: ValidationResult[]
}

interface PWAAssetStatus {
  manifest: boolean
  serviceWorker: boolean
  offlinePage: boolean
  headers: boolean
}

interface RoutingStatus {
  spa404: boolean
  nojekyll: boolean
}

interface BundleSizeInfo {
  total: string
  details: string[]
}

interface ValidationResult {
  file: string
  exists: boolean
  status: 'Ready' | 'Missing'
}

// ==================== Constants ====================

const CONFIG: PWADeploymentConfig = {
  distDir: path.join(__dirname, '..', 'dist'),
  basePath: '/PMPLearningManagement/',
  requiredFiles: ['.nojekyll', '404.html', 'offline.html', '_headers', 'manifest.json'],
  optimization: {
    minification: true,
    compression: true,
    treeshaking: true,
    codeSplitting: true,
    imageOptimization: true,
    cssOptimization: true,
  },
  securityHeaders: {
    csp: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; manifest-src 'self'; worker-src 'self';",
    xFrame: 'DENY',
    xContentType: 'nosniff',
    referrer: 'strict-origin-when-cross-origin',
    permissions: 'camera=(), microphone=(), geolocation=()',
  },
}

// ==================== Utility Functions ====================

function log(message: string, level: LogLevel = 'info'): void {
  const emoji = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    fatal: '💀',
  }[level]
  
  console.log(`${emoji} ${message}`)
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Build directory not found: ${dirPath}. Run npm run build first.`)
  }
}

function createFile(filePath: string, content: string, description: string): void {
  try {
    fs.writeFileSync(filePath, content, 'utf8')
    log(`Created ${description}`, 'info')
  } catch (error) {
    log(`Failed to create ${description}: ${error}`, 'error')
    throw error
  }
}

// ==================== File Creation Functions ====================

function createNoJekyllFile(distDir: string): void {
  const filePath = path.join(distDir, '.nojekyll')
  createFile(filePath, '', '.nojekyll file')
}

function create404Html(distDir: string, basePath: string): void {
  const content = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>PMP Learning Management System</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="manifest" href="${basePath}manifest.json">
  <link rel="icon" href="${basePath}icon-192x192.png">
  <meta name="theme-color" content="#2563eb">
  <script>
    // GitHub Pages SPA routing redirect
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='${basePath}'" />
</head>
<body>
  <h1>Redirecting...</h1>
  <p>If you are not redirected, <a href="${basePath}">click here</a>.</p>
</body>
</html>`

  const filePath = path.join(distDir, '404.html')
  createFile(filePath, content, '404.html for SPA routing')
}

function createOfflineHtml(distDir: string, basePath: string): void {
  const content = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>オフライン - PMP Learning</title>
  <link rel="manifest" href="${basePath}manifest.json">
  <meta name="theme-color" content="#2563eb">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 400px;
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .icon { font-size: 4rem; margin-bottom: 20px; opacity: 0.8; }
    h1 { font-size: 2rem; margin-bottom: 20px; font-weight: 600; }
    p { margin: 15px 0; line-height: 1.6; opacity: 0.9; }
    .btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      margin-top: 20px;
      transition: all 0.3s ease;
    }
    .btn:hover {
      background: rgba(255,255,255,0.3);
      border-color: rgba(255,255,255,0.5);
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📚</div>
    <h1>オフライン状態です</h1>
    <p>インターネット接続を確認してから、もう一度お試しください。</p>
    <p>一部の機能はオフラインでも利用できます。</p>
    <button class="btn" onclick="handleRetry()">再試行</button>
  </div>
  <script>
    function handleRetry() {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        alert('まだオフライン状態です。インターネット接続を確認してください。');
      }
    }
    window.addEventListener('online', function() {
      window.location.reload();
    });
  </script>
</body>
</html>`

  const filePath = path.join(distDir, 'offline.html')
  createFile(filePath, content, 'offline.html page')
}

function createHeadersFile(distDir: string, headers: SecurityHeaders): void {
  const content = `# Enhanced Security Headers for PMP Learning Management System
/*
  # CSP for PWA applications
  Content-Security-Policy: ${headers.csp}
  
  # Security headers
  X-Frame-Options: ${headers.xFrame}
  X-Content-Type-Options: ${headers.xContentType}
  Referrer-Policy: ${headers.referrer}
  Permissions-Policy: ${headers.permissions}
  
  # PWA caching directives
  Cache-Control: public, max-age=31536000, immutable

# Service Worker - No caching for dynamic updates
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
  
# Manifest - Short caching for updates
/manifest.json
  Cache-Control: public, max-age=3600
  
# HTML files - No caching for dynamic content
/*.html
  Cache-Control: no-cache, no-store, must-revalidate
  
# API endpoints (if any)
/api/*
  Cache-Control: no-cache, no-store, must-revalidate`

  const filePath = path.join(distDir, '_headers')
  createFile(filePath, content, '_headers file for security')
}

function updateIndexHtml(distDir: string): void {
  const indexPath = path.join(distDir, 'index.html')
  
  if (!fs.existsSync(indexPath)) {
    log('index.html not found, skipping update', 'warn')
    return
  }

  try {
    let indexContent = fs.readFileSync(indexPath, 'utf8')

    const spaScript = `
  <script>
    // GitHub Pages SPA routing support
    (function(l) {
      if (l.search) {
        var q = {};
        l.search.slice(1).split('&').forEach(function(v) {
          var a = v.split('=');
          q[a[0]] = a.slice(1).join('=').replace(/~and~/g, '&');
        });
        if (q.p !== undefined) {
          window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + (q.p || '') +
            (q.q ? ('?' + q.q) : '') +
            l.hash
          );
        }
      }
    }(window.location))
    
    // Handle offline redirect from sessionStorage
    if (sessionStorage.redirect) {
      var redirect = sessionStorage.redirect;
      delete sessionStorage.redirect;
      history.replaceState(null, null, redirect);
    }
  </script>`

    indexContent = indexContent.replace('</head>', `${spaScript}\n</head>`)
    fs.writeFileSync(indexPath, indexContent, 'utf8')
    log('Updated index.html with SPA routing support', 'info')
  } catch (error) {
    log(`Failed to update index.html: ${error}`, 'error')
    throw error
  }
}

// ==================== Bundle Analysis ====================

function calculateBundleSize(distDir: string): BundleSizeInfo | undefined {
  try {
    const bundleStats = execSync('find dist -type f -name "*.js" -o -name "*.css" | xargs ls -la', {
      encoding: 'utf8',
      cwd: path.dirname(distDir),
    })
    
    const totalSize = execSync('du -sh dist/', { 
      encoding: 'utf8',
      cwd: path.dirname(distDir),
    }).trim()
    
    return {
      total: totalSize,
      details: bundleStats.split('\n').filter((line) => line.trim()),
    }
  } catch (error) {
    log('Could not calculate bundle size', 'warn')
    return undefined
  }
}

// ==================== Validation ====================

function validateDeployment(distDir: string, requiredFiles: string[]): ValidationResult[] {
  const results: ValidationResult[] = []
  
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(distDir, file))
    results.push({
      file,
      exists,
      status: exists ? 'Ready' : 'Missing',
    })
    
    const icon = exists ? '✅' : '❌'
    log(`${icon} ${file}: ${exists ? 'Ready' : 'Missing'}`, exists ? 'info' : 'error')
  }
  
  return results
}

// ==================== Report Generation ====================

function generateDeploymentReport(
  config: PWADeploymentConfig,
  bundleSize?: BundleSizeInfo,
  validation?: ValidationResult[]
): DeploymentReport {
  const report: DeploymentReport = {
    timestamp: new Date().toISOString(),
    buildPath: config.distDir,
    baseUrl: config.basePath,
    pwaAssets: {
      manifest: fs.existsSync(path.join(config.distDir, 'manifest.json')),
      serviceWorker: fs.existsSync(path.join(config.distDir, 'sw.js')),
      offlinePage: fs.existsSync(path.join(config.distDir, 'offline.html')),
      headers: fs.existsSync(path.join(config.distDir, '_headers')),
    },
    routing: {
      spa404: fs.existsSync(path.join(config.distDir, '404.html')),
      nojekyll: fs.existsSync(path.join(config.distDir, '.nojekyll')),
    },
    validation: validation || [],
  }

  if (bundleSize) {
    report.bundleSize = bundleSize
  }

  const reportPath = path.join(config.distDir, 'deployment-report.json')
  createFile(reportPath, JSON.stringify(report, null, 2), 'deployment report')
  
  return report
}

// ==================== Main Execution ====================

async function optimizeBuild(options: ScriptOptions = {}): Promise<ScriptResult<DeploymentReport>> {
  const startTime = Date.now()
  
  try {
    log('🚀 Starting GitHub Pages PWA deployment optimization...', 'info')
    
    // 1. Validate environment
    ensureDirectoryExists(CONFIG.distDir)
    
    if (options.dryRun) {
      log('DRY RUN MODE: Would perform optimization but no files will be modified', 'warn')
      return {
        success: true,
        data: {} as DeploymentReport,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
    
    // 2. Create required files
    createNoJekyllFile(CONFIG.distDir)
    create404Html(CONFIG.distDir, CONFIG.basePath)
    createOfflineHtml(CONFIG.distDir, CONFIG.basePath)
    createHeadersFile(CONFIG.distDir, CONFIG.securityHeaders)
    
    // 3. Update existing files
    updateIndexHtml(CONFIG.distDir)
    
    // 4. Analyze bundle
    const bundleSize = calculateBundleSize(CONFIG.distDir)
    
    // 5. Validate deployment
    log('\n📊 Deployment Validation:', 'info')
    const validation = validateDeployment(CONFIG.distDir, CONFIG.requiredFiles)
    
    // 6. Generate report
    const report = generateDeploymentReport(CONFIG, bundleSize, validation)
    
    // 7. Final output
    log('\n🎉 GitHub Pages PWA deployment optimization complete!', 'info')
    log(`📦 Total build size: ${bundleSize?.total || 'Unknown'}`, 'info')
    log(`🌐 Base URL: ${CONFIG.basePath}`, 'info')
    log('🚀 Ready for GitHub Pages deployment!', 'info')
    
    return {
      success: true,
      data: report,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log(`Failed to optimize build: ${errorMessage}`, 'error')
    
    return {
      success: false,
      error: errorMessage,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    }
  }
}

// ==================== CLI Execution ====================

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }
  
  optimizeBuild(options)
    .then((result) => {
      if (result.success) {
        process.exit(0)
      } else {
        process.exit(1)
      }
    })
    .catch((error) => {
      log(`Unexpected error: ${error}`, 'error')
      process.exit(1)
    })
}

export default optimizeBuild
export { optimizeBuild, type PWADeploymentConfig, type DeploymentReport }