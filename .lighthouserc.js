module.exports = {
  ci: {
    collect: {
      numberOfRuns: 5,
      staticDistDir: './dist',
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 60000,
      settings: {
        chromeFlags: '--no-sandbox --headless --disable-gpu',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        'categories:pwa': ['error', { minScore: 0.90 }],
        
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 5000 }],
        
        // PWA requirements
        'installable-manifest': 'error',
        'service-worker': 'error',
        'works-offline': 'error',
        'viewport': 'error',
        
        // Resource hints
        'uses-rel-preload': 'warn',
        'uses-rel-preconnect': 'warn',
        
        // Images
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'error',
        'uses-responsive-images': 'warn',
        
        // JavaScript
        'unused-javascript': ['warn', { maxLength: 1 }],
        'unminified-javascript': 'error',
        'legacy-javascript': 'warn',
        
        // CSS
        'unused-css-rules': ['warn', { maxLength: 1 }],
        'unminified-css': 'error',
        
        // Network
        'uses-text-compression': 'error',
        'uses-long-cache-ttl': 'warn',
        'efficient-animated-content': 'warn',
        
        // Security
        'is-on-https': 'error',
        'no-vulnerable-libraries': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        sqlDatabasePath: './.lighthouseci/database.sql'
      }
    }
  }
};