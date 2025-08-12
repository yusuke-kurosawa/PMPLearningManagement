module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      staticDistDir: './dist',
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 60000,
      settings: {
        chromeFlags: '--no-sandbox --headless --disable-gpu',
        preset: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 150,
          downloadThroughputKbps: 1600,
          uploadThroughputKbps: 750
        },
        emulatedFormFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          disabled: false
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.80 }], // Mobile is more lenient
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        'categories:pwa': ['error', { minScore: 0.95 }], // PWA more important on mobile
        
        // Core Web Vitals (Mobile)
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Mobile-specific metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'speed-index': ['warn', { maxNumericValue: 5000 }],
        'interactive': ['warn', { maxNumericValue: 8000 }],
        
        // PWA requirements (Mobile focus)
        'installable-manifest': 'error',
        'service-worker': 'error',
        'works-offline': 'error',
        'viewport': 'error',
        'apple-touch-icon': 'error',
        'splash-screen': 'warn',
        'themed-omnibox': 'warn',
        'maskable-icon': 'warn',
        
        // Mobile-specific optimizations
        'tap-targets': 'error',
        'content-width': 'error',
        
        // Performance optimizations
        'render-blocking-resources': 'warn',
        'uses-text-compression': 'error',
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'error',
        'uses-responsive-images': 'error',
        
        // Network efficiency (crucial for mobile)
        'total-byte-weight': ['error', { maxNumericValue: 2048000 }], // 2MB max
        'uses-long-cache-ttl': 'error',
        'efficient-animated-content': 'error',
        
        // Security
        'is-on-https': 'error',
        'no-vulnerable-libraries': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage',
      urlReplacementPatterns: [
        's/http:\\/\\/localhost:\\d+/https:\\/\\/pmp-learning-management.example.com/g'
      ]
    }
  }
};