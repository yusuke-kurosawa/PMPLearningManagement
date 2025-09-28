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
        {
          src: 'public/sw.js',
          dest: ''
        },
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
    minify: 'terser', // Better compression for mobile
    target: ['es2015', 'edge88', 'chrome88', 'safari14'], // Modern browser support
    rollupOptions: {
      // Ensure correct module loading order to prevent useLayoutEffect errors
      external: [],
      output: {
        manualChunks(id) {
          // More granular chunking to reduce individual file sizes and avoid 429 errors
          if (id.includes('node_modules')) {
            // IMPORTANT: Order matters! Check react-dom and react-router before react
            // to prevent mismatches in module resolution
            if (id.includes('react-dom')) return 'react-dom';
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('react') && !id.includes('react-dom') && !id.includes('react-router')) {
              return 'react';
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
    chunkSizeWarningLimit: 250,
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

  // Path resolution and React duplication prevention
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@data': resolve(__dirname, './src/data'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@utils': resolve(__dirname, './src/utils')
    },
    dedupe: ['react', 'react-dom']
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