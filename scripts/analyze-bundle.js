#!/usr/bin/env node

/**
 * Intelligent Bundle Analyzer
 * Provides detailed analysis and optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class IntelligentBundleAnalyzer {
  constructor() {
    this.distDir = './dist';
    this.analysisDir = './bundle-analysis';
    this.statsFile = path.join(this.distDir, 'stats.json');
    this.budgets = {
      totalSize: 2 * 1024 * 1024,      // 2MB
      gzippedSize: 1 * 1024 * 1024,    // 1MB
      jsSize: 1.5 * 1024 * 1024,       // 1.5MB
      cssSize: 256 * 1024,             // 256KB
      chunkSize: 512 * 1024,           // 512KB per chunk
      thirdPartyPercent: 60            // 60% max third-party code
    };
  }

  async analyze() {
    console.log('📦 Starting intelligent bundle analysis...');
    
    try {
      await this.ensureAnalysisDir();
      await this.generateBundleStats();
      
      const stats = await this.loadBundleStats();
      const analysis = await this.performComprehensiveAnalysis(stats);
      
      await this.generateReports(analysis);
      await this.checkBudgetCompliance(analysis);
      
      console.log('✅ Bundle analysis completed successfully!');
      return analysis;
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
      process.exit(1);
    }
  }

  async ensureAnalysisDir() {
    if (!fs.existsSync(this.analysisDir)) {
      fs.mkdirSync(this.analysisDir, { recursive: true });
    }
  }

  async generateBundleStats() {
    console.log('📊 Generating bundle statistics...');
    
    // Generate webpack stats if not present
    if (!fs.existsSync(this.statsFile)) {
      try {
        await execAsync('npm run build -- --analyze');
      } catch (error) {
        console.log('⚠️ Build with analyze flag failed, using regular build');
        await execAsync('npm run build');
      }
    }

    // Generate additional analysis files
    await this.generateFileSizeAnalysis();
    await this.generateDependencyAnalysis();
  }

  async generateFileSizeAnalysis() {
    const distFiles = this.getAllFiles(this.distDir);
    const fileSizes = [];

    for (const file of distFiles) {
      const stats = fs.statSync(file);
      const relativePath = path.relative(this.distDir, file);
      
      fileSizes.push({
        path: relativePath,
        size: stats.size,
        type: this.getFileType(file),
        gzippedSize: await this.getGzippedSize(file)
      });
    }

    fileSizes.sort((a, b) => b.size - a.size);
    
    fs.writeFileSync(
      path.join(this.analysisDir, 'file-sizes.json'),
      JSON.stringify(fileSizes, null, 2)
    );
  }

  async generateDependencyAnalysis() {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    const dependencyAnalysis = [];

    for (const [name, version] of Object.entries(dependencies)) {
      try {
        const packagePath = path.join('./node_modules', name, 'package.json');
        if (fs.existsSync(packagePath)) {
          const depPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          dependencyAnalysis.push({
            name,
            version,
            description: depPackage.description,
            size: await this.getDependencySize(name),
            license: depPackage.license,
            dependencies: Object.keys(depPackage.dependencies || {}),
            category: this.categorizeDependency(name, depPackage)
          });
        }
      } catch (error) {
        console.warn(`Failed to analyze dependency ${name}:`, error.message);
      }
    }

    dependencyAnalysis.sort((a, b) => b.size - a.size);
    
    fs.writeFileSync(
      path.join(this.analysisDir, 'dependency-analysis.json'),
      JSON.stringify(dependencyAnalysis, null, 2)
    );
  }

  async loadBundleStats() {
    let stats = null;
    
    if (fs.existsSync(this.statsFile)) {
      stats = JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
    }

    const fileSizes = JSON.parse(
      fs.readFileSync(path.join(this.analysisDir, 'file-sizes.json'), 'utf8')
    );
    
    const dependencyAnalysis = JSON.parse(
      fs.readFileSync(path.join(this.analysisDir, 'dependency-analysis.json'), 'utf8')
    );

    return { stats, fileSizes, dependencyAnalysis };
  }

  async performComprehensiveAnalysis(data) {
    const { stats, fileSizes, dependencyAnalysis } = data;
    
    const analysis = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(fileSizes),
      chunks: this.analyzeChunks(fileSizes),
      dependencies: this.analyzeDependencies(dependencyAnalysis),
      optimizations: this.identifyOptimizations(fileSizes, dependencyAnalysis),
      duplications: this.findDuplications(dependencyAnalysis),
      treeshaking: this.analyzeTreeshaking(fileSizes, dependencyAnalysis),
      codesplitting: this.analyzeCodeSplitting(fileSizes),
      recommendations: []
    };

    analysis.recommendations = this.generateRecommendations(analysis);
    
    return analysis;
  }

  generateSummary(fileSizes) {
    const totalSize = fileSizes.reduce((sum, file) => sum + file.size, 0);
    const totalGzippedSize = fileSizes.reduce((sum, file) => sum + file.gzippedSize, 0);
    
    const typeBreakdown = fileSizes.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + file.size;
      return acc;
    }, {});

    return {
      totalSize: this.formatSize(totalSize),
      totalSizeBytes: totalSize,
      gzippedSize: this.formatSize(totalGzippedSize),
      gzippedSizeBytes: totalGzippedSize,
      compressionRatio: ((1 - totalGzippedSize / totalSize) * 100).toFixed(1) + '%',
      fileCount: fileSizes.length,
      typeBreakdown: Object.fromEntries(
        Object.entries(typeBreakdown).map(([type, size]) => [type, this.formatSize(size)])
      )
    };
  }

  analyzeChunks(fileSizes) {
    const jsFiles = fileSizes.filter(f => f.type === 'js');
    
    return {
      totalChunks: jsFiles.length,
      largestChunk: jsFiles.length > 0 ? {
        path: jsFiles[0].path,
        size: this.formatSize(jsFiles[0].size)
      } : null,
      oversizedChunks: jsFiles.filter(f => f.size > this.budgets.chunkSize).map(f => ({
        path: f.path,
        size: this.formatSize(f.size),
        overage: this.formatSize(f.size - this.budgets.chunkSize)
      })),
      chunkDistribution: this.analyzeChunkDistribution(jsFiles)
    };
  }

  analyzeChunkDistribution(jsFiles) {
    const ranges = [
      { name: 'Small (<100KB)', min: 0, max: 100 * 1024 },
      { name: 'Medium (100KB-500KB)', min: 100 * 1024, max: 500 * 1024 },
      { name: 'Large (500KB-1MB)', min: 500 * 1024, max: 1024 * 1024 },
      { name: 'Very Large (>1MB)', min: 1024 * 1024, max: Infinity }
    ];

    return ranges.map(range => ({
      ...range,
      count: jsFiles.filter(f => f.size >= range.min && f.size < range.max).length
    }));
  }

  analyzeDependencies(dependencyAnalysis) {
    const totalSize = dependencyAnalysis.reduce((sum, dep) => sum + dep.size, 0);
    const thirdPartySize = dependencyAnalysis
      .filter(dep => dep.category !== 'first-party')
      .reduce((sum, dep) => sum + dep.size, 0);

    return {
      totalDependencies: dependencyAnalysis.length,
      totalSize: this.formatSize(totalSize),
      thirdPartySize: this.formatSize(thirdPartySize),
      thirdPartyPercent: ((thirdPartySize / totalSize) * 100).toFixed(1) + '%',
      largestDependencies: dependencyAnalysis.slice(0, 10).map(dep => ({
        name: dep.name,
        size: this.formatSize(dep.size),
        category: dep.category,
        percentage: ((dep.size / totalSize) * 100).toFixed(1) + '%'
      })),
      categoryBreakdown: this.categorizeDependenciesByType(dependencyAnalysis)
    };
  }

  categorizeDependenciesByType(dependencies) {
    const categories = dependencies.reduce((acc, dep) => {
      acc[dep.category] = (acc[dep.category] || []);
      acc[dep.category].push(dep);
      return acc;
    }, {});

    return Object.fromEntries(
      Object.entries(categories).map(([category, deps]) => [
        category,
        {
          count: deps.length,
          totalSize: this.formatSize(deps.reduce((sum, dep) => sum + dep.size, 0)),
          topDependencies: deps.slice(0, 5).map(dep => dep.name)
        }
      ])
    );
  }

  identifyOptimizations(fileSizes, dependencyAnalysis) {
    const optimizations = [];

    // Large bundle optimization
    const totalSize = fileSizes.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > this.budgets.totalSize) {
      optimizations.push({
        type: 'bundle-size',
        priority: 'high',
        description: 'Bundle exceeds size budget',
        currentValue: this.formatSize(totalSize),
        targetValue: this.formatSize(this.budgets.totalSize),
        potentialSaving: this.formatSize(totalSize - this.budgets.totalSize)
      });
    }

    // Large dependencies
    const largeDeps = dependencyAnalysis
      .filter(dep => dep.size > 100 * 1024) // >100KB
      .slice(0, 5);

    if (largeDeps.length > 0) {
      optimizations.push({
        type: 'large-dependencies',
        priority: 'medium',
        description: `${largeDeps.length} large dependencies found`,
        dependencies: largeDeps.map(dep => dep.name),
        potentialSaving: 'Review for lighter alternatives'
      });
    }

    // Unused CSS
    const cssFiles = fileSizes.filter(f => f.type === 'css');
    const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalCssSize > this.budgets.cssSize) {
      optimizations.push({
        type: 'css-optimization',
        priority: 'medium',
        description: 'CSS bundle exceeds budget',
        currentValue: this.formatSize(totalCssSize),
        potentialSaving: 'Use PurgeCSS or similar tools'
      });
    }

    return optimizations;
  }

  findDuplications(dependencyAnalysis) {
    const duplicates = [];
    const nameVersionMap = new Map();

    for (const dep of dependencyAnalysis) {
      const baseName = dep.name.split('/')[0]; // Handle scoped packages
      if (nameVersionMap.has(baseName)) {
        const existing = nameVersionMap.get(baseName);
        if (existing.version !== dep.version) {
          duplicates.push({
            name: baseName,
            versions: [existing.version, dep.version],
            totalWastedSize: this.formatSize(Math.min(existing.size, dep.size))
          });
        }
      } else {
        nameVersionMap.set(baseName, dep);
      }
    }

    return {
      count: duplicates.length,
      duplicates: duplicates.slice(0, 10),
      potentialSaving: duplicates.reduce((sum, dup) => 
        sum + Math.min(...dup.versions.map(v => nameVersionMap.get(dup.name)?.size || 0)), 0
      )
    };
  }

  analyzeTreeshaking(fileSizes, dependencyAnalysis) {
    const jsSize = fileSizes
      .filter(f => f.type === 'js')
      .reduce((sum, file) => sum + file.size, 0);

    const librariesWithTreeshaking = [
      'lodash', 'moment', 'date-fns', 'rxjs', 'ramda'
    ];

    const optimizableLibraries = dependencyAnalysis
      .filter(dep => librariesWithTreeshaking.some(lib => dep.name.includes(lib)))
      .map(dep => ({
        name: dep.name,
        size: this.formatSize(dep.size),
        recommendation: this.getTreeshakingRecommendation(dep.name)
      }));

    return {
      currentJsSize: this.formatSize(jsSize),
      optimizableLibraries,
      potentialSaving: optimizableLibraries.length * 50 + 'KB (estimated)',
      recommendations: [
        'Enable tree shaking in webpack config',
        'Use ES6 imports instead of CommonJS',
        'Import specific functions instead of entire libraries'
      ]
    };
  }

  getTreeshakingRecommendation(name) {
    const recommendations = {
      'lodash': 'Use lodash-es or import specific functions',
      'moment': 'Consider date-fns for better tree shaking',
      'date-fns': 'Import specific functions only',
      'rxjs': 'Import operators individually',
      'ramda': 'Import specific functions'
    };

    return recommendations[name] || 'Review for tree shaking opportunities';
  }

  analyzeCodeSplitting(fileSizes) {
    const jsFiles = fileSizes.filter(f => f.type === 'js');
    const mainBundle = jsFiles.find(f => f.path.includes('index') || f.path.includes('main'));
    
    const routeBasedChunks = jsFiles.filter(f => 
      f.path.includes('route') || f.path.includes('page') || f.path.includes('chunk')
    );

    return {
      hasCodeSplitting: routeBasedChunks.length > 0,
      mainBundleSize: mainBundle ? this.formatSize(mainBundle.size) : 'Not found',
      chunkCount: routeBasedChunks.length,
      recommendations: this.getCodeSplittingRecommendations(mainBundle, routeBasedChunks)
    };
  }

  getCodeSplittingRecommendations(mainBundle, chunks) {
    const recommendations = [];

    if (mainBundle && mainBundle.size > 500 * 1024) { // >500KB
      recommendations.push('Main bundle is large - implement route-based code splitting');
    }

    if (chunks.length === 0) {
      recommendations.push('No code splitting detected - implement lazy loading for routes');
    }

    if (chunks.length > 0) {
      const largeChunks = chunks.filter(c => c.size > 300 * 1024);
      if (largeChunks.length > 0) {
        recommendations.push('Some chunks are large - consider further splitting');
      }
    }

    return recommendations;
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // High priority recommendations
    if (analysis.summary.totalSizeBytes > this.budgets.totalSize) {
      recommendations.push('🚨 CRITICAL: Reduce total bundle size to meet budget');
    }

    if (analysis.optimizations.some(opt => opt.type === 'large-dependencies')) {
      recommendations.push('📦 HIGH: Review and replace large dependencies with lighter alternatives');
    }

    // Medium priority recommendations
    if (analysis.duplications.count > 0) {
      recommendations.push('🔄 MEDIUM: Eliminate duplicate dependencies to reduce bundle size');
    }

    if (!analysis.codesplitting.hasCodeSplitting) {
      recommendations.push('✂️ MEDIUM: Implement code splitting for better load performance');
    }

    if (analysis.treeshaking.optimizableLibraries.length > 0) {
      recommendations.push('🌳 MEDIUM: Enable tree shaking for optimizable libraries');
    }

    // Low priority recommendations
    if (analysis.chunks.oversizedChunks.length > 0) {
      recommendations.push('📏 LOW: Break down oversized chunks for better caching');
    }

    return recommendations;
  }

  async checkBudgetCompliance(analysis) {
    const violations = [];
    
    if (analysis.summary.totalSizeBytes > this.budgets.totalSize) {
      violations.push('Total bundle size exceeds budget');
    }
    
    if (analysis.summary.gzippedSizeBytes > this.budgets.gzippedSize) {
      violations.push('Gzipped bundle size exceeds budget');
    }

    const budgetStatus = violations.length === 0 ? 'compliant' : 'exceeded';
    
    const budgetReport = {
      status: budgetStatus,
      violations,
      budgets: this.budgets,
      current: {
        totalSize: analysis.summary.totalSizeBytes,
        gzippedSize: analysis.summary.gzippedSizeBytes
      }
    };

    fs.writeFileSync(
      path.join(this.analysisDir, 'budget-compliance.json'),
      JSON.stringify(budgetReport, null, 2)
    );

    if (budgetStatus === 'exceeded') {
      console.warn('⚠️ Bundle size budget exceeded!');
    } else {
      console.log('✅ Bundle size within budget');
    }
  }

  async generateReports(analysis) {
    // Main analysis report
    fs.writeFileSync(
      path.join(this.analysisDir, 'bundle-analysis.json'),
      JSON.stringify(analysis, null, 2)
    );

    // Summary for GitHub Actions
    const summary = {
      totalSize: analysis.summary.totalSize,
      gzippedSize: analysis.summary.gzippedSize,
      sizeChange: '+0B', // Would need previous build data
      sizeChangePercent: '+0%',
      largeDependencies: analysis.dependencies.largestDependencies.slice(0, 5),
      optimizations: analysis.optimizations.slice(0, 3),
      recommendations: analysis.recommendations.slice(0, 5),
      budgetStatus: analysis.summary.totalSizeBytes > this.budgets.totalSize ? 'exceeded' : 'compliant',
      reportUrl: 'https://bundle-analysis.example.com'
    };

    fs.writeFileSync(
      path.join(this.analysisDir, 'bundle-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    // Generate HTML report
    await this.generateHTMLReport(analysis);
    
    console.log('📊 Bundle analysis reports generated');
  }

  async generateHTMLReport(analysis) {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bundle Analysis Report</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 40px; }
        .metric { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .recommendation { background: #e3f2fd; padding: 15px; margin: 10px 0; border-left: 4px solid #2196f3; }
        .optimization { background: #fff3e0; padding: 15px; margin: 10px 0; border-left: 4px solid #ff9800; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
    </style>
</head>
<body>
    <h1>📦 Bundle Analysis Report</h1>
    <p>Generated: ${analysis.timestamp}</p>
    
    <div class="metric">
        <h2>Bundle Summary</h2>
        <p><strong>Total Size:</strong> ${analysis.summary.totalSize}</p>
        <p><strong>Gzipped Size:</strong> ${analysis.summary.gzippedSize}</p>
        <p><strong>Compression Ratio:</strong> ${analysis.summary.compressionRatio}</p>
    </div>

    <h2>Top Dependencies</h2>
    <table>
        <thead>
            <tr><th>Package</th><th>Size</th><th>Percentage</th><th>Category</th></tr>
        </thead>
        <tbody>
            ${analysis.dependencies.largestDependencies.map(dep => 
              `<tr><td>${dep.name}</td><td>${dep.size}</td><td>${dep.percentage}</td><td>${dep.category}</td></tr>`
            ).join('')}
        </tbody>
    </table>

    <h2>Optimization Opportunities</h2>
    ${analysis.optimizations.map(opt => 
      `<div class="optimization">
        <strong>${opt.type}</strong> (${opt.priority} priority)<br>
        ${opt.description}<br>
        Potential saving: ${opt.potentialSaving}
      </div>`
    ).join('')}

    <h2>Recommendations</h2>
    ${analysis.recommendations.map(rec => 
      `<div class="recommendation">${rec}</div>`
    ).join('')}
</body>
</html>`;

    fs.writeFileSync(path.join(this.analysisDir, 'bundle-report.html'), htmlTemplate);
  }

  // Helper methods
  getAllFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const typeMap = {
      '.js': 'js',
      '.mjs': 'js',
      '.css': 'css',
      '.html': 'html',
      '.png': 'image',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.gif': 'image',
      '.svg': 'image',
      '.webp': 'image',
      '.ico': 'image',
      '.woff': 'font',
      '.woff2': 'font',
      '.ttf': 'font',
      '.eot': 'font',
      '.json': 'data',
      '.map': 'sourcemap'
    };
    
    return typeMap[ext] || 'other';
  }

  async getGzippedSize(filePath) {
    try {
      const { stdout } = await execAsync(`gzip -c "${filePath}" | wc -c`);
      return parseInt(stdout.trim());
    } catch (error) {
      return 0;
    }
  }

  async getDependencySize(name) {
    try {
      const { stdout } = await execAsync(`du -sb node_modules/${name} 2>/dev/null || echo "0"`);
      return parseInt(stdout.split('\t')[0]) || 0;
    } catch (error) {
      return 0;
    }
  }

  categorizeDependency(name, packageJson) {
    const categories = {
      'framework': ['react', 'vue', 'angular', 'svelte'],
      'ui': ['@mui', 'antd', 'bootstrap', 'tailwindcss'],
      'utility': ['lodash', 'ramda', 'date-fns', 'moment'],
      'bundler': ['webpack', 'rollup', 'vite', 'parcel'],
      'testing': ['jest', 'vitest', 'cypress', 'playwright'],
      'build': ['babel', 'typescript', 'eslint', 'prettier'],
      'visualization': ['d3', 'chart.js', 'plotly', 'three']
    };

    for (const [category, packages] of Object.entries(categories)) {
      if (packages.some(pkg => name.includes(pkg))) {
        return category;
      }
    }

    return packageJson.description?.includes('component') ? 'component' : 'other';
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}

// Run if called directly
if (require.main === module) {
  const analyzer = new IntelligentBundleAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = IntelligentBundleAnalyzer;