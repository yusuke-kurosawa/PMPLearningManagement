#!/usr/bin/env node

/**
 * PMPLearningManagement Performance Check Script
 * Comprehensive performance analysis and optimization suggestions
 */

import { readFileSync, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const PERFORMANCE_BUDGETS = {
  bundleSize: 1024 * 1024, // 1MB
  initialJS: 512 * 1024,   // 512KB
  css: 256 * 1024,         // 256KB
  images: 2 * 1024 * 1024, // 2MB total
  loadTime: 3000,          // 3 seconds
  fcp: 1800,              // First Contentful Paint
  lcp: 2500,              // Largest Contentful Paint
  fid: 100,               // First Input Delay
  cls: 0.1                // Cumulative Layout Shift
};

class PerformanceChecker {
  constructor() {
    this.results = {
      bundleAnalysis: {},
      dependencies: {},
      assets: {},
      codeQuality: {},
      recommendations: []
    };
  }

  async run() {
    console.log('🚀 PMPLearningManagement Performance Check');
    console.log('==========================================\n');

    try {
      await this.checkBundleSize();
      await this.analyzeDependencies();
      await this.checkAssets();
      await this.analyzeCodeQuality();
      this.generateRecommendations();
      this.printReport();
    } catch (error) {
      console.error('❌ Performance check failed:', error.message);
      process.exit(1);
    }
  }

  async checkBundleSize() {
    console.log('📦 Checking bundle size...');

    try {
      // Build the project
      execSync('npm run build', { stdio: 'pipe' });

      const distPath = './dist';
      const bundleStats = this.analyzeBundleSize(distPath);
      
      this.results.bundleAnalysis = bundleStats;
      
      console.log(`   Total bundle size: ${this.formatBytes(bundleStats.totalSize)}`);
      console.log(`   JS chunks: ${bundleStats.jsChunks.length}`);
      console.log(`   CSS files: ${bundleStats.cssFiles.length}`);
      
      if (bundleStats.totalSize > PERFORMANCE_BUDGETS.bundleSize) {
        this.results.recommendations.push({
          type: 'warning',
          category: 'Bundle Size',
          message: `Bundle size (${this.formatBytes(bundleStats.totalSize)}) exceeds budget (${this.formatBytes(PERFORMANCE_BUDGETS.bundleSize)})`
        });
      }
    } catch (error) {
      console.log('   ⚠️  Could not analyze bundle (build may have failed)');
      this.results.bundleAnalysis.error = error.message;
    }
  }

  analyzeBundleSize(distPath) {
    const stats = {
      totalSize: 0,
      jsChunks: [],
      cssFiles: [],
      assets: [],
      largestFiles: []
    };

    const analyzeDir = (dirPath) => {
      try {
        const items = readdirSync(dirPath);
        
        for (const item of items) {
          const itemPath = join(dirPath, item);
          const stat = statSync(itemPath);
          
          if (stat.isDirectory()) {
            analyzeDir(itemPath);
          } else {
            const size = stat.size;
            stats.totalSize += size;
            
            const ext = extname(item);
            const fileInfo = {
              name: item,
              path: itemPath,
              size: size,
              sizeFormatted: this.formatBytes(size)
            };
            
            if (ext === '.js') {
              stats.jsChunks.push(fileInfo);
            } else if (ext === '.css') {
              stats.cssFiles.push(fileInfo);
            } else {
              stats.assets.push(fileInfo);
            }
            
            stats.largestFiles.push(fileInfo);
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    };

    analyzeDir(distPath);
    
    // Sort by size
    stats.largestFiles.sort((a, b) => b.size - a.size);
    stats.largestFiles = stats.largestFiles.slice(0, 10); // Top 10
    
    return stats;
  }

  async analyzeDependencies() {
    console.log('📚 Analyzing dependencies...');

    try {
      const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const analysis = {
        total: Object.keys(deps).length,
        production: Object.keys(packageJson.dependencies || {}).length,
        development: Object.keys(packageJson.devDependencies || {}).length,
        heavyDeps: [],
        outdated: []
      };

      // Check for heavy dependencies
      const HEAVY_DEPS = [
        'lodash', 'moment', 'rxjs', 'core-js', 'polyfills'
      ];

      for (const dep of Object.keys(deps)) {
        if (HEAVY_DEPS.some(heavy => dep.includes(heavy))) {
          analysis.heavyDeps.push(dep);
        }
      }

      this.results.dependencies = analysis;
      
      console.log(`   Total dependencies: ${analysis.total}`);
      console.log(`   Production: ${analysis.production}, Development: ${analysis.development}`);
      
      if (analysis.heavyDeps.length > 0) {
        console.log(`   ⚠️  Heavy dependencies found: ${analysis.heavyDeps.join(', ')}`);
        this.results.recommendations.push({
          type: 'info',
          category: 'Dependencies',
          message: `Consider alternatives for heavy dependencies: ${analysis.heavyDeps.join(', ')}`
        });
      }
    } catch (error) {
      console.log('   ❌ Could not analyze dependencies');
      this.results.dependencies.error = error.message;
    }
  }

  async checkAssets() {
    console.log('🖼️  Checking assets...');

    try {
      const publicPath = './public';
      const srcPath = './src';
      
      const assetStats = {
        images: [],
        totalImageSize: 0,
        largeImages: [],
        unoptimizedImages: []
      };

      const checkAssetDir = (dirPath) => {
        try {
          const items = readdirSync(dirPath);
          
          for (const item of items) {
            const itemPath = join(dirPath, item);
            const stat = statSync(itemPath);
            
            if (stat.isDirectory()) {
              checkAssetDir(itemPath);
            } else {
              const ext = extname(item).toLowerCase();
              
              if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
                const size = stat.size;
                assetStats.totalImageSize += size;
                
                const imageInfo = {
                  name: item,
                  path: itemPath,
                  size: size,
                  sizeFormatted: this.formatBytes(size),
                  extension: ext
                };
                
                assetStats.images.push(imageInfo);
                
                // Check for large images (> 500KB)
                if (size > 500 * 1024) {
                  assetStats.largeImages.push(imageInfo);
                }
                
                // Check for unoptimized formats
                if (['.png', '.jpg', '.jpeg'].includes(ext) && size > 100 * 1024) {
                  assetStats.unoptimizedImages.push(imageInfo);
                }
              }
            }
          }
        } catch (error) {
          // Directory doesn't exist
        }
      };

      checkAssetDir(publicPath);
      checkAssetDir(srcPath);
      
      this.results.assets = assetStats;
      
      console.log(`   Total images: ${assetStats.images.length}`);
      console.log(`   Total image size: ${this.formatBytes(assetStats.totalImageSize)}`);
      
      if (assetStats.largeImages.length > 0) {
        console.log(`   ⚠️  Large images (>500KB): ${assetStats.largeImages.length}`);
        this.results.recommendations.push({
          type: 'warning',
          category: 'Assets',
          message: `${assetStats.largeImages.length} large images found. Consider optimization.`
        });
      }
      
      if (assetStats.unoptimizedImages.length > 0) {
        this.results.recommendations.push({
          type: 'info',
          category: 'Assets',
          message: `Consider converting ${assetStats.unoptimizedImages.length} images to WebP format for better compression.`
        });
      }
    } catch (error) {
      console.log('   ❌ Could not analyze assets');
      this.results.assets.error = error.message;
    }
  }

  async analyzeCodeQuality() {
    console.log('🔍 Analyzing code quality...');

    const codeStats = {
      sourceFiles: 0,
      totalLines: 0,
      avgComplexity: 0,
      duplicateCode: 0
    };

    const analyzeSourceDir = (dirPath) => {
      try {
        const items = readdirSync(dirPath);
        
        for (const item of items) {
          const itemPath = join(dirPath, item);
          const stat = statSync(itemPath);
          
          if (stat.isDirectory() && !['node_modules', 'dist', '.git'].includes(item)) {
            analyzeSourceDir(itemPath);
          } else {
            const ext = extname(item);
            
            if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
              codeStats.sourceFiles++;
              
              try {
                const content = readFileSync(itemPath, 'utf8');
                codeStats.totalLines += content.split('\n').length;
              } catch (error) {
                // Can't read file
              }
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist
      }
    };

    analyzeSourceDir('./src');
    
    this.results.codeQuality = codeStats;
    
    console.log(`   Source files: ${codeStats.sourceFiles}`);
    console.log(`   Total lines: ${codeStats.totalLines}`);
    console.log(`   Avg lines per file: ${Math.round(codeStats.totalLines / codeStats.sourceFiles)}`);
  }

  generateRecommendations() {
    const { bundleAnalysis, dependencies, assets } = this.results;

    // Bundle size recommendations
    if (bundleAnalysis.totalSize > PERFORMANCE_BUDGETS.bundleSize * 0.8) {
      this.results.recommendations.push({
        type: 'info',
        category: 'Bundle Optimization',
        message: 'Consider implementing code splitting and lazy loading for better initial load performance'
      });
    }

    // Dependency recommendations
    if (dependencies.total > 50) {
      this.results.recommendations.push({
        type: 'info',
        category: 'Dependencies',
        message: 'High number of dependencies. Review and remove unused packages'
      });
    }

    // Asset recommendations
    if (assets.totalImageSize > PERFORMANCE_BUDGETS.images) {
      this.results.recommendations.push({
        type: 'warning',
        category: 'Assets',
        message: 'Total image size exceeds budget. Implement image optimization and lazy loading'
      });
    }

    // General recommendations
    this.results.recommendations.push({
      type: 'info',
      category: 'General',
      message: 'Enable gzip/brotli compression on your server'
    });

    this.results.recommendations.push({
      type: 'info',
      category: 'General',
      message: 'Implement service worker for caching and offline functionality'
    });
  }

  printReport() {
    console.log('\n📊 Performance Report');
    console.log('=====================\n');

    // Bundle Analysis
    if (this.results.bundleAnalysis.totalSize) {
      console.log('📦 Bundle Analysis:');
      console.log(`   Total Size: ${this.formatBytes(this.results.bundleAnalysis.totalSize)}`);
      console.log(`   Budget: ${this.formatBytes(PERFORMANCE_BUDGETS.bundleSize)}`);
      console.log(`   Status: ${this.results.bundleAnalysis.totalSize <= PERFORMANCE_BUDGETS.bundleSize ? '✅ Within budget' : '❌ Exceeds budget'}\n`);
    }

    // Dependencies
    if (this.results.dependencies.total) {
      console.log('📚 Dependencies:');
      console.log(`   Total: ${this.results.dependencies.total}`);
      console.log(`   Production: ${this.results.dependencies.production}`);
      console.log(`   Development: ${this.results.dependencies.development}\n`);
    }

    // Assets
    if (this.results.assets.images) {
      console.log('🖼️  Assets:');
      console.log(`   Images: ${this.results.assets.images.length}`);
      console.log(`   Total Image Size: ${this.formatBytes(this.results.assets.totalImageSize)}`);
      console.log(`   Large Images: ${this.results.assets.largeImages.length}\n`);
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        const icon = rec.type === 'warning' ? '⚠️ ' : rec.type === 'error' ? '❌' : '💡';
        console.log(`   ${index + 1}. ${icon} [${rec.category}] ${rec.message}`);
      });
      console.log('');
    }

    // Summary
    const score = this.calculatePerformanceScore();
    console.log(`🎯 Performance Score: ${score}/100`);
    console.log(`${this.getScoreEmoji(score)} ${this.getScoreMessage(score)}\n`);
  }

  calculatePerformanceScore() {
    let score = 100;
    
    // Bundle size penalty
    if (this.results.bundleAnalysis.totalSize > PERFORMANCE_BUDGETS.bundleSize) {
      score -= 20;
    } else if (this.results.bundleAnalysis.totalSize > PERFORMANCE_BUDGETS.bundleSize * 0.8) {
      score -= 10;
    }

    // Dependencies penalty
    if (this.results.dependencies.total > 100) {
      score -= 15;
    } else if (this.results.dependencies.total > 50) {
      score -= 5;
    }

    // Assets penalty
    if (this.results.assets.totalImageSize > PERFORMANCE_BUDGETS.images) {
      score -= 15;
    }

    if (this.results.assets.largeImages && this.results.assets.largeImages.length > 5) {
      score -= 10;
    }

    // Heavy dependencies penalty
    if (this.results.dependencies.heavyDeps && this.results.dependencies.heavyDeps.length > 0) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🎉';
    if (score >= 80) return '✅';
    if (score >= 70) return '⚠️';
    return '❌';
  }

  getScoreMessage(score) {
    if (score >= 90) return 'Excellent performance! 🚀';
    if (score >= 80) return 'Good performance with minor optimizations needed';
    if (score >= 70) return 'Acceptable performance, consider optimizations';
    return 'Performance needs significant improvement';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run the performance check
const checker = new PerformanceChecker();
checker.run().catch(console.error);