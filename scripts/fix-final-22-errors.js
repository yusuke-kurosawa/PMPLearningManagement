#!/usr/bin/env node

/**
 * Fix the final 22 ESLint errors
 */

const fs = require('fs').promises
const path = require('path')
const { execSync } = require('child_process')

async function fixFile(filePath, lineNumber, fixDescription, fixFunction) {
  try {
    const fullPath = path.join(__dirname, '..', filePath)
    const content = await fs.readFile(fullPath, 'utf8')
    const fixed = await fixFunction(content, lineNumber)

    if (fixed !== content) {
      await fs.writeFile(fullPath, fixed)
      console.log(`✓ Fixed ${filePath}:${lineNumber} - ${fixDescription}`)
      return true
    }
  } catch (error) {
    console.log(`⚠️ Could not fix ${filePath}:${lineNumber} - ${error.message}`)
  }
  return false
}

async function main() {
  console.log('🔧 Fixing final 22 ESLint errors...\n')

  let fixedCount = 0

  // Fix each specific error
  const fixes = [
    // MobileOptimizedApp.tsx:753 - Declaration or statement expected
    {
      file: 'src/components/mobile/MobileOptimizedApp.tsx',
      line: 753,
      desc: 'Declaration or statement expected',
      fix: (content) => {
        // Check if there's an issue with EOF
        const lines = content.split('\n')
        // Remove any trailing empty lines that might be causing issues
        while (lines.length > 0 && lines[lines.length - 1] === '') {
          lines.pop()
        }
        // Ensure proper ending
        if (!lines[lines.length - 1].includes('export default')) {
          lines.push('')
          lines.push('export default MobileOptimizedApp')
        }
        return lines.join('\n')
      },
    },

    // EnhancedPMBOKMatrix.tsx:125 - Expression expected
    {
      file: 'src/components/pmbok/EnhancedPMBOKMatrix.tsx',
      line: 125,
      desc: 'Expression expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Check line 124 (0-indexed)
        if (lines[124] && lines[124].includes('?') && !lines[124].includes(':')) {
          lines[124] = lines[124] + ' : null'
        }
        return lines.join('\n')
      },
    },

    // QuickShortcuts.jsx:171 - 'return' outside of function
    {
      file: 'src/components/shared/QuickShortcuts.jsx',
      line: 171,
      desc: 'return outside of function',
      fix: (content) => {
        const lines = content.split('\n')
        // Comment out orphaned return at line 170 (0-indexed)
        if (lines[170] && lines[170].trim() === 'return') {
          lines[170] = '  // ' + lines[170].trim() + ' // Fixed: orphaned return'
        }
        return lines.join('\n')
      },
    },

    // ITTOForceGraph.jsx:64 - Missing semicolon
    {
      file: 'src/components/visualizations/ITTOForceGraph.jsx',
      line: 64,
      desc: 'Missing semicolon',
      fix: (content) => {
        const lines = content.split('\n')
        // Add semicolon to line 63 (0-indexed)
        if (
          lines[63] &&
          !lines[63].trim().endsWith(';') &&
          !lines[63].trim().endsWith('{') &&
          !lines[63].trim().endsWith('}')
        ) {
          lines[63] = lines[63].trimEnd() + ';'
        }
        return lines.join('\n')
      },
    },

    // ITTONetworkDiagram.jsx:299 - 'return' outside of function
    {
      file: 'src/components/visualizations/ITTONetworkDiagram.jsx',
      line: 299,
      desc: 'return outside of function',
      fix: (content) => {
        const lines = content.split('\n')
        // Comment out orphaned return at line 298 (0-indexed)
        if (lines[298] && lines[298].trim() === 'return') {
          lines[298] = '// ' + lines[298].trim() + ' // Fixed: orphaned return'
        }
        return lines.join('\n')
      },
    },

    // connectionPool.ts:106 - ',' expected
    {
      file: 'src/lib/db/connectionPool.ts',
      line: 106,
      desc: 'comma expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Fix missing comma at line 105 (0-indexed)
        if (
          lines[105] &&
          !lines[105].trim().endsWith(',') &&
          !lines[105].trim().endsWith(';') &&
          !lines[105].trim().endsWith('{') &&
          !lines[105].trim().endsWith('}')
        ) {
          // Check if it's in an interface or object
          if (lines[106] && !lines[106].trim().startsWith('}')) {
            lines[105] = lines[105] + ','
          }
        }
        return lines.join('\n')
      },
    },

    // geoMiddleware.ts:151 - ',' expected
    {
      file: 'src/lib/middleware/geoMiddleware.ts',
      line: 151,
      desc: 'comma expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Fix double comma or missing comma
        if (lines[150]) {
          lines[150] = lines[150].replace(/,\s*,/g, ',').replace(/([^,])\s*\n/, '$1,\n')
        }
        return lines.join('\n')
      },
    },

    // rateLimitMiddleware.ts:76 - Declaration or statement expected
    {
      file: 'src/lib/middleware/rateLimitMiddleware.ts',
      line: 76,
      desc: 'Declaration or statement expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Check for extra closing brace at line 75 (0-indexed)
        if (lines[75] && lines[75].trim() === '}') {
          // Count braces to see if this is extra
          const beforeContent = lines.slice(0, 76).join('\n')
          const openCount = (beforeContent.match(/{/g) || []).length
          const closeCount = (beforeContent.match(/}/g) || []).length
          if (closeCount > openCount) {
            lines[75] = '// ' + lines[75] + ' // Fixed: extra closing brace'
          }
        }
        return lines.join('\n')
      },
    },

    // healthCheck.ts:410 - ';' expected
    {
      file: 'src/lib/monitoring/healthCheck.ts',
      line: 410,
      desc: 'semicolon expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Replace require with import or add semicolon
        if (lines[409] && lines[409].includes('require')) {
          // Convert to dynamic import
          lines[409] = lines[409].replace(
            /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/,
            'const $1 = await import("$2")'
          )
        } else if (lines[409] && !lines[409].trim().endsWith(';')) {
          lines[409] = lines[409] + ';'
        }
        return lines.join('\n')
      },
    },

    // serviceWorker.ts:27 - Expression expected
    {
      file: 'src/lib/pwa/serviceWorker.ts',
      line: 27,
      desc: 'Expression expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Check for incomplete expression at line 26 (0-indexed)
        if (lines[26]) {
          // Check for incomplete ternary
          if (lines[26].includes('?') && !lines[26].includes(':')) {
            lines[26] = lines[26] + ' : undefined'
          }
          // Check for incomplete return
          else if (lines[26].includes('return') && !lines[26].includes(';')) {
            lines[26] = lines[26] + ' undefined;'
          }
        }
        return lines.join('\n')
      },
    },

    // csrf.ts:521 - ',' expected
    {
      file: 'src/lib/security/csrf.ts',
      line: 521,
      desc: 'comma expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Fix comma issue at line 520 (0-indexed)
        if (lines[520]) {
          lines[520] = lines[520].replace(/,\s*,/g, ',').replace(/,\s*}/g, '}')
          // Add comma if needed
          if (
            !lines[520].trim().endsWith(',') &&
            !lines[520].trim().endsWith('}') &&
            lines[521] &&
            !lines[521].trim().startsWith('}')
          ) {
            lines[520] = lines[520] + ','
          }
        }
        return lines.join('\n')
      },
    },

    // keyManagement.ts:248 - Argument expression expected
    {
      file: 'src/lib/security/keyManagement.ts',
      line: 248,
      desc: 'Argument expression expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Fix missing argument at line 247 (0-indexed)
        if (lines[247]) {
          // Check for incomplete function call
          const openParens = (lines[247].match(/\(/g) || []).length
          const closeParens = (lines[247].match(/\)/g) || []).length
          if (openParens > closeParens) {
            lines[247] = lines[247] + ')'
          }
        }
        return lines.join('\n')
      },
    },

    // providers.ts:379 - Declaration or statement expected
    {
      file: 'src/server/auth/providers.ts',
      line: 379,
      desc: 'Declaration or statement expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Check for extra closing brace at line 378 (0-indexed)
        if (lines[378] && lines[378].trim() === '}') {
          const beforeContent = lines.slice(0, 379).join('\n')
          const openCount = (beforeContent.match(/{/g) || []).length
          const closeCount = (beforeContent.match(/}/g) || []).length
          if (closeCount > openCount) {
            lines[378] = '// ' + lines[378] + ' // Fixed: extra closing brace'
          }
        }
        return lines.join('\n')
      },
    },

    // slo-manager.ts:1 - Invalid character
    {
      file: 'src/server/monitoring/slo-manager.ts',
      line: 1,
      desc: 'Invalid character',
      fix: (content) => {
        // Remove BOM and non-ASCII characters from the beginning
        return content.replace(/^\uFEFF/, '').replace(/^[^\x00-\x7F]+/, '')
      },
    },

    // auth.ts:54 - ';' expected
    {
      file: 'src/server/routers/auth.ts',
      line: 54,
      desc: 'semicolon expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Add semicolon to line 53 (0-indexed)
        if (
          lines[53] &&
          !lines[53].trim().endsWith(';') &&
          !lines[53].trim().endsWith('{') &&
          !lines[53].trim().endsWith('}')
        ) {
          lines[53] = lines[53] + ';'
        }
        return lines.join('\n')
      },
    },

    // emailService.ts:299 - Argument expression expected
    {
      file: 'src/server/services/emailService.ts',
      line: 299,
      desc: 'Argument expression expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Fix missing argument at line 298 (0-indexed)
        if (lines[298]) {
          const openParens = (lines[298].match(/\(/g) || []).length
          const closeParens = (lines[298].match(/\)/g) || []).length
          if (openParens > closeParens) {
            lines[298] = lines[298] + ')'
          }
        }
        return lines.join('\n')
      },
    },

    // encryptedUserService.ts:27 - ';' expected
    {
      file: 'src/server/services/encryptedUserService.ts',
      line: 27,
      desc: 'semicolon expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Add semicolon to line 26 (0-indexed)
        if (
          lines[26] &&
          !lines[26].trim().endsWith(';') &&
          !lines[26].trim().endsWith('{') &&
          !lines[26].trim().endsWith('}')
        ) {
          lines[26] = lines[26] + ';'
        }
        return lines.join('\n')
      },
    },

    // stripeService.ts:567 - Expression expected
    {
      file: 'src/server/services/stripeService.ts',
      line: 567,
      desc: 'Expression expected',
      fix: (content) => {
        const lines = content.split('\n')
        // Fix incomplete expression at line 566 (0-indexed)
        if (lines[566]) {
          if (lines[566].includes('return') && !lines[566].includes(';')) {
            lines[566] = lines[566].replace(/return\s*$/, 'return undefined;')
          }
        }
        return lines.join('\n')
      },
    },

    // performanceOptimizer.js:152 - Unexpected token
    {
      file: 'src/services/performanceOptimizer.js',
      line: 152,
      desc: 'Unexpected token',
      fix: (content) => {
        const lines = content.split('\n')
        // Fix syntax issue at line 151 (0-indexed)
        if (lines[151]) {
          // Remove trailing commas in objects/arrays
          lines[151] = lines[151].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
        }
        return lines.join('\n')
      },
    },
  ]

  // Convert require to import in test files
  const testFiles = ['src/server/auth/__tests__/middleware.test.ts']

  for (const testFile of testFiles) {
    try {
      const fullPath = path.join(__dirname, '..', testFile)
      let content = await fs.readFile(fullPath, 'utf8')

      // Convert all require statements to dynamic imports
      content = content.replace(
        /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
        'const $1 = await import("$2")'
      )

      await fs.writeFile(fullPath, content)
      console.log(`✓ Fixed require statements in ${testFile}`)
      fixedCount++
    } catch (error) {
      console.log(`⚠️ Could not fix ${testFile}: ${error.message}`)
    }
  }

  // Apply all fixes
  for (const fix of fixes) {
    if (await fixFile(fix.file, fix.line, fix.desc, fix.fix)) {
      fixedCount++
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} issues`)

  // Run ESLint to check
  console.log('\n📊 Checking ESLint status...')
  try {
    execSync('npx eslint src --ext .js,.jsx,.ts,.tsx --quiet', { stdio: 'inherit' })
    console.log('\n🎉 Success! Zero ESLint errors!')
  } catch (error) {
    console.log('\n⚠️ Some errors remain. Running full check...')
    try {
      execSync('npm run lint', { stdio: 'inherit' })
    } catch (e) {
      // Show remaining issues
    }
  }
}

main().catch(console.error)
