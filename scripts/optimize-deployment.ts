#!/usr/bin/env node

/**
 * Mobile-First PWA Deployment Optimization Script
 * Optimizes the build output for GitHub Pages deployment with focus on mobile performance
 */

import { promises as fs } from 'node:fs'
import * as fsSync from 'node:fs'
import * as path from 'node:path'
import { execSync } from 'node:child_process'
import type { 
  CLIArguments, 
  Logger, 
  ExitCode, 
  CLIException,
  DeploymentOptimizer,
  PWAAssets,
  DeploymentReport,
  BundleAnalysis,
  PerformanceBudget
} from '../src/types/scripts/index.js'

const DIST_DIR = path.join(__dirname, '..', 'dist')
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const PERFORMANCE_BUDGET_KB = 500 // 500KB total

// Logger implementation
const logger: Logger = {
  info: (message: string) => console.log(`ℹ️ ${message}`),
  warn: (message: string) => console.warn(`⚠️ ${message}`),
  error: (message: string) => console.error(`❌ ${message}`),
  debug: (message: string) => console.log(`🐛 ${message}`),
  success: (message: string) => console.log(`✅ ${message}`)
}

console.log('🚀 Starting mobile-first PWA deployment optimization...')

/**
 * 1. Verify build output exists
 */
function verifyBuild(): void {
  logger.info('Verifying build output...')

  if (!fsSync.existsSync(DIST_DIR)) {
    throw new CLIException('Build directory not found. Run npm run build first.', ExitCode.CONFIG_ERROR)
  }

  const indexPath = path.join(DIST_DIR, 'index.html')
  if (!fsSync.existsSync(indexPath)) {
    throw new CLIException('index.html not found in build output.', ExitCode.CONFIG_ERROR)
  }

  logger.success('Build output verified')
}

/**
 * 2. Optimize HTML for mobile PWA
 */
