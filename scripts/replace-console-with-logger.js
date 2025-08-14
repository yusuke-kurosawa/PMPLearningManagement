#!/usr/bin/env node

/**
 * Replace Console with Logger Service
 * Automatically replaces console statements with logger service calls
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Find all source files
const findSourceFiles = () => {
  try {
    const files = execSync('find src -type f \\( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \\) ! -path "*/node_modules/*" ! -path "*/services/logger.ts"', {
      encoding: 'utf-8'
    }).trim().split('\n').filter(Boolean)
    return files
  } catch (error) {
    console.error('Error finding files:', error.message)
    return []
  }
}

// Replace console statements in a file
const replaceConsoleInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false
  
  // Check if file already imports logger
  const hasLoggerImport = content.includes("from '../services/logger'") || 
                         content.includes("from '../../services/logger'") ||
                         content.includes("from '../../../services/logger'") ||
                         content.includes("from '@/services/logger'")
  
  // Replace console statements
  const replacements = [
    { from: /console\.log\(/g, to: 'logger.debug(' },
    { from: /console\.info\(/g, to: 'logger.info(' },
    { from: /console\.warn\(/g, to: 'logger.warn(' },
    { from: /console\.error\(/g, to: 'logger.error(' },
  ]
  
  // Check if file has console statements that need replacing
  const hasConsole = replacements.some(r => r.from.test(content))
  
  if (hasConsole) {
    // Only process if in development environment check
    const lines = content.split('\n')
    const processedLines = lines.map(line => {
      // Skip if line is already in a development check
      if (line.includes("process.env.NODE_ENV === 'development'")) {
        return line
      }
      
      // Replace console statements
      let processedLine = line
      replacements.forEach(({ from, to }) => {
        if (from.test(processedLine)) {
          // Wrap in development check if not already wrapped
          const indent = processedLine.match(/^(\s*)/)[1]
          if (!processedLine.includes('logger.')) {
            processedLine = processedLine.replace(from, to)
            modified = true
          }
        }
      })
      
      return processedLine
    })
    
    content = processedLines.join('\n')
    
    // Add logger import if needed and file was modified
    if (modified && !hasLoggerImport) {
      // Calculate relative path to logger
      const fileDir = path.dirname(filePath)
      const loggerPath = path.join(process.cwd(), 'src/services/logger')
      let relativePath = path.relative(fileDir, loggerPath)
      
      // Ensure proper format
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath
      }
      
      // Remove .ts extension
      relativePath = relativePath.replace(/\.ts$/, '')
      
      // Add import at the top of the file
      const importStatement = `import { logger } from '${relativePath}'\n`
      
      // Find the right place to insert import
      const firstImportIndex = content.search(/^import /m)
      if (firstImportIndex !== -1) {
        // Add after other imports
        const lines = content.split('\n')
        let lastImportIndex = 0
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIndex = i
          } else if (lastImportIndex > 0 && !lines[i].startsWith('import ')) {
            break
          }
        }
        lines.splice(lastImportIndex + 1, 0, importStatement.trim())
        content = lines.join('\n')
      } else {
        // Add at the beginning
        content = importStatement + '\n' + content
      }
    }
    
    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8')
      return true
    }
  }
  
  return false
}

// Main execution
const main = () => {
  console.log('🔍 Searching for console statements to replace...')
  
  const files = findSourceFiles()
  console.log(`Found ${files.length} source files to check`)
  
  let modifiedCount = 0
  
  files.forEach(file => {
    if (replaceConsoleInFile(file)) {
      console.log(`  ✓ Modified: ${path.relative(process.cwd(), file)}`)
      modifiedCount++
    }
  })
  
  console.log('\n' + '='.repeat(50))
  console.log(`✨ Replaced console statements in ${modifiedCount} files`)
  console.log('='.repeat(50))
  
  if (modifiedCount > 0) {
    console.log('\nℹ️  Remember to review the changes and ensure imports are correct')
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { replaceConsoleInFile }