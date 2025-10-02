import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Ensure single React instance
      jsxRuntime: 'automatic'
    }),
    viteStaticCopy({
      targets: [
        // PWA manifest and icons
        {
          src: 'public/manifest.json',
          dest: ''
        },
        {
          src: 'public/icon-192x192.png',
          dest: ''
        },
        {
          src: 'public/icon-512x512.png',
          dest: ''
        }
      ]
    })
  ],
  
  // GitHub Pages configuration
  base: '/PMPLearningManagement/',
  
  // Build configuration optimized for mobile PWA and GitHub Pages rate limiting
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled for production performance
    minify: 'esbuild', // Using esbuild to prevent segmentation faults
    target: ['es2020', 'edge88', 'chrome88', 'safari14'], // Modern browser support (updated to es2020)
    rollupOptions: {
      // Ensure correct module loading order to prevent useLayoutEffect errors
      external: [],
      output: {
        manualChunks(id) {
          // More granular chunking to reduce individual file sizes and avoid 429 errors
          if (id.includes('node_modules')) {
            // CRITICAL FIX: Bundle React, React-DOM, Scheduler, and React-Router together
            // to prevent multiple React instances and "Cannot set properties of undefined" error
            // scheduler MUST be bundled with React to avoid initialization conflicts
            if (id.includes('scheduler') ||
                id.includes('react-dom') ||
                id.includes('react-router') ||
                (id.includes('react') && !id.includes('@radix-ui') && !id.includes('lucide-react'))) {
              return 'react-vendor';
            }

            // Split D3 libraries
            if (id.includes('d3-sankey')) return 'd3-sankey';
            if (id.includes('d3')) return 'd3-core';

            // Split UI libraries
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('lucide-react')) return 'lucide-icons';

            // Split Radix UI into smaller chunks
            if (id.includes('@radix-ui/react-dialog')) return 'radix-dialog';
            if (id.includes('@radix-ui/react-accordion')) return 'radix-accordion';
            if (id.includes('@radix-ui/react-tabs')) return 'radix-tabs';
            if (id.includes('@radix-ui')) return 'radix-core';

            // Split other large dependencies
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('zustand')) return 'zustand';
            if (id.includes('zod')) return 'validation';
            if (id.includes('react-hook-form')) return 'forms';

            // All other vendor modules
            return 'vendor';
          }
        },
        // Optimize chunk names for mobile caching with shorter hashes
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]'
      }
    },
    // Adjusted bundle size limits to create more, smaller chunks
    chunkSizeWarningLimit: 500 // Increased to reduce warnings for legitimate large chunks
  },
  
  // Development server configuration
  server: {
    port: 5173,
    open: true,
    host: true,
    cors: true,
    hmr: {
      overlay: true // Re-enabled for better development experience
    },
    watch: {
      // Performance optimization for file watching
      ignored: ['**/node_modules/**', '**/dist/**', '**/reports/**', '**/.git/**']
    }
  },
  
  // Preview server (for testing production build)
  preview: {
    port: 4173,
    host: true
  },
  
  
  // CSS configuration
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true
  },
  
  // Environment variables and feature flags
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __IS_PRODUCTION__: JSON.stringify(process.env.NODE_ENV === 'production'),
    __ENABLE_PWA__: JSON.stringify(true),
    __ENABLE_OFFLINE__: JSON.stringify(true)
  },
  
  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'scheduler', // Explicitly include scheduler with React
      'd3',
      'd3-sankey',
      'lucide-react',
      'framer-motion',
      'zustand',
      '@radix-ui/react-dialog',
      '@radix-ui/react-progress',
      'react-hook-form',
      'zod'
    ],
    exclude: ['@stryker-mutator/core'],
    // Force clear cache and rebuild to ensure single React instance
    force: false
  },

  // Path resolution and React duplication prevention
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@data': resolve(__dirname, './src/data'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@utils': resolve(__dirname, './src/utils'),
      // Explicit React aliases to prevent duplication
      'react': resolve(__dirname, './node_modules/react'),
      'react-dom': resolve(__dirname, './node_modules/react-dom'),
      'scheduler': resolve(__dirname, './node_modules/scheduler')
    },
    dedupe: ['react', 'react-dom', 'react-router-dom', 'scheduler']
  },

  // Performance optimizations
  // CRITICAL FIX: Disable minifyIdentifiers to prevent TDZ (Temporal Dead Zone) errors
  // Issue: "Cannot access 'un' before initialization" in react-vendor chunk
  // Cause: Aggressive identifier minification breaks React/Scheduler initialization order
  esbuild: {
    target: 'es2020',
    treeShaking: true,
    minifyIdentifiers: false, // Disabled to prevent variable initialization conflicts
    minifySyntax: true,
    minifyWhitespace: true,
    keepNames: true // Preserve function/variable names for safer minification
  }
})