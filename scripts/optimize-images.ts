#!/usr/bin/env node

/**
 * Advanced Image Optimization Pipeline
 * Optimizes images for web performance with modern formats
 */

import { promises as fs } from 'node:fs'
import * as fsSync from 'node:fs'
import * as path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { 
  CLIArguments, 
  Logger, 
  ExitCode, 
  CLIException,
  ImageOptimizer,
  ImageInfo,
  OptimizationConfig,
  OptimizationReport,
  ResponsiveImageInfo
} from '../src/types/scripts/index.js'

const execAsync = promisify(exec)

interface ImageOptimizerArgs {
  readonly type: string
  readonly input: string | null
  readonly quality: number | null
}

interface ProcessedImage {
  readonly path: string
  readonly originalSize: number
  readonly optimizedSize: number
  readonly savings: number
  readonly compressionRatio: string
  readonly format: string
}

interface FormatBreakdown {
  readonly count: number
  readonly originalSize: number
  readonly optimizedSize: number
}

interface OptimizationError {
  readonly path: string
  readonly error: string
}

class IntelligentImageOptimizer implements ImageOptimizer {
  private readonly outputDir: string = './public/assets/images/optimized'
  private readonly config: OptimizationConfig
  private readonly responsiveSizes: readonly number[] = [400, 800, 1200, 1600, 2000]
  private readonly report: {
    processedImages: ProcessedImage[]
    totalOriginalSize: number
    totalOptimizedSize: number
    formatBreakdown: Record<string, FormatBreakdown>
    errors: OptimizationError[]
  }

  private readonly logger: Logger = {
    info: (message: string) => console.log(`ℹ️ ${message}`),
    warn: (message: string) => console.warn(`⚠️ ${message}`),
    error: (message: string) => console.error(`❌ ${message}`),
    debug: (message: string) => console.log(`🐛 ${message}`),
    success: (message: string) => console.log(`✅ ${message}`)
  }

  constructor() {
    this.config = {
      jpeg: {
        quality: 80,
        progressive: true,
        mozjpeg: true,
      },
      png: {
        quality: [0.6, 0.8],
        speed: 1,
        strip: true,
      },
      webp: {
        quality: 80,
        effort: 6,
        lossless: false,
      },
      avif: {
        quality: 50,
        effort: 9,
        lossless: false,
      },
    }

    this.report = {
      processedImages: [],
      totalOriginalSize: 0,
      totalOptimizedSize: 0,
      formatBreakdown: {},
      errors: [],
    }
  }

  async optimize(): Promise<void> {
    console.log('🖼️ Starting intelligent image optimization...')

    try {
      const args = this.parseArguments()
      const imagePaths = await this.getImagePaths(args)

      if (imagePaths.length === 0) {
        console.log('No images to optimize')
        return
      }

      await this.ensureOutputDirectory()

      for (const imagePath of imagePaths) {
        await this.processImage(imagePath)
      }

      await this.generateReport()

      this.logger.success('Image optimization completed!')
      this.printSummary()
    } catch (error) {
      if (error instanceof CLIException) {
        this.logger.error(`Image optimization failed: ${error.message}`)
        process.exit(error.exitCode)
      } else {
        this.logger.error(`Image optimization failed: ${error instanceof Error ? error.message : String(error)}`)
        process.exit(ExitCode.GENERAL_ERROR)
      }
    }
  }

  private parseArguments(): ImageOptimizerArgs {
    const args = process.argv.slice(2)
    const parsed: ImageOptimizerArgs = {
      type: 'all',
      input: null,
      quality: null,
    }

    for (const arg of args) {
      if (arg.startsWith('--type=')) {
        parsed.type = arg.split('=')[1]
      } else if (arg.startsWith('--input=')) {
        parsed.input = arg.split('=')[1]
      } else if (arg.startsWith('--quality=')) {
        const quality = parseInt(arg.split('=')[1])
        if (isNaN(quality) || quality < 1 || quality > 100) {
          throw new CLIException('Quality must be a number between 1 and 100', ExitCode.INVALID_INPUT)
        }
        parsed.quality = quality
      }
    }

    return parsed
  }

  private async getImagePaths(args: ImageOptimizerArgs): Promise<string[]> {
    let imagePaths: string[] = []

    if (args.input && fsSync.existsSync(args.input)) {
      // Read from file list
      const fileContent = fsSync.readFileSync(args.input, 'utf8')
      imagePaths = fileContent
        .split('\n')
        .filter((line) => line.trim())
        .filter((line) => this.isImageFile(line))
    } else {
      // Scan directories
      imagePaths = await this.scanForImages(['./public', './src'])
    }

    // Filter by type if specified
    if (args.type && args.type !== 'all') {
      imagePaths = imagePaths.filter((path) => path.toLowerCase().includes(`.${args.type}`))
    }

    return imagePaths
  }

