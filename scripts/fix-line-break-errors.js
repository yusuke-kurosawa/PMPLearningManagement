#!/usr/bin/env node

/**
 * Line Break Error Fixer
 * Fixes critical line break syntax errors that prevent build completion
 */

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
const { glob } = globPkg

class LineBreakErrorFixer {
  constructor() {
    this.fixedFiles = []
    this.errors = []
  }

  async fixAllFiles() {
    console.log('🔧 Line break error fixing...')
    
    try {
      const files = await new Promise((resolve, reject) => {
        glob('src/**/*.{js,jsx,ts,tsx}', { 
          ignore: ['src/**/*.test.{js,jsx,ts,tsx}', 'src/**/*.spec.{js,jsx,ts,tsx}']
        }, (err, matches) => {
          if (err) reject(err)
          else resolve(matches)
        })
      })
      
      console.log(`📁 Checking ${files.length} files for line break errors`)
      
      for (const file of files) {
        await this.fixFile(file)
      }
      
      this.printSummary()
      
    } catch (error) {
      console.error('❌ Error:', error.message)
      process.exit(1)
    }
  }

  async fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      let fixedContent = content

      // Fix broken property definitions (spaces in property names)
      fixedContent = this.fixBrokenPropertyDefinitions(fixedContent)
      
      // Fix broken object structures
      fixedContent = this.fixBrokenObjectStructures(fixedContent)
      
      // Fix broken type definitions
      fixedContent = this.fixBrokenTypeDefinitions(fixedContent)
      
      // Fix broken className strings
      fixedContent = this.fixBrokenClassNames(fixedContent)
      
      if (content !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8')
        this.fixedFiles.push(filePath)
        console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`)
      }
      
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message })
      console.error(`❌ Error in ${filePath}: ${error.message}`)
    }
  }

  fixBrokenPropertyDefinitions(content) {
    // Fix patterns like "performanc\ne: 0" -> "performance: 0"
    content = content.replace(/(\w+)\s*\n\s*([a-z]): /g, '$1$2: ')
    
    // Fix patterns like "goo\nd: 1800" -> "good: 1800"
    content = content.replace(/(\w+)\s*\n\s*([a-z]): /g, '$1$2: ')
    
    // Fix patterns like "lc\np: 0" -> "lcp: 0"
    content = content.replace(/(\w+)\s*\n\s*([a-z]): /g, '$1$2: ')
    
    return content
  }

  fixBrokenObjectStructures(content) {
    // Fix broken object property definitions with line breaks
    content = content.replace(
      /(\w+): \{\s*([a-z]+)\s*\n\s*([a-z]): /g,
      '$1: { $2$3: '
    )
    
    // Fix specific patterns
    content = content.replace(/performanc\s*\n\s*e:/g, 'performance:')
    content = content.replace(/accessibilit\s*\n\s*y:/g, 'accessibility:')
    content = content.replace(/lc\s*\n\s*p:/g, 'lcp:')
    content = content.replace(/goo\s*\n\s*d:/g, 'good:')
    content = content.replace(/needs_improvemen\s*\n\s*t:/g, 'needs_improvement:')
    content = content.replace(/processGrou\s*\n\s*p:/g, 'processGroup:')
    
    return content
  }

  fixBrokenTypeDefinitions(content) {
    // Fix TypeScript type definitions broken across lines
    content = content.replace(
      /(\w+): \{\s*([a-z]+)\s*\n\s*([a-z]): ([^}]+)\s*}/g,
      '$1: { $2$3: $4 }'
    )
    
    return content
  }

  fixBrokenClassNames(content) {
    // Fix broken className strings in JSX
    content = content.replace(
      /className=\{`([^`]*)\s*\n\s*([^`]*)`\}/g,
      'className={`$1$2`}'
    )
    
    // Fix broken CSS class definitions
    content = content.replace(
      /hover:\s*([a-z-]+)\s*focu,s:([a-z-:]+)/g,
      'hover:$1 focus:$2'
    )
    
    content = content.replace(
      /dark:\s*([a-z-]+)\s*dar,k:([a-z-:]+)/g,
      'dark:$1 dark:$2'
    )
    
    content = content.replace(
      /hover:\s*([a-z-]+)\s*dark:hove,r:([a-z-:]+)/g,
      'hover:$1 dark:hover:$2'
    )
    
    return content
  }

  printSummary() {
    console.log('\\n📊 Line Break Error Fix Summary')
    console.log('='.repeat(50))
    console.log(`✅ Fixed files: ${this.fixedFiles.length}`)
    console.log(`❌ Error files: ${this.errors.length}`)
    
    if (this.fixedFiles.length > 0) {
      console.log('\\n🔧 Fixed files:')
      this.fixedFiles.forEach(file => {
        console.log(`  - ${path.relative(process.cwd(), file)}`)
      })
    }
    
    console.log('\\n🎯 Fixed patterns:')
    console.log('  - Broken property definitions')
    console.log('  - Broken object structures')
    console.log('  - Broken type definitions')
    console.log('  - Broken className strings')
    
    console.log('\\n📋 Next: npm run build')
  }
}

// Execute
const fixer = new LineBreakErrorFixer()
await fixer.fixAllFiles()

export default LineBreakErrorFixer