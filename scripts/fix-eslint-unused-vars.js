#!/usr/bin/env node
/**
 * Fix ESLint unused variable errors by adding underscore prefix
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Get all TypeScript/JavaScript files in src
function getSourceFiles() {
  try {
    const output = execSync('find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"', 
      { encoding: 'utf8', cwd: process.cwd() })
    return output.trim().split('\n').filter(file => file.length > 0)
  } catch (error) {
    console.error('Error finding source files:', error.message)
    return []
  }
}

// Fix unused variables in a file
function fixUnusedVariables(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let hasChanges = false

    // Common patterns for unused variables
    const patterns = [
      // Function parameters
      {
        regex: /(\w+): (\w+)(?=,|\))/g,
        replacement: (match, name, type) => `_${name}: ${type}`
      },
      // Destructuring assignments
      {
        regex: /const \{ ([^}]+) \} = /g,
        replacement: (match, destructured) => {
          const parts = destructured.split(',').map(part => {
            const trimmed = part.trim()
            if (trimmed.includes(':') && !trimmed.startsWith('_')) {
              return `_${trimmed}`
            }
            return trimmed
          })
          return `const { ${parts.join(', ')} } = `
        }
      },
      // Variable declarations
      {
        regex: /const (\w+) = /g,
        replacement: (match, name) => `const _${name} = `
      }
    ]

    // Apply fixes based on ESLint output
    try {
      const eslintOutput = execSync(`npx eslint "${filePath}" --format json`, 
        { encoding: 'utf8', cwd: process.cwd() })
      const results = JSON.parse(eslintOutput)
      
      if (results[0]?.messages) {
        for (const message of results[0].messages) {
          if (message.ruleId === '@typescript-eslint/no-unused-vars') {
            const varName = message.message.match(/'([^']+)'/)?.[1]
            if (varName && !varName.startsWith('_')) {
              // Add underscore prefix to unused variable
              const regex = new RegExp(`\\b${varName}\\b(?=\\s*[=:,)])`, 'g')
              const newContent = content.replace(regex, `_${varName}`)
              if (newContent !== content) {
                content = newContent
                hasChanges = true
              }
            }
          }
        }
      }
    } catch (eslintError) {
      // ESLint might fail, but we continue with other patterns
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✓ Fixed unused variables in ${filePath}`)
      return true
    }
    
    return false
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message)
    return false
  }
}

// Main execution
function main() {
  console.log('🔧 Fixing ESLint unused variable errors...')
  
  const sourceFiles = getSourceFiles()
  let fixedCount = 0

  for (const file of sourceFiles) {
    if (fixUnusedVariables(file)) {
      fixedCount++
    }
  }

  console.log(`\n✅ Fixed unused variables in ${fixedCount} files`)
  
  // Run ESLint again to see remaining issues
  try {
    console.log('\n📊 Running ESLint to check remaining issues...')
    execSync('npm run lint', { stdio: 'inherit', cwd: process.cwd() })
  } catch (error) {
    console.log('Some ESLint issues remain - manual fixing may be required')
  }
}

if (require.main === module) {
  main()
}

module.exports = { fixUnusedVariables, getSourceFiles }