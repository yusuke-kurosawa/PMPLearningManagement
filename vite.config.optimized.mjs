import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'

// Performance-optimized Vite configuration
export default defineConfig({
  plugins: [
    react({
      // Enable React Compiler optimizations when available
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-constant-elements'],
          ['@babel/plugin-transform-react-inline-elements']
        ]
      }
    }),

    // Split vendor chunks intelligently
    splitVendorChunkPlugin(),

    // PWA optimizations for offline performance
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    }),

    // Compression plugin for smaller bundle sizes
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false
    }),

    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    }),

    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE && visualizer({
      open: true,
      filename: 'dist/bundle-stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),

  // GitHub Pages configuration
  base: '/PMPLearningManagement/',

  // Advanced build optimizations
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: true,

    rollupOptions: {
      output: {
        // Advanced manual chunks for optimal loading
        manualChunks: (id) => {
          // Core React dependencies (immediate load)
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-core';
          }

          // Router (high priority)
          if (id.includes('react-router')) {
            return 'react-router';
          }

          // D3 visualization libraries (lazy load)
          if (id.includes('d3') || id.includes('d3-')) {
            return 'd3-viz';
          }

          // Radix UI components (lazy load per component type)
          if (id.includes('@radix-ui')) {
            const component = id.split('@radix-ui/react-')[1]?.split('/')[0];
            if (component) {
              // Group related Radix components
              if (['dialog', 'alert-dialog', 'popover'].includes(component)) {
                return 'radix-overlays';
              }
              if (['select', 'dropdown-menu', 'context-menu'].includes(component)) {
                return 'radix-menus';
              }
              if (['tabs', 'accordion', 'collapsible'].includes(component)) {
                return 'radix-navigation';
              }
              return 'radix-ui';
            }
          }

          // Icons and animations
          if (id.includes('lucide-react')) {
            return 'icons';
          }

          if (id.includes('framer-motion')) {
            return 'animation';
          }

          // Charts (separate chunk)
          if (id.includes('recharts')) {
            return 'charts';
          }

          // State management
          if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
            return 'state';
          }

          // Form handling
          if (id.includes('react-hook-form') || id.includes('zod')) {
            return 'forms';
          }

          // Auth and Supabase
          if (id.includes('supabase') || id.includes('@supabase')) {
            return 'auth';
          }

          // Utils and helpers in vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // Optimize chunk names for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        },

        entryFileNames: 'assets/js/[name]-[hash].js',

        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          } else {
            return `assets/[name]-[hash][extname]`;
          }
        },

        // Experimental: Use advanced chunks for better optimization
        experimentalMinChunkSize: 10000, // 10KB minimum chunk size
      },

      // Tree-shake unused exports aggressively
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false
      }
    },

    // Chunk size limits
    chunkSizeWarningLimit: 200, // Aggressive 200KB limit

    // Terser optimizations
    terserOptions: {
      compress: {
        ecma: 2020,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        passes: 3,
        inline: 2,
        toplevel: true,
        warnings: false,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true
      },
      mangle: {
        safari10: true,
        toplevel: true,
        properties: {
          regex: /^_/  // Mangle properties starting with _
        }
      },
      format: {
        comments: false,
        ascii_only: true
      },
      module: true,
      toplevel: true
    },

    // CSS optimizations
    cssMinify: 'lightningcss',
    cssTarget: ['chrome88', 'safari14']
  },

  // Development server configuration
  server: {
    port: 5173,
    open: true,
    host: true,
    cors: true,
    hmr: {
      overlay: false
    },
    // Pre-transform heavy dependencies
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/components/layout/Navigation.tsx'
      ]
    }
  },

  // Preview server
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
      '@utils': resolve(__dirname, './src/utils'),
      '@api': resolve(__dirname, './src/api'),
      '@lib': resolve(__dirname, './src/lib')
    }
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
    devSourcemap: false,
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __IS_PRODUCTION__: JSON.stringify(process.env.NODE_ENV === 'production'),
    __ENABLE_PWA__: JSON.stringify(true),
    __ENABLE_OFFLINE__: JSON.stringify(true)
  },

  // Dependency optimization
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
      '@tanstack/react-query',
      'react-hook-form',
      'zod'
    ],
    exclude: ['@stryker-mutator/core'],

    // Force optimization of deep imports
    entries: [
      './src/main.tsx',
      './src/App.tsx'
    ],

    // Experimental: use esbuild plugins for optimization
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis',
      },
      plugins: []
    }
  },

  // ESBuild optimizations
  esbuild: {
    target: 'es2020',
    legalComments: 'none',
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },

  // Worker optimizations
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/workers/[name]-[hash].js'
      }
    }
  }
})