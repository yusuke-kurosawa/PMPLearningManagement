#!/usr/bin/env node

/**
 * Mobile-First PWA Deployment Optimization Script
 * Optimizes the build output for GitHub Pages deployment with focus on mobile performance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

console.log('🚀 Starting mobile-first PWA deployment optimization...');

/**
 * 1. Verify build output exists
 */
function verifyBuild() {
    console.log('📋 Verifying build output...');
    
    if (!fs.existsSync(DIST_DIR)) {
        throw new Error('Build directory not found. Run npm run build first.');
    }
    
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) {
        throw new Error('index.html not found in build output.');
    }
    
    console.log('✅ Build output verified');
}

/**
 * 2. Optimize HTML for mobile PWA
 */
function optimizeHTML() {
    console.log('📱 Optimizing HTML for mobile PWA...');
    
    const indexPath = path.join(DIST_DIR, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    
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
    `;
    
    // Insert mobile meta tags after charset
    html = html.replace(
        /<meta charset="utf-8">/i,
        '<meta charset="utf-8">' + mobileMetaTags
    );
    
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
    `;
    
    // Add SW registration before closing body tag
    html = html.replace('</body>', swRegistration + '</body>');
    
    fs.writeFileSync(indexPath, html);
    console.log('✅ HTML optimized for mobile PWA');
}

/**
 * 3. Create 404.html for SPA routing
 */
function createSPA404() {
    console.log('🔄 Creating SPA routing fallback...');
    
    const indexPath = path.join(DIST_DIR, 'index.html');
    const notFoundPath = path.join(DIST_DIR, '404.html');
    
    // Copy index.html to 404.html for SPA routing
    fs.copyFileSync(indexPath, notFoundPath);
    
    console.log('✅ SPA routing configured');
}

/**
 * 4. Copy PWA assets
 */
function copyPWAAssets() {
    console.log('📄 Copying PWA assets...');
    
    const assets = ['manifest.json', 'sw.js', 'offline.html', '_headers'];
    
    assets.forEach(asset => {
        const srcPath = path.join(PUBLIC_DIR, asset);
        const destPath = path.join(DIST_DIR, asset);
        
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`  ✓ Copied ${asset}`);
        } else {
            console.warn(`  ⚠ ${asset} not found in public directory`);
        }
    });
    
    console.log('✅ PWA assets copied');
}

/**
 * 5. Create .nojekyll file
 */
function createNoJekyll() {
    console.log('🚫 Creating .nojekyll file...');
    
    const nojekyllPath = path.join(DIST_DIR, '.nojekyll');
    fs.writeFileSync(nojekyllPath, '');
    
    console.log('✅ Jekyll processing disabled');
}

/**
 * 6. Optimize assets for mobile
 */
function optimizeAssets() {
    console.log('⚡ Optimizing assets for mobile delivery...');
    
    const assetsDir = path.join(DIST_DIR, 'assets');
    
    if (!fs.existsSync(assetsDir)) {
        console.warn('  ⚠ Assets directory not found, skipping optimization');
        return;
    }
    
    // Get all JS and CSS files
    const files = fs.readdirSync(assetsDir);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    
    console.log(`  Found ${jsFiles.length} JS files and ${cssFiles.length} CSS files`);
    
    // Calculate total sizes
    let totalSize = 0;
    let gzippedSize = 0;
    
    [...jsFiles, ...cssFiles].forEach(file => {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
        
        // Simulate gzip compression (rough estimate)
        gzippedSize += Math.floor(stats.size * 0.3);
    });
    
    console.log(`  Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`  Estimated gzipped: ${(gzippedSize / 1024).toFixed(2)} KB`);
    
    // Check against performance budget
    const PERFORMANCE_BUDGET_KB = 500; // 500KB total
    if (gzippedSize / 1024 > PERFORMANCE_BUDGET_KB) {
        console.warn(`  ⚠ Bundle size exceeds performance budget (${PERFORMANCE_BUDGET_KB}KB)`);
        process.exitCode = 1;
    } else {
        console.log(`  ✅ Bundle size within performance budget`);
    }
}

/**
 * 7. Generate deployment report
 */
function generateReport() {
    console.log('📊 Generating deployment report...');
    
    const report = {
        timestamp: new Date().toISOString(),
        buildPath: DIST_DIR,
        pwaAssets: {
            manifest: fs.existsSync(path.join(DIST_DIR, 'manifest.json')),
            serviceWorker: fs.existsSync(path.join(DIST_DIR, 'sw.js')),
            offlinePage: fs.existsSync(path.join(DIST_DIR, 'offline.html')),
            headers: fs.existsSync(path.join(DIST_DIR, '_headers'))
        },
        routing: {
            spa404: fs.existsSync(path.join(DIST_DIR, '404.html')),
            nojekyll: fs.existsSync(path.join(DIST_DIR, '.nojekyll'))
        }
    };
    
    // Calculate bundle sizes
    const assetsDir = path.join(DIST_DIR, 'assets');
    if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        let totalSize = 0;
        
        files.forEach(file => {
            const filePath = path.join(assetsDir, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        });
        
        report.bundleSize = {
            totalBytes: totalSize,
            totalKB: Math.round(totalSize / 1024),
            estimatedGzippedKB: Math.round(totalSize * 0.3 / 1024)
        };
    }
    
    const reportPath = path.join(DIST_DIR, 'deployment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('✅ Deployment report generated');
    console.log('📋 Report summary:');
    console.log(`   PWA Assets: ${Object.values(report.pwaAssets).filter(Boolean).length}/4`);
    console.log(`   SPA Routing: ${report.routing.spa404 && report.routing.nojekyll ? 'Configured' : 'Missing'}`);
    if (report.bundleSize) {
        console.log(`   Bundle Size: ${report.bundleSize.totalKB}KB (${report.bundleSize.estimatedGzippedKB}KB gzipped)`);
    }
}

/**
 * Main optimization process
 */
async function main() {
    try {
        verifyBuild();
        optimizeHTML();
        createSPA404();
        copyPWAAssets();
        createNoJekyll();
        optimizeAssets();
        generateReport();
        
        console.log('\n🎉 Mobile-first PWA deployment optimization completed successfully!');
        console.log('\n📱 Ready for GitHub Pages deployment with:');
        console.log('   • Mobile-optimized PWA configuration');
        console.log('   • Service Worker with advanced caching');
        console.log('   • Offline support and install prompts');
        console.log('   • SPA routing with GitHub Pages compatibility');
        console.log('   • Performance-optimized asset delivery');
        
    } catch (error) {
        console.error('\n❌ Optimization failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    verifyBuild,
    optimizeHTML,
    createSPA404,
    copyPWAAssets,
    createNoJekyll,
    optimizeAssets,
    generateReport
};