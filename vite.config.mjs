import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // GitHub Pages configuration
  base: '/PMPLearningManagement/',
  
  // Build configuration optimized for mobile PWA
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled for production performance
    minify: 'terser', // Better compression for mobile
    target: ['es2015', 'edge88', 'chrome88', 'safari14'], // Modern browser support
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunk (priority loading)
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // D3 visualization chunk (lazy loaded)
          d3: ['d3', 'd3-sankey'],
          // UI component library chunk
          ui: ['lucide-react', 'framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-progress'],
          // Radix UI components (separate chunk for tree shaking)
          radix: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog', 
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu'
          ],
          // Chart libraries (optional loading)
          charts: ['recharts']
        },
        // Optimize chunk names for mobile caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Aggressive bundle size limits for mobile
    chunkSizeWarningLimit: 500,
    // Terser options for better mobile performance
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2 // Multiple compression passes
      },
      mangle: {
        safari10: true // Safari compatibility
      },
      format: {
        comments: false // Remove comments
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 5173,
    open: true,
    host: true,
    cors: true,
    hmr: {
      overlay: false
    }
  },
  
  // Preview server (for testing production build)
  preview: {
    port: 4173,
    host: true
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@data': resolve(__dirname, './src/data'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@utils': resolve(__dirname, './src/utils')
    }
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
    exclude: ['@stryker-mutator/core']
  },

  // Performance optimizations
  esbuild: {
    target: 'es2020',
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  }
})