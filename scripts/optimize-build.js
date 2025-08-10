#!/usr/bin/env node
/**
 * Post-Build Optimization Script for GitHub Pages PWA Deployment
 * Optimizes the built application for GitHub Pages deployment with PWA features
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const DIST_DIR = path.join(__dirname, '..', 'dist')
const GITHUB_PAGES_BASE = '/PMPLearningManagement/'

console.log('🚀 Starting GitHub Pages PWA deployment optimization...')

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Build directory not found. Run npm run build first.')
  process.exit(1)
}

// 1. Create .nojekyll file to disable Jekyll processing
const nojekyllPath = path.join(DIST_DIR, '.nojekyll')
fs.writeFileSync(nojekyllPath, '')
console.log('✅ Created .nojekyll file')

// 2. Create 404.html for SPA routing support
const html404Content = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>PMP Learning Management System</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="manifest" href="${GITHUB_PAGES_BASE}manifest.json">
  <link rel="icon" href="${GITHUB_PAGES_BASE}icon-192x192.png">
  <meta name="theme-color" content="#2563eb">
  <script>
    // GitHub Pages SPA routing redirect
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='${GITHUB_PAGES_BASE}'" />
</head>
<body>
  <h1>Redirecting...</h1>
  <p>If you are not redirected, <a href="${GITHUB_PAGES_BASE}">click here</a>.</p>
</body>
</html>`

fs.writeFileSync(path.join(DIST_DIR, '404.html'), html404Content)
console.log('✅ Created 404.html for SPA routing')

// 3. Create offline.html page
const offlinePageContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>オフライン - PMP Learning</title>
  <link rel="manifest" href="${GITHUB_PAGES_BASE}manifest.json">
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

fs.writeFileSync(path.join(DIST_DIR, 'offline.html'), offlinePageContent)
console.log('✅ Created offline.html page')

// 4. Create _headers file for enhanced security
const headersContent = `# Enhanced Security Headers for PMP Learning Management System
/*
  # CSP for PWA applications
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; manifest-src 'self'; worker-src 'self';
  
  # Security headers
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  
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

fs.writeFileSync(path.join(DIST_DIR, '_headers'), headersContent)
console.log('✅ Created _headers file for security')

// 5. Update index.html with proper GitHub Pages base path handling
const indexPath = path.join(DIST_DIR, 'index.html')
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8')

  // Inject GitHub Pages SPA routing script
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

  // Insert the script before closing head tag
  indexContent = indexContent.replace('</head>', `${spaScript}\n</head>`)

  fs.writeFileSync(indexPath, indexContent)
  console.log('✅ Updated index.html with SPA routing support')
}

// 6. Generate deployment report
const deploymentReport = {
  timestamp: new Date().toISOString(),
  buildPath: DIST_DIR,
  baseUrl: GITHUB_PAGES_BASE,
  pwaAssets: {
    manifest: fs.existsSync(path.join(DIST_DIR, 'manifest.json')),
    serviceWorker: fs.existsSync(path.join(DIST_DIR, 'sw.js')),
    offlinePage: fs.existsSync(path.join(DIST_DIR, 'offline.html')),
    headers: fs.existsSync(path.join(DIST_DIR, '_headers')),
  },
  routing: {
    spa404: fs.existsSync(path.join(DIST_DIR, '404.html')),
    nojekyll: fs.existsSync(path.join(DIST_DIR, '.nojekyll')),
  },
}

// Calculate bundle size
try {
  const bundleStats = execSync('find dist -type f -name "*.js" -o -name "*.css" | xargs ls -la', {
    encoding: 'utf8',
  })
  const totalSize = execSync('du -sh dist/', { encoding: 'utf8' }).trim()
  deploymentReport.bundleSize = {
    total: totalSize,
    details: bundleStats.split('\n').filter((line) => line.trim()),
  }
} catch (error) {
  console.log('⚠️  Could not calculate bundle size')
}

fs.writeFileSync(
  path.join(DIST_DIR, 'deployment-report.json'),
  JSON.stringify(deploymentReport, null, 2)
)
console.log('✅ Generated deployment report')

// 7. Final validation
console.log('\n📊 Deployment Validation:')
const requiredFiles = ['.nojekyll', '404.html', 'offline.html', '_headers', 'manifest.json']
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(DIST_DIR, file))
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'Ready' : 'Missing'}`)
}

console.log('\n🎉 GitHub Pages PWA deployment optimization complete!')
console.log(`📦 Total build size: ${deploymentReport.bundleSize?.total || 'Unknown'}`)
console.log(`🌐 Base URL: ${GITHUB_PAGES_BASE}`)
console.log('🚀 Ready for GitHub Pages deployment!')
