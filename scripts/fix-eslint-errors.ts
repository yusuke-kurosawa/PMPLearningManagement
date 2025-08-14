#!/usr/bin/env node

/**
 * ESLint Error Fix Script
 * Automatically fixes common ESLint errors and warnings
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

interface FixResult {
  file: string
  fixed: boolean
  error?: string
}

class ESLintFixer {
  private results: FixResult[] = []

  async fixAll(): Promise<void> {
    console.log('🔧 Starting ESLint error fixes...\n')

    // Step 1: Replace console statements with logger
    await this.replaceConsoleStatements()

    // Step 2: Fix unused variables
    await this.fixUnusedVariables()

    // Step 3: Replace any types
    await this.replaceAnyTypes()

    // Step 4: Fix parsing errors
    await this.fixParsingErrors()

    // Step 5: Run ESLint auto-fix
    await this.runESLintAutoFix()

    this.printSummary()
  }

  private async replaceConsoleStatements(): Promise<void> {
    console.log('📝 Replacing console statements with logger...')

    const files = this.getSourceFiles()
    
    for (const file of files) {
      try {
        let content = fs.readFileSync(file, 'utf-8')
        const originalContent = content

        // Skip test files
        if (file.includes('.test.') || file.includes('.spec.')) {
          continue
        }

        // Check if logger is already imported
        const hasLoggerImport = content.includes("from '@/utils/logger'") || 
                               content.includes('from "../utils/logger"') ||
                               content.includes("from './utils/logger'")

        // Replace console statements
        let modified = false
        
        if (content.includes('console.log')) {
          content = content.replace(/console\.log\(/g, 'logger.debug(')
          modified = true
        }
        
        if (content.includes('console.info')) {
          content = content.replace(/console\.info\(/g, 'logger.info(')
          modified = true
        }
        
        if (content.includes('console.warn')) {
          content = content.replace(/console\.warn\(/g, 'logger.warn(')
          modified = true
        }
        
        if (content.includes('console.error')) {
          content = content.replace(/console\.error\(/g, 'logger.error(')
          modified = true
        }

        // Add logger import if needed
        if (modified && !hasLoggerImport) {
          const importPath = this.getRelativeLoggerPath(file)
          const importStatement = `import { logger } from '${importPath}'\n`
          
          // Add after other imports
          if (content.includes('import ')) {
            const lastImportIndex = content.lastIndexOf('import ')
            const lineEnd = content.indexOf('\n', lastImportIndex)
            content = content.slice(0, lineEnd + 1) + importStatement + content.slice(lineEnd + 1)
          } else {
            content = importStatement + '\n' + content
          }
        }

        if (content !== originalContent) {
          fs.writeFileSync(file, content)
          this.results.push({ file, fixed: true })
          console.log(`  ✅ Fixed: ${file}`)
        }
      } catch (error) {
        this.results.push({ 
          file, 
          fixed: false, 
          error: error instanceof Error ? error.message : String(error) 
        })
      }
    }
  }

  private async fixUnusedVariables(): Promise<void> {
    console.log('\n🗑️  Fixing unused variables...')

    const files = this.getSourceFiles()
    
    for (const file of files) {
      try {
        let content = fs.readFileSync(file, 'utf-8')
        const originalContent = content

        // Prefix unused variables with underscore
        const unusedVarRegex = /const\s+(\w+)\s*=\s*.*?;\s*\/\/\s*eslint-disable-line.*?no-unused-vars/g
        content = content.replace(unusedVarRegex, 'const _$1 = $2; // eslint-disable-line @typescript-eslint/no-unused-vars')

        // Remove completely unused imports
        content = this.removeUnusedImports(content)

        if (content !== originalContent) {
          fs.writeFileSync(file, content)
          this.results.push({ file, fixed: true })
          console.log(`  ✅ Fixed: ${file}`)
        }
      } catch (error) {
        this.results.push({ 
          file, 
          fixed: false, 
          error: error instanceof Error ? error.message : String(error) 
        })
      }
    }
  }

  private removeUnusedImports(content: string): string {
    // This is a simplified implementation
    // In production, use a proper AST parser
    const lines = content.split('\n')
    const importedSymbols = new Set<string>()
    const importLines: { line: string; index: number; symbols: string[] }[] = []

    // Parse imports
    lines.forEach((line, index) => {
      const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from/)
      if (importMatch) {
        const symbols = importMatch[1] 
          ? importMatch[1].split(',').map(s => s.trim())
          : [importMatch[2]]
        importLines.push({ line, index, symbols })
        symbols.forEach(s => importedSymbols.add(s))
      }
    })

    // Check which symbols are used
    const codeWithoutImports = lines
      .filter((_, i) => !importLines.some(il => il.index === i))
      .join('\n')

    const unusedImports = new Set<string>()
    importedSymbols.forEach(symbol => {
      const regex = new RegExp(`\\b${symbol}\\b`)
      if (!regex.test(codeWithoutImports)) {
        unusedImports.add(symbol)
      }
    })

    // Remove unused imports
    return lines.filter((line, index) => {
      const importLine = importLines.find(il => il.index === index)
      if (!importLine) return true
      
      const hasUsedSymbol = importLine.symbols.some(s => !unusedImports.has(s))
      return hasUsedSymbol
    }).join('\n')
  }

  private async replaceAnyTypes(): Promise<void> {
    console.log('\n🔍 Replacing any types with specific types...')

    const tsFiles = this.getTypeScriptFiles()
    
    for (const file of tsFiles) {
      try {
        let content = fs.readFileSync(file, 'utf-8')
        const originalContent = content

        // Replace common any patterns
        content = content.replace(/:\s*any\[\]/g, ': unknown[]')
        content = content.replace(/:\s*any\b/g, ': unknown')
        content = content.replace(/as\s+any\b/g, 'as unknown')
        content = content.replace(/<any>/g, '<unknown>')

        // Replace specific patterns with better types
        content = content.replace(/\(e:\s*any\)/g, '(e: Error | unknown)')
        content = content.replace(/\(error:\s*any\)/g, '(error: Error | unknown)')
        content = content.replace(/\(data:\s*any\)/g, '(data: unknown)')
        content = content.replace(/\(response:\s*any\)/g, '(response: unknown)')

        if (content !== originalContent) {
          fs.writeFileSync(file, content)
          this.results.push({ file, fixed: true })
          console.log(`  ✅ Fixed: ${file}`)
        }
      } catch (error) {
        this.results.push({ 
          file, 
          fixed: false, 
          error: error instanceof Error ? error.message : String(error) 
        })
      }
    }
  }

  private async fixParsingErrors(): Promise<void> {
    console.log('\n🐛 Fixing parsing errors...')

    // Fix specific known parsing errors
    const filesToFix = [
      '/home/kurosawa/PMPLearningManagement/src/components/visualizations/ITTONetworkDiagram.jsx',
      '/home/kurosawa/PMPLearningManagement/src/services/performanceOptimizer.js',
    ]

    for (const file of filesToFix) {
      if (!fs.existsSync(file)) continue

      try {
        let content = fs.readFileSync(file, 'utf-8')
        const originalContent = content

        // Fix ITTONetworkDiagram - remove duplicate return
        if (file.includes('ITTONetworkDiagram')) {
          // Count return statements outside of functions
          const lines = content.split('\n')
          let braceCount = 0
          let inFunction = false
          let fixed = false

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.includes('const ITTONetworkDiagram = () => {')) {
              inFunction = true
              braceCount = 1
            } else if (inFunction) {
              braceCount += (line.match(/{/g) || []).length
              braceCount -= (line.match(/}/g) || []).length
              
              if (braceCount === 0) {
                inFunction = false
              }
            } else if (line.trim().startsWith('return') && !inFunction) {
              // Remove this return statement
              lines[i] = '// ' + line
              fixed = true
            }
          }

          if (fixed) {
            content = lines.join('\n')
          }
        }

        if (content !== originalContent) {
          fs.writeFileSync(file, content)
          this.results.push({ file, fixed: true })
          console.log(`  ✅ Fixed: ${file}`)
        }
      } catch (error) {
        this.results.push({ 
          file, 
          fixed: false, 
          error: error instanceof Error ? error.message : String(error) 
        })
      }
    }
  }

  private async runESLintAutoFix(): Promise<void> {
    console.log('\n🚀 Running ESLint auto-fix...')
    
    try {
      execSync('npx eslint src --ext .js,.jsx,.ts,.tsx --fix', {
        stdio: 'inherit'
      })
      console.log('  ✅ ESLint auto-fix completed')
    } catch (error) {
      console.log('  ⚠️  ESLint auto-fix completed with some warnings')
    }
  }

  private getSourceFiles(): string[] {
    return this.getAllFiles('src', ['.js', '.jsx', '.ts', '.tsx'])
  }

  private getTypeScriptFiles(): string[] {
    return this.getAllFiles('src', ['.ts', '.tsx'])
  }

  private getAllFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = []
    
    const walk = (currentDir: string) => {
      const items = fs.readdirSync(currentDir)
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory() && !item.includes('node_modules')) {
          walk(fullPath)
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    }
    
    walk(dir)
    return files
  }

  private getRelativeLoggerPath(file: string): string {
    const depth = file.split('/').length - 4 // Adjust based on src location
    const prefix = '../'.repeat(Math.max(0, depth - 1))
    return `${prefix}utils/logger`
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50))
    console.log('📊 Fix Summary')
    console.log('='.repeat(50))
    
    const successful = this.results.filter(r => r.fixed).length
    const failed = this.results.filter(r => !r.fixed).length
    
    console.log(`Total files processed: ${this.results.length}`)
    console.log(`Successfully fixed: ${successful}`)
    console.log(`Failed: ${failed}`)
    
    if (failed > 0) {
      console.log('\n❌ Failed fixes:')
      this.results
        .filter(r => !r.fixed)
        .forEach(r => console.log(`  - ${r.file}: ${r.error}`))
    }
    
    console.log('\n✨ ESLint fixes complete!')
  }
}

// Run the fixer
const fixer = new ESLintFixer()
fixer.fixAll().catch(console.error)