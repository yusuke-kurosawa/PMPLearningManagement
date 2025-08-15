#!/usr/bin/env node

/**
 * Fix Unused Imports and Variables
 * Automatically removes unused imports and variables from all files
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Get list of files with unused imports/variables
const getUnusedIssues = () => {
  try {
    const eslintOutput = execSync('npx eslint src --ext .js,.jsx,.ts,.tsx --format json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })

    const results = JSON.parse(eslintOutput)
    const unusedIssues = new Map()

    results.forEach((file) => {
      if (file.messages && file.messages.length > 0) {
        const unused = file.messages.filter(
          (msg) =>
            msg.ruleId === '@typescript-eslint/no-unused-vars' || msg.ruleId === 'no-unused-vars'
        )

        if (unused.length > 0) {
          unusedIssues.set(file.filePath, unused)
        }
      }
    })

    return unusedIssues
  } catch (error) {
    console.error('Error getting ESLint results:', error.message)
    return new Map()
  }
}

// Fix a single file
const fixFile = (filePath, issues) => {
  let content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // Sort issues by line number in descending order to avoid index shifting
  const sortedIssues = issues.sort((a, b) => b.line - a.line)

  sortedIssues.forEach((issue) => {
    const lineIndex = issue.line - 1
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex]

      // Check if it's an import statement
      if (line.includes('import')) {
        // Extract the imported items
        const importMatch = line.match(/import\s+(?:{([^}]+)}|([^,\s]+))\s+from/)

        if (importMatch) {
          const unusedVar = issue.message.match(/'([^']+)'/)?.[1]

          if (unusedVar) {
            if (importMatch[1]) {
              // Named import
              const imports = importMatch[1].split(',').map((i) => i.trim())
              const filteredImports = imports.filter((i) => {
                const importName = i.split(' as ')[0].trim()
                return importName !== unusedVar
              })

              if (filteredImports.length === 0) {
                // Remove entire import line
                lines.splice(lineIndex, 1)
              } else {
                // Update import line with remaining imports
                const newImports = filteredImports.join(', ')
                lines[lineIndex] = line.replace(importMatch[1], newImports)
              }
            } else if (importMatch[2] && importMatch[2].trim() === unusedVar) {
              // Default import - remove entire line
              lines.splice(lineIndex, 1)
            }
          }
        }
      } else {
        // Check if it's a variable declaration
        const varMatch = line.match(/^\s*(?:const|let|var)\s+([^=\s]+)/)
        if (varMatch) {
          const varName = varMatch[1].trim()
          const unusedVar = issue.message.match(/'([^']+)'/)?.[1]

          if (varName === unusedVar) {
            // Comment out the line instead of removing it
            lines[lineIndex] = '// ' + line + ' // TODO: Removed unused variable'
          }
        }
      }
    }
  })

  // Write back the fixed content
  const fixedContent = lines.join('\n')
  fs.writeFileSync(filePath, fixedContent, 'utf-8')

  return true
}

// Main execution
const main = () => {
  console.log('🔍 Scanning for unused imports and variables...')

  const unusedIssues = getUnusedIssues()

  if (unusedIssues.size === 0) {
    console.log('✅ No unused imports or variables found!')
    return
  }

  console.log(`Found ${unusedIssues.size} files with unused imports/variables`)

  let totalFixed = 0
  let totalIssues = 0

  unusedIssues.forEach((issues, filePath) => {
    const relativePath = path.relative(process.cwd(), filePath)
    console.log(`\n📝 Fixing ${relativePath} (${issues.length} issues)...`)

    try {
      if (fixFile(filePath, issues)) {
        totalFixed++
        totalIssues += issues.length
      }
    } catch (error) {
      console.error(`  ❌ Error fixing file: ${error.message}`)
    }
  })

  console.log('\n' + '='.repeat(50))
  console.log(`✨ Fixed ${totalFixed} files with ${totalIssues} total issues`)
  console.log('='.repeat(50))

  // Run ESLint fix to clean up any formatting issues
  console.log('\n🧹 Running ESLint fix to clean up formatting...')
  try {
    execSync('npx eslint src --ext .js,.jsx,.ts,.tsx --fix', {
      stdio: 'inherit',
    })
  } catch (error) {
    // ESLint fix might still have errors, that's okay
  }

  console.log('\n✅ Unused imports and variables cleanup complete!')
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { getUnusedIssues, fixFile }