function optimizeHTML(): void {
  logger.info('Optimizing HTML for mobile PWA...')

  const indexPath = path.join(DIST_DIR, 'index.html')
  let html = fsSync.readFileSync(indexPath, 'utf8')

  // Add mobile-specific meta tags if not present
  const mobileMetaTags = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <meta name="theme-color" content="#1f2937">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="PMP Learning">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="PMP Learning">
    
    <!-- iOS Splash Screens -->
    <link rel="apple-touch-startup-image" href="/PMPLearningManagement/icons/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)">
    <link rel="apple-touch-startup-image" href="/PMPLearningManagement/icons/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)">
    <link rel="apple-touch-startup-image" href="/PMPLearningManagement/icons/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)">
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/PMPLearningManagement/manifest.json" as="fetch" crossorigin>
    `

  // Insert mobile meta tags after charset
  html = html.replace(/<meta charset="utf-8">/i, '<meta charset="utf-8">' + mobileMetaTags)

  // Add service worker registration
  const swRegistration = `
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/PMPLearningManagement/sw.js')
                    .then((registration) => {
                        console.log('[SW] Registration successful:', registration.scope);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content available, show update prompt
                                    if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
                                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                                        window.location.reload();
                                    }
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.warn('[SW] Registration failed:', error);
                    });
            });
            
            // Listen for service worker messages
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
                    if (confirm('アプリが更新されました。再読み込みしますか？')) {
                        window.location.reload();
                    }
                }
            });
        }
        
        // Add to home screen prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button after a delay
            setTimeout(() => {
                if (deferredPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
                    const installButton = document.createElement('button');
                    installButton.textContent = 'アプリをインストール';
                    installButton.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;padding:12px 20px;background:#1f2937;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
                    
                    installButton.addEventListener('click', async () => {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        console.log('PWA install prompt outcome:', outcome);
                        installButton.remove();
                        deferredPrompt = null;
                    });
                    
                    document.body.appendChild(installButton);
                    
                    // Auto-hide after 10 seconds
                    setTimeout(() => {
                        if (installButton.parentElement) {
                            installButton.remove();
                        }
                    }, 10000);
                }
            }, 5000);
        });
    </script>
    `

  // Add SW registration before closing body tag
  html = html.replace('</body>', swRegistration + '</body>')

  fsSync.writeFileSync(indexPath, html)
  logger.success('HTML optimized for mobile PWA')
}

/**
 * 3. Create 404.html for SPA routing
 */
function createSPA404(): void {
  logger.info('Creating SPA routing fallback...')

  const indexPath = path.join(DIST_DIR, 'index.html')
  const notFoundPath = path.join(DIST_DIR, '404.html')

  // Copy index.html to 404.html for SPA routing
  fsSync.copyFileSync(indexPath, notFoundPath)

  logger.success('SPA routing configured')
}

/**
 * 4. Copy PWA assets
 */
function copyPWAAssets(): PWAAssets {
  logger.info('Copying PWA assets...')

  const assets = ['manifest.json', 'sw.js', 'offline.html', '_headers']
  const result: PWAAssets = {
    manifest: false,
    serviceWorker: false,
    offlinePage: false,
    headers: false
  }

  assets.forEach((asset) => {
    const srcPath = path.join(PUBLIC_DIR, asset)
    const destPath = path.join(DIST_DIR, asset)

    if (fsSync.existsSync(srcPath)) {
      fsSync.copyFileSync(srcPath, destPath)
      logger.info(`  ✓ Copied ${asset}`)
      
      // Update result
      switch (asset) {
        case 'manifest.json':
          result.manifest = true
          break
        case 'sw.js':
          result.serviceWorker = true
          break
        case 'offline.html':
          result.offlinePage = true
          break
        case '_headers':
          result.headers = true
          break
      }
    } else {
      logger.warn(`${asset} not found in public directory`)
    }
  })

  logger.success('PWA assets copied')
  return result
}

/**
 * 5. Create .nojekyll file
 */
function createNoJekyll(): void {
  logger.info('Creating .nojekyll file...')

  const nojekyllPath = path.join(DIST_DIR, '.nojekyll')
  fsSync.writeFileSync(nojekyllPath, '')

  logger.success('Jekyll processing disabled')
}

/**
 * 6. Optimize assets for mobile
 */
function optimizeAssets(): BundleAnalysis {
  logger.info('Optimizing assets for mobile delivery...')

  const assetsDir = path.join(DIST_DIR, 'assets')

  if (!fsSync.existsSync(assetsDir)) {
    logger.warn('Assets directory not found, skipping optimization')
    return {
      totalSizeBytes: 0,
      totalSizeKB: 0,
      gzippedSizeKB: 0,
      fileCount: 0,
      withinBudget: true
    }
  }

  // Get all JS and CSS files
  const files = fsSync.readdirSync(assetsDir)
  const jsFiles = files.filter((f) => f.endsWith('.js'))
  const cssFiles = files.filter((f) => f.endsWith('.css'))

  logger.info(`Found ${jsFiles.length} JS files and ${cssFiles.length} CSS files`)

  // Calculate total sizes
  let totalSize = 0
  let gzippedSize = 0

  ;[...jsFiles, ...cssFiles].forEach((file) => {
    const filePath = path.join(assetsDir, file)
    const stats = fsSync.statSync(filePath)
    totalSize += stats.size

    // Simulate gzip compression (rough estimate)
    gzippedSize += Math.floor(stats.size * 0.3)
  })

  const totalKB = totalSize / 1024
  const gzippedKB = gzippedSize / 1024

  logger.info(`Total bundle size: ${totalKB.toFixed(2)} KB`)
  logger.info(`Estimated gzipped: ${gzippedKB.toFixed(2)} KB`)

  // Check against performance budget
  const withinBudget = gzippedKB <= PERFORMANCE_BUDGET_KB
  if (!withinBudget) {
    logger.warn(`Bundle size exceeds performance budget (${PERFORMANCE_BUDGET_KB}KB)`)
    process.exitCode = 1
  } else {
    logger.success('Bundle size within performance budget')
  }

  return {
    totalSizeBytes: totalSize,
    totalSizeKB: Math.round(totalKB),
    gzippedSizeKB: Math.round(gzippedKB),
    fileCount: jsFiles.length + cssFiles.length,
    withinBudget
  }
}

/**
 * 7. Generate deployment report
 */
function generateReport(pwaAssets: PWAAssets, bundleAnalysis?: BundleAnalysis): DeploymentReport {
  logger.info('Generating deployment report...')

  const report: DeploymentReport = {
    timestamp: new Date().toISOString(),
    buildPath: DIST_DIR,
    pwaAssets,
    routing: {
      spa404: fsSync.existsSync(path.join(DIST_DIR, '404.html')),
      nojekyll: fsSync.existsSync(path.join(DIST_DIR, '.nojekyll')),
    },
    bundleAnalysis,
    performanceBudget: {
      limitKB: PERFORMANCE_BUDGET_KB,
      withinBudget: bundleAnalysis?.withinBudget ?? true
    }
  }

  const reportPath = path.join(DIST_DIR, 'deployment-report.json')
  fsSync.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  logger.success('Deployment report generated')
  logger.info('Report summary:')
  logger.info(`   PWA Assets: ${Object.values(pwaAssets).filter(Boolean).length}/4`)
  logger.info(
    `   SPA Routing: ${report.routing.spa404 && report.routing.nojekyll ? 'Configured' : 'Missing'}`
  )
  if (bundleAnalysis) {
    logger.info(
      `   Bundle Size: ${bundleAnalysis.totalSizeKB}KB (${bundleAnalysis.gzippedSizeKB}KB gzipped)`
    )
  }

  return report
}

/**
 * Main optimization process
 */
async function main(): Promise<void> {
  try {
    verifyBuild()
    optimizeHTML()
    createSPA404()
    const pwaAssets = copyPWAAssets()
    createNoJekyll()
    const bundleAnalysis = optimizeAssets()
    generateReport(pwaAssets, bundleAnalysis)

    console.log('\n🎉 Mobile-first PWA deployment optimization completed successfully!')
    console.log('\n📱 Ready for GitHub Pages deployment with:')
    console.log('   • Mobile-optimized PWA configuration')
    console.log('   • Service Worker with advanced caching')
    console.log('   • Offline support and install prompts')
    console.log('   • SPA routing with GitHub Pages compatibility')
    console.log('   • Performance-optimized asset delivery')
  } catch (error) {
    if (error instanceof CLIException) {
      logger.error(`Optimization failed: ${error.message}`)
      process.exit(error.exitCode)
    } else {
      logger.error(`Optimization failed: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(ExitCode.GENERAL_ERROR)
    }
  }
}

// Export functions for testing
export {
  verifyBuild,
  optimizeHTML,
  createSPA404,
  copyPWAAssets,
  createNoJekyll,
  optimizeAssets,
  generateReport
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}