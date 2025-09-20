/**
 * Context7 MCP Server Advanced Configuration
 * PMP Learning Management Project Optimization
 */

export default {
  // Server Configuration
  server: {
    host: 'localhost',
    port: process.env.CONTEXT7_PORT || 3001,
    timeout: 30000,
    keepAlive: true,
    maxConnections: 100,
  },

  // Performance Optimization
  performance: {
    caching: {
      enabled: true,
      ttl: 86400, // 24 hours
      maxSize: '100MB',
      compression: {
        enabled: true,
        algorithm: 'gzip',
        level: 6,
      },
      storage: {
        type: 'filesystem',
        path: './.context7-cache',
        maxFiles: 10000,
      },
    },

    streaming: {
      enabled: true,
      chunkSize: '64KB',
      maxConcurrent: 5,
    },

    requests: {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      maxConcurrent: 5,
      batchSize: 10,
      rateLimit: {
        requests: 100,
        window: 60000, // 1 minute
      },
    },
  },

  // Documentation Sources Configuration
  documentation: {
    // Primary sources for React/TypeScript development
    primary: [
      {
        name: 'React',
        url: 'https://react.dev',
        priority: 1,
        sections: ['learn', 'reference', 'community'],
        searchPaths: ['/learn/describing-the-ui', '/reference/react'],
      },
      {
        name: 'TypeScript',
        url: 'https://www.typescriptlang.org',
        priority: 1,
        sections: ['docs', 'handbook'],
        searchPaths: ['/docs/handbook', '/docs/reference'],
      },
      {
        name: 'Vite',
        url: 'https://vitejs.dev',
        priority: 1,
        sections: ['guide', 'config'],
        searchPaths: ['/guide', '/config'],
      },
    ],

    // Secondary sources for UI/Styling
    secondary: [
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        priority: 2,
        sections: ['docs'],
        searchPaths: ['/docs'],
      },
      {
        name: 'Radix UI',
        url: 'https://www.radix-ui.com',
        priority: 2,
        sections: ['primitives', 'colors'],
        searchPaths: ['/primitives/docs', '/colors/docs'],
      },
      {
        name: 'D3.js',
        url: 'https://d3js.org',
        priority: 2,
        sections: ['api', 'examples'],
        searchPaths: ['/d3-selection', '/d3-scale', '/d3-shape'],
      },
    ],

    // Tertiary sources for specific libraries
    tertiary: [
      {
        name: 'Zustand',
        url: 'https://zustand.docs.pmnd.rs',
        priority: 3,
        sections: ['getting-started', 'guides'],
      },
      {
        name: 'TanStack Query',
        url: 'https://tanstack.com/query',
        priority: 3,
        sections: ['v5'],
      },
      {
        name: 'Playwright',
        url: 'https://playwright.dev',
        priority: 3,
        sections: ['docs'],
      },
      {
        name: 'Vitest',
        url: 'https://vitest.dev',
        priority: 3,
        sections: ['guide', 'api'],
      },
      {
        name: 'Supabase',
        url: 'https://supabase.com/docs',
        priority: 3,
        sections: ['guides', 'reference'],
      },
      {
        name: 'Framer Motion',
        url: 'https://www.framer.com/motion',
        priority: 3,
        sections: ['introduction', 'api'],
      },
      {
        name: 'Zod',
        url: 'https://zod.dev',
        priority: 3,
        sections: [''],
      },
      {
        name: 'React Hook Form',
        url: 'https://react-hook-form.com',
        priority: 3,
        sections: ['get-started', 'api'],
      },
      {
        name: 'Lucide',
        url: 'https://lucide.dev',
        priority: 3,
        sections: ['icons'],
      },
    ],

    // Custom project documentation
    custom: [
      {
        name: 'PMBOK Guide',
        url: 'https://www.pmi.org/pmbok-guide-standards',
        priority: 4,
        sections: ['pmbok-guide-seventh-edition'],
      },
    ],
  },

  // Project-specific optimization
  project: {
    name: 'pmp-learning-management',
    type: 'react-spa',
    framework: 'react',
    language: 'typescript',
    buildTool: 'vite',

    // Context awareness
    context: {
      mainDomains: [
        'project-management',
        'pmbok',
        'react-development',
        'typescript',
        'data-visualization',
      ],

      codePatterns: [
        'react-hooks',
        'typescript-interfaces',
        'component-patterns',
        'd3-visualizations',
        'state-management',
      ],

      preferredAPIs: [
        'react-hooks',
        'typescript-types',
        'vite-plugins',
        'd3-selections',
        'zustand-stores',
      ],
    },
  },

  // Monitoring and Analytics
  monitoring: {
    enabled: true,
    metrics: {
      responseTime: true,
      cacheHitRate: true,
      errorRate: true,
      memoryUsage: true,
      requestVolume: true,
    },

    alerts: {
      responseTimeThreshold: 5000, // 5 seconds
      errorRateThreshold: 0.05, // 5%
      memoryThreshold: '2GB',
    },

    logging: {
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
      includeStackTraces: process.env.NODE_ENV !== 'production',
      logRequests: true,
      logResponses: false, // Set to true for debugging
    },
  },

  // Security Configuration
  security: {
    validateCertificates: true,
    allowRedirects: true,
    maxRedirects: 5,
    secureHeaders: true,
    rateLimiting: {
      enabled: true,
      requests: 100,
      window: 60000,
    },
  },

  // Error Handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    circuitBreaker: {
      enabled: true,
      threshold: 5,
      timeout: 60000,
    },
  },

  // Development Configuration
  development: {
    verboseLogging: process.env.NODE_ENV !== 'production',
    includeSourceMaps: true,
    hotReload: true,
    debugMode: process.env.CONTEXT7_DEBUG === 'true',
  },
};