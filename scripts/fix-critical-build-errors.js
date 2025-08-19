#!/usr/bin/env node

/**
 * Critical Build Error Fixer
 * Fixes remaining syntax errors that prevent build completion
 */

import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
const { glob } = globPkg

class CriticalBuildErrorFixer {
  constructor() {
    this.fixedFiles = []
    this.errors = []
  }

  async fixAllFiles() {
    console.log('🚨 Critical build error fixing...')
    
    try {
      // Target files with critical syntax errors
      const files = await new Promise((resolve, reject) => {
        glob('src/**/*.{js,jsx,ts,tsx}', { 
          ignore: ['src/**/*.test.{js,jsx,ts,tsx}', 'src/**/*.spec.{js,jsx,ts,tsx}']
        }, (err, matches) => {
          if (err) reject(err)
          else resolve(matches)
        })
      })
      
      console.log(`📁 Checking ${files.length} files for critical build errors`)
      
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
      
      // Fix malformed onClick handlers
      fixedContent = this.fixMalformedClickHandlers(fixedContent)
      
      // Fix malformed TypeScript interface definitions
      fixedContent = this.fixInterfaceDefinitions(fixedContent)
      
      // Fix malformed useCallback structures
      fixedContent = this.fixUseCallbackStructures(fixedContent)
      
      // Fix object property syntax errors
      fixedContent = this.fixObjectPropertySyntax(fixedContent)
      
      // Fix stray dependency arrays
      fixedContent = this.fixStrayDependencyArrays(fixedContent)
      
      // Fix malformed arrow functions
      fixedContent = this.fixMalformedArrowFunctions(fixedContent)
      
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

  fixMalformedClickHandlers(content) {
    // Fix pattern: onClick={() = role="button" ...> handler}
    content = content.replace(
      /onClick=\{\(\) = role="button" tabIndex=\{0\} onKeyDown=\{[^}]+\}> ([^}]+)\}/g,
      'onClick={() => $1}\n              role="button"\n              tabIndex={0}\n              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}'
    )
    
    return content
  }

  fixInterfaceDefinitions(content) {
    // Fix TypeScript interface property separators
    content = content.replace(
      /(\w+): ([^,\n]+),(\w+): /g,
      '$1: $2\n  $3: '
    )
    
    // Fix function signature commas
    content = content.replace(
      /(emai),l:/g,
      'email:'
    )
    
    content = content.replace(
      /(succes),s:/g,
      'success:'
    )
    
    return content
  }

  fixUseCallbackStructures(content) {
    // Fix malformed useCallback with stray dependency arrays
    content = content.replace(
      /(\s+)}, \[\]\)/g,
      '$1}'
    )
    
    return content
  }

  fixObjectPropertySyntax(content) {
    // Fix object properties with leading commas
    content = content.replace(
      /\{,(\w+):/g,
      '{\n      $1:'
    )
    
    return content
  }

  fixStrayDependencyArrays(content) {
    // Remove stray }, []) patterns
    content = content.replace(
      /(\s+)}, \[\]\s*\n/g,
      '$1}\n'
    )
    
    return content
  }

  fixMalformedArrowFunctions(content) {
    // Fix malformed arrow function parameters
    content = content.replace(
      /\(,(\w+):/g,
      '($1:'
    )
    
    return content
  }

  printSummary() {
    console.log('\\n📊 Critical Build Error Fix Summary')
    console.log('='.repeat(50))
    console.log(`✅ Fixed files: ${this.fixedFiles.length}`)
    console.log(`❌ Error files: ${this.errors.length}`)
    
    if (this.fixedFiles.length > 0) {
      console.log('\\n🔧 Fixed files:')
      this.fixedFiles.forEach(file => {
        console.log(`  - ${path.relative(process.cwd(), file)}`)
      })
    }
    
    if (this.errors.length > 0) {
      console.log('\\n❌ Error files:')
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${path.relative(process.cwd(), file)}: ${error}`)
      })
    }
    
    console.log('\\n🎯 Fixed patterns:')
    console.log('  - Malformed onClick handlers')
    console.log('  - TypeScript interface syntax')
    console.log('  - useCallback structure errors')
    console.log('  - Object property syntax')
    console.log('  - Stray dependency arrays')
    
    console.log('\\n📋 Next: npm run build')
  }
}

// Execute
const fixer = new CriticalBuildErrorFixer()
await fixer.fixAllFiles()

export default CriticalBuildErrorFixer