import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'

  return {
    plugins: [react()],
    base: '/PMPLearningManagement/',

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_BUILD_VERSION || 'development'),
      __BUILD_TIME__: JSON.stringify(env.VITE_BUILD_TIMESTAMP || new Date().toISOString()),
      __APP_ENV__: JSON.stringify(mode),
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isProduction ? false : true,

      // Bundle analysis
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            d3: ['d3', 'd3-sankey'],
            ui: ['lucide-react', 'recharts'],
          },
        },
      },

      // Performance settings
      chunkSizeWarningLimit: 1000, // 1MB warning limit

      // Minification
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
            mangle: {
              safari10: true,
            },
          }
        : undefined,

      // Asset optimization
      assetsInlineLimit: 4096, // 4KB inline limit
    },

    server: {
      port: 3000,
      open: true,
      host: true, // Allow external connections
    },

    preview: {
      port: 4173,
      host: true,
    },

    // Development optimizations
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },

    // Test configuration
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: './src/test-setup.js',
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'src/test-setup.js', '**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
      },
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
        'recharts',
      ],
    },
  }
})