  private async scanForImages(directories: string[]): Promise<string[]> {
    const images: string[] = []

    for (const dir of directories) {
      if (fsSync.existsSync(dir)) {
        const files = await this.getAllFiles(dir)
        images.push(...files.filter((file) => this.isImageFile(file)))
      }
    }

    return images
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = []
    const entries = fsSync.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        files.push(...this.getAllFiles(fullPath))
      } else if (entry.isFile()) {
        files.push(fullPath)
      }
    }

    return files
  }

  private isImageFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase()
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)
  }

  private async ensureOutputDirectory(): Promise<void> {
    if (!fsSync.existsSync(this.outputDir)) {
      fsSync.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  private async processImage(imagePath: string): Promise<void> {
    console.log(`Processing: ${imagePath}`)

    try {
      const imageInfo = await this.getImageInfo(imagePath)
      const ext = path.extname(imagePath).toLowerCase()

      // Skip if already optimized recently
      if (await this.isRecentlyOptimized(imagePath)) {
        console.log(`  Skipping (recently optimized): ${imagePath}`)
        return
      }

      let optimizedPath: string | undefined

      switch (ext) {
        case '.png':
          optimizedPath = await this.optimizePNG(imagePath, imageInfo)
          break
        case '.jpg':
        case '.jpeg':
          optimizedPath = await this.optimizeJPEG(imagePath, imageInfo)
          break
        default:
          console.log(`  Skipping unsupported format: ${ext}`)
          return
      }

      // Generate modern format variants
      await this.generateWebP(imagePath, imageInfo)
      await this.generateAVIF(imagePath, imageInfo)

      // Generate responsive sizes
      await this.generateResponsiveSizes(imagePath, imageInfo)

      // Record optimization results
      this.recordOptimization(imagePath, optimizedPath, imageInfo)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to process ${imagePath}: ${errorMessage}`)
      this.report.errors.push({
        path: imagePath,
        error: errorMessage,
      })
    }
  }

  private async getImageInfo(imagePath: string): Promise<ImageInfo> {
    try {
      const { stdout } = await execAsync(`identify -format "%w %h %b %m" "${imagePath}"`)
      const [width, height, size, format] = stdout.trim().split(' ')

      return {
        width: parseInt(width),
        height: parseInt(height),
        size: this.parseSize(size),
        format: format.toLowerCase(),
        path: imagePath,
      }
    } catch (error) {
      throw new CLIException(
        `Failed to get image info: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.GENERAL_ERROR
      )
    }
  }

  private parseSize(sizeStr: string): number {
    const units: Record<string, number> = { 
      B: 1, 
      KB: 1024, 
      MB: 1024 * 1024, 
      GB: 1024 * 1024 * 1024 
    }
    const match = sizeStr.match(/^([0-9.]+)([A-Z]+)$/)

    if (match) {
      return parseFloat(match[1]) * (units[match[2]] || 1)
    }

    return parseInt(sizeStr) || 0
  }

  private async isRecentlyOptimized(imagePath: string): Promise<boolean> {
    const optimizedPath = this.getOptimizedPath(imagePath)

    if (!fsSync.existsSync(optimizedPath)) {
      return false
    }

    const originalStat = fsSync.statSync(imagePath)
    const optimizedStat = fsSync.statSync(optimizedPath)

    // Check if optimized version is newer
    return optimizedStat.mtime > originalStat.mtime
  }

  private getOptimizedPath(imagePath: string): string {
    const baseName = path.basename(imagePath)
    return path.join(this.outputDir, baseName)
  }

  private async optimizePNG(imagePath: string, imageInfo: ImageInfo): Promise<string> {
    const outputPath = this.getOptimizedPath(imagePath)

    try {
      // Use oxipng for better compression
      await execAsync(`oxipng --opt max --strip all "${imagePath}" --out "${outputPath}"`)

      console.log(
        `  ✅ PNG optimized: ${this.formatSize(imageInfo.size)} → ${this.formatSize(this.getFileSize(outputPath))}`
      )
      return outputPath
    } catch (error) {
      // Fallback to optipng
      try {
        await execAsync(`optipng -o7 -strip all "${imagePath}" -out "${outputPath}"`)
        return outputPath
      } catch (fallbackError) {
        throw new CLIException(
          `PNG optimization failed: ${error instanceof Error ? error.message : String(error)}`,
          ExitCode.GENERAL_ERROR
        )
      }
    }
  }

  private async optimizeJPEG(imagePath: string, imageInfo: ImageInfo): Promise<string> {
    const outputPath = this.getOptimizedPath(imagePath)
    const config = this.config.jpeg

    try {
      // Use mozjpeg for better compression
      const command = `cjpeg -quality ${config.quality} ${config.progressive ? '-progressive' : ''} -optimize -outfile "${outputPath}" "${imagePath}"`
      await execAsync(command)

      console.log(
        `  ✅ JPEG optimized: ${this.formatSize(imageInfo.size)} → ${this.formatSize(this.getFileSize(outputPath))}`
      )
      return outputPath
    } catch (error) {
      throw new CLIException(
        `JPEG optimization failed: ${error instanceof Error ? error.message : String(error)}`,
        ExitCode.GENERAL_ERROR
      )
    }
  }

  private async generateWebP(imagePath: string, imageInfo: ImageInfo): Promise<void> {
    const baseName = path.parse(imagePath).name
    const outputPath = path.join(this.outputDir, `${baseName}.webp`)
    const config = this.config.webp

    try {
      const command = `cwebp -q ${config.quality} -m ${config.effort} "${imagePath}" -o "${outputPath}"`
      await execAsync(command)

      console.log(`  ✅ WebP generated: ${this.formatSize(this.getFileSize(outputPath))}`)
    } catch (error) {
      this.logger.warn(`WebP generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async generateAVIF(imagePath: string, imageInfo: ImageInfo): Promise<void> {
    const baseName = path.parse(imagePath).name
    const outputPath = path.join(this.outputDir, `${baseName}.avif`)
    const config = this.config.avif

    try {
      // Use squoosh-cli for AVIF generation
      const command = `squoosh-cli --avif '{"cqLevel":${config.quality},"effort":${config.effort}}' -d "${this.outputDir}" "${imagePath}"`
      await execAsync(command)

      console.log(`  ✅ AVIF generated: ${this.formatSize(this.getFileSize(outputPath))}`)
    } catch (error) {
      this.logger.warn(`AVIF generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async generateResponsiveSizes(imagePath: string, imageInfo: ImageInfo): Promise<void> {
    const baseName = path.parse(imagePath).name
    const ext = path.extname(imagePath)

    // Only generate responsive sizes for images larger than 800px
    if (imageInfo.width <= 800) {
      return
    }

    const sizesToGenerate = this.responsiveSizes.filter((size) => size < imageInfo.width)

    for (const size of sizesToGenerate) {
      const outputPath = path.join(this.outputDir, `${baseName}_${size}w${ext}`)

      try {
        await execAsync(`convert "${imagePath}" -resize ${size}x -quality 85 "${outputPath}"`)
        console.log(`  📱 Responsive size generated: ${size}w`)

        // Also generate WebP version
        const webpPath = path.join(this.outputDir, `${baseName}_${size}w.webp`)
        await execAsync(`cwebp -q 80 "${outputPath}" -o "${webpPath}"`)
      } catch (error) {
        this.logger.warn(`Failed to generate ${size}w variant: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  private recordOptimization(originalPath: string, optimizedPath: string | undefined, imageInfo: ImageInfo): void {
    const originalSize = imageInfo.size
    const optimizedSize = optimizedPath ? this.getFileSize(optimizedPath) : originalSize
    const savings = originalSize - optimizedSize
    const compressionRatio = ((savings / originalSize) * 100).toFixed(1)

    this.report.processedImages.push({
      path: originalPath,
      originalSize,
      optimizedSize,
      savings,
      compressionRatio: `${compressionRatio}%`,
      format: imageInfo.format,
    })

    this.report.totalOriginalSize += originalSize
    this.report.totalOptimizedSize += optimizedSize

    // Update format breakdown
    if (!this.report.formatBreakdown[imageInfo.format]) {
      this.report.formatBreakdown[imageInfo.format] = {
        count: 0,
        originalSize: 0,
        optimizedSize: 0,
      }
    }

    const breakdown = this.report.formatBreakdown[imageInfo.format]
    breakdown.count++
    breakdown.originalSize += originalSize
    breakdown.optimizedSize += optimizedSize
  }

  private getFileSize(filePath: string): number {
    try {
      return fsSync.statSync(filePath).size
    } catch (error) {
      return 0
    }
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  private async generateReport(): Promise<OptimizationReport> {
    const totalSavings = this.report.totalOriginalSize - this.report.totalOptimizedSize
    const totalCompressionRatio =
      this.report.totalOriginalSize > 0
        ? ((totalSavings / this.report.totalOriginalSize) * 100).toFixed(1)
        : '0'

    const formatBreakdown = Object.entries(this.report.formatBreakdown).map(([format, data]) => ({
      format: format.toUpperCase(),
      originalSize: this.formatSize(data.originalSize),
      optimizedSize: this.formatSize(data.optimizedSize),
      savings: this.formatSize(data.originalSize - data.optimizedSize),
    }))

    // Calculate performance impact
    const loadTimeImprovement = this.calculateLoadTimeImprovement(totalSavings)
    const bandwidthSavings = this.formatSize(totalSavings)

    const report: OptimizationReport = {
      timestamp: new Date().toISOString(),
      processedCount: this.report.processedImages.length,
      totalSizeReduction: this.formatSize(totalSavings),
      compressionRatio: `${totalCompressionRatio}%`,
      webpCount: this.countGeneratedFiles('.webp'),
      avifCount: this.countGeneratedFiles('.avif'),
      formatBreakdown,
      responsiveImages: this.getResponsiveImageInfo(),
      loadTimeImprovement,
      bandwidthSavings,
      coreWebVitalsImpact: this.assessCoreWebVitalsImpact(totalSavings),
      recommendations: this.generateRecommendations(),
      errors: this.report.errors,
    }

    fsSync.writeFileSync('./image-optimization-report.json', JSON.stringify(report, null, 2))
    this.logger.success('Optimization report generated')
    return report
  }

  private countGeneratedFiles(extension: string): number {
    if (!fsSync.existsSync(this.outputDir)) return 0

    return fsSync.readdirSync(this.outputDir).filter((file) => file.endsWith(extension)).length
  }

  private getResponsiveImageInfo(): ResponsiveImageInfo[] {
    const responsiveImages: ResponsiveImageInfo[] = []

    for (const imageData of this.report.processedImages) {
      const baseName = path.parse(imageData.path).name
      const variants = this.responsiveSizes
        .filter((size) => fsSync.existsSync(path.join(this.outputDir, `${baseName}_${size}w.webp`)))
        .map((size) => `${size}w`)

      if (variants.length > 0) {
        responsiveImages.push({
          name: baseName,
          variants,
        })
      }
    }

    return responsiveImages
  }

  private calculateLoadTimeImprovement(savedBytes: number): string {
    // Rough calculation: assume 3G connection (1.6 Mbps)
    const connectionSpeed = (1.6 * 1024 * 1024) / 8 // bytes per second
    const timeSaved = savedBytes / connectionSpeed

    if (timeSaved < 1) {
      return `${Math.round(timeSaved * 1000)}ms`
    } else {
      return `${timeSaved.toFixed(1)}s`
    }
  }

  private assessCoreWebVitalsImpact(savedBytes: number): string {
    const impacts: string[] = []

    if (savedBytes > 100 * 1024) {
      // > 100KB
      impacts.push('LCP improvement expected')
    }

    if (savedBytes > 500 * 1024) {
      // > 500KB
      impacts.push('Significant bandwidth savings')
    }

    if (this.countGeneratedFiles('.webp') > 0) {
      impacts.push('Modern format adoption')
    }

    return impacts.length > 0 ? impacts.join(', ') : 'Minimal impact'
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.countGeneratedFiles('.webp') === 0) {
      recommendations.push('Consider implementing WebP format support')
    }

    if (this.countGeneratedFiles('.avif') === 0) {
      recommendations.push('Consider implementing AVIF format for even better compression')
    }

    if (this.getResponsiveImageInfo().length === 0) {
      recommendations.push('Implement responsive images with srcset for better mobile performance')
    }

    if (this.report.errors.length > 0) {
      recommendations.push(`Fix ${this.report.errors.length} optimization errors`)
    }

    const largeImages = this.report.processedImages.filter((img) => img.originalSize > 1024 * 1024)
    if (largeImages.length > 0) {
      recommendations.push(
        `Consider further optimization for ${largeImages.length} large images (>1MB)`
      )
    }

    return recommendations
  }

  private printSummary(): void {
    const totalSavings = this.report.totalOriginalSize - this.report.totalOptimizedSize
    const compressionRatio =
      this.report.totalOriginalSize > 0
        ? ((totalSavings / this.report.totalOriginalSize) * 100).toFixed(1)
        : '0'

    console.log('\n📊 Optimization Summary:')
    console.log(`  Images processed: ${this.report.processedImages.length}`)
    console.log(`  Total size reduction: ${this.formatSize(totalSavings)} (${compressionRatio}%)`)
    console.log(`  WebP variants: ${this.countGeneratedFiles('.webp')}`)
    console.log(`  AVIF variants: ${this.countGeneratedFiles('.avif')}`)
    console.log(`  Responsive variants: ${this.getResponsiveImageInfo().length}`)

    if (this.report.errors.length > 0) {
      console.log(`  Errors: ${this.report.errors.length}`)
    }
  }
}

// Export class for testing
export default IntelligentImageOptimizer

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new IntelligentImageOptimizer()
  optimizer.optimize().catch(console.error)
}